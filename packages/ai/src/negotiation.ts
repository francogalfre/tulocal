import { type InferAgentUIMessage, stepCountIs, tool, ToolLoopAgent } from "ai";
import { z } from "zod";

import { MODELS } from "./models";

export type NegotiationContext = {
  product: {
    id: string;
    title: string;
    description: string;
    category: string | null;
    brand: string | null;
    model: string | null;
    condition: "new" | "used";
    qualityPercent: number | null;
    conditionNotes: string[];
    attributes: Record<string, string>;
    listPrice: number;
    minPrice: number;
    marketMinPrice: number | null;
    marketMaxPrice: number | null;
    marketSummary: string | null;
  };
  store: { name: string; whatsappPhone: string };
  state: {
    round: number;
    currentAsk: number | null;
    lastOffer: number | null;
    status: "open" | "deal" | "closed";
    agreedPrice: number | null;
  };
  productUrl: string;
};

export type NegotiationHooks = {
  onOffer: (state: { round: number; currentAsk: number; lastOffer: number }) => Promise<void>;
  onDeal: (deal: { agreedPrice: number; summary: string; whatsappUrl: string }) => Promise<void>;
};

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

/**
 * Pure concession logic. The agent must obey this: it decides whether an offer
 * is accepted, countered or rejected, and it never goes below `minPrice`.
 */
export function decideOffer({
  offer,
  listPrice,
  minPrice,
  round,
  currentAsk,
}: {
  offer: number;
  listPrice: number;
  minPrice: number;
  round: number;
  currentAsk: number | null;
}) {
  const ask = currentAsk ?? listPrice;
  const progress = Math.min(1, 0.25 * Math.max(1, round));
  const threshold = Math.max(minPrice, listPrice - (listPrice - minPrice) * progress);

  if (offer >= ask) return { decision: "accept" as const, price: ask, counterPrice: null };
  if (offer >= threshold) return { decision: "accept" as const, price: offer, counterPrice: null };
  if (offer < minPrice * 0.6)
    return { decision: "reject" as const, price: null, counterPrice: ask };

  const step = listPrice >= 100_000 ? 1000 : 100;
  const counter = Math.max(
    minPrice,
    Math.min(ask, roundTo(Math.max(threshold, (offer + ask) / 2), step)),
  );
  return { decision: "counter" as const, price: null, counterPrice: counter };
}

