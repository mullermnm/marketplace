import { Suspense } from "react";
import { SuccessPoller } from "./SuccessPoller";

export default function CheckoutSuccess({
  searchParams,
}: {
  searchParams: { _ptxn?: string };
}) {
  // Paddle appends `?_ptxn=<transaction_id>` to the configured payment-link
  // success URL after the customer pays.
  const txn = searchParams._ptxn ?? "";
  return (
    <div className="mx-auto max-w-md py-20 px-6 text-center">
      <Suspense fallback={null}>
        <SuccessPoller transactionId={txn} />
      </Suspense>
    </div>
  );
}
