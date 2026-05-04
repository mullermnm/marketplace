"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input, Label, Textarea } from "@/src/components/ui/input";
import { toast } from "sonner";

export function OnboardingForm() {
  const r = useRouter();
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/seller/apply", {
      method: "POST",
      body: JSON.stringify({
        businessName: fd.get("businessName"),
        description: fd.get("description"),
        contactEmail: fd.get("contactEmail"),
      }),
      headers: { "Content-Type": "application/json" },
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Failed");
      return;
    }
    toast.success("Application submitted");
    r.refresh();
  }
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <Label htmlFor="businessName">Business name</Label>
        <Input id="businessName" name="businessName" required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required minLength={10} />
      </div>
      <div>
        <Label htmlFor="contactEmail">Contact email</Label>
        <Input id="contactEmail" name="contactEmail" type="email" required />
      </div>
      <Button type="submit" disabled={busy} className="w-full">
        {busy ? "Submitting..." : "Submit application"}
      </Button>
    </form>
  );
}
