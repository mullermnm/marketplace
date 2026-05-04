import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md py-16 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <p className="text-sm text-muted-foreground mt-4">
            Already have one?{" "}
            <Link href="/login" className="text-primary underline">Log in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
