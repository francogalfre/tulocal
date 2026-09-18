import type { subscriptionPlan } from "@tulocal/database/schema/subscriptions";

export type PaidPlan = (typeof subscriptionPlan.enumValues)[number];

export type Plan = "free" | PaidPlan;

export type PlanDetails = {
  name: string;
  tagline: string;
  priceInArs: number;
  productLimit: number;
  isProductLimitLifetime: boolean;
  dailyCreationLimit: number | null;
  monthlyAgentMessageLimit: number | null;
  canGenerateScenes: boolean;
  isVerified: boolean;
  benefits: string[];
};

export const PLAN_ORDER: Plan[] = ["free", "pro", "business"];

export const PLANS: Record<Plan, PlanDetails> = {
  free: {
    name: "Gratis",
    tagline: "Para probar sin pagar.",
    priceInArs: 0,
    productLimit: 3,
    isProductLimitLifetime: true,
    dailyCreationLimit: null,
    monthlyAgentMessageLimit: 100,
    canGenerateScenes: false,
    isVerified: false,
    benefits: [
      "3 productos",
      "Tu local con link y QR",
      "La IA arma la publicación",
      "Precio sugerido con datos reales",
      "Agente con 100 mensajes por mes",
      "Piezas para Instagram con tus fotos",
    ],
  },
  pro: {
    name: "Pro",
    tagline: "Para emprendedores que venden seguido.",
    priceInArs: 10_000,
    productLimit: 20,
    isProductLimitLifetime: false,
    dailyCreationLimit: 10,
    monthlyAgentMessageLimit: null,
    canGenerateScenes: true,
    isVerified: true,
    benefits: [
      "Todo lo de Gratis",
      "Hasta 20 productos a la vez",
      "Agente sin límite de mensajes",
      "Posteos con IA para Instagram",
      "Tienda verificada",
      "Vendés o borrás y liberás lugar",
      "Cancelás cuando quieras",
    ],
  },
  business: {
    name: "Negocio",
    tagline: "Para locales con catálogo grande.",
    priceInArs: 25_000,
    productLimit: 100,
    isProductLimitLifetime: false,
    dailyCreationLimit: 30,
    monthlyAgentMessageLimit: null,
    canGenerateScenes: true,
    isVerified: true,
    benefits: [
      "Todo lo de Pro",
      "Hasta 100 productos a la vez",
      "Agente sin límite para todo tu catálogo",
      "Posteos con IA para cada producto",
      "Ideal para locales y marcas",
      "Cancelás cuando quieras",
    ],
  },
};

export const HIGHLIGHTED_PLAN: Plan = "pro";

export const WIDE_PLAN: Plan = "business";
