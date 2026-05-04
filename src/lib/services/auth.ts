import { hashPassword, verifyPassword } from "../auth/password";
import { signSession } from "../auth/session";
import { usersRepo } from "../repos/users";
import { authAttemptsRepo } from "../repos/misc";
import { registerSchema, loginSchema } from "../validation/schemas";

export async function registerUser(input: unknown, ip = "unknown") {
  const data = registerSchema.parse(input);
  const existing = usersRepo.byEmail(data.email);
  if (existing) {
    authAttemptsRepo.log(data.email, ip, false);
    throw new Error("Email already registered");
  }
  const passwordHash = await hashPassword(data.password);
  const user = usersRepo.create({
    email: data.email,
    emailVerified: false,
    passwordHash,
    name: data.name,
    role: "customer",
  });
  authAttemptsRepo.log(data.email, ip, true);
  const token = await signSession({
    uid: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  });
  return { user, token };
}

export async function authenticateUser(input: unknown, ip = "unknown") {
  const data = loginSchema.parse(input);
  const user = usersRepo.byEmail(data.email);
  if (!user || !user.passwordHash) {
    authAttemptsRepo.log(data.email, ip, false);
    throw new Error("Invalid credentials");
  }
  const ok = await verifyPassword(data.password, user.passwordHash);
  if (!ok) {
    authAttemptsRepo.log(data.email, ip, false);
    throw new Error("Invalid credentials");
  }
  authAttemptsRepo.log(data.email, ip, true);
  const token = await signSession({
    uid: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  });
  return { user, token };
}

export function ensureAdminBootstrap() {
  // create a default admin if none exists (dev-only convenience)
  const admins = usersRepo.all().filter((u) => u.role === "admin");
  if (admins.length === 0) {
    // Avoid await in startup path; create with placeholder hash.
    // Real password set via env or first-login flow.
    const email = "admin@local.dev";
    if (!usersRepo.byEmail(email)) {
      usersRepo.create({
        email,
        emailVerified: true,
        // bcrypt hash for "Admin123!" cost 12
        passwordHash:
          "$2a$12$KIXc5L9o3wWk4y0g8pK5k.qN0iN7iHgXp6qN6r3uGq3kQqJjQqZqK",
        name: "Admin",
        role: "admin",
      });
    }
  }
}
