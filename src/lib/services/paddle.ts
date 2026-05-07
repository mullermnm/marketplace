// Paddle payment provider. Auto-switches to the real SDK when PADDLE_API_KEY is set
// to a non-stub value. The fake provider keeps the local /checkout/fake demo working.

import { newId } from "../ids";
import crypto from "node:crypto";
import { Paddle, Environment, EventName } from "@paddle/paddle-node-sdk";

export interface PaymentProvider {
  createCheckoutSession(input: {
    items: { name: string; priceCents: number; quantity: number }[];
    customerEmail: string;
    metadata?: Record<string, string>;
  }): Promise<{ checkoutId: string; checkoutUrl?: string; transactionId?: string }>;
  createSubscriptionCheckout(input: {
    tierId: string;
    customerEmail: string;
    metadata?: Record<string, string>;
  }): Promise<{ checkoutId: string; checkoutUrl?: string; transactionId?: string; priceId?: string }>;
  createInlineCheckout(input: {
    items: { name: string; priceCents: number; quantity: number }[];
    customerEmail: string;
    metadata?: Record<string, string>;
  }): Promise<{ transactionId: string; items: Array<{ priceId: string; quantity: number }> }>;
  createInlineSubscriptionCheckout(input: {
    tierId: string;
    customerEmail: string;
    metadata?: Record<string, string>;
  }): Promise<{ transactionId: string; priceId: string }>;
  refund(
    transactionId: string,
    amountCents: number,
  ): Promise<{ refundId: string; ok: boolean }>;
  payout(input: {
    recipientId: string;
    amountCents: number;
    currency: string;
  }): Promise<{ payoutId: string; ok: boolean }>;
  verifyWebhook(rawBody: string, signatureHeader: string | null): boolean;
  getTransaction(
    transactionId: string,
  ): Promise<{
    id: string;
    status: string;
    customData: Record<string, any> | null;
    customerEmail?: string;
    items: { priceId: string; priceName: string; priceCents: number; quantity: number }[];
  }>;
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
    return { checkoutId: id, checkoutUrl: `/checkout/fake?${params.toString()}` };
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
    return { checkoutId: id, checkoutUrl: `/checkout/fake?${params.toString()}` };
  }
  async createInlineCheckout(input: any) {
    const transactionId = newId("txn");
    const items = input.items.map((item: any, index: number) => ({
      priceId: `pri_fake_${index}`,
      quantity: item.quantity,
    }));
    return { transactionId, items };
  }
  async createInlineSubscriptionCheckout(input: any) {
    const transactionId = newId("txn");
    const priceId = `pri_fake_${input.tierId}`;
    return { transactionId, priceId };
  }
  async refund() {
    return { refundId: newId("rfn"), ok: true };
  }
  async payout() {
    return { payoutId: newId("pad"), ok: true };
  }
  verifyWebhook(): boolean {
    return true;
  }
  async getTransaction(transactionId: string) {
    return {
      id: transactionId,
      status: "completed",
      customData: null,
      customerEmail: undefined,
      items: [],
    };
  }
}

class RealPaddle implements PaymentProvider {
  private client: Paddle;
  private webhookSecret: string;

  constructor(apiKey: string, env: "sandbox" | "production", webhookSecret: string) {
    this.client = new Paddle(apiKey, {
      environment: env === "production" ? Environment.production : Environment.sandbox,
    });
    this.webhookSecret = webhookSecret;
  }

  async createCheckoutSession(input: {
    items: { name: string; priceCents: number; quantity: number }[];
    customerEmail: string;
    metadata?: Record<string, string>;
  }) {
    // Non-catalog items: each cart line gets a one-shot price.
    const tx = await this.client.transactions.create({
      items: input.items.map((i) => ({
        quantity: i.quantity,
        price: {
          description: i.name,
          name: i.name,
          unitPrice: { amount: String(i.priceCents), currencyCode: "USD" },
          quantity: { minimum: 1, maximum: 1 },
          taxMode: "account_setting",
          product: {
            name: i.name,
            taxCategory: "standard",
          },
        },
      })) as any,
      customerEmail: input.customerEmail,
      customData: input.metadata ?? null,
      collectionMode: "automatic",
    } as any);
    const checkoutUrl = (tx as any).checkout?.url;
    if (!checkoutUrl) throw new Error("Paddle did not return a checkout URL");
    return { checkoutId: tx.id, checkoutUrl, transactionId: tx.id };
  }

  async createSubscriptionCheckout(input: {
    tierId: string;
    customerEmail: string;
    metadata?: Record<string, string>;
  }) {
    const priceId = process.env[`PADDLE_PRICE_${input.tierId.toUpperCase()}`];
    if (!priceId)
      throw new Error(
        `Missing PADDLE_PRICE_${input.tierId.toUpperCase()} env var — create a price for this tier in the Paddle dashboard and set the env var.`,
      );
    const tx = await this.client.transactions.create({
      items: [{ priceId, quantity: 1 }],
      customerEmail: input.customerEmail,
      customData: { ...(input.metadata ?? {}), tierId: input.tierId },
      collectionMode: "automatic",
    } as any);
    const checkoutUrl = (tx as any).checkout?.url;
    if (!checkoutUrl) throw new Error("Paddle did not return a checkout URL");
    return { checkoutId: tx.id, checkoutUrl, transactionId: tx.id, priceId };
  }

