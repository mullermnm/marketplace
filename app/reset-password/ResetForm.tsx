"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Label } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";

export function ResetForm({ token }: { token: string }) {
  const r = useRouter();
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password"));
    const confirm = String(fd.get("confirm"));
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      body: JSON.stringify({ token, password }),
      headers: { "Content-Type": "application/json" },
    });
    setBusy(false);
    if (res.ok) {
      toast.success("Password updated. Please log in.");
      r.push("/login");
    } else {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Failed");
    }
  }
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" required minLength={8} />
      </div>
      <div>
        <Label htmlFor="confirm">Confirm</Label>
        <Input id="confirm" name="confirm" type="password" required minLength={8} />
      </div>
      <Button type="submit" disabled={busy} variant="primary" className="w-full">
        {busy ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
