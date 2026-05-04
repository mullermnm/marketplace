"use client";

import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddToCartButton({ productId }: { productId: string }) {
  const r = useRouter();
  const [busy, setBusy] = useState(false);
  async function add() {
    setBusy(true);
    const res = await fetch("/api/cart/add", {
      method: "POST",
      body: JSON.stringify({ type: "product", id: productId }),
      headers: { "Content-Type": "application/json" },
    });
    setBusy(false);
    if (res.ok) {
      toast.success("Added to cart");
      r.refresh();
    } else toast.error("Failed");
  }
  return (
    <Button onClick={add} disabled={busy} className="w-full" size="xl" variant="primary">
      {busy ? "Adding..." : "Add to cart"}
    </Button>
  );
}
