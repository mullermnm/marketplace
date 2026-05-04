// Paddle payment provider. Real adapter optional; stub used by default.

import { newId } from "../ids";

export interface PaymentProvider {
  createCheckoutSession(input: {
    items: { name: string; priceCents: number; quantity: number }[];
    customerEmail: string;
    metadata?: Record<string, string>;
  }): Promise<{ checkoutId: string; checkoutUrl: string }>;
  createSubscriptionCheckout(input: {
    tierId: string;
    customerEmail: string;
    metadata?: Record<string, string>;
  }): Promise<{ checkoutId: string; checkoutUrl: string }>;
  refund(transactionId: string, amountCents: number): Promise<{ refundId: string; ok: boolean }>;
  payout(input: {
    recipientId: string;
    amountCents: number;
    currency: string;
  }): Promise<{ payoutId: string; ok: boolean }>;
  verifyWebhook(rawBody: string, signatureHeader: string | null): boolean;
}

class FakePaddle implements PaymentProvider {
  async createCheckoutSession(input: any) {
    const id = newId("chk");
    const params = new URLSearchParams({
      checkoutId: id,
      type: "products",
      meta: JSON.stringify(input.metadata ?? {}),
      items: JSON.stringify(input.items),
      email: input.customerEmail,
    });
    return {
      checkoutId: id,
      checkoutUrl: `/checkout/fake?${params.toString()}`,
    };
  }
  async createSubscriptionCheckout(input: any) {
    const id = newId("chk");
    const params = new URLSearchParams({
      checkoutId: id,
      type: "subscription",
      tierId: input.tierId,
      email: input.customerEmail,
      meta: JSON.stringify(input.metadata ?? {}),
    });
    return {
      checkoutId: id,
      checkoutUrl: `/checkout/fake?${params.toString()}`,
    };
  }
  async refund(transactionId: string, amountCents: number) {
    return { refundId: newId("rfn"), ok: true };
  }
  async payout() {
    return { payoutId: newId("pad"), ok: true };
  }
  verifyWebhook(_raw: string, _sig: string | null): boolean {
    return true; // stub trusts caller
  }
}

let _instance: PaymentProvider | null = null;
export function paddle(): PaymentProvider {
  if (!_instance) _instance = new FakePaddle();
  return _instance;
}
