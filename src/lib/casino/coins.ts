import { randomUUID } from "node:crypto";
import type { Sql } from "@/lib/db";

export class CoinError extends Error {
  status = 400;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/** Server-only ledger. Browser never writes balances. */
export async function applyLedger(
  sql: Sql,
  input: {
    userId: string;
    amount: number;
    type: string;
    source: string;
    metadata?: Record<string, unknown>;
  },
) {
  if (!Number.isFinite(input.amount) || input.amount === 0) {
    throw new CoinError("Invalid amount");
  }
  const rows = await sql<{ casino_coins: number }>`
    select casino_coins from balances where user_id = ${input.userId}
  `;
  if (!rows[0]) throw new CoinError("Balance not found", 404);
  const current = Number(rows[0].casino_coins);
  const next = current + input.amount;
  if (next < 0) throw new CoinError("Insufficient Casino Coins");
  await sql`
    update balances set casino_coins = ${next}, updated_at = now()
    where user_id = ${input.userId}
  `;
  const id = randomUUID();
  const meta = JSON.stringify(input.metadata ?? {});
  await sql`
    insert into currency_transactions (
      id, user_id, amount, balance_after, type, source, metadata
    ) values (
      ${id}, ${input.userId}, ${input.amount}, ${next}, ${input.type}, ${input.source}, ${meta}::jsonb
    )
  `;
  return { transactionId: id, balance: next };
}
