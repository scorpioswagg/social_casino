import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { VIP_ORDER, VIP_XP } from "@/lib/casino/constants";
import { getMe } from "@/lib/casino/fns";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";
import type { PlayerSnapshot } from "@/lib/casino/player";

export const Route = createFileRoute("/_app/vip")({ component: Vip });

function Vip() {
  const { user, isPending } = useCurrentUserState();
  const [player, setPlayer] = useState<PlayerSnapshot | null>(null);
  useEffect(() => {
    if (user) void getMe().then(setPlayer);
  }, [user?.id]);
  if (isPending) return <div className="h-32 animate-pulse rounded-[28px] bg-surface" />;
  if (!user) return <RedirectToSignIn />;
  return (
    <div className="page-enter">
      <h1 className="font-display text-4xl">VIP salon</h1>
      <p className="mt-2 text-muted">
        Tiers follow XP. No cash benefits — only house standing and envelope multipliers later.
      </p>
      {player ? (
        <p className="mt-4 text-sm text-gold capitalize">
          Current: {player.vipTier} · Level {player.level}
        </p>
      ) : null}
      <div className="mt-8 grid gap-3">
        {VIP_ORDER.map((tier) => (
          <Card key={tier} className="flex items-center justify-between">
            <div>
              <p className="font-display text-2xl capitalize">{tier}</p>
              <p className="text-xs text-muted">{VIP_XP[tier]} XP</p>
            </div>
            {player?.vipTier === tier ? <Progress className="w-32" value={70} /> : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
