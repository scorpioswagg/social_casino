import { createServerFn } from "@tanstack/react-start";
import { randomUUID } from "node:crypto";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { DAILY_REWARD_AMOUNT, STAFF_ROLES, type RoleId } from "./constants";
import { applyLedger } from "./coins";
import { ensurePlayer } from "./player";
import { requireStaff } from "./rbac";
import { rateLimit } from "./rate-limit";
import { requestMeta, writeAudit } from "./audit";

export const getMe = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => ensurePlayer(context.userId));

export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<{
    id: string;
    slug: string;
    name: string;
    description: string | null;
    category: string;
    status: string;
    is_hot: boolean;
    is_new: boolean;
    is_featured: boolean;
    min_bet: number;
    max_bet: number;
  }>`
    select id, slug, name, description, category, status, is_hot, is_new, is_featured, min_bet, max_bet
    from games
    order by sort_order, name
  `;
});

export const getLobby = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const games = await sql<{
    id: string;
    slug: string;
    name: string;
    description: string | null;
    category: string;
    is_hot: boolean;
    is_new: boolean;
    is_featured: boolean;
  }>`
    select id, slug, name, description, category, is_hot, is_new, is_featured
    from games order by sort_order
  `;
  const board = await sql<{
    username: string;
    avatar_id: string;
    vip_tier: string;
    xp: number;
    level: number;
  }>`
    select username, avatar_id, vip_tier, xp, level
    from profiles
    order by xp desc, username
    limit 8
  `;
  const missions = await sql<{
    id: string;
    name: string;
    description: string | null;
    coin_reward: number;
    xp_reward: number;
    goal_value: number;
  }>`
    select id, name, description, coin_reward, xp_reward, goal_value
    from missions where is_active = true
  `;
  return { games, board, missions };
});

export const getMyExtras = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensurePlayer(context.userId);
    const favs = await sql<{ game_id: string }>`
      select game_id from game_favorites where user_id = ${context.userId}
    `;
    const recent = await sql<{
      slug: string;
      name: string;
      category: string;
      started_at: string;
    }>`
      select g.slug, g.name, g.category, gs.started_at
      from game_sessions gs
      join games g on g.id = gs.game_id
      where gs.user_id = ${context.userId}
      order by gs.started_at desc
      limit 8
    `;
    const progress = await sql<{
      mission_id: string;
      progress: number;
      completed_at: string | null;
    }>`
      select mission_id, progress, completed_at from mission_progress
      where user_id = ${context.userId}
    `;
    return {
      favoriteIds: favs.map((f) => f.game_id),
      recent,
      progress,
    };
  });

export const claimDaily = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    rateLimit(`daily:${context.userId}`, 8, 60_000);
    await ensurePlayer(context.userId);
    const id = randomUUID();
    try {
      await sql`
        insert into reward_claims (id, user_id, reward_id)
        values (${id}, ${context.userId}, 'r_daily')
      `;
    } catch {
      return { ok: false as const, reason: "already_claimed" };
    }
    const result = await applyLedger(sql, {
      userId: context.userId,
      amount: DAILY_REWARD_AMOUNT,
      type: "daily_reward",
      source: "daily",
      metadata: { virtual: true },
    });
    await sql`
      insert into user_achievements (user_id, achievement_id)
      values (${context.userId}, 'a_generous')
      on conflict do nothing
    `;
    await sql`
      insert into mission_progress (user_id, mission_id, progress, completed_at)
      values (${context.userId}, 'm_claim_daily', 1, now())
      on conflict (user_id, mission_id) do update
        set progress = 1, completed_at = coalesce(mission_progress.completed_at, now())
    `;
    return { ok: true as const, ...result };
  });

export const toggleFavorite = createServerFn({ method: "POST" })
  .validator((gameId: string) => gameId)
  .middleware([authMiddleware])
  .handler(async ({ context, data: gameId }) => {
    const sql = await getSql();
    const existing = await sql<{ game_id: string }>`
      select game_id from game_favorites
      where user_id = ${context.userId} and game_id = ${gameId}
    `;
    if (existing[0]) {
      await sql`
        delete from game_favorites
        where user_id = ${context.userId} and game_id = ${gameId}
      `;
      return { favorited: false };
    }
    await sql`
      insert into game_favorites (user_id, game_id)
      values (${context.userId}, ${gameId})
    `;
    return { favorited: true };
  });

