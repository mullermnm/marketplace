import { notFound } from "next/navigation";
import { requireUser } from "@/src/lib/auth/guards";
import { ordersRepo } from "@/src/lib/repos/orders";
import { productsRepo } from "@/src/lib/repos/products";
import { Card, CardContent } from "@/src/components/ui/card";
import { formatMoney } from "@/src/lib/utils";
import { Badge } from "@/src/components/ui/badge";
import Link from "next/link";
import { Download, Key, CheckCircle2, AlertCircle, Receipt } from "lucide-react";
import { OrderItemActions } from "./OrderItemActions";
import { RefundRequestForm } from "./RefundRequestForm";

export default async function OrderDetail({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { new?: string };
}) {
  const session = await requireUser();
  const order = ordersRepo.byId(params.id);
  if (!order || (order.customerId !== session.uid && session.role !== "admin"))
    notFound();
  const fresh = searchParams.new === "1";

  const statusBadge =
    order.paymentStatus === "completed" ? "success"
    : order.paymentStatus === "refunded" || order.paymentStatus === "partially_refunded" ? "destructive"
    : "warn";

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      {fresh && order.paymentStatus === "completed" && (
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-6 flex items-start gap-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-serif-display text-2xl mb-1">Thank you, your order's ready.</h2>
            <p className="text-sm text-[color:var(--fg-muted)]">
              Download links are below. We've also emailed them to you.
            </p>
          </div>
        </div>
      )}

      <div>
        <p className="text-xs uppercase tracking-widest text-[color:var(--fg-muted)] mb-1">Order</p>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="font-serif-display text-3xl tracking-tight font-mono">
            {order.id.slice(0, 16)}
          </h1>
          <Badge variant={statusBadge}>{order.paymentStatus.replace("_", " ")}</Badge>
        </div>
        <p className="text-sm text-[color:var(--fg-muted)] mt-2">
          Placed on {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      {order.requiresReview && order.paymentStatus !== "refunded" && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3 text-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-[color:var(--fg-muted)]">
            This order is being reviewed.
            {order.refundReason && (
              <> Reason: <span className="text-[color:var(--fg)]">{order.refundReason}</span></>
            )}
          </p>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-[color:var(--border)]">
            {order.items.map((i) => {
              const product = productsRepo.byId(i.productId);
              const expired = Date.now() > new Date(i.downloadTokenExpiry).getTime();
              return (
                <li key={i.productId} className="px-6 py-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        href={`/products/${i.productId}`}
                        className="font-medium hover:underline"
                      >
                        {i.title}
                      </Link>
                      <p className="text-xs text-[color:var(--fg-muted)] font-mono mt-0.5">
                        {product?.productType ?? "digital"} · v{product?.currentVersion ?? 1}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold tracking-tight whitespace-nowrap">
                        {formatMoney(i.priceCents)}
                      </span>
                      {i.refunded && <Badge variant="destructive" className="block mt-1">Refunded</Badge>}
                    </div>
                  </div>

                  {i.licenseKey && (
                    <div className="rounded-md border border-[color:var(--border)] bg-[color:var(--muted)]/40 p-3 flex items-center gap-3">
                      <Key className="w-4 h-4 text-[color:var(--brand-600)] dark:text-[color:var(--brand-300)] shrink-0" />
                      <code className="font-mono text-sm flex-1 select-all">{i.licenseKey}</code>
                      <CopyKey value={i.licenseKey} />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[color:var(--fg-muted)]">
                      {i.downloadCount} download{i.downloadCount !== 1 && "s"} · expires{" "}
                      {new Date(i.downloadTokenExpiry).toLocaleDateString()}
                    </span>
                    {i.refunded ? (
                      <span className="text-[color:var(--fg-muted)]">Access revoked</span>
                    ) : expired ? (
                      <span className="text-[color:var(--destructive)]">Download window expired</span>
                    ) : (
                      <a
                        href={`/api/download/${i.downloadToken}`}
                        className="inline-flex items-center gap-1.5 text-[color:var(--brand-600)] dark:text-[color:var(--brand-300)] font-medium hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-2 text-sm">
          <Row label="Subtotal" value={formatMoney(order.subtotalCents)} />
          {order.discountCents > 0 && (
            <Row
              label={`Discount${order.discountCodeUsed ? ` (${order.discountCodeUsed})` : ""}`}
              value={`−${formatMoney(order.discountCents)}`}
              accent="emerald"
            />
          )}
          <div className="border-t border-[color:var(--border)] pt-2 mt-2">
            <Row label="Total" value={formatMoney(order.totalCents)} bold />
          </div>
        </CardContent>
      </Card>

      {order.paymentStatus === "completed" &&
        !order.requiresReview &&
        order.customerId === session.uid && (
          <RefundRequestForm orderId={order.id} />
        )}

      <div className="flex items-center gap-3 text-xs text-[color:var(--fg-muted)] justify-center pt-4">
        <Receipt className="w-3.5 h-3.5" />
        Transaction #{order.paddleTransactionId.slice(0, 16)}
      </div>
    </div>
  );
}

function Row({
  label, value, bold = false, accent,
}: { label: string; value: string; bold?: boolean; accent?: "emerald" }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold" : ""}`}>
      <span className="text-[color:var(--fg-muted)]">{label}</span>
      <span className={
        accent === "emerald"
          ? "text-emerald-600 dark:text-emerald-400"
          : ""
      }>
        {value}
      </span>
    </div>
  );
}

function CopyKey({ value }: { value: string }) {
  return <OrderItemActions.Copy value={value} />;
}
