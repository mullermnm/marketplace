"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Textarea, Label } from "@/src/components/ui/input";
import { toast } from "sonner";

export function RefundRequestForm({ orderId }: { orderId: string }) {
  const r = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/orders/${orderId}/refund-request`, {
      method: "POST",
      body: JSON.stringify({ reason: fd.get("reason") }),
      headers: { "Content-Type": "application/json" },
    });
    setBusy(false);
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(j.error ?? "Failed");
      return;
    }
    toast.success("Refund request submitted");
    r.refresh();
  }
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-[color:var(--fg-muted)] hover:text-[color:var(--fg)] underline underline-offset-4"
      >
        Need a refund?
      </button>
    );
  }
  return (
    <form onSubmit={submit} className="rounded-lg border border-[color:var(--border)] p-4 space-y-3">
      <div>
        <Label htmlFor="reason">Tell us why</Label>
        <Textarea id="reason" name="reason" required minLength={4} maxLength={500} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={busy} variant="primary" size="sm">
          {busy ? "Sending…" : "Submit request"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
