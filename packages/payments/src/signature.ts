import { InvalidWebhookSignatureError, WebhookSignatureValidator } from "mercadopago";

export type WebhookSignatureInput = {
  signatureHeader: string | null;
  requestIdHeader: string | null;
  notifiedResourceId: string | null;
  secret: string;
};

export function isMercadoPagoSignatureValid(input: WebhookSignatureInput): boolean {
  try {
    WebhookSignatureValidator.validate({
      xSignature: input.signatureHeader,
      xRequestId: input.requestIdHeader,
      dataId: input.notifiedResourceId,
      secret: input.secret,
    });
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      return false;
    }

    throw error;
  }

  return true;
}
