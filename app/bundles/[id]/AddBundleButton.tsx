"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";

export function AddBundleButton({ bundleId }: { bundleId: string }) {
  const r = useRouter();
  const [busy, setBusy] = useState(false);
  async function add() {
    setBusy(true);
    const res = await fetch("/api/cart/add", {
      method: "POST",
      body: JSON.stringify({ type: "bundle", id: bundleId }),
      headers: { "Content-Type": "application/json" },
    });
    setBusy(false);
    if (res.ok) {
      toast.success("Bundle added to cart");
      r.refresh();
    } else toast.error("Failed");
  }
  return (
    <Button onClick={add} disabled={busy} className="w-full" size="xl" variant="primary">
      {busy ? "Adding..." : "Add bundle to cart"}
    </Button>
  );
}
