"use client";

import { useState } from "react";
import { Input, Label } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";

export function ForgotForm() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      body: JSON.stringify({ email: fd.get("email") }),
      headers: { "Content-Type": "application/json" },
    });
    setBusy(false);
    if (res.ok) {
      setDone(true);
      toast.success("If that email exists, a reset link is on its way");
    } else {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Failed");
    }
  }
  if (done) {
    return (
      <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)]/40 p-6 text-sm">
        <p className="font-medium mb-1">Check your inbox</p>
        <p className="text-[color:var(--fg-muted)]">If your email is registered, a reset link is on its way. The link expires in 2 hours.</p>
      </div>
    );
  }
  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <Button type="submit" disabled={busy} variant="primary" className="w-full">
        {busy ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
