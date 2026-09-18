import { MercadoPagoConfig, PreApproval } from "mercadopago";

import { paymentsEnvironment } from "@tulocal/environment/payments";

const REQUEST_TIMEOUT_IN_MILLISECONDS = 10_000;

export const MERCADO_PAGO_API_URL = "https://api.mercadopago.com";

export class PaymentsDisabledError extends Error {
  constructor() {
    super("Mercado Pago is not configured: MERCADOPAGO_ACCESS_TOKEN is missing");
    this.name = "PaymentsDisabledError";
  }
}

export function isPaymentsEnabled(): boolean {
  return (
    paymentsEnvironment.MERCADOPAGO_ACCESS_TOKEN !== undefined &&
    paymentsEnvironment.MERCADOPAGO_WEBHOOK_SECRET !== undefined
  );
}

export function readMercadoPagoAccessToken(): string {
  const accessToken = paymentsEnvironment.MERCADOPAGO_ACCESS_TOKEN;

  if (accessToken === undefined) {
    throw new PaymentsDisabledError();
  }

  return accessToken;
}

export function createPreapprovalClient(): PreApproval {
  return new PreApproval(
    new MercadoPagoConfig({
      accessToken: readMercadoPagoAccessToken(),
      options: { timeout: REQUEST_TIMEOUT_IN_MILLISECONDS },
    }),
  );
}
