import type {
  AgentComparable,
  AgentProduct,
  AgentQuestion,
  AgentStore,
} from "@/features/agent/context";
import { CATEGORY_LABELS } from "@/features/product/category";
import { CONDITION_LABELS } from "@/features/product/condition";
import { formatArs } from "@/lib/money";

type PrivateProductField = "floorPriceInArs" | "photoUrls" | "listingPhotoUrls";

export type PromptProduct = Omit<AgentProduct, PrivateProductField>;

export type AgentKnowledgeInput = {
  product: PromptProduct;
  store: AgentStore;
  photoCount: number;
  questions: AgentQuestion[];
  comparables: AgentComparable[];
};

function hasText(text: string | null): text is string {
  return text !== null && text.trim() !== "";
}

function describeProduct(product: PromptProduct): string {
  const lines = [
    `Título: ${product.title}`,
    `Precio de venta publicado: ${formatArs(product.listPriceInArs)}`,
  ];

  if (product.category !== null) {
    lines.push(`Categoría: ${CATEGORY_LABELS[product.category]}`);
  }

  if (product.brand !== null) {
    lines.push(`Marca: ${product.brand}`);
  }

  if (product.model !== null) {
    lines.push(`Modelo: ${product.model}`);
  }

  if (product.condition !== null) {
    lines.push(`Estado: ${CONDITION_LABELS[product.condition].toLowerCase()}`);
  }

  if (hasText(product.description)) {
    lines.push(`Descripción publicada: ${product.description}`);
  }

  if (hasText(product.conditionNotes)) {
    lines.push(`Detalles y marcas de uso: ${product.conditionNotes}`);
  }

  if (product.attributes.length > 0) {
    lines.push(`Características: ${product.attributes.join(", ")}`);
  }

  if (hasText(product.sellerNotes)) {
    lines.push(`Notas del dueño sobre esta unidad: ${product.sellerNotes}`);
  }

  return lines.join("\n");
}

function describePhotos(photoCount: number): string {
  if (photoCount === 0) {
    return "Fotos: la publicación no tiene fotos reales para revisar.";
  }

  return `Fotos: hay ${photoCount} fotos reales de esta unidad. No las ves directamente; para saber qué se ve en ellas usá inspectPhotos.`;
}

function describeFacts(facts: string[]): string {
  if (facts.length === 0) {
    return "";
  }

  const lines = [
    "Lo que se sabe del modelo en general (investigado en internet, puede no aplicar a esta unidad):",
  ];

  for (const fact of facts) {
    lines.push(`- ${fact}`);
  }

  return lines.join("\n");
}

function describeStore(store: AgentStore): string {
  const lines = [`Nombre: ${store.name}`];

  if (hasText(store.locationName)) {
    lines.push(`Zona: ${store.locationName}. Es la zona aproximada, no des una dirección exacta.`);
  }

  if (hasText(store.description)) {
    lines.push(`Sobre la tienda: ${store.description}`);
  }

  lines.push(
    hasText(store.agentContext)
      ? `Envíos, pagos, retiro y horarios: ${store.agentContext}`
      : "Envíos, pagos, retiro y horarios: el dueño no dejó info. Si preguntan, consultalo con askSeller.",
  );

  return lines.join("\n");
}

function describeComparables(comparables: AgentComparable[]): string {
  if (comparables.length === 0) {
    return "";
  }

  const lines = [
    "Referencias de precio en el mercado (publicaciones parecidas, solo para argumentar el precio, no son ofertas tuyas y nunca las nombres ni las linkees):",
  ];

  for (const comparable of comparables) {
    lines.push(`- ${comparable.title}: ${formatArs(comparable.priceInArs)}`);
  }

  return lines.join("\n");
}

function describeQuestions(questions: AgentQuestion[]): string {
  const answered = questions.filter((question) => question.status === "answered");
  const pending = questions.filter((question) => question.status === "pending");
  const lines: string[] = [];

  if (answered.length > 0) {
    lines.push("Preguntas que el dueño ya respondió (valen como info confirmada de esta unidad):");
    for (const question of answered) {
      lines.push(`- ${question.question} → ${question.answer}`);
    }
  }

  if (pending.length > 0) {
    lines.push("Preguntas que ya se le mandaron al dueño y todavía no contestó:");
    for (const question of pending) {
      lines.push(`- ${question.question}`);
    }
  }

  return lines.length > 0 ? lines.join("\n") : "Todavía no hay preguntas respondidas por el dueño.";
}

export function buildAgentKnowledge(input: AgentKnowledgeInput): string {
  return [
    `### Esta unidad\n${describeProduct(input.product)}\n${describePhotos(input.photoCount)}`,
    `### Respuestas del dueño\n${describeQuestions(input.questions)}`,
    `### La tienda\n${describeStore(input.store)}`,
    describeFacts(input.product.facts),
    describeComparables(input.comparables),
  ]
    .filter((block) => block !== "")
    .join("\n\n");
}
