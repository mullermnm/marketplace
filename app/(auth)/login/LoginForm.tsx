"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Label } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";

export function LoginForm() {
  const r = useRouter();
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
      headers: { "Content-Type": "application/json" },
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Login failed");
      return;
    }
    toast.success("Logged in");
    const next = new URLSearchParams(window.location.search).get("next");
    r.push(next || "/");
    r.refresh();
  }
  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      <Button type="submit" disabled={busy} className="w-full">
        {busy ? "Logging in..." : "Log in"}
      </Button>
    </form>
  );
}
