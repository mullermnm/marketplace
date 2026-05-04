"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Label } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";

export function DiscountForm({ products }: { products: { id: string; title: string }[] }) {
  const r = useRouter();
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      code: String(fd.get("code")),
      discountType: fd.get("discountType"),
      discountValue: parseFloat(String(fd.get("discountValue"))),
      applicableProductIds: fd.getAll("applicableProductIds"),
      startDate: String(fd.get("startDate")),
      endDate: String(fd.get("endDate")),
      maxUses: fd.get("maxUses") ? parseInt(String(fd.get("maxUses"))) : null,
    };
    const res = await fetch("/api/seller/discounts", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    setBusy(false);
    const j = await res.json();
    if (!res.ok) {
      toast.error(j.error ?? "Failed");
      return;
    }
    toast.success("Code created");
    r.refresh();
  }
  const today = new Date().toISOString().slice(0, 10);
  const inAYear = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <Label>Code</Label>
        <Input name="code" required pattern="^[A-Za-z0-9_-]+$" />
      </div>
      <div>
        <Label>Type</Label>
        <select name="discountType" className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm">
          <option value="percentage">Percentage (%)</option>
          <option value="fixed">Fixed (cents)</option>
        </select>
      </div>
      <div>
        <Label>Value</Label>
        <Input name="discountValue" type="number" required min={1} />
      </div>
      <div>
        <Label>Max uses</Label>
        <Input name="maxUses" type="number" min={1} placeholder="Unlimited" />
      </div>
      <div>
        <Label>Start</Label>
        <Input name="startDate" type="date" defaultValue={today} required />
      </div>
      <div>
        <Label>End</Label>
        <Input name="endDate" type="date" defaultValue={inAYear} required />
      </div>
      <div className="col-span-2">
        <Label>Applies to (leave empty = all)</Label>
        <div className="grid grid-cols-2 gap-1 max-h-40 overflow-auto border border-border rounded p-2 text-sm">
          {products.map((p) => (
            <label key={p.id} className="flex items-center gap-2">
              <input type="checkbox" name="applicableProductIds" value={p.id} />
              {p.title}
            </label>
          ))}
        </div>
      </div>
      <Button type="submit" disabled={busy} className="col-span-2 mt-2">
        {busy ? "Creating..." : "Create code"}
      </Button>
    </form>
  );
}
