import { requireRole } from "@/src/lib/auth/guards";
import { usersRepo } from "@/src/lib/repos/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

export default async function PendingSellersPage() {
  await requireRole("admin");
  const pending = usersRepo.bySellerStatus("pending_approval");
  return (
    <div className="mx-auto max-w-3xl py-8 px-4 space-y-4">
      <h1 className="text-2xl font-semibold">Pending seller applications ({pending.length})</h1>
      {pending.length === 0 && <p className="text-muted-foreground">None pending.</p>}
      {pending.map((u) => (
        <Card key={u.id}>
          <CardHeader>
            <CardTitle>{u.sellerProfile?.businessName}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{u.sellerProfile?.description}</p>
            <p className="text-xs text-muted-foreground mt-2">{u.email} · {u.sellerProfile?.contactEmail}</p>
            <div className="flex gap-2 mt-3">
              <form action="/api/admin/sellers/approve" method="post">
                <input type="hidden" name="userId" value={u.id} />
                <Button type="submit">Approve</Button>
              </form>
              <form action="/api/admin/sellers/reject" method="post" className="flex gap-2">
                <input type="hidden" name="userId" value={u.id} />
                <input name="reason" placeholder="Rejection reason" className="h-9 rounded-md border border-border bg-background px-3 text-sm" required />
                <Button type="submit" variant="destructive">Reject</Button>
              </form>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