export const openGame = createServerFn({ method: "POST" })
  .validator((slug: string) => slug)
  .middleware([authMiddleware])
  .handler(async ({ context, data: slug }) => {
    const sql = await getSql();
    await ensurePlayer(context.userId);
    const game = await sql<{ id: string }>`select id from games where slug = ${slug}`;
    if (!game[0]) throw new Error("Unknown table");
    const id = randomUUID();
    await sql`
      insert into game_sessions (id, user_id, game_id, status)
      values (${id}, ${context.userId}, ${game[0].id}, 'preview')
    `;
    await sql`
      update player_stats
      set games_opened = games_opened + 1, last_played_at = now()
      where user_id = ${context.userId}
    `;
    await sql`
      insert into mission_progress (user_id, mission_id, progress)
      values (${context.userId}, 'm_browse_three', 1)
      on conflict (user_id, mission_id) do update
        set progress = least(mission_progress.progress + 1, 3),
            completed_at = case
              when mission_progress.progress + 1 >= 3 then coalesce(mission_progress.completed_at, now())
              else mission_progress.completed_at
            end
    `;
    return { sessionId: id };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .validator((input: { username?: string; avatarId?: string; bio?: string }) => input)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensurePlayer(context.userId);
    if (data.username) {
      const username = data.username.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 24);
      if (username.length < 3) throw new Error("Username must be 3–24 characters");
      await sql`
        update profiles set username = ${username}, updated_at = now()
        where user_id = ${context.userId}
      `;
    }
    if (data.avatarId) {
      await sql`
        update profiles set avatar_id = ${data.avatarId}, updated_at = now()
        where user_id = ${context.userId}
      `;
    }
    if (data.bio !== undefined) {
      const bio = data.bio.slice(0, 240);
      await sql`
        update profiles set bio = ${bio}, updated_at = now()
        where user_id = ${context.userId}
      `;
    }
    return ensurePlayer(context.userId);
  });

export const createTicket = createServerFn({ method: "POST" })
  .validator((input: { subject: string; body: string }) => input)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    rateLimit(`ticket:${context.userId}`, 6, 10 * 60_000);
    const subject = data.subject.trim().slice(0, 120);
    const body = data.body.trim().slice(0, 4000);
    if (subject.length < 4 || body.length < 8) throw new Error("Please add more detail");
    const id = randomUUID();
    await sql`
      insert into support_tickets (id, user_id, subject)
      values (${id}, ${context.userId}, ${subject})
    `;
    await sql`
      insert into support_ticket_messages (id, ticket_id, author_id, body)
      values (${randomUUID()}, ${id}, ${context.userId}, ${body})
    `;
    return { id };
  });

export const listMyTickets = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{
      id: string;
      subject: string;
      status: string;
      created_at: string;
    }>`
      select id, subject, status, created_at
      from support_tickets
      where user_id = ${context.userId}
      order by created_at desc
    `;
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const roles = await requireStaff(sql, context.userId);
    const players = await sql<{ n: number }>`select count(*)::int as n from profiles`;
    const coins = await sql<{ n: number }>`select coalesce(sum(casino_coins),0)::bigint as n from balances`;
    const txs = await sql<{ n: number }>`select count(*)::int as n from currency_transactions`;
    const tickets = await sql<{ n: number }>`select count(*)::int as n from support_tickets where status = 'open'`;
    return {
      roles,
      players: Number(players[0]?.n ?? 0),
      coinsInCirculation: Number(coins[0]?.n ?? 0),
      transactions: Number(txs[0]?.n ?? 0),
      openTickets: Number(tickets[0]?.n ?? 0),
    };
  });

export const listPlayersAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireStaff(sql, context.userId, ["admin", "super_admin", "moderator", "support"]);
    return sql<{
      user_id: string;
      username: string;
      vip_tier: string;
      level: number;
      xp: number;
      casino_coins: number;
      created_at: string;
    }>`
      select p.user_id, p.username, p.vip_tier, p.level, p.xp, b.casino_coins, p.created_at
      from profiles p
      join balances b on b.user_id = p.user_id
      order by p.created_at desc
      limit 100
    `;
  });

export const listAuditAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireStaff(sql, context.userId, ["admin", "super_admin"]);
    return sql<{
      id: string;
      actor_id: string;
      action: string;
      target_type: string | null;
      target_id: string | null;
      created_at: string;
    }>`
      select id, actor_id, action, target_type, target_id, created_at
      from audit_logs
      order by created_at desc
      limit 80
    `;
  });

export const listTicketsAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireStaff(sql, context.userId, ["admin", "super_admin", "support"]);
    return sql<{
      id: string;
      subject: string;
      status: string;
      user_id: string;
      created_at: string;
    }>`
      select id, subject, status, user_id, created_at
      from support_tickets
      order by created_at desc
      limit 80
    `;
  });

export const economySnapshot = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireStaff(sql, context.userId, ["admin", "super_admin"]);
    const byType = await sql<{ type: string; n: number; volume: number }>`
      select type, count(*)::int as n, coalesce(sum(abs(amount)),0)::bigint as volume
      from currency_transactions
      group by type
      order by n desc
    `;
    return byType.map((r) => ({
      type: r.type,
      n: Number(r.n),
      volume: Number(r.volume),
    }));
  });

