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
  const [picked, setPicked] = useState<string[]>(
    initial?.categoryIds ?? (categories[0] ? [categories[0].id] : []),
  );
  const [titleError, setTitleError] = useState("");
  const [descError, setDescError] = useState("");
  const [catError, setCatError] = useState("");

  function togglePick(id: string) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTitleError("");
    setDescError("");
    setCatError("");

    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") ?? "").trim();
    const description = String(fd.get("description") ?? "").trim();
    const priceStr = String(fd.get("price") ?? "0");
    const priceNum = parseFloat(priceStr);

    let bad = false;
    if (title.length < 3) {
      setTitleError("Title must be at least 3 characters.");
      bad = true;
    }
    if (description.length < 10) {
      setDescError("Description must be at least 10 characters.");
      bad = true;
    }
    if (picked.length === 0) {
      setCatError("Pick at least one category.");
      bad = true;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      toast.error("Enter a valid non-negative price.");
      bad = true;
    }
    if (bad) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setBusy(true);
    const body = {
      id: initial?.id,
      title,
      description,
      priceCents: Math.round(priceNum * 100),
      categoryIds: picked,
      productType: fd.get("productType"),
      isSoftware: fd.get("isSoftware") === "on",
    };
    const res = await fetch("/api/seller/products", {
      method: initial ? "PUT" : "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(j.error ?? `Failed (${res.status})`);
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
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={140}
          defaultValue={initial?.title ?? ""}
          aria-invalid={!!titleError}
        />
        {titleError && <p className="text-xs text-[color:var(--destructive)] mt-1">{titleError}</p>}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          minLength={10}
          defaultValue={initial?.description ?? ""}
          aria-invalid={!!descError}
          placeholder="Describe what's included, who it's for, and what makes it special. Minimum 10 characters."
        />
        {descError && <p className="text-xs text-[color:var(--destructive)] mt-1">{descError}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            step={0.01}
            defaultValue={initial ? (initial.priceCents / 100).toFixed(2) : "9.99"}
            required
          />
        </div>
        <div>
          <Label htmlFor="productType">Type</Label>
          <select
            id="productType"
            name="productType"
            defaultValue={initial?.productType ?? "pdf"}
            className="w-full h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--card)] px-3 text-sm focus-visible:outline-none focus-visible:border-[color:var(--brand-500)]"
          >
            {["pdf", "video", "audio", "software", "image", "3d_model", "document", "other"].map(
              (t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      <div>
        <Label>
          Categories <span className="text-[color:var(--fg-muted)] normal-case">· pick 1+</span>
        </Label>
        {categories.length === 0 ? (
          <p className="text-xs text-[color:var(--fg-muted)]">
            No categories defined yet. Ask an admin to create one.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => {
                const on = picked.includes(c.id);
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => togglePick(c.id)}
                    aria-pressed={on}
                    className={`text-xs rounded-full px-3 py-1 border transition-colors ${
                      on
                        ? "bg-[color:var(--brand-600)] border-[color:var(--brand-600)] text-white"
                        : "bg-[color:var(--card)] border-[color:var(--border)] text-[color:var(--fg-muted)] hover:text-[color:var(--fg)] hover:border-[color:var(--border-strong)]"
                    }`}
                  >
                    {c.path}
                  </button>
                );
              })}
            </div>
            {catError && (
              <p className="text-xs text-[color:var(--destructive)] mt-2">{catError}</p>
            )}
          </>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm select-none">
        <input
          type="checkbox"
          name="isSoftware"
          defaultChecked={initial?.isSoftware}
          className="accent-[color:var(--brand-600)]"
        />
        This is software (generate a unique license key on each purchase)
      </label>

      <div>
        <Label htmlFor="file">Digital file</Label>
        <input
          id="file"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[color:var(--muted)] file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-[color:var(--accent)]"
        />
        <p className="text-xs text-[color:var(--fg-muted)] mt-1">
          Optional during demo (a placeholder is served). Real product · max 5 GB.
        </p>
      </div>

      <Button type="submit" disabled={busy} variant="primary" size="lg">
        {busy ? "Saving…" : initial ? "Save changes" : "Submit for review"}
      </Button>
    </form>
  );
}
