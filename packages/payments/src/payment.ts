import { MERCADO_PAGO_API_URL, readMercadoPagoAccessToken } from "@tulocal/payments/client";

import { z } from "zod";

const authorizedPaymentResponseSchema = z.object({
  preapproval_id: z.string().min(1),
});

export async function findAuthorizedPaymentPreapprovalId(
  authorizedPaymentId: string,
): Promise<string> {
  const response = await fetch(
    `${MERCADO_PAGO_API_URL}/authorized_payments/${encodeURIComponent(authorizedPaymentId)}`,
    { headers: { Authorization: `Bearer ${readMercadoPagoAccessToken()}` } },
  );

  if (!response.ok) {
    throw new Error(`Mercado Pago authorized payment lookup failed with ${response.status}`);
  }

  return authorizedPaymentResponseSchema.parse(await response.json()).preapproval_id;
}
