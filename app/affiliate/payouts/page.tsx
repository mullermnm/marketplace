import { requireUser } from "@/src/lib/auth/guards";
import { affiliatesRepo, payoutsRepo } from "@/src/lib/repos/misc";
import { formatMoney } from "@/src/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

export default async function AffiliatePayouts() {
  const session = await requireUser();
  const aff = affiliatesRepo.byUserId(session.uid);
  const payouts = payoutsRepo.byRecipient(session.uid).filter((p) => p.recipientType === "affiliate");
  return (
    <div className="mx-auto max-w-3xl py-8 px-4 space-y-4">
      <h1 className="text-2xl font-semibold">Affiliate payouts</h1>
      {aff && (
        <Card>
          <CardHeader><CardTitle>Pending balance</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatMoney(aff.pendingCommissionsCents)}</p>
            <p className="text-sm text-muted-foreground">Paid monthly when balance ≥ $100.</p>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle>History</CardTitle></CardHeader>
        <CardContent>
          {payouts.length === 0 && <p className="text-muted-foreground text-sm">No payouts yet.</p>}
          <ul className="text-sm space-y-1">
            {payouts.map((p) => (
              <li key={p.id} className="flex justify-between border-b border-border pb-1">
                <span>{new Date(p.scheduledDate).toLocaleDateString()}</span>
                <span>{formatMoney(p.amountCents)} — {p.status}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
