import { requireUser } from "@/src/lib/auth/guards";
import { ordersRepo } from "@/src/lib/repos/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import Link from "next/link";

export default async function CustomerDashboard() {
  const session = await requireUser();
  const orders = ordersRepo.byCustomer(session.uid);
  return (
    <div className="mx-auto max-w-3xl py-8 px-4 space-y-4">
      <h1 className="text-2xl font-semibold">Hello, {session.name}</h1>
      <Card>
        <CardHeader><CardTitle>Quick links</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1">
          <Link href="/orders" className="block underline">My orders ({orders.length})</Link>
          <Link href="/seller/onboarding" className="block underline">Become a seller</Link>
          <Link href="/affiliate/dashboard" className="block underline">Affiliate program</Link>
          <Link href="/api/account/export" className="block underline">Export my data (GDPR)</Link>
        </CardContent>
      </Card>
    </div>
  );
}
