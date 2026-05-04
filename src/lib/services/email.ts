// Email service — SendGrid in prod, console-log fake in dev.
// All templates rendered as simple HTML strings; replace with real templates later.

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

export interface EmailProvider {
  send(msg: EmailMessage): Promise<{ id: string; ok: boolean }>;
}

class FakeEmailProvider implements EmailProvider {
  async send(msg: EmailMessage) {
    console.log(
      `\n[email][fake] -> ${msg.to}\n  subject: ${msg.subject}\n  body: ${msg.html.slice(0, 200)}...\n`,
    );
    return { id: `fake_${Date.now()}`, ok: true };
  }
}

class SendGridProvider implements EmailProvider {
  constructor(
    private apiKey: string,
    private from: string,
  ) {}
  async send(msg: EmailMessage) {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: msg.to }] }],
        from: { email: this.from },
        subject: msg.subject,
        content: [{ type: "text/html", value: msg.html }],
      }),
    });
    return { id: res.headers.get("x-message-id") ?? "sg", ok: res.ok };
  }
}

let _provider: EmailProvider | null = null;
export function emailProvider(): EmailProvider {
  if (_provider) return _provider;
  const key = process.env.SENDGRID_API_KEY;
  if (key && key !== "stub") {
    _provider = new SendGridProvider(
      key,
      process.env.SENDGRID_FROM_EMAIL ?? "noreply@example.com",
    );
  } else {
    _provider = new FakeEmailProvider();
  }
  return _provider;
}

export const Templates = {
  welcomeVerify(name: string, link: string) {
    return {
      subject: "Verify your email",
      html: `<h2>Welcome, ${escape(name)}</h2><p>Click <a href="${link}">here</a> to verify your email.</p>`,
    };
  },
  sellerApproved(name: string) {
    return {
      subject: "You're approved as a seller",
      html: `<p>${escape(name)}, your seller application was approved. You can now list products.</p>`,
    };
  },
  sellerRejected(name: string, reason: string) {
    return {
      subject: "Seller application update",
      html: `<p>${escape(name)}, your application was rejected. Reason: ${escape(reason)}</p>`,
    };
  },
  paymentFailure(name: string) {
    return {
      subject: "Payment failed",
      html: `<p>${escape(name)}, your subscription payment failed. Please update your payment method.</p>`,
    };
  },
  purchaseConfirmation(items: { title: string; downloadUrl: string; licenseKey?: string }[]) {
    return {
      subject: "Your purchase is ready",
      html: `<h3>Thanks for your purchase</h3><ul>${items
        .map(
          (i) =>
            `<li>${escape(i.title)} — <a href="${i.downloadUrl}">Download</a>${i.licenseKey ? ` — License: <code>${i.licenseKey}</code>` : ""}</li>`,
        )
        .join("")}</ul>`,
    };
  },
  saleNotification(productTitle: string, amountCents: number) {
    return {
      subject: `New sale: ${productTitle}`,
      html: `<p>You sold <b>${escape(productTitle)}</b> for $${(amountCents / 100).toFixed(2)}.</p>`,
    };
  },
  payoutConfirmation(amountCents: number) {
    return {
      subject: "Payout processed",
      html: `<p>Your payout of $${(amountCents / 100).toFixed(2)} has been processed.</p>`,
    };
  },
  productUpdated(title: string, link: string) {
    return {
      subject: `Updated: ${title}`,
      html: `<p>The product <b>${escape(title)}</b> has a new version. <a href="${link}">Download latest</a>.</p>`,
    };
  },
  refundConfirmation(productTitle: string, amountCents: number) {
    return {
      subject: "Refund processed",
      html: `<p>Refund of $${(amountCents / 100).toFixed(2)} for <b>${escape(productTitle)}</b> processed.</p>`,
    };
  },
  commissionEarned(amountCents: number) {
    return {
      subject: "You earned a commission",
      html: `<p>You earned $${(amountCents / 100).toFixed(2)} in affiliate commission.</p>`,
    };
  },
};

function escape(s: string) {
  return s.replace(/[<>&"']/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
