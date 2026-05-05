import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { createProduct } from "@/src/lib/services/products";
import { productCreateSchema } from "@/src/lib/validation/schemas";
import { productsRepo } from "@/src/lib/repos/products";
import { formatError } from "@/src/lib/validation/errors";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in" }, { status: 401 });
  if (session.role !== "seller")
    return NextResponse.json(
      { error: "Only approved sellers can create products. Apply at /seller/onboarding." },
      { status: 403 },
    );
  try {
    const data = productCreateSchema.parse(await req.json());
    const result = createProduct({ sellerId: session.uid, ...data });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ ok: true, product: result.product });
  } catch (e) {
    return NextResponse.json({ error: formatError(e) }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const p = productsRepo.byId(body.id);
  if (!p || p.sellerId !== session.uid)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (p.status === "active")
    return NextResponse.json({ error: "Cannot edit active product (resubmit a new version)" }, { status: 400 });
  productsRepo.update(p.id, {
    title: body.title,
    description: body.description,
    priceCents: body.priceCents,
    categoryIds: body.categoryIds,
    productType: body.productType,
    isSoftware: body.isSoftware,
    status: "pending_review",
  });
  return NextResponse.json({ ok: true, product: productsRepo.byId(p.id) });
}
