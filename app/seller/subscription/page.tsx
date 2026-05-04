import { requireRole } from "@/src/lib/auth/guards";
import { subsRepo } from "@/src/lib/repos/subscriptions";
import { TIERS } from "@/src/lib/config/tiers";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { formatMoney } from "@/src/lib/utils";

export default async function SubscriptionPage() {
  const session = await requireRole("seller");
  const sub = subsRepo.byUserId(session.uid);
  return (
    <div className="mx-auto max-w-5xl py-8 px-4 space-y-6">
      <h1 className="text-2xl font-semibold">Subscription</h1>
      {sub && (
        <Card>
          <CardHeader><CardTitle>Current plan</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <p>Tier: <b>{sub.tier}</b> · Status: {sub.status}</p>
            <p>Period ends: {new Date(sub.currentPeriodEnd).toLocaleDateString()}</p>
            <p>Commission: {sub.commissionRate}% · Products: {sub.currentProductCount}/{sub.productLimit === -1 ? "∞" : sub.productLimit}</p>
          </CardContent>
        </Card>
      )}
      <div className="grid md:grid-cols-4 gap-4">
        {Object.values(TIERS).map((t) => (
          <Card key={t.id} className={sub?.tier === t.id ? "ring-2 ring-primary" : ""}>
            <CardHeader><CardTitle>{t.name}</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-2xl font-bold">{formatMoney(t.monthlyPriceCents)}<span className="text-sm text-muted-foreground">/mo</span></p>
              <p>{t.commissionRate}% commission</p>
              <p>{t.productLimit === -1 ? "Unlimited" : t.productLimit} products</p>
              <p>{t.storageLimitGB}GB storage</p>
              <form action="/api/seller/subscription/checkout" method="post">
                <input type="hidden" name="tierId" value={t.id} />
                <Button type="submit" className="w-full" variant={sub?.tier === t.id ? "outline" : "default"} disabled={sub?.tier === t.id}>
                  {sub?.tier === t.id ? "Current" : t.id === "free_trial" ? "Switch" : "Subscribe"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
