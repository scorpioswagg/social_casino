import { randomBytes } from "node:crypto";

/** Cryptographically strong integer in [0, maxExclusive). */
export function secureInt(maxExclusive: number): number {
  if (maxExclusive <= 0) throw new Error("maxExclusive must be > 0");
  // Rejection sampling to avoid modulo bias
  const max = 0xffffffff;
  const limit = max - (max % maxExclusive);
  let x: number;
  do {
    x = randomBytes(4).readUInt32BE(0);
  } while (x >= limit);
  return x % maxExclusive;
}

/** Pick index from cumulative weights. */
export function weightedPick(weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return 0;
  let r = secureInt(total);
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r < 0) return i;
  }
  return weights.length - 1;
}
