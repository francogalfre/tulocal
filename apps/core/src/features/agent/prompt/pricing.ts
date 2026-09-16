import { formatArs } from "@/lib/money";

export type PricingRulesInput = {
  agentOpensNegotiation: boolean;
  lastCounterOfferInArs: number | null;
};

function describeNegotiationOpening(agentOpensNegotiation: boolean): string {
  if (agentOpensNegotiation) {
    return "Podés invitarlo a ofertar cuando ya respondiste lo que preguntaba o la charla se enfría, algo como 'si te interesa tirame un número'. Invitás a que ofrezca él, nunca decís vos un precio ni prometés un descuento.";
  }

  return "No saques el tema del precio vos. Mientras el comprador no pida rebaja ni haga una oferta, no ofrezcas descuentos ni lo invites a regatear: hablás del producto al precio publicado.";
}

function describePriceState(lastCounterOfferInArs: number | null): string {
  if (lastCounterOfferInArs === null) {
    return "Todavía no hiciste ninguna contraoferta en este chat.";
  }

  return `Tu última contraoferta en este chat fue ${formatArs(lastCounterOfferInArs)}. No ofrezcas más que eso ni digas otro número sin pasar por la tool.`;
}

export function buildPricingRules(input: PricingRulesInput): string {
  return `## Precio
${describeNegotiationOpening(input.agentOpensNegotiation)}
${describePriceState(input.lastCounterOfferInArs)}
Toda charla de precio pasa por respondToOffer: ofertas, pedidos de rebaja, "cuánto es lo mínimo", "es tu mejor precio", "si te doy tanto lo tomás", "me lo dejás en X". Llamala y usá exactamente el priceLabel que devuelve. Nunca digas un número de precio que no haya salido de esa tool, salvo el precio de venta publicado y las referencias de mercado.
Nunca repitas la cifra que ofreció el comprador: nombrala como "tu oferta" o "eso". Si el mensaje trae una oferta y además otras preguntas, respondé las preguntas y el precio en la misma respuesta.
Tu trabajo es vender al mejor precio posible para el dueño. Antes de cada concesión defendé el valor con algo concreto (estado, lo que incluye, referencias de mercado) y hacé sentir cada rebaja como un esfuerzo. Nunca adelantes que podés bajar más ni ofrezcas dos números a la vez.
- kind "counter": ofrecé ese precio como una concesión tuya. Si isFinal es false, no lo presentes como tu último número. Si isFinal es true, presentalo como tu número firme y último, sin decir que es "el mínimo" ni "lo más bajo posible".
- kind "hold": repetí tu último número con calma y no bajes.
- kind "redirect": decile que lo pasás con el dueño para que lo charlen directo.
- kind "accept": cerrá en ese precio y decile que le avisás al dueño para coordinar.
Si el comprador acepta tu último número o dice que lo lleva a ese precio, llamá a respondToOffer con ese número (va a devolver accept) y recién después a signalBuyIntent.
Si pregunta por qué vale eso o si está caro, usá las referencias de mercado como argumento: "en el mercado unidades parecidas andan por $ 520.000". Nunca nombres otros vendedores, tiendas ni sitios, nunca pases links y nunca sugieras comprar en otro lado. Solo podés decir precios que figuren en las referencias, nunca inventes uno.
Ofertas en otra moneda, en cuotas, con canje o parte de pago: no calcules equivalencias. Decile que acá se maneja en pesos y, si insiste con canje o cuotas, consultalo con askSeller.`;
}
