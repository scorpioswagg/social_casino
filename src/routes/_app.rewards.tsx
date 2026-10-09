import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { claimDaily, getMe } from "@/lib/casino/fns";
import { DAILY_REWARD_AMOUNT, SIGNUP_BONUS } from "@/lib/casino/constants";
import { formatCoins } from "@/lib/casino/format";
import { playSound } from "@/lib/casino/sound";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import type { PlayerSnapshot } from "@/lib/casino/player";

export const Route = createFileRoute("/_app/rewards")({ component: Rewards });

function Rewards() {
  const { user, isPending } = useCurrentUserState();
  const [player, setPlayer] = useState<PlayerSnapshot | null>(null);

  useEffect(() => {
    if (!user) return;
    void getMe().then(setPlayer);
  }, [user?.id]);

  if (isPending) return <div className="h-40 animate-pulse rounded-[28px] bg-surface" />;
  if (!user) return <RedirectToSignIn />;

  return (
    <div className="page-enter">
      <h1 className="font-display text-4xl">Rewards</h1>
      <p className="mt-2 text-muted">Virtual envelopes only. Nothing here is cash.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-xs tracking-[0.16em] text-gold uppercase">Daily</p>
          <h2 className="font-display mt-2 text-2xl">Evening envelope</h2>
          <p className="mt-2 text-sm text-muted">{formatCoins(DAILY_REWARD_AMOUNT)} Casino Coins</p>
          <Button
            className="mt-4"
            disabled={player?.dailyClaimed}
            onClick={async () => {
              const r = await claimDaily();
              if (r.ok) {
                playSound("reward");
                setPlayer(await getMe());
              }
            }}
          >
            {player?.dailyClaimed ? "Already collected" : "Collect"}
          </Button>
        </Card>
        <Card>
          <p className="text-xs tracking-[0.16em] text-gold uppercase">Welcome</p>
          <h2 className="font-display mt-2 text-2xl">House grant</h2>
          <p className="mt-2 text-sm text-muted">
            {formatCoins(SIGNUP_BONUS)} Casino Coins on first seating.
          </p>
        </Card>
      </div>
    </div>
  );
}
