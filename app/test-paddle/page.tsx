"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";

// Paddle.js types
declare global {
  interface Window {
    Paddle: any;
  }
}

export default function TestPaddlePage() {
  const [paddleLoaded, setPaddleLoaded] = useState(false);
  const [busy, setBusy] = useState(false);

  // Load Paddle.js
  useEffect(() => {
    const loadPaddle = async () => {
      if (window.Paddle) {
        setPaddleLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
      script.async = true;
      
      script.onload = () => {
        console.log('Paddle.js loaded, initializing...');
        try {
          window.Paddle.Initialize({
            token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
            environment: 'sandbox', // Explicitly set sandbox environment
          });
          console.log('Paddle.js initialized successfully');
          setPaddleLoaded(true);
        } catch (error) {
          console.error('Paddle.js initialization error:', error);
          toast.error('Failed to initialize Paddle.js');
        }
      };
      
      script.onerror = () => {
        console.error('Failed to load Paddle.js');
        toast.error('Payment system unavailable');
      };

      document.head.appendChild(script);
    };

    loadPaddle();
  }, []);

  const testInlineCheckout = async () => {
    if (!paddleLoaded) {
      toast.error('Paddle.js not loaded yet');
      return;
    }

    setBusy(true);
    
    try {
      console.log('Creating test transaction...');
      
      // Create a test transaction
      const response = await fetch('/api/test-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ name: 'Test Product', priceCents: 1000, quantity: 1 }],
          customerEmail: 'test@example.com'
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create transaction');
      }
      
      console.log('Transaction created:', data.transactionId);
      
      // Open Paddle inline checkout
      await new Promise<void>((resolve, reject) => {
        window.Paddle.Checkout.open({
          transactionId: data.transactionId,
          settings: {
            displayMode: 'overlay',
            theme: 'light',
            allowLogout: false,
            showAddTaxId: true,
            showAddDiscounts: true,
          },
          eventCallback: (eventData: any) => {
            console.log('Paddle checkout event:', eventData);
            
            switch (eventData.name) {
              case 'checkout.completed':
                toast.success('Test payment completed!');
                resolve();
                break;
              case 'checkout.closed':
                if (eventData.data?.status === 'completed') {
                  resolve();
                } else {
                  reject(new Error('Checkout cancelled'));
                }
                break;
              case 'checkout.error':
                console.error('Checkout error:', eventData);
                reject(new Error('Checkout error'));
                break;
            }
          },
        });
      });
    } catch (error: any) {
      console.error('Test checkout error:', error);
      toast.error(error.message || 'Test checkout failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Paddle.js Test Page
        </h1>
        
        <div className="space-y-4">
          <div className="text-sm">
            <strong>Paddle.js Status:</strong> {paddleLoaded ? '✅ Loaded' : '⏳ Loading...'}
          </div>
          
          <div className="text-sm">
            <strong>Client Token:</strong> {process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ? '✅ Set' : '❌ Missing'}
          </div>
          
          <Button 
            onClick={testInlineCheckout}
            disabled={!paddleLoaded || busy}
            className="w-full"
          >
            {busy ? 'Testing...' : 'Test Inline Checkout'}
          </Button>
          
          <div className="text-xs text-gray-500 text-center">
            This will create a test transaction and open Paddle's inline checkout.
            Use test card: 4000 0000 0000 0002
          </div>
        </div>
      </div>
    </div>
  );
}