import { newToken } from "../ids";
import { hashPassword } from "../auth/password";
import { usersRepo } from "../repos/users";
import { store } from "../db/store";
import { emailProvider } from "./email";

interface ResetToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: string;
  used: boolean;
}

// Repurpose the events collection for reset tokens (avoids a schema migration).
function tokensCol() {
  return store.events;
}

export async function requestPasswordReset(email: string, baseUrl: string) {
  const u = usersRepo.byEmail(email);
  if (!u) return { ok: true }; // don't leak which emails exist
  const token = newToken();
  tokensCol().insert({
    id: `rst_${token.slice(0, 8)}`,
    token,
    userId: u.id,
    expiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    used: false,
    kind: "password_reset",
  });
  await emailProvider().send({
    to: u.email,
    subject: "Reset your Plinth password",
    html: `<p>Hi ${u.name},</p><p>Click the link below to reset your password. The link expires in 2 hours.</p><p><a href="${baseUrl}/reset-password?token=${token}">Reset password</a></p>`,
  });
  return { ok: true };
}

export async function consumeReset(token: string, newPassword: string) {
  const rec = tokensCol().findOne(
    (e: any) => e.kind === "password_reset" && e.token === token,
  ) as ResetToken | null;
  if (!rec) throw new Error("Invalid or expired link");
  if (rec.used) throw new Error("Link already used");
  if (Date.now() > new Date(rec.expiresAt).getTime())
    throw new Error("Link expired");
  const u = usersRepo.byId(rec.userId);
  if (!u) throw new Error("Account missing");
  const passwordHash = await hashPassword(newPassword);
  usersRepo.update(u.id, { passwordHash });
  tokensCol().update(rec.id, { used: true } as any);
  return { ok: true };
}
