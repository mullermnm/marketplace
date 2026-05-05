import { ZodError } from "zod";

export function formatError(e: unknown): string {
  if (e instanceof ZodError) {
    return e.issues
      .map((i) => {
        const path = i.path.join(".");
        return path ? `${path}: ${i.message}` : i.message;
      })
      .join("; ");
  }
  if (e instanceof Error) return e.message;
  return "Unknown error";
}
