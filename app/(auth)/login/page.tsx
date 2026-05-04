import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { Aurora } from "@/src/components/fx/Aurora";
import { Logo } from "@/src/components/fx/Logo";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Logo className="lg:hidden mb-8" />
          <h1 className="font-serif-display text-4xl tracking-tight mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-[color:var(--fg-muted)] mb-8">
            Log in to your account to continue.
          </p>
          <LoginForm />
          <p className="mt-6 text-sm text-[color:var(--fg-muted)]">
            New here?{" "}
            <Link href="/register" className="text-[color:var(--fg)] underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </div>
      <aside className="relative hidden lg:flex border-l border-[color:var(--border)] overflow-hidden">
        <Aurora />
        <div className="absolute inset-0 grid-bg opacity-40" aria-hidden />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo />
          <div>
            <blockquote className="font-serif-display text-3xl leading-tight max-w-md text-balance">
              “Setting up shop took less time than writing my product description.”
            </blockquote>
            <p className="mt-4 text-sm text-[color:var(--fg-muted)]">
              — Ada R., creator of Pixel Atlas
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
