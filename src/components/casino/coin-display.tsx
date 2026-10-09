import { formatCoins } from "@/lib/casino/format";
import { CURRENCY_CODE } from "@/lib/casino/constants";

export function CoinDisplay({ amount }: { amount: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-sm text-gold">
      <span className="size-2 rounded-full bg-gold" />
      <span className="tabular-nums font-medium">{formatCoins(amount)}</span>
      <span className="text-[10px] tracking-[0.14em] uppercase">{CURRENCY_CODE}</span>
    </span>
  );
}