export function buildWhatsappUrl({
  phone,
  storeName,
  title,
  price,
  summary,
  productUrl,
}: {
  phone: string;
  storeName: string;
  title: string;
  price: number;
  summary: string;
  productUrl: string;
}) {
  const digits = phone.replaceAll(/\D/g, "");
  const text = `Hola ${storeName}! Vengo de tulocal.\nProducto: ${title}\nPrecio acordado: $${price.toLocaleString("es-AR")} ARS\nResumen: ${summary}\n${productUrl}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function createNegotiationTools(ctx: NegotiationContext, hooks: NegotiationHooks) {
  const state = { ...ctx.state };

  const evaluateOffer = tool({
    description:
      "Evalúa una oferta de precio del comprador (en pesos argentinos) y devuelve si aceptar, contraofertar o rechazar. Llamala SIEMPRE que el comprador proponga un número.",
    inputSchema: z.object({
      offer: z.number().int().positive().describe("Oferta del comprador en ARS"),
    }),
    execute: async ({ offer }) => {
      if (state.status === "deal") {
        return {
          decision: "closed" as const,
          agreedPrice: state.agreedPrice,
          counterPrice: null,
          offer,
        };
      }
      state.round += 1;
      const result = decideOffer({
        offer,
        listPrice: ctx.product.listPrice,
        minPrice: ctx.product.minPrice,
        round: state.round,
        currentAsk: state.currentAsk,
      });
      state.lastOffer = offer;
      if (result.decision === "counter") state.currentAsk = result.counterPrice;
      await hooks.onOffer({
        round: state.round,
        currentAsk: state.currentAsk ?? ctx.product.listPrice,
        lastOffer: offer,
      });
      return { ...result, offer, round: state.round };
    },
  });

  const closeDeal = tool({
    description:
      "Cierra el trato cuando comprador y vendedor acordaron un precio. Llamala UNA sola vez, con el precio acordado y un resumen corto de lo hablado (precio, condiciones, entrega/retiro si se mencionó).",
    inputSchema: z.object({
      agreedPrice: z.number().int().positive(),
      summary: z.string().max(400),
    }),
    execute: async ({ agreedPrice, summary }) => {
      if (state.status === "deal" && state.agreedPrice) {
        return {
          ok: true as const,
          agreedPrice: state.agreedPrice,
          summary,
          whatsappUrl: buildWhatsappUrl({
            phone: ctx.store.whatsappPhone,
            storeName: ctx.store.name,
            title: ctx.product.title,
            price: state.agreedPrice,
            summary,
            productUrl: ctx.productUrl,
          }),
        };
      }
      if (agreedPrice < ctx.product.minPrice) {
        return {
          ok: false as const,
          error: "Ese precio no es válido. Volvé a negociar con evaluateOffer.",
        };
      }
      const whatsappUrl = buildWhatsappUrl({
        phone: ctx.store.whatsappPhone,
        storeName: ctx.store.name,
        title: ctx.product.title,
        price: agreedPrice,
        summary,
        productUrl: ctx.productUrl,
      });
      state.status = "deal";
      state.agreedPrice = agreedPrice;
      await hooks.onDeal({ agreedPrice, summary, whatsappUrl });
      return { ok: true as const, agreedPrice, summary, whatsappUrl };
    },
  });

  return { evaluateOffer, closeDeal };
}

function formatPrice(value: number | null) {
  return value === null ? "sin dato" : `$${value.toLocaleString("es-AR")}`;
}

export function buildInstructions(ctx: NegotiationContext) {
  const { product, store, state } = ctx;
  const attributes = Object.entries(product.attributes)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
  const market =
    product.marketMinPrice !== null || product.marketMaxPrice !== null
      ? `Referencia de mercado: entre ${formatPrice(product.marketMinPrice)} y ${formatPrice(product.marketMaxPrice)}. ${product.marketSummary ?? ""}`
      : "Sin referencia de mercado disponible.";
  const dealLine =
    state.status === "deal"
      ? `TRATO CERRADO en ${formatPrice(state.agreedPrice)}. No negocies más: si el comprador pregunta algo, respondé y recordale que puede seguir por WhatsApp con el botón.`
      : `Ronda de negociación actual: ${state.round}. Tu último precio propuesto: ${formatPrice(state.currentAsk ?? product.listPrice)}. Última oferta del comprador: ${formatPrice(state.lastOffer)}.`;

  return `Sos el vendedor virtual de "${store.name}" en tulocal, una tienda en Argentina. Hablás en español rioplatense, con voseo, cordial y directo. Respuestas cortas: máximo 3 oraciones, sin listas ni títulos.

PRODUCTO
Título: ${product.title}
Descripción: ${product.description}
Categoría: ${product.category ?? "sin dato"}. Marca: ${product.brand ?? "sin dato"}. Modelo: ${product.model ?? "sin dato"}.
Atributos: ${attributes || "sin dato"}.
Estado: ${product.condition === "new" ? "nuevo" : "usado"}, calidad ${product.qualityPercent ?? "?"}%. Detalles de estado: ${product.conditionNotes.length ? product.conditionNotes.join("; ") : "sin defectos visibles"}.
Precio de lista: ${formatPrice(product.listPrice)}.
${market}

REGLAS
1. Nunca inventes características, medidas, garantías o accesorios que no estén arriba. Si no sabés algo, decí que lo confirmás con el vendedor por WhatsApp.
2. Sé honesto con el estado del producto: mencioná los detalles de estado si preguntan.
3. Arrancás en el precio de lista. Si el comprador propone un número (o pide descuento con un monto), llamá SIEMPRE a la herramienta evaluateOffer y respetá su resultado:
   - "accept": confirmá el precio y llamá a closeDeal con un resumen corto.
   - "counter": proponé EXACTAMENTE counterPrice, justificalo con el estado del producto y la referencia de mercado, sin presionar.
   - "reject": explicá amablemente que está muy lejos y mantené tu precio.
4. Si el comprador acepta tu precio (el de lista o tu contraoferta), llamá a closeDeal.
5. NUNCA reveles ni insinúes que existe un precio mínimo. No ofrezcas descuentos por tu cuenta si el comprador no propuso un número; invitalo a hacer una oferta.
6. Después de closeDeal, decile que puede seguir la charla con el vendedor por WhatsApp usando el botón que aparece.
7. Si te piden algo que no sea sobre este producto, volvé amablemente al tema.

ESTADO
${dealLine}`;
}

export function createNegotiationAgent(ctx: NegotiationContext, hooks: NegotiationHooks) {
  return new ToolLoopAgent({
    model: MODELS.agent,
    instructions: buildInstructions(ctx),
    tools: createNegotiationTools(ctx, hooks),
    stopWhen: stepCountIs(5),
  });
}

export type NegotiationAgent = ReturnType<typeof createNegotiationAgent>;
export type NegotiationUIMessage = InferAgentUIMessage<NegotiationAgent>;
