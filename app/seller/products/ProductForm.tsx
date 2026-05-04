"use client";

import { useState } from "react";
import { CategoryDoc } from "@/src/lib/repos/categories";
import { Input, Label, Textarea } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ProductForm({
  categories,
  initial,
}: {
  categories: CategoryDoc[];
  initial?: any;
}) {
  const r = useRouter();
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      id: initial?.id,
      title: fd.get("title"),
      description: fd.get("description"),
      priceCents: Math.round(parseFloat(String(fd.get("price") ?? "0")) * 100),
      categoryIds: fd.getAll("categoryIds"),
      productType: fd.get("productType"),
      isSoftware: fd.get("isSoftware") === "on",
    };
    const res = await fetch("/api/seller/products", {
      method: initial ? "PUT" : "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const j = await res.json();
    if (!res.ok) {
      toast.error(j.error ?? "Failed");
      setBusy(false);
      return;
    }
    const productId = j.product.id;

    if (file) {
      const upload = new FormData();
      upload.append("file", file);
      upload.append("productId", productId);
      const up = await fetch("/api/seller/products/upload", { method: "POST", body: upload });
      if (!up.ok) {
        const ej = await up.json().catch(() => ({}));
        toast.error(ej.error ?? "Upload failed");
        setBusy(false);
        return;
      }
    }
    toast.success(initial ? "Updated" : "Submitted for review");
    r.push("/seller/products");
    r.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={initial?.title ?? ""} />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required defaultValue={initial?.description ?? ""} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="price">Price (USD)</Label>
          <Input id="price" name="price" type="number" min={0} step={0.01} defaultValue={initial ? (initial.priceCents / 100).toFixed(2) : "9.99"} required />
        </div>
        <div>
          <Label htmlFor="productType">Type</Label>
          <select id="productType" name="productType" defaultValue={initial?.productType ?? "pdf"} className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm">
            {["pdf","video","audio","software","image","3d_model","document","other"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label>Categories</Label>
        <div className="grid grid-cols-2 gap-1 max-h-40 overflow-auto border border-border rounded p-2 text-sm">
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2">
              <input type="checkbox" name="categoryIds" value={c.id} defaultChecked={initial?.categoryIds?.includes(c.id)} />
              {c.path}
            </label>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isSoftware" defaultChecked={initial?.isSoftware} />
        This is software (generate license keys on purchase)
      </label>
      <div>
        <Label htmlFor="file">Digital file</Label>
        <input
          id="file"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">Max 5GB. Optional during demo — a placeholder is served if no file uploaded.</p>
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? "Saving..." : initial ? "Save changes" : "Submit for review"}
      </Button>
    </form>
  );
}
