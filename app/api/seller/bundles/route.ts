import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { bundleSchema } from "@/src/lib/validation/schemas";
import { productsRepo } from "@/src/lib/repos/products";
import { bundlesRepo } from "@/src/lib/repos/misc";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "seller")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const data = bundleSchema.parse(await req.json());
    const products = data.productIds.map((id) => productsRepo.byId(id)).filter(Boolean) as any[];
    if (products.length !== data.productIds.length)
      return NextResponse.json({ error: "Some products not found" }, { status: 400 });
    if (products.some((p) => p.sellerId !== session.uid))
      return NextResponse.json({ error: "All products must belong to you" }, { status: 400 });
    const individualTotal = products.reduce((s, p) => s + p.priceCents, 0);
    if (data.bundlePriceCents > individualTotal)
      return NextResponse.json({ error: "Bundle price must be ≤ individual total" }, { status: 400 });
    const savings = individualTotal - data.bundlePriceCents;
    const doc = bundlesRepo.create({
      sellerId: session.uid,
      title: data.title,
      description: data.description,
      products: products.map((p) => ({
        productId: p.id,
        title: p.title,
        individualPriceCents: p.priceCents,
      })),
      individualTotalCents: individualTotal,
      bundlePriceCents: data.bundlePriceCents,
      savingsCents: savings,
      savingsPercentage: individualTotal > 0 ? (savings / individualTotal) * 100 : 0,
      thumbnailUrl: products[0]?.thumbnailUrl ?? "",
      status: "active",
    });
    return NextResponse.json({ ok: true, bundle: doc });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
