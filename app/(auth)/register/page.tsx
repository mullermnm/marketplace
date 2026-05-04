import Link from "next/link";
import { RegisterForm } from "./RegisterForm";
import { Aurora } from "@/src/components/fx/Aurora";
import { Logo } from "@/src/components/fx/Logo";

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <aside className="relative hidden lg:flex border-r border-[color:var(--border)] overflow-hidden">
        <Aurora />
        <div className="absolute inset-0 grid-bg opacity-40" aria-hidden />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo />
          <div>
            <h2 className="font-serif-display text-3xl leading-tight max-w-md text-balance">
              Join the marketplace where digital makers actually keep their margins.
            </h2>
            <ul className="mt-6 space-y-2 text-sm text-[color:var(--fg-muted)]">
              <li>· Sell anything that ships in a file</li>
              <li>· 3-10% commission, scaling with your tier</li>
              <li>· Weekly payouts. No spreadsheets.</li>
            </ul>
          </div>
        </div>
      </aside>
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Logo className="lg:hidden mb-8" />
          <h1 className="font-serif-display text-4xl tracking-tight mb-2">
            Create your account
          </h1>
          <p className="text-sm text-[color:var(--fg-muted)] mb-8">
            One account for buying and selling.
          </p>
          <RegisterForm />
          <p className="mt-6 text-sm text-[color:var(--fg-muted)]">
            Already have one?{" "}
            <Link href="/login" className="text-[color:var(--fg)] underline underline-offset-4">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
