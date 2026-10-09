import type { VipTier } from "@/lib/casino/constants";

export function VipBadge({ tier }: { tier: string }) {
  const label = (tier as VipTier) || "bronze";
  return (
    <span className="rounded-full border border-border px-2.5 py-1 text-[11px] tracking-[0.14em] text-gold uppercase">
      {label} VIP
    </span>
  );
}
