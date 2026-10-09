import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { ensurePlayer } from "./player";
import { rateLimit } from "./rate-limit";
import { playSlot, playRoulette, bjStart, bjAction } from "./games/play";
import type { RouletteBet } from "./games/roulette";

export const spinSlot = createServerFn({ method: "POST" })
  .validator((input: { slug: string; bet: number; lines?: number }) => input)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    rateLimit(`spin:${context.userId}`, 30, 60_000);
    await ensurePlayer(context.userId);
    const sql = await getSql();
    return playSlot(sql, context.userId, data.slug, data.bet, data.lines);
  });

export const spinRouletteFn = createServerFn({ method: "POST" })
  .validator((input: { bets: RouletteBet[] }) => input)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    rateLimit(`roulette:${context.userId}`, 20, 60_000);
    await ensurePlayer(context.userId);
    const sql = await getSql();
    return playRoulette(sql, context.userId, data.bets);
  });

export const blackjackStart = createServerFn({ method: "POST" })
  .validator((input: { bet: number }) => input)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    rateLimit(`bj:${context.userId}`, 20, 60_000);
    await ensurePlayer(context.userId);
    const sql = await getSql();
    return bjStart(sql, context.userId, data.bet);
  });

export const blackjackAction = createServerFn({ method: "POST" })
  .validator((input: { sessionId: string; action: "hit" | "stand" | "double" }) => input)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    rateLimit(`bj-act:${context.userId}`, 40, 60_000);
    const sql = await getSql();
    return bjAction(sql, context.userId, data.sessionId, data.action);
  });
