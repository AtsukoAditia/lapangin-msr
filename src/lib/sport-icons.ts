// Sport-specific emoji/icon mapping for visual cards
// Supports both DB IDs (sport-futsal) and legacy keys (futsal)
export const sportEmoji: Record<string, string> = {
  // DB IDs
  "sport-futsal": "⚽",
  "sport-mini-soccer": "🥅",
  "sport-bulu-tangkis": "🏸",
  "sport-padel": "🎾",
  "sport-tenis": "🎾",
  "sport-basket": "🏀",
  // Legacy / slug keys
  futsal: "⚽",
  minisoccer: "🥅",
  "mini-soccer": "🥅",
  badminton: "🏸",
  "bulu-tangkis": "🏸",
  padel: "🎾",
  tenis: "🎾",
  basket: "🏀",
};

export const sportColor: Record<string, string> = {
  // DB IDs
  "sport-futsal": "bg-emerald-100 text-emerald-700",
  "sport-mini-soccer": "bg-green-100 text-green-700",
  "sport-bulu-tangkis": "bg-orange-100 text-orange-700",
  "sport-padel": "bg-blue-100 text-blue-700",
  "sport-tenis": "bg-yellow-100 text-yellow-700",
  "sport-basket": "bg-red-100 text-red-700",
  // Legacy / slug keys
  futsal: "bg-emerald-100 text-emerald-700",
  minisoccer: "bg-green-100 text-green-700",
  "mini-soccer": "bg-green-100 text-green-700",
  badminton: "bg-orange-100 text-orange-700",
  "bulu-tangkis": "bg-orange-100 text-orange-700",
  padel: "bg-blue-100 text-blue-700",
  tenis: "bg-yellow-100 text-yellow-700",
  basket: "bg-red-100 text-red-700",
};