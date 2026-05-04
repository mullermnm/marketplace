import { usersRepo } from "@/src/lib/repos/users";

export default function VerifyPage({ searchParams }: { searchParams: { u?: string } }) {
  const id = searchParams.u;
  const u = id ? usersRepo.byId(id) : null;
  if (u && !u.emailVerified) {
    usersRepo.update(u.id, { emailVerified: true });
  }
  return (
    <div className="mx-auto max-w-md py-16 px-4 text-center">
      <h1 className="text-2xl font-semibold mb-2">Email verified</h1>
      <p className="text-muted-foreground">You can close this tab.</p>
    </div>
  );
}
