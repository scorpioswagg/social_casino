import { secureInt, weightedPick } from "./rng";

export type SlotSymbol = {
  id: string;
  label: string;
  /** Relative weight on the reel strip */
  weight: number;
  /** Payout multipliers for 3 / 4 / 5 of a kind (index 0 = 3oak) */
  pays: [number, number, number];
  isWild?: boolean;
  isScatter?: boolean;
};

export type SlotTheme = {
  id: string;
  slug: string;
  name: string;
  reels: number;
  rows: number;
  /** Classic left-to-right paylines as [row indices] length === reels */
  paylines: number[][];
  symbols: SlotSymbol[];
  /** Base RTP target is controlled by symbol weights + pays; not a guarantee. */
  minBet: number;
  maxBet: number;
  /** Scatter free-spin award when count >= threshold */
  scatterFreeSpins?: { threshold: number; spins: number };
};

export type SpinRequest = {
  theme: SlotTheme;
  bet: number;
  /** Active paylines (1..paylines.length). Defaults to all. */
  lines?: number;
};

export type LineWin = {
  lineIndex: number;
  symbolId: string;
  count: number;
  multiplier: number;
  payout: number;
};

export type SpinResult = {
  grid: string[][]; // [reel][row]
  lineWins: LineWin[];
  scatterCount: number;
  freeSpinsAwarded: number;
  totalPayout: number;
  bet: number;
  lines: number;
};

function buildStrip(symbols: SlotSymbol[]): string[] {
  const strip: string[] = [];
  for (const s of symbols) {
    for (let i = 0; i < s.weight; i++) strip.push(s.id);
  }
  // Shuffle lightly for visual variety (still server RNG)
  for (let i = strip.length - 1; i > 0; i--) {
    const j = secureInt(i + 1);
    [strip[i], strip[j]] = [strip[j], strip[i]];
  }
  return strip.length ? strip : symbols.map((s) => s.id);
}

export function spinSlots(req: SpinRequest): SpinResult {
  const { theme, bet } = req;
  const lines = Math.min(
    theme.paylines.length,
    Math.max(1, req.lines ?? theme.paylines.length),
  );
  if (bet < theme.minBet || bet > theme.maxBet) {
    throw new Error(`Bet must be between ${theme.minBet} and ${theme.maxBet}`);
  }

  const byId = new Map(theme.symbols.map((s) => [s.id, s]));
  const wildIds = new Set(theme.symbols.filter((s) => s.isWild).map((s) => s.id));
  const scatterIds = new Set(theme.symbols.filter((s) => s.isScatter).map((s) => s.id));

  // Build per-reel strips and stop positions
  const grid: string[][] = [];
  for (let r = 0; r < theme.reels; r++) {
    const strip = buildStrip(theme.symbols);
    const stop = secureInt(strip.length);
    const col: string[] = [];
    for (let row = 0; row < theme.rows; row++) {
      col.push(strip[(stop + row) % strip.length]);
    }
    grid.push(col);
  }

  const lineWins: LineWin[] = [];
  let totalPayout = 0;

  for (let li = 0; li < lines; li++) {
    const path = theme.paylines[li];
    if (!path || path.length !== theme.reels) continue;

    const sequence = path.map((row, reel) => grid[reel][row]);
    // Determine pay symbol: first non-wild, or wild if all wild
    let paySymbol: string | null = null;
    for (const id of sequence) {
      if (!wildIds.has(id) && !scatterIds.has(id)) {
        paySymbol = id;
        break;
      }
    }
    if (!paySymbol) {
      // all wild / scatter — use highest wild if present
      const wild = sequence.find((id) => wildIds.has(id));
      if (!wild) continue;
      paySymbol = wild;
    }

    let count = 0;
    for (const id of sequence) {
      if (id === paySymbol || wildIds.has(id)) count++;
      else break;
    }
    if (count < 3) continue;

    const sym = byId.get(paySymbol);
    if (!sym) continue;
    const mult = sym.pays[Math.min(2, count - 3)] ?? 0;
    if (mult <= 0) continue;
    const payout = mult * bet; // per-line bet simplification
    lineWins.push({
      lineIndex: li,
      symbolId: paySymbol,
      count,
      multiplier: mult,
      payout,
    });
    totalPayout += payout;
  }

  // Scatter count anywhere
  let scatterCount = 0;
  for (const col of grid) {
    for (const id of col) {
      if (scatterIds.has(id)) scatterCount++;
    }
  }

  let freeSpinsAwarded = 0;
  if (theme.scatterFreeSpins && scatterCount >= theme.scatterFreeSpins.threshold) {
    freeSpinsAwarded = theme.scatterFreeSpins.spins;
  }

  return {
    grid,
    lineWins,
    scatterCount,
    freeSpinsAwarded,
    totalPayout,
    bet,
    lines,
  };
}

/** Classic 5-reel / 3-row / 20-line layout helpers */
export function classicPaylines5x3(): number[][] {
  // rows: 0 top, 1 mid, 2 bottom
  return [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2],
    [0, 0, 1, 0, 0],
    [2, 2, 1, 2, 2],
    [1, 0, 0, 0, 1],
    [1, 2, 2, 2, 1],
    [0, 1, 1, 1, 0],
    [2, 1, 1, 1, 2],
    [1, 1, 0, 1, 1],
    [1, 1, 2, 1, 1],
    [0, 1, 0, 1, 0],
    [2, 1, 2, 1, 2],
    [1, 0, 1, 0, 1],
    [1, 2, 1, 2, 1],
    [0, 2, 0, 2, 0],
    [2, 0, 2, 0, 2],
    [0, 2, 1, 2, 0],
  ];
}
