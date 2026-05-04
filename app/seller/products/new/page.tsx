import { requireRole } from "@/src/lib/auth/guards";
import { categoriesRepo } from "@/src/lib/repos/categories";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { ProductForm } from "../ProductForm";

export default async function NewProductPage() {
  await requireRole("seller");
  const cats = categoriesRepo.all();
  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      <Card>
        <CardHeader><CardTitle>Create product</CardTitle></CardHeader>
        <CardContent>
          <ProductForm categories={cats} />
        </CardContent>
      </Card>
    </div>
  );
}