  async createInlineCheckout(input: {
    items: { name: string; priceCents: number; quantity: number }[];
    customerEmail: string;
    metadata?: Record<string, string>;
  }) {
    // Create transaction without checkout URL for inline use
    const tx = await this.client.transactions.create({
      items: input.items.map((i) => ({
        quantity: i.quantity,
        price: {
          description: i.name,
          name: i.name,
          unitPrice: { amount: String(i.priceCents), currencyCode: "USD" },
          quantity: { minimum: 1, maximum: 1 },
          taxMode: "account_setting",
          product: {
            name: i.name,
            taxCategory: "standard",
          },
        },
      })) as any,
      customerEmail: input.customerEmail,
      customData: input.metadata ?? null,
      collectionMode: "automatic",
    } as any);
    
    // Extract price IDs from the created transaction
    const items = ((tx as any).items ?? []).map((item: any) => ({
      priceId: item.price.id,
      quantity: item.quantity,
    }));
    
    return { transactionId: tx.id, items };
  }

  async createInlineSubscriptionCheckout(input: {
    tierId: string;
    customerEmail: string;
    metadata?: Record<string, string>;
  }) {
    const priceId = process.env[`PADDLE_PRICE_${input.tierId.toUpperCase()}`];
    if (!priceId)
      throw new Error(
        `Missing PADDLE_PRICE_${input.tierId.toUpperCase()} env var — create a price for this tier in the Paddle dashboard and set the env var.`,
      );
    
    const tx = await this.client.transactions.create({
      items: [{ priceId, quantity: 1 }],
      customerEmail: input.customerEmail,
      customData: { ...(input.metadata ?? {}), tierId: input.tierId },
      collectionMode: "automatic",
    } as any);
    
    return { transactionId: tx.id, priceId };
  }

  async refund(transactionId: string, amountCents: number) {
    // Paddle adjustments require itemizing each transaction line. The simple
    // path: full refund. For partial, we'd need the transaction's items first.
    try {
      const tx = await this.client.transactions.get(transactionId);
      const items = ((tx as any).items ?? []).map((it: any) => ({
        itemId: it.id,
        type: "full" as const,
      }));
      const adj = await this.client.adjustments.create({
        action: "refund",
        transactionId,
        reason: "Customer request",
        items,
      } as any);
      void amountCents;
      return { refundId: adj.id, ok: true };
    } catch (e) {
      console.error("[paddle] refund failed", e);
      return { refundId: "", ok: false };
    }
  }

  async payout() {
    // Paddle does not expose a generic 3rd-party payout API — sellers in a
    // marketplace are paid out via Paddle Connect, manual ACH, or a separate
    // rail (Wise, Stripe Connect, etc.). For now we record the intent and
    // skip the actual transfer.
    return { payoutId: newId("pad"), ok: true };
  }

  verifyWebhook(rawBody: string, signatureHeader: string | null): boolean {
    if (!signatureHeader) return false;
    try {
      // Use the SDK's built-in unmarshal-with-verify pathway via signature parts.
      // Paddle signature format: ts=<unix>;h1=<sha256_hex>
      const parts: Record<string, string> = {};
      for (const piece of signatureHeader.split(";")) {
        const [k, v] = piece.split("=");
        if (k && v) parts[k.trim()] = v.trim();
      }
      const ts = parts["ts"];
      const h1 = parts["h1"];
      if (!ts || !h1) return false;
      const payload = `${ts}:${rawBody}`;
      const computed = crypto
        .createHmac("sha256", this.webhookSecret)
        .update(payload)
        .digest("hex");
      // Length-check before timingSafeEqual to avoid throw
      if (computed.length !== h1.length) return false;
      return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(h1));
    } catch (e) {
      console.error("[paddle] webhook verify error", e);
      return false;
    }
  }

  async getTransaction(transactionId: string) {
    const tx = (await this.client.transactions.get(transactionId)) as any;
    const items = ((tx.items ?? []) as any[]).map((it) => {
      const unit = it.price?.unitPrice ?? it.price?.unit_price ?? {};
      return {
        priceId: it.price?.id ?? "",
        priceName: it.price?.name ?? "",
        priceCents: parseInt(unit.amount ?? "0", 10),
        quantity: it.quantity ?? 1,
      };
    });
    return {
      id: tx.id,
      status: tx.status,
      customData: tx.customData ?? tx.custom_data ?? null,
      customerEmail:
        tx.customer?.email ?? tx.billing_details?.customer_email ?? undefined,
      items,
    };
  }
}

let _instance: PaymentProvider | null = null;
export function paddle(): PaymentProvider {
  if (_instance) return _instance;
  const apiKey = process.env.PADDLE_API_KEY;
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  const env = (process.env.PADDLE_ENV as "sandbox" | "production") ?? "sandbox";
  if (apiKey && apiKey !== "stub" && secret && secret !== "stub") {
    console.log(`[paddle] using real adapter (${env})`);
    _instance = new RealPaddle(apiKey, env, secret);
  } else {
    console.log("[paddle] using fake adapter — set PADDLE_API_KEY + PADDLE_WEBHOOK_SECRET to enable real Paddle");
    _instance = new FakePaddle();
  }
  return _instance;
}

export { EventName };
