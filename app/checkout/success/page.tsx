import { Suspense } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";

function SuccessContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your order has been processed successfully.
          You should receive a confirmation email shortly.
        </p>
        
        <div className="space-y-4">
          <Link href="/dashboard" className="block">
            <Button className="w-full">
              Go to Dashboard
            </Button>
          </Link>
          
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}