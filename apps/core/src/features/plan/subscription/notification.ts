import { findAuthorizedPaymentPreapprovalId } from "@tulocal/payments/payment";

import { syncPreapproval } from "@/features/plan/subscription/sync";
import { logEvent } from "@/lib/logger";

const PREAPPROVAL_NOTIFICATION_TYPE = "subscription_preapproval";

const AUTHORIZED_PAYMENT_NOTIFICATION_TYPE = "subscription_authorized_payment";

export type PaymentNotification = {
  type: string;
  resourceId: string;
};

export async function processPaymentNotification(notification: PaymentNotification): Promise<void> {
  if (notification.type === PREAPPROVAL_NOTIFICATION_TYPE) {
    await syncPreapproval(notification.resourceId);
    return;
  }

  if (notification.type === AUTHORIZED_PAYMENT_NOTIFICATION_TYPE) {
    await syncPreapproval(await findAuthorizedPaymentPreapprovalId(notification.resourceId));
    return;
  }

  logEvent({ event: "payments.notification.ignored", detail: notification.type });
}
