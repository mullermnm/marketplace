import { requireUser } from "@/src/lib/auth/guards";
import { affiliatesRepo, commissionsRepo, payoutsRepo } from "@/src/lib/repos/misc";
import { productsRepo } from "@/src/lib/repos/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { formatMoney } from "@/src/lib/utils";
import Link from "next/link";

export default async function AffiliateDashboard() {
  const session = await requireUser();
  const aff = affiliatesRepo.byUserId(session.uid);
  return (
    <div className="mx-auto max-w-4xl py-8 px-4 space-y-6">
      <h1 className="text-2xl font-semibold">Affiliate</h1>
      {!aff ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="mb-4">Become an affiliate and earn 10% on every product you refer.</p>
            <form action="/api/affiliate/register" method="post">
              <Button type="submit">Register as affiliate</Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader><CardTitle>Your stats</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Affiliate ID</p>
                <p className="font-mono">{aff.affiliateId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total earned</p>
                <p>{formatMoney(aff.totalEarningsCents)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pending</p>
                <p>{formatMoney(aff.pendingCommissionsCents)}</p>
              </div>
            </CardContent>
          </Card>
          <LinkBuilder affiliateId={aff.affiliateId} />
          <Card>
            <CardHeader><CardTitle>Referral links</CardTitle></CardHeader>
            <CardContent>
              {aff.referralLinks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No clicks yet.</p>
              ) : (
                <ul className="text-sm space-y-1">
                  {aff.referralLinks.map((l) => {
                    const p = productsRepo.byId(l.productId);
                    const conv = l.clicks > 0 ? (l.conversions / l.clicks) * 100 : 0;
                    return (
                      <li key={l.productId} className="flex justify-between">
                        <Link href={`/products/${l.productId}`} className="hover:underline">{p?.title ?? l.productId}</Link>
                        <span>{l.clicks} clicks · {l.conversions} conv ({conv.toFixed(1)}%)</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function LinkBuilder({ affiliateId }: { affiliateId: string }) {
  return (
    <Card>
      <CardHeader><CardTitle>Build referral link</CardTitle></CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">
          Append <code>?aff={affiliateId}</code> to any product URL, or use the API:
        </p>
        <code className="block bg-muted p-2 rounded text-xs">
          /api/affiliate/track?aff={affiliateId}&p=PRODUCT_ID
        </code>
      </CardContent>
    </Card>
  );
}
