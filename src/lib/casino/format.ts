export function formatCoins(n: number | string | null | undefined): string {
  const v = typeof n === "string" ? Number(n) : (n ?? 0);
  return new Intl.NumberFormat("en-US").format(Math.max(0, Math.floor(v)));
}

export function asNumber(n: number | string | null | undefined): number {
  if (typeof n === "number") return n;
  if (typeof n === "string") return Number(n) || 0;
  return 0;
}
