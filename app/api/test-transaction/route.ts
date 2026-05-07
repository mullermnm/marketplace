import { NextRequest, NextResponse } from "next/server";
import { paddle } from "@/src/lib/services/paddle";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customerEmail } = body;

    if (!items || !customerEmail) {
      return NextResponse.json(
        { error: "Missing required fields: items, customerEmail" },
        { status: 400 }
      );
    }

    console.log('Creating test transaction with items:', items);

    const checkout = await paddle().createInlineCheckout({
      customerEmail,
      items: items.map((item: any) => ({
        name: item.name,
        priceCents: item.priceCents,
        quantity: item.quantity,
      })),
      metadata: {
        test: 'true',
        source: 'test-page'
      },
    });

    console.log('Test transaction created:', checkout.transactionId);

    return NextResponse.json({ 
      transactionId: checkout.transactionId,
      items: checkout.items 
    });
  } catch (error: any) {
    console.error("[test-transaction] error", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to create test transaction" },
      { status: 500 }
    );
  }
}