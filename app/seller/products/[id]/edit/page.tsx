import { requireRole } from "@/src/lib/auth/guards";
import { productsRepo } from "@/src/lib/repos/products";
import { categoriesRepo } from "@/src/lib/repos/categories";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { ProductForm } from "../../ProductForm";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const session = await requireRole("seller");
  const p = productsRepo.byId(params.id);
  if (!p || p.sellerId !== session.uid) notFound();
  const cats = categoriesRepo.all();
  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      <Card>
        <CardHeader><CardTitle>Edit product</CardTitle></CardHeader>
        <CardContent>
          <ProductForm categories={cats} initial={p} />
        </CardContent>
      </Card>
    </div>
  );
}
