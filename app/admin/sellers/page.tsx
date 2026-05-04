import { requireRole } from "@/src/lib/auth/guards";
import { usersRepo } from "@/src/lib/repos/users";
import { subsRepo } from "@/src/lib/repos/subscriptions";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";

export default async function AdminSellers() {
  await requireRole("admin");
  const sellers = usersRepo.all().filter((u) => u.role === "seller" || u.sellerProfile);
  return (
    <div className="mx-auto max-w-5xl py-8 px-4 space-y-4">
      <h1 className="text-2xl font-semibold">All sellers</h1>
      <ul className="space-y-3">
        {sellers.map((u) => {
          const sub = subsRepo.byUserId(u.id);
          return (
            <li key={u.id}>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {u.sellerProfile?.businessName ?? u.name}{" "}
                    <Badge variant="outline">{u.sellerProfile?.status ?? "no profile"}</Badge>{" "}
                    {sub && <Badge>{sub.tier}</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm flex justify-between">
                  <span>{u.email}</span>
                  <div className="flex gap-2">
                    <form action="/api/admin/sellers/suspend" method="post">
                      <input type="hidden" name="userId" value={u.id} />
                      <Button size="sm" variant="outline" type="submit">Suspend</Button>
                    </form>
                    <form action="/api/admin/sellers/ban" method="post">
                      <input type="hidden" name="userId" value={u.id} />
                      <Button size="sm" variant="destructive" type="submit">Ban</Button>
                    </form>
                    <form action="/api/admin/sellers/commission" method="post" className="flex gap-1">
                      <input type="hidden" name="userId" value={u.id} />
                      <input name="rate" type="number" step={0.1} min={0} max={50} placeholder="rate %" className="h-8 w-20 rounded border border-border bg-background px-2 text-sm" />
                      <Button size="sm" type="submit">Set rate</Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
