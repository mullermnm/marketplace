import Link from "next/link";
import { Aurora } from "@/src/components/fx/Aurora";
import { Logo } from "@/src/components/fx/Logo";
import { ResetForm } from "./ResetForm";

export default function ResetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token ?? "";
  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-serif-display text-4xl tracking-tight mb-2">Set a new password</h1>
          <p className="text-sm text-[color:var(--fg-muted)] mb-8">Choose something strong.</p>
          {token ? (
            <ResetForm token={token} />
          ) : (
            <p className="text-sm text-rose-500">Missing reset token. Request a new link from <Link href="/forgot-password" className="underline">forgot password</Link>.</p>
          )}
        </div>
      </div>
      <aside className="relative hidden lg:flex border-l border-[color:var(--border)] overflow-hidden">
        <Aurora />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo />
        </div>
      </aside>
    </div>
  );
}
