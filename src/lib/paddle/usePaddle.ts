"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Paddle: any;
  }
}

const SCRIPT_ID = "paddle-js-v2";

export function usePaddle() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    function init() {
      const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
      const env =
        (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as
          | "sandbox"
          | "production"
          | undefined) ?? "sandbox";
      if (!token) {
        setError(
          "NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not set — add it in .env.local and restart dev",
        );
        return;
      }
      try {
        window.Paddle.Environment.set(env);
        window.Paddle.Initialize({ token });
        if (!cancelled) setReady(true);
      } catch (e: any) {
        setError(e?.message ?? "Paddle init failed");
      }
    }

    if (typeof window === "undefined") return;
    if (window.Paddle?.Initialized) {
      setReady(true);
      return;
    }
    if (window.Paddle) {
      init();
      return;
    }
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      script.async = true;
      document.head.appendChild(script);
    }
    const handleLoad = () => init();
    const handleError = () => setError("Failed to load Paddle.js");
    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    return () => {
      cancelled = true;
      script?.removeEventListener("load", handleLoad);
      script?.removeEventListener("error", handleError);
    };
  }, []);

  return { ready, error };
}

export interface OpenCheckoutOpts {
  transactionId: string;
  customerEmail?: string;
  onCompleted?: (data: any) => void;
  onClosed?: (data: any) => void;
  onError?: (data: any) => void;
}

export function openPaddleCheckout({
  transactionId,
  customerEmail,
  onCompleted,
  onClosed,
  onError,
}: OpenCheckoutOpts) {
  if (typeof window === "undefined" || !window.Paddle) {
    throw new Error("Paddle.js not ready");
  }
  window.Paddle.Checkout.open({
    transactionId,
    ...(customerEmail ? { customer: { email: customerEmail } } : {}),
    settings: {
      displayMode: "overlay",
      theme: "light",
      allowLogout: false,
      showAddTaxId: true,
      showAddDiscounts: true,
    },
    eventCallback: (event: any) => {
      switch (event?.name) {
        case "checkout.completed":
          onCompleted?.(event.data);
          break;
        case "checkout.closed":
          onClosed?.(event.data);
          break;
        case "checkout.error":
          onError?.(event.data);
          break;
      }
    },
  });
}
