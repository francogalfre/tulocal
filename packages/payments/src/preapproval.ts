import { MercadoPagoError } from "mercadopago";
import { z } from "zod";

import { createPreapprovalClient } from "@tulocal/payments/client";

const ARGENTINE_PESO_CURRENCY_ID = "ARS";
const MONTHLY_FREQUENCY_TYPE = "months";
const BROKEN_ACTIVATION_QUERY_PARAMETER = "activation";

const preapprovalStatusSchema = z
  .enum(["pending", "authorized", "paused", "cancelled", "canceled"])
  .transform((status) => (status === "canceled" ? "cancelled" : status));

const preapprovalResponseSchema = z.object({
  id: z.string().min(1),
  status: preapprovalStatusSchema,
  external_reference: z.string().min(1),
  init_point: z.url().nullish(),
  next_payment_date: z.string().nullish(),
});

export type PreapprovalStatus = z.infer<typeof preapprovalStatusSchema>;

export type Preapproval = {
  id: string;
  status: PreapprovalStatus;
  externalReference: string;
  checkoutUrl: string | null;
  nextPaymentAt: Date | null;
};

export type CreatePreapprovalInput = {
  reason: string;
  externalReference: string;
  payerEmail: string;
  amountInArs: number;
  returnUrl: string;
};

export class PreapprovalRejectedError extends Error {
  constructor(providerError: MercadoPagoError) {
    super(
      `Mercado Pago rejected the subscription with ${providerError.status}: ${providerError.message}`,
      {
        cause: providerError,
      },
    );
    this.name = "PreapprovalRejectedError";
  }
}

function removeBrokenActivationParameter(checkoutUrl: string): string {
  const url = new URL(checkoutUrl);

  url.searchParams.delete(BROKEN_ACTIVATION_QUERY_PARAMETER);

  return url.toString();
}

function decodePreapproval(response: object): Preapproval {
  const preapproval = preapprovalResponseSchema.parse(response);

  return {
    id: preapproval.id,
    status: preapproval.status,
    externalReference: preapproval.external_reference,
    checkoutUrl:
      preapproval.init_point === null || preapproval.init_point === undefined
        ? null
        : removeBrokenActivationParameter(preapproval.init_point),
    nextPaymentAt:
      preapproval.next_payment_date === null || preapproval.next_payment_date === undefined
        ? null
        : new Date(preapproval.next_payment_date),
  };
}

async function requestPreapprovalCreation(input: CreatePreapprovalInput): Promise<object> {
  return createPreapprovalClient().create({
    body: {
      reason: input.reason,
      external_reference: input.externalReference,
      payer_email: input.payerEmail,
      back_url: input.returnUrl,
      status: "pending",
      auto_recurring: {
        frequency: 1,
        frequency_type: MONTHLY_FREQUENCY_TYPE,
        transaction_amount: input.amountInArs,
        currency_id: ARGENTINE_PESO_CURRENCY_ID,
      },
    },
    requestOptions: { idempotencyKey: input.externalReference },
  });
}

export async function createPreapproval(input: CreatePreapprovalInput): Promise<Preapproval> {
  try {
    return decodePreapproval(await requestPreapprovalCreation(input));
  } catch (error) {
    if (error instanceof MercadoPagoError) {
      throw new PreapprovalRejectedError(error);
    }

    throw error;
  }
}

export async function findPreapproval(preapprovalId: string): Promise<Preapproval> {
  return decodePreapproval(await createPreapprovalClient().get({ id: preapprovalId }));
}

export async function cancelPreapproval(preapprovalId: string): Promise<void> {
  await createPreapprovalClient().update({ id: preapprovalId, body: { status: "cancelled" } });
}
