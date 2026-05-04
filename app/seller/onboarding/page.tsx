import { requireUser } from "@/src/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { OnboardingForm } from "./OnboardingForm";
import { usersRepo } from "@/src/lib/repos/users";
import { Badge } from "@/src/components/ui/badge";

export default async function OnboardingPage() {
  const session = await requireUser();
  const u = usersRepo.byId(session.uid)!;
  if (u.sellerProfile?.status === "approved") {
    return (
      <div className="mx-auto max-w-md py-12 px-4 text-center">
        <h1 className="text-2xl font-semibold mb-2">You're already a seller</h1>
        <a className="text-primary underline" href="/seller/dashboard">Go to dashboard</a>
      </div>
    );
  }
  if (u.sellerProfile?.status === "pending_approval") {
    return (
      <div className="mx-auto max-w-md py-12 px-4 text-center">
        <h1 className="text-2xl font-semibold mb-2">Application submitted</h1>
        <p className="text-muted-foreground">An admin will review and approve shortly.</p>
        <Badge variant="warn" className="mt-3">pending_approval</Badge>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-md py-12 px-4">
      <Card>
        <CardHeader><CardTitle>Become a seller</CardTitle></CardHeader>
        <CardContent>
          {u.sellerProfile?.status === "rejected" && (
            <p className="text-sm text-destructive mb-3">
              Previous application was rejected: {u.sellerProfile.rejectionReason}
            </p>
          )}
          <OnboardingForm />
        </CardContent>
      </Card>
    </div>
  );
}
