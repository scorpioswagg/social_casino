export const APP_NAME = "Nocturne";
export const APP_TAGLINE = "A private social casino. Play for the house, not for cash.";
export const CURRENCY_NAME = "Casino Coins";
export const CURRENCY_CODE = "CC";

/** Welcome grant — virtual only, no cash value. */
export const SIGNUP_BONUS = 25_000;
export const DAILY_REWARD_AMOUNT = 5_000;

export const STAFF_ROLES = [
  "moderator",
  "support",
  "content_manager",
  "game_manager",
  "admin",
  "super_admin",
] as const;

export type RoleId =
  | "player"
  | "moderator"
  | "support"
  | "content_manager"
  | "game_manager"
  | "admin"
  | "super_admin";

export const ROLE_LABELS: Record<RoleId, string> = {
  player: "Player",
  moderator: "Moderator",
  support: "Support",
  content_manager: "Content manager",
  game_manager: "Game manager",
  admin: "Admin",
  super_admin: "Super admin",
};

export const ADMIN_NAV = [
  { to: "/admin", label: "Dashboard", roles: STAFF_ROLES },
  { to: "/admin/players", label: "Players", roles: ["admin", "super_admin", "moderator", "support"] },
  { to: "/admin/games", label: "Games", roles: ["admin", "super_admin", "game_manager"] },
  { to: "/admin/economy", label: "Economy", roles: ["admin", "super_admin"] },
  { to: "/admin/rewards", label: "Rewards", roles: ["admin", "super_admin", "content_manager"] },
  { to: "/admin/events", label: "Events", roles: ["admin", "super_admin", "content_manager"] },
  { to: "/admin/leaderboards", label: "Leaderboards", roles: ["admin", "super_admin"] },
  { to: "/admin/moderation", label: "Moderation", roles: ["admin", "super_admin", "moderator"] },
  { to: "/admin/support", label: "Support", roles: ["admin", "super_admin", "support"] },
  { to: "/admin/analytics", label: "Analytics", roles: ["admin", "super_admin"] },
  { to: "/admin/audit", label: "Audit logs", roles: ["admin", "super_admin"] },
  { to: "/admin/settings", label: "Settings", roles: ["super_admin"] },
] as const;

export const PLAYER_NAV = [
  { to: "/", label: "Home" },
  { to: "/games", label: "Games" },
  { to: "/slots", label: "Slots" },
  { to: "/table-games", label: "Table Games" },
  { to: "/poker", label: "Poker" },
  { to: "/rewards", label: "Rewards" },
  { to: "/vip", label: "VIP" },
  { to: "/leaderboards", label: "Leaderboard" },
  { to: "/friends", label: "Friends" },
  { to: "/support", label: "Support" },
  { to: "/profile", label: "Profile" },
] as const;

export const AVATAR_PRESETS = [
  { id: "lion", label: "Lion" },
  { id: "raven", label: "Raven" },
  { id: "stag", label: "Stag" },
  { id: "koi", label: "Koi" },
  { id: "orchid", label: "Orchid" },
  { id: "compass", label: "Compass" },
  { id: "crown", label: "Crown" },
  { id: "fox", label: "Fox" },
] as const;

export const VIP_ORDER = ["bronze", "silver", "gold", "platinum", "diamond"] as const;
export type VipTier = (typeof VIP_ORDER)[number];

export const VIP_XP: Record<VipTier, number> = {
  bronze: 0,
  silver: 1000,
  gold: 5000,
  platinum: 20000,
  diamond: 80000,
};

export function xpToLevel(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 50)) + 1);
}

export function vipFromXp(xp: number): VipTier {
  if (xp >= 80000) return "diamond";
  if (xp >= 20000) return "platinum";
  if (xp >= 5000) return "gold";
  if (xp >= 1000) return "silver";
  return "bronze";
}
