/**
 * Server-side game play orchestration.
 * All outcomes are generated here; client only renders results.
 */
import { randomUUID } from "node:crypto";
import type { Sql } from "@/lib/db";
import { applyLedger } from "../coins";
import { spinSlots } from "./slot-engine";
import { getSlotTheme } from "./slot-themes";
import {
  startRound,
  playerHit,
  playerStand,
  playerDouble,
  publicBjView,
  type BjState,
} from "./blackjack";
import { spinRoulette, type RouletteBet } from "./roulette";

// In-memory BJ sessions (preview / single instance). Production should use Redis.
const bjSessions = new Map<string, BjState>();

export async function playSlot(
  sql: Sql,
  userId: string,
  slug: string,
  bet: number,
  lines?: number,
) {
  const theme = getSlotTheme(slug);
  if (!theme) throw new Error("Unknown slot theme");

  const game = await sql<{ id: string }>`select id from games where slug = ${slug}`;
  if (!game[0]) throw new Error("Unknown game");

  // Debit wager first
  await applyLedger(sql, {
    userId,
    amount: -bet,
    type: "wager",
    source: `slot:${slug}`,
    metadata: { virtual: true, game: slug, bet },
  });

  const result = spinSlots({ theme, bet, lines });

  if (result.totalPayout > 0) {
    await applyLedger(sql, {
      userId,
      amount: result.totalPayout,
      type: "payout",
      source: `slot:${slug}`,
      metadata: { virtual: true, game: slug, lineWins: result.lineWins.length },
    });
  }

  const sessionId = randomUUID();
  await sql`
    insert into game_sessions (id, user_id, game_id, wagered, paid_out, status, ended_at)
    values (
      ${sessionId}, ${userId}, ${game[0].id},
      ${bet}, ${result.totalPayout}, 'closed', now()
    )
  `;
  await sql`
    update player_stats
    set total_wagered = total_wagered + ${bet},
        total_won = total_won + ${result.totalPayout},
        biggest_win = greatest(biggest_win, ${result.totalPayout}),
        last_played_at = now()
    where user_id = ${userId}
  `;

  // XP for engagement
  await sql`
    update profiles set xp = xp + ${Math.max(1, Math.floor(bet / 50))}, updated_at = now()
    where user_id = ${userId}
  `;

  return { sessionId, ...result };
}

export async function playRoulette(
  sql: Sql,
  userId: string,
  bets: RouletteBet[],
) {
  const result = spinRoulette(bets);
  const game = await sql<{ id: string }>`select id from games where slug = 'velvet-wheel'`;
  if (!game[0]) throw new Error("Roulette not in catalog");

  await applyLedger(sql, {
    userId,
    amount: -result.totalWagered,
    type: "wager",
    source: "roulette",
    metadata: { virtual: true, bets: result.bets.length },
  });

  if (result.totalPayout > 0) {
    await applyLedger(sql, {
      userId,
      amount: result.totalPayout,
      type: "payout",
      source: "roulette",
      metadata: { virtual: true, result: result.result },
    });
  }

  const sessionId = randomUUID();
  await sql`
    insert into game_sessions (id, user_id, game_id, wagered, paid_out, status, ended_at)
    values (
      ${sessionId}, ${userId}, ${game[0].id},
      ${result.totalWagered}, ${result.totalPayout}, 'closed', now()
    )
  `;
  await sql`
    update player_stats
    set total_wagered = total_wagered + ${result.totalWagered},
        total_won = total_won + ${result.totalPayout},
        biggest_win = greatest(biggest_win, ${result.totalPayout}),
        last_played_at = now()
    where user_id = ${userId}
  `;
  await sql`
    update profiles set xp = xp + ${Math.max(1, Math.floor(result.totalWagered / 40))}, updated_at = now()
    where user_id = ${userId}
  `;

  return { sessionId, ...result };
}

export async function bjStart(sql: Sql, userId: string, bet: number) {
  const game = await sql<{ id: string }>`select id from games where slug = 'house-21'`;
  if (!game[0]) throw new Error("Blackjack not in catalog");

  await applyLedger(sql, {
    userId,
    amount: -bet,
    type: "wager",
    source: "blackjack",
    metadata: { virtual: true },
  });

  const sessionId = randomUUID();
  const state = startRound(sessionId, bet);
  bjSessions.set(sessionId, state);

  await sql`
    insert into game_sessions (id, user_id, game_id, wagered, paid_out, status)
    values (${sessionId}, ${userId}, ${game[0].id}, ${bet}, 0, 'open')
  `;

  // Immediate resolve (player BJ / dealer BJ)
  if (state.phase === "resolved") {
    await settleBj(sql, userId, state);
  }

  return publicBjView(state);
}

export async function bjAction(
  sql: Sql,
  userId: string,
  sessionId: string,
  action: "hit" | "stand" | "double",
) {
  const state = bjSessions.get(sessionId);
  if (!state) throw new Error("Session expired");

  // Verify ownership via open session
  const row = await sql<{ user_id: string; status: string }>`
    select user_id, status from game_sessions where id = ${sessionId}
  `;
  if (!row[0] || row[0].user_id !== userId) throw new Error("Not your table");
  if (row[0].status !== "open") throw new Error("Round already closed");

  let next: BjState;
  if (action === "hit") next = playerHit(state);
  else if (action === "stand") next = playerStand(state);
  else if (action === "double") {
    // Debit extra bet
    await applyLedger(sql, {
      userId,
      amount: -state.bet,
      type: "wager",
      source: "blackjack:double",
      metadata: { virtual: true, sessionId },
    });
    next = playerDouble(state);
  } else {
    throw new Error("Unknown action");
  }

  bjSessions.set(sessionId, next);

  if (next.phase === "resolved") {
    await settleBj(sql, userId, next);
  }

  return publicBjView(next);
}

async function settleBj(sql: Sql, userId: string, state: BjState) {
  const stake = state.bet + state.doubleBet;
  if (state.payout > 0) {
    await applyLedger(sql, {
      userId,
      amount: state.payout,
      type: "payout",
      source: "blackjack",
      metadata: { virtual: true, result: state.result, sessionId: state.sessionId },
    });
  }
  await sql`
    update game_sessions
    set paid_out = ${state.payout}, wagered = ${stake}, status = 'closed', ended_at = now()
    where id = ${state.sessionId}
  `;
  await sql`
    update player_stats
    set total_wagered = total_wagered + ${stake},
        total_won = total_won + ${state.payout},
        biggest_win = greatest(biggest_win, ${state.payout}),
        last_played_at = now()
    where user_id = ${userId}
  `;
  await sql`
    update profiles set xp = xp + ${Math.max(1, Math.floor(stake / 30))}, updated_at = now()
    where user_id = ${userId}
  `;
  bjSessions.delete(state.sessionId);
}
