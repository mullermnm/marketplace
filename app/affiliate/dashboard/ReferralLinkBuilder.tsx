"use client";

import { useState } from "react";
import { Section } from "@/src/components/dashboard/Section";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Copy, Check, ExternalLink } from "lucide-react";

export function ReferralLinkBuilder({ affiliateId }: { affiliateId: string }) {
  const [productId, setProductId] = useState("");
  const [done, setDone] = useState(false);
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const link = productId
    ? `${base}/api/affiliate/track?aff=${affiliateId}&p=${productId.trim()}`
    : "";
  async function copy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setDone(true);
    setTimeout(() => setDone(false), 1200);
  }
  return (
    <Section
      title="Build a referral link"
      hint={
        <>Paste any product ID (the <code className="font-mono text-[10px]">prd_…</code> part of a product URL).</>
      }
    >
      <div className="grid sm:grid-cols-[1fr_auto] gap-2 items-center">
        <Input
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="prd_aBc123…"
          className="font-mono"
        />
        <a
          href="/products"
          target="_blank"
          className="inline-flex items-center gap-1 text-xs text-[color:var(--fg-muted)] hover:text-[color:var(--fg)] px-3"
        >
          Browse <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      {link && (
        <div className="mt-3 rounded-md border border-[color:var(--border)] bg-[color:var(--muted)]/40 px-3 py-2 flex items-center gap-2">
          <code className="flex-1 font-mono text-xs truncate">{link}</code>
          <Button onClick={copy} size="sm" variant="ghost">
            {done ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            {done ? "Copied" : "Copy"}
          </Button>
        </div>
      )}
      <p className="mt-3 text-xs text-[color:var(--fg-muted)]">
        Affiliate ID: <code className="font-mono">{affiliateId}</code>
      </p>
    </Section>
  );
}
