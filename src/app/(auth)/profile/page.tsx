"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Reward {
  id: string;
  name: string;
  description: string;
  type: string;
  pointsCost: number;
  value: number;
  isActive: boolean;
}

interface LoyaltyData {
  transactions: Array<{
    id: string;
    type: string;
    points: number;
    description: string;
    createdAt: string;
    bookingCode?: string;
  }>;
  points: number;
  tier: string;
  totalSpent: number;
  rewards: Reward[];
  redemptions: Array<{
    id: string;
    rewardName: string;
    pointsUsed: number;
    status: string;
    createdAt: string;
  }>;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  totalSpent: number;
  memberSince: string;
}

const TIER_CONFIG: Record<string, { label: string; color: string; icon: string; next?: string; minPoints: number }> = {
  bronze: { label: "Bronze", color: "from-amber-700 to-amber-500", icon: "🥉", next: "Silver", minPoints: 0 },
  silver: { label: "Silver", color: "from-gray-400 to-gray-300", icon: "🥈", next: "Gold", minPoints: 500 },
  gold: { label: "Gold", color: "from-yellow-500 to-yellow-300", icon: "🥇", next: "Platinum", minPoints: 2000 },
  platinum: { label: "Platinum", color: "from-primary-500 to-primary-300", icon: "💎", minPoints: 5000 },
};

