import { Suspense } from "react";
import { SuccessPoller } from "./SuccessPoller";

// Paddle's hosted-checkout redirect appends `?_ptxn=<id>`.
// The Paddle.js callback path normally creates the order before navigating
// here, but if the user lands here directly (or our confirm bridge failed)
// the poller will keep checking until the webhook lands, then jump to /orders/[id].
export default function CheckoutSuccess({
  searchParams,
}: {
  searchParams: { _ptxn?: string };
}) {
  return (
    <div className="mx-auto max-w-md py-20 px-6 text-center">
      <Suspense fallback={null}>
        <SuccessPoller transactionId={searchParams._ptxn ?? ""} />
      </Suspense>
    </div>
  );
}
