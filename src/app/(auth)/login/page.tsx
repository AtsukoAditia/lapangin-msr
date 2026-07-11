"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login gagal");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="page-enter page-enter-scale w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/30">
              <span className="text-white font-black text-2xl">⚡</span>
            </div>
            <h1 className="text-3xl font-black text-white">
              Arena<span className="text-emerald-400">Book</span>
            </h1>
          </Link>
          <p className="text-slate-400 mt-2">Masuk ke akun Anda</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700 p-8"
        >
          <h2 className="text-xl font-bold text-white mb-6">👋 Selamat Datang Kembali</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="email@contoh.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Belum punya akun?{" "}
              <Link href="/register" className="text-emerald-400 font-semibold hover:text-emerald-300">
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <p className="text-xs text-emerald-400 text-center mb-1 font-medium">Demo Customer:</p>
          <p className="text-xs text-emerald-300 text-center font-mono">
            budi@email.com / budi123
          </p>
        </div>

        {/* Back to home */}
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>

      {/* Browser autofill fix: force white text on autofilled inputs */}
      <style dangerouslySetInnerHTML={{ __html: `
        @-webkit-keyframes onAutoFillStart { from {} to {} }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: #ffffff !important;
          -webkit-box-shadow: 0 0 0px 1000px rgba(55, 65, 81, 0.5) inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        input[data-completed="true"] {
          animation: onAutoFillStart 0.01s forwards;
        }
      ` }} />
    </div>
  );
}