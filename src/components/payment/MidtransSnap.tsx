"use client";
import { useEffect } from "react";

interface MidtransSnapProps {
  snapToken: string;
  onSuccess?: (result: Record<string, unknown>) => void;
  onPending?: (result: Record<string, unknown>) => void;
  onError?: (result: Record<string, unknown>) => void;
  onClose?: () => void;
}

export default function MidtransSnap({ snapToken, onSuccess, onPending, onError, onClose }: MidtransSnapProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      (window as unknown as { snap: { pay: (token: string, options: Record<string, unknown>) => void } }).snap.pay(snapToken, {
        onSuccess,
        onPending,
        onError,
        onClose,
      });
    };

    return () => { document.body.removeChild(script); };
  }, [snapToken, onSuccess, onPending, onError, onClose]);

  return null;
}
