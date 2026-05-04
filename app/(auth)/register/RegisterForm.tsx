"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Label } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";

export function RegisterForm() {
  const r = useRouter();
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: fd.get("email"),
        password: fd.get("password"),
        name: fd.get("name"),
      }),
      headers: { "Content-Type": "application/json" },
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Registration failed");
      return;
    }
    toast.success("Account created. Check email to verify.");
    r.push("/");
    r.refresh();
  }
  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required minLength={8} />
        <p className="text-xs text-muted-foreground mt-1">
          At least 8 chars, one upper, one lower, one number.
        </p>
      </div>
      <Button type="submit" disabled={busy} className="w-full">
        {busy ? "Creating..." : "Create account"}
      </Button>
    </form>
  );
}
