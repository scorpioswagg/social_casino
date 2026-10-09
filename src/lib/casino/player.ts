import { randomUUID } from "node:crypto";
import { getSql } from "@/lib/db";
import { SIGNUP_BONUS, vipFromXp, xpToLevel, type RoleId } from "./constants";
import { applyLedger } from "./coins";
import { requestMeta, writeAudit } from "./audit";

function slugifyUsername(name: string, userId: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 16);
  const suffix = userId.replace(/[^a-z0-9]/gi, "").slice(-4);
  return (base || "guest") + suffix;
}

export type PlayerSnapshot = {
  userId: string;
  username: string;
  avatarId: string;
  level: number;
  xp: number;
  vipTier: string;
  bio: string | null;
  coins: number;
  createdAt: string;
  roles: RoleId[];
  dailyClaimed: boolean;
  stats: {
    gamesOpened: number;
    totalWagered: number;
    totalWon: number;
    biggestWin: number;
  };
};

export async function ensurePlayer(userId: string): Promise<PlayerSnapshot> {
  const sql = await getSql();
  const existing = await sql<{ user_id: string }>`
    select user_id from profiles where user_id = ${userId}
  `;
  if (!existing[0]) {
    const users = await sql<{ id: string; name: string; email: string }>`
      select id, name, email from "user" where id = ${userId}
    `;
    const name = users[0]?.name || users[0]?.email?.split("@")[0] || "Guest";
    let username = slugifyUsername(name, userId);
    const clash = await sql<{ username: string }>`
      select username from profiles where lower(username) = ${username.toLowerCase()}
    `;
    if (clash[0]) username = `${username}${Math.floor(Math.random() * 90 + 10)}`;

    const staffCount = await sql<{ n: number }>`
      select count(*)::int as n from user_roles where role_id = 'super_admin'
    `;
    const isFirst = Number(staffCount[0]?.n ?? 0) === 0;

    await sql`
      insert into profiles (user_id, username, avatar_id)
      values (${userId}, ${username}, 'crown')
    `;
    await sql`insert into balances (user_id, casino_coins) values (${userId}, 0)`;
    await sql`insert into player_stats (user_id) values (${userId})`;
    await sql`insert into user_roles (user_id, role_id) values (${userId}, 'player')`;
    if (isFirst) {
      await sql`insert into user_roles (user_id, role_id) values (${userId}, 'super_admin')`;
    }
    await applyLedger(sql, {
      userId,
      amount: SIGNUP_BONUS,
      type: "signup_bonus",
      source: "system",
      metadata: { note: "Virtual only. No cash value." },
    });
    await sql`
      insert into user_achievements (user_id, achievement_id)
      values (${userId}, 'a_member')
      on conflict do nothing
    `;
    await sql`
      insert into notifications (id, user_id, title, body, kind)
      values (
        ${randomUUID()}, ${userId},
        'Welcome to Nocturne',
        'Casino Coins are entertainment only. They cannot be withdrawn or exchanged for money.',
        'system'
      )
    `;
    const meta = await requestMeta();
    await writeAudit(sql, {
      actorId: userId,
      action: "player.provisioned",
      targetType: "user",
      targetId: userId,
      ip: meta.ip,
      ua: meta.ua,
      metadata: { firstSuperAdmin: isFirst },
    });
  }

  const rows = await sql<{
    user_id: string;
    username: string;
    avatar_id: string;
    level: number;
    xp: number;
    vip_tier: string;
    bio: string | null;
    created_at: string;
    casino_coins: number;
  }>`
    select p.user_id, p.username, p.avatar_id, p.level, p.xp, p.vip_tier, p.bio,
           p.created_at, b.casino_coins
    from profiles p
    join balances b on b.user_id = p.user_id
    where p.user_id = ${userId}
  `;
  const p = rows[0];
  if (!p) throw new Error("Player not found");
  const roles = await sql<{ role_id: RoleId }>`
    select role_id from user_roles where user_id = ${userId}
  `;
  const claimed = await sql<{ id: string }>`
    select id from reward_claims
    where user_id = ${userId} and reward_id = 'r_daily'
      and claimed_on = (timezone('utc', now()))::date
    limit 1
  `;
  const stats = await sql<{
    games_opened: number;
    total_wagered: number;
    total_won: number;
    biggest_win: number;
  }>`
    select games_opened, total_wagered, total_won, biggest_win
    from player_stats where user_id = ${userId}
  `;
  const s = stats[0];
  const xp = Number(p.xp);
  const level = xpToLevel(xp);
  const vip = vipFromXp(xp);
  if (level !== Number(p.level) || vip !== p.vip_tier) {
    await sql`
      update profiles set level = ${level}, vip_tier = ${vip}, updated_at = now()
      where user_id = ${userId}
    `;
  }
  return {
    userId: p.user_id,
    username: p.username,
    avatarId: p.avatar_id,
    level,
    xp,
    vipTier: vip,
    bio: p.bio,
    coins: Number(p.casino_coins),
    createdAt: String(p.created_at),
    roles: roles.map((r) => r.role_id),
    dailyClaimed: Boolean(claimed[0]),
    stats: {
      gamesOpened: Number(s?.games_opened ?? 0),
      totalWagered: Number(s?.total_wagered ?? 0),
      totalWon: Number(s?.total_won ?? 0),
      biggestWin: Number(s?.biggest_win ?? 0),
    },
  };
}
