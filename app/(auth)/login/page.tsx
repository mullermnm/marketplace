import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md py-16 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Log in</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="text-sm text-muted-foreground mt-4">
            New here?{" "}
            <Link href="/register" className="text-primary underline">Create an account</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
