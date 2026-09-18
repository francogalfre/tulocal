import { z } from "zod";

import { paymentsEnvironment } from "@tulocal/environment/payments";
import { isPaymentsEnabled } from "@tulocal/payments/client";
import { isMercadoPagoSignatureValid } from "@tulocal/payments/signature";

import { processPaymentNotification } from "@/features/plan/subscription/notification";
import { logEvent } from "@/lib/logger";

const RESOURCE_ID_QUERY_PARAMETER = "data.id";

const notificationSchema = z.object({
  type: z.string().min(1),
});

export async function POST(request: Request): Promise<Response> {
  const webhookSecret = paymentsEnvironment.MERCADOPAGO_WEBHOOK_SECRET;

  if (webhookSecret === undefined || !isPaymentsEnabled()) {
    logEvent({ event: "payments.notification.disabled" });
    return new Response(null, { status: 503 });
  }

  const resourceId = new URL(request.url).searchParams.get(RESOURCE_ID_QUERY_PARAMETER);
  const isSigned = isMercadoPagoSignatureValid({
    signatureHeader: request.headers.get("x-signature"),
    requestIdHeader: request.headers.get("x-request-id"),
    notifiedResourceId: resourceId,
    secret: webhookSecret,
  });

  if (!isSigned || resourceId === null) {
    logEvent({ event: "payments.notification.rejected" });
    return new Response(null, { status: 401 });
  }

  const notification = notificationSchema.safeParse(await request.json());

  if (!notification.success) {
    logEvent({ event: "payments.notification.malformed", detail: resourceId });
    return new Response(null, { status: 200 });
  }

  await processPaymentNotification({ type: notification.data.type, resourceId });

  return new Response(null, { status: 200 });
}
