import { ordersRepo } from "../repos/orders";
import { authAttemptsRepo } from "../repos/misc";
import { usersRepo } from "../repos/users";

export function runFraudChecks(input: {
  customerId: string;
  totalCents: number;
  ipAddress: string;
}): { score: number; flags: string[] } {
  const flags: string[] = [];
  let score = 0;

  const user = usersRepo.byId(input.customerId);
  if (!user) {
    flags.push("unknown_user");
    score += 50;
    return { score, flags };
  }

  // 1) recent failed payment attempts
  const recentFails = authAttemptsRepo.recentFailuresByEmail(user.email);
  if (recentFails.length >= 3) {
    flags.push("multiple_failed_attempts");
    score += 30;
  }

  // 2) unusual order size compared to history
  const history = ordersRepo.byCustomer(input.customerId);
  const avg =
    history.length > 0
      ? history.reduce((s, o) => s + o.totalCents, 0) / history.length
      : 0;
  if (avg > 0 && input.totalCents > avg * 5 && input.totalCents > 20000) {
    flags.push("unusual_value");
    score += 20;
  }

  // 3) IP heuristic — placeholder (real impl would geolocate)
  if (!input.ipAddress || input.ipAddress === "unknown") {
    score += 5;
  }

  return { score, flags };
}
