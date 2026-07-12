"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function AdminLoginPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Detect browser autofill
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formRef.current) {
        const emailInput = formRef.current.querySelector('input[name="admin-email"]') as HTMLInputElement;
        const passwordInput = formRef.current.querySelector('input[name="admin-password"]') as HTMLInputElement;
        if (emailInput && emailInput.value && !email) setEmail(emailInput.value);
        if (passwordInput && passwordInput.value && !password) setPassword(passwordInput.value);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Read values from DOM to handle autofill
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const emailValue = (formData.get("admin-email") as string) || email;
    const passwordValue = (formData.get("admin-password") as string) || password;

    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, password: passwordValue }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login gagal");
        return;
      }

      const redirectParam = new URLSearchParams(window.location.search).get("redirect");
      window.location.href = redirectParam || data.dashboardUrl || "/";
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="text-white font-black text-2xl">⚡</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            Lapang<span className="text-emerald-400">in</span>
          </h1>
          <p className="text-gray-400 mt-2">Admin Panel Login</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl"
        >
          <h2 className="text-xl font-bold text-white mb-6">🔐 Masuk sebagai Admin</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="admin-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onAnimationStart={(e) => {
                  // Detect autofill animation
                  if (e.animationName === "onAutoFillStart") {
                    setEmail(e.currentTarget.value);
                  }
                }}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="admin@lapangin.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                name="admin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onAnimationStart={(e) => {
                  if (e.animationName === "onAutoFillStart") {
                    setPassword(e.currentTarget.value);
                  }
                }}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Memproses...
              </span>
            ) : (
              "Masuk"
            )}
          </button>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
              ← Kembali ke Beranda
            </Link>
          </div>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <p className="text-xs text-gray-400 text-center mb-2">Demo Credentials:</p>
          <p className="text-xs text-gray-500 text-center font-mono">
            admin@lapangin.id / Admin123!@#
          </p>
          <p className="text-xs text-gray-600 text-center font-mono mt-1">
            owner@lapangin.id / Owner123!@#
          </p>
        </div>
      </div>
    </div>
  );
}