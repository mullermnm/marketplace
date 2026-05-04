import Link from "next/link";
import { Logo } from "@/src/components/fx/Logo";
import { Aurora } from "@/src/components/fx/Aurora";
import { ForgotForm } from "./ForgotForm";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Logo className="lg:hidden mb-8" />
          <h1 className="font-serif-display text-4xl tracking-tight mb-2">Reset password</h1>
          <p className="text-sm text-[color:var(--fg-muted)] mb-8">
            We'll email you a secure link.
          </p>
          <ForgotForm />
          <p className="mt-6 text-sm text-[color:var(--fg-muted)]">
            Remembered it?{" "}
            <Link href="/login" className="text-[color:var(--fg)] underline underline-offset-4">
              Back to login
            </Link>
          </p>
        </div>
      </div>
      <aside className="relative hidden lg:flex border-l border-[color:var(--border)] overflow-hidden">
        <Aurora />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo />
          <p className="font-serif-display text-2xl max-w-md text-[color:var(--fg-muted)]">
            "Took 30 seconds. Best part of my morning."
          </p>
        </div>
      </aside>
    </div>
  );
}
