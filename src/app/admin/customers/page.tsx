"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  loyaltyTier: string;
  totalSpent: number;
  memberSince: string;
}

const TIER_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  bronze: { label: "Bronze", color: "bg-amber-100 text-amber-800", icon: "🥉" },
  silver: { label: "Silver", color: "bg-gray-100 text-gray-800", icon: "🥈" },
  gold: { label: "Gold", color: "bg-yellow-100 text-yellow-800", icon: "🥇" },
  platinum: { label: "Platinum", color: "bg-indigo-100 text-indigo-800", icon: "💎" },
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-blue-600 p-6 shadow-xl sm:p-8">
        <h1 className="text-2xl font-black text-white sm:text-3xl">👥 Pelanggan</h1>
        <p className="mt-1 text-sm text-purple-100">{customers.length} total pelanggan terdaftar</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {(["bronze", "silver", "gold", "platinum"] as const).map((tier) => {
          const count = customers.filter((c) => c.loyaltyTier === tier).length;
          const cfg = TIER_LABELS[tier];
          return (
            <div key={tier} className="rounded-xl border bg-white p-4 text-center shadow-sm">
              <p className="text-2xl">{cfg.icon}</p>
              <p className="text-lg font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500">{cfg.label}</p>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-lg font-bold text-slate-700">Belum ada pelanggan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map((customer) => {
            const tier = TIER_LABELS[customer.loyaltyTier] || TIER_LABELS.bronze;
            return (
              <div key={customer.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-lg font-bold text-white">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900">{customer.name}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tier.color}`}>
                            {tier.icon} {tier.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{customer.email} · {customer.phone}</p>
                        <p className="text-[10px] text-gray-400">Bergabung {new Date(customer.memberSince).toLocaleDateString("id-ID")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="text-xs text-gray-500">Poin</p>
                        <p className="text-sm font-bold text-indigo-600">{customer.loyaltyPoints.toLocaleString("id-ID")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Belanja</p>
                        <p className="text-sm font-bold text-emerald-600">Rp {customer.totalSpent.toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
