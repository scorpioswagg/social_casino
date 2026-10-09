import { secureInt } from "./rng";

/** European wheel: 0 + 1–36 */
export const EUROPEAN_WHEEL = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16,
  33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
] as const;

export type RouletteColor = "green" | "red" | "black";

const RED = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

export function numberColor(n: number): RouletteColor {
  if (n === 0) return "green";
  return RED.has(n) ? "red" : "black";
}

export type BetKind =
  | "straight" // single number
  | "red"
  | "black"
  | "even"
  | "odd"
  | "low" // 1-18
  | "high" // 19-36
  | "dozen1"
  | "dozen2"
  | "dozen3"
  | "col1"
  | "col2"
  | "col3";

export type RouletteBet = {
  kind: BetKind;
  /** Required for straight */
  number?: number;
  amount: number;
};

const PAYOUT: Record<BetKind, number> = {
  straight: 35,
  red: 1,
  black: 1,
  even: 1,
  odd: 1,
  low: 1,
  high: 1,
  dozen1: 2,
  dozen2: 2,
  dozen3: 2,
  col1: 2,
  col2: 2,
  col3: 2,
};

function betWins(bet: RouletteBet, result: number): boolean {
  switch (bet.kind) {
    case "straight":
      return bet.number === result;
    case "red":
      return numberColor(result) === "red";
    case "black":
      return numberColor(result) === "black";
    case "even":
      return result !== 0 && result % 2 === 0;
    case "odd":
      return result !== 0 && result % 2 === 1;
    case "low":
      return result >= 1 && result <= 18;
    case "high":
      return result >= 19 && result <= 36;
    case "dozen1":
      return result >= 1 && result <= 12;
    case "dozen2":
      return result >= 13 && result <= 24;
    case "dozen3":
      return result >= 25 && result <= 36;
    case "col1":
      return result !== 0 && result % 3 === 1;
    case "col2":
      return result !== 0 && result % 3 === 2;
    case "col3":
      return result !== 0 && result % 3 === 0;
    default:
      return false;
  }
}

export type RouletteSpinResult = {
  result: number;
  color: RouletteColor;
  /** Index on EUROPEAN_WHEEL for animation */
  wheelIndex: number;
  bets: RouletteBet[];
  totalWagered: number;
  totalPayout: number;
  wins: { kind: BetKind; number?: number; amount: number; payout: number }[];
};

export function spinRoulette(bets: RouletteBet[]): RouletteSpinResult {
  if (!bets.length) throw new Error("Place at least one bet");
  let totalWagered = 0;
  for (const b of bets) {
    if (!Number.isFinite(b.amount) || b.amount < 10) {
      throw new Error("Minimum bet is 10 Casino Coins");
    }
    if (b.kind === "straight") {
      if (b.number === undefined || b.number < 0 || b.number > 36) {
        throw new Error("Invalid straight number");
      }
    }
    totalWagered += b.amount;
  }
  if (totalWagered > 50000) throw new Error("Table limit exceeded");

  const wheelIndex = secureInt(EUROPEAN_WHEEL.length);
  const result = EUROPEAN_WHEEL[wheelIndex];
  const color = numberColor(result);

  const wins: RouletteSpinResult["wins"] = [];
  let totalPayout = 0;

  for (const b of bets) {
    if (betWins(b, result)) {
      const payout = b.amount + b.amount * PAYOUT[b.kind];
      wins.push({ kind: b.kind, number: b.number, amount: b.amount, payout });
      totalPayout += payout;
    }
  }

  return {
    result,
    color,
    wheelIndex,
    bets,
    totalWagered,
    totalPayout,
    wins,
  };
}
