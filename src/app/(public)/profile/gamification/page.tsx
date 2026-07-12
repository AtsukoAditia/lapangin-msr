"use client";

import { useEffect, useState } from "react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  current: number;
  unlocked: boolean;
  tier: "bronze" | "silver" | "gold" | "platinum";
}

const TIER_COLORS: Record<string, string> = {
  bronze: "from-amber-600 to-amber-700",
  silver: "from-gray-400 to-gray-500",
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-primary-400 to-primary-600",
};

const TIER_BADGE: Record<string, string> = {
  bronze: "bg-amber-100 text-amber-800",
  silver: "bg-gray-100 text-gray-800",
  gold: "bg-yellow-100 text-yellow-800",
  platinum: "bg-primary-100 text-primary-800",
};

export default function GamificationPage() {
  const [achievements, setAchievements] = useState<{ unlocked: Achievement[]; locked: Achievement[] }>({ unlocked: [], locked: [] });
  const [stats, setStats] = useState({ totalAchievements: 0, unlockedCount: 0, completionPct: 0, tierCounts: { bronze: 0, silver: 0, gold: 0, platinum: 0 }, achievementPoints: 0 });
  const [loading, setLoading] = useState(true);

  // TODO: replace with actual customer ID from auth
  const customerId = "placeholder";

  useEffect(() => {
    fetch(`/api/gamification/achievements?customerId=${customerId}`)
      .then((r) => r.json())
      .then((d) => {
        setAchievements(d.achievements || { unlocked: [], locked: [] });
        setStats((s) => d.stats || s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="page-enter page-enter-slide-up min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-blue-600 px-4 py-8 text-center">
        <p className="text-4xl mb-2">🏆</p>
        <h1 className="text-2xl font-black text-white">Achievements</h1>
        <p className="text-purple-100 text-sm mt-1">
          {stats.unlockedCount} / {stats.totalAchievements} unlocked ({stats.completionPct}%)
        </p>
        <div className="mt-3 flex items-center justify-center gap-4 text-sm">
          <span className="bg-white/20 px-3 py-1 rounded-full text-white">
            🪙 {stats.achievementPoints} pts
          </span>
        </div>
        {/* Progress bar */}
        <div className="mx-auto mt-4 max-w-xs">
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Tier summary */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {(["bronze", "silver", "gold", "platinum"] as const).map((tier) => (
            <div key={tier} className="text-center p-3 rounded-xl bg-white border shadow-sm">
              <p className="text-2xl">{tier === "bronze" ? "🥉" : tier === "silver" ? "🥈" : tier === "gold" ? "🥇" : "💎"}</p>
              <p className="text-lg font-bold text-gray-900">{stats.tierCounts[tier]}</p>
              <p className="text-[10px] text-gray-500 capitalize">{tier}</p>
            </div>
          ))}
        </div>

        {/* Unlocked */}
        {achievements.unlocked.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-3">✅ Unlocked ({achievements.unlocked.length})</h2>
            <div className="space-y-2">
              {achievements.unlocked.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-emerald-200 shadow-sm">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${TIER_COLORS[a.tier]} text-2xl shadow-md`}>
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">{a.name}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${TIER_BADGE[a.tier]}`}>
                        {a.tier}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{a.description}</p>
                  </div>
                  <span className="text-emerald-600 text-lg">✓</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        {achievements.locked.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-3">🔒 Locked ({achievements.locked.length})</h2>
            <div className="space-y-2">
              {achievements.locked.map((a) => {
                const pct = Math.min(100, Math.round((a.current / a.requirement) * 100));
                return (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 opacity-70">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl">
                      {a.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700">{a.name}</p>
                      <p className="text-xs text-gray-400">{a.description}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-400">{a.current}/{a.requirement}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
