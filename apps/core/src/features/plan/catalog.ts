import type { subscriptionPlan } from "@tulocal/database/schema/subscriptions";

export type PaidPlan = (typeof subscriptionPlan.enumValues)[number];

export type Plan = "free" | PaidPlan;

export type PlanDetails = {
  name: string;
  tagline: string;
  priceInArs: number;
  regularPriceInArs: number | null;
  productLimit: number;
  isProductLimitLifetime: boolean;
  monthlyCreationLimit: number | null;
  monthlyAgentMessageLimit: number | null;
  monthlySceneLimit: number;
  isVerified: boolean;
  benefits: string[];
};

export const PLAN_ORDER: Plan[] = ["free", "pro", "business"];

export const PLANS: Record<Plan, PlanDetails> = {
  free: {
    name: "Gratis",
    tagline: "Para probar sin pagar.",
    priceInArs: 0,
    regularPriceInArs: null,
    productLimit: 3,
    isProductLimitLifetime: true,
    monthlyCreationLimit: null,
    monthlyAgentMessageLimit: 100,
    monthlySceneLimit: 0,
    isVerified: false,
    benefits: [
      "3 productos",
      "Tu local con link y QR",
      "La IA arma cada publicación",
      "Agente con 100 mensajes por mes",
    ],
  },
  pro: {
    name: "Pro",
    tagline: "Para emprendedores que venden seguido.",
    priceInArs: 10_000,
    regularPriceInArs: 15_000,
    productLimit: 20,
    isProductLimitLifetime: false,
    monthlyCreationLimit: 40,
    monthlyAgentMessageLimit: null,
    monthlySceneLimit: 30,
    isVerified: true,
    benefits: [
      "20 productos a la vez",
      "Agente sin límite de mensajes",
      "30 posteos con IA por mes",
      "Verificada y primero en las búsquedas",
    ],
  },
  business: {
    name: "Negocio",
    tagline: "Para locales con catálogo grande.",
    priceInArs: 25_000,
    regularPriceInArs: null,
    productLimit: 100,
    isProductLimitLifetime: false,
    monthlyCreationLimit: 150,
    monthlyAgentMessageLimit: null,
    monthlySceneLimit: 100,
    isVerified: true,
    benefits: [
      "Todo lo de Pro",
      "100 productos a la vez",
      "100 posteos con IA por mes",
      "Arriba de todo en el directorio",
    ],
  },
};

export const HIGHLIGHTED_PLAN: Plan = "pro";

export const WIDE_PLAN: Plan = "business";
