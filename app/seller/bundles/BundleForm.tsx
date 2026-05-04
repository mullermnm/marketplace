"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Label, Textarea } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";

export function BundleForm({
  products,
}: {
  products: { id: string; title: string; priceCents: number }[];
}) {
  const r = useRouter();
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const sumCents = products
    .filter((p) => selected.includes(p.id))
    .reduce((s, p) => s + p.priceCents, 0);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      title: fd.get("title"),
      description: fd.get("description"),
      productIds: selected,
      bundlePriceCents: Math.round(parseFloat(String(fd.get("price"))) * 100),
    };
    const res = await fetch("/api/seller/bundles", {
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
    toast.success("Bundle created");
    r.refresh();
  }
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <Label>Title</Label>
        <Input name="title" required />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea name="description" required />
      </div>
      <div>
        <Label>Pick products (≥2)</Label>
        <div className="grid grid-cols-2 gap-1 max-h-40 overflow-auto border border-border rounded p-2 text-sm">
          {products.map((p) => (
            <label key={p.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selected.includes(p.id)}
                onChange={(e) => {
                  if (e.target.checked) setSelected([...selected, p.id]);
                  else setSelected(selected.filter((x) => x !== p.id));
                }}
              />
              {p.title} (${(p.priceCents / 100).toFixed(2)})
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Individual total: ${(sumCents / 100).toFixed(2)}</p>
      </div>
      <div>
        <Label>Bundle price (USD, must be ≤ individual total)</Label>
        <Input name="price" type="number" min={0} step={0.01} required />
      </div>
      <Button type="submit" disabled={busy || selected.length < 2}>
        {busy ? "Creating..." : "Create bundle"}
      </Button>
    </form>
  );
}
