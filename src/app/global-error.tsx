"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "1rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Terjadi Kesalahan</h1>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>Ada masalah yang tidak terduga. Silakan coba lagi.</p>
          <button
            onClick={reset}
            style={{ padding: "0.75rem 1.5rem", backgroundColor: "#059669", color: "#fff", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontSize: "1rem" }}
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}