function getTier(points: number) {
  if (points >= 5000) return "platinum";
  if (points >= 2000) return "gold";
  if (points >= 500) return "silver";
  return "bronze";
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "rewards" | "history">("overview");
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, loyaltyRes] = await Promise.all([
          fetch("/api/auth/session"),
          fetch("/api/customer/loyalty"),
        ]);

        if (!profileRes.ok) {
          router.push("/login");
          return;
        }

        const profileData = await profileRes.json();
        setProfile(profileData.user);

        if (loyaltyRes.ok) {
          const loyaltyResponse = await loyaltyRes.json();
          if (loyaltyResponse.success && loyaltyResponse.data) {
            setLoyalty({
              transactions: loyaltyResponse.data.transactions || [],
              points: loyaltyResponse.data.totalPoints || 0,
              tier: loyaltyResponse.data.tier || 'bronze',
              totalSpent: loyaltyResponse.data.totalSpent || 0,
              rewards: loyaltyResponse.data.rewards || [],
              redemptions: loyaltyResponse.data.redemptions || [],
            });
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  async function handleRedeem(rewardId: string) {
    if (!confirm("Tukarkan poin untuk reward ini?")) return;
    setRedeeming(rewardId);
    try {
      const res = await fetch("/api/customer/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "redeem", bookingId: rewardId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Berhasil menukarkan poin! 🎉");
        // Reload data
        const loyaltyRes = await fetch("/api/customer/loyalty");
        if (loyaltyRes.ok) {
          const resp = await loyaltyRes.json();
          if (resp.success && resp.data) {
            setLoyalty({
              transactions: resp.data.transactions || [],
              points: resp.data.totalPoints || 0,
              tier: resp.data.tier || 'bronze',
              totalSpent: resp.data.totalSpent || 0,
              rewards: resp.data.rewards || [],
              redemptions: resp.data.redemptions || [],
            });
          }
        }
      } else {
        alert(data.error || "Gagal menukarkan poin");
      }
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setRedeeming(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const tier = loyalty?.tier || getTier(profile.loyaltyPoints);
  const tierConfig = TIER_CONFIG[tier];
  const points = loyalty?.points ?? profile.loyaltyPoints;

  // Calculate progress to next tier
  const nextTierPoints = tierConfig.next ? TIER_CONFIG[getTier(points + 1) === tier ? tier : getTier(points + 1000)].minPoints : 0;
  const progress = tierConfig.next ? Math.min(100, ((points - tierConfig.minPoints) / (nextTierPoints - tierConfig.minPoints)) * 100) : 100;

  return (
    <div className="page-enter page-enter-slide-up min-h-screen bg-gray-50 pb-24">
      {/* Profile Header */}
      <div className={`bg-gradient-to-br ${tierConfig.color} text-white`}>
        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
            {tierConfig.icon}
          </div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-white/80 text-sm mt-1">{profile.email}</p>
          
          {/* Tier Badge */}
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 bg-white/20 backdrop-blur rounded-full">
            <span className="text-lg">{tierConfig.icon}</span>
            <span className="font-semibold">Member {tierConfig.label}</span>
          </div>

          {/* Points Display */}
          <div className="mt-6 flex items-center justify-center gap-8">
            <div>
              <div className="text-3xl font-bold">{points.toLocaleString()}</div>
              <div className="text-white/70 text-sm">Poin Tersedia</div>
            </div>
            <div className="w-px h-10 bg-white/30"></div>
            <div>
              <div className="text-3xl font-bold">{formatCurrency(loyalty?.totalSpent ?? profile.totalSpent)}</div>
              <div className="text-white/70 text-sm">Total Transaksi</div>
            </div>
          </div>

          {/* Tier Progress */}
          {tierConfig.next && (
            <div className="mt-6">
              <div className="flex justify-between text-xs text-white/70 mb-1">
                <span>{tierConfig.label}</span>
                <span>{TIER_CONFIG[getTier(nextTierPoints)]?.label || tierConfig.next}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-xs text-white/60 mt-1">
                {(nextTierPoints - points).toLocaleString()} poin lagi untuk naik ke {tierConfig.next}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-lg mx-auto px-4 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg flex overflow-hidden">
          {[
            { key: "overview" as const, label: "Overview", icon: "📊" },
            { key: "rewards" as const, label: "Rewards", icon: "🎁" },
            { key: "history" as const, label: "Riwayat", icon: "📋" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-center text-sm font-medium transition ${
                activeTab === tab.key
                  ? "text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-lg mx-auto px-4 mt-4">
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl mb-1">🏆</div>
                <div className="text-sm text-gray-500">Member Sejak</div>
                <div className="font-semibold">{formatDate(profile.memberSince)}</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl mb-1">📱</div>
                <div className="text-sm text-gray-500">No. HP</div>
                <div className="font-semibold">{profile.phone}</div>
              </div>
            </div>

            {/* How to Earn */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3">💡 Cara Mendapatkan Poin</h3>
              <div className="space-y-3">
                {[
                  { icon: "📅", text: "Setiap booking mendapat 1 poin per Rp 10.000" },
                  { icon: "⭐", text: "Bonus 2x poin di hari weekend" },
                  { icon: "🎉", text: "Bonus 50 poin untuk member baru" },
                  { icon: "🔥", text: "Bonus tier multiplier: Silver 1.2x, Gold 1.5x, Platinum 2x" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm text-gray-600">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tier Benefits */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3">🎖️ Benefit Tier</h3>
              <div className="space-y-2">
                {Object.entries(TIER_CONFIG).map(([key, config]) => (
                  <div
                    key={key}
                    className={`flex items-center gap-3 p-2 rounded-lg ${key === tier ? "bg-emerald-50 ring-2 ring-emerald-400" : ""}`}
                  >
                    <span className="text-xl">{config.icon}</span>
                    <div className="flex-1">
                      <span className="font-medium text-sm">{config.label}</span>
                      <span className="text-xs text-gray-500 ml-2">({config.minPoints.toLocaleString()}+ poin)</span>
                    </div>
                    {key === tier && <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">Aktif</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "rewards" && (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-emerald-800">
                <span className="font-bold">Poin Anda: {points.toLocaleString()}</span> — Tukarkan dengan reward di bawah ini!
              </p>
            </div>

            {(loyalty?.rewards || []).length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <div className="text-4xl mb-3">🎁</div>
                <p className="text-gray-500">Belum ada reward tersedia</p>
              </div>
            ) : (
              (loyalty?.rewards || []).map((reward) => {
                const canAfford = points >= reward.pointsCost;
                return (
                  <div key={reward.id} className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">
                            {reward.type === "discount_percentage" ? "🏷️" :
                             reward.type === "discount_amount" ? "💰" :
                             reward.type === "free_hour" ? "⏰" : "🏟️"}
                          </span>
                          <h4 className="font-bold text-gray-800">{reward.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                        <div className="text-sm">
                          {reward.type === "discount_percentage" && (
                            <span className="text-emerald-600 font-medium">Diskon {reward.value}%</span>
                          )}
                          {reward.type === "discount_amount" && (
                            <span className="text-emerald-600 font-medium">Diskon {formatCurrency(reward.value)}</span>
                          )}
                          {reward.type === "free_hour" && (
                            <span className="text-emerald-600 font-medium">{reward.value} Jam Gratis</span>
                          )}
                          {reward.type === "free_session" && (
                            <span className="text-emerald-600 font-medium">1 Sesi Gratis</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-amber-600">{reward.pointsCost} Poin</div>
                        <button
                          onClick={() => handleRedeem(reward.id)}
                          disabled={!canAfford || redeeming === reward.id}
                          className={`mt-2 px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                            canAfford
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {redeeming === reward.id ? "..." : canAfford ? "Tukar" : "Poin Kurang"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Redemption History */}
            {(loyalty?.redemptions || []).length > 0 && (
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3">📋 Riwayat Penukaran</h3>
                <div className="space-y-2">
                  {(loyalty?.redemptions || []).map((r) => (
                    <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-sm">{r.rewardName}</p>
                        <p className="text-xs text-gray-500">{formatDate(r.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-red-500 font-medium">-{r.pointsUsed} poin</span>
                        <span className={`block text-xs ${
                          r.status === "applied" ? "text-emerald-500" : r.status === "pending" ? "text-amber-500" : "text-gray-400"
                        }`}>
                          {r.status === "applied" ? "Digunakan" : r.status === "pending" ? "Menunggu" : "Kedaluwarsa"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-4">
            {(loyalty?.transactions || []).length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-500">Belum ada transaksi poin</p>
                <Link href="/booking/futsal" className="inline-block mt-3 text-emerald-600 font-medium text-sm hover:underline">
                  Mulai Booking →
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
                {(loyalty?.transactions || []).map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 p-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      tx.type === "earned" ? "bg-emerald-100" :
                      tx.type === "redeemed" ? "bg-red-100" :
                      tx.type === "bonus" ? "bg-amber-100" :
                      "bg-gray-100"
                    }`}>
                      {tx.type === "earned" ? "➕" :
                       tx.type === "redeemed" ? "➖" :
                       tx.type === "bonus" ? "🎁" :
                       tx.type === "expired" ? "⏰" : "✏️"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-800 truncate">{tx.description}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(tx.createdAt)}
                        {tx.bookingCode && ` • ${tx.bookingCode}`}
                      </p>
                    </div>
                    <span className={`font-bold text-sm ${
                      tx.points > 0 ? "text-emerald-600" : "text-red-500"
                    }`}>
                      {tx.points > 0 ? "+" : ""}{tx.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}