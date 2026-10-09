import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { blackjackStart, blackjackAction } from "@/lib/casino/fns-play";
import { formatCoins } from "@/lib/casino/format";
import { playSound } from "@/lib/casino/sound";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { getMe } from "@/lib/casino/fns";

type View = Awaited<ReturnType<typeof blackjackStart>>;

function CardFace({ rank, suit }: { rank: string; suit: string }) {
  const red = suit === "H" || suit === "D";
  return (
    <div
      className={`flex h-20 w-14 flex-col items-center justify-center rounded-lg border border-border bg-fg text-sm font-semibold ${
        red ? "text-danger" : "text-bg"
      }`}
    >
      <span>{rank}</span>
      <span className="text-xs">{suit === "S" ? "♠" : suit === "H" ? "♥" : suit === "D" ? "♦" : suit === "C" ? "♣" : "?"}</span>
    </div>
  );
}

export function BlackjackTable() {
  const user = useCurrentUser();
  const [bet, setBet] = useState(50);
  const [view, setView] = useState<View | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  async function refreshBalance() {
    const me = await getMe();
    setBalance(me.coins);
  }

  async function deal() {
    if (!user || busy) return;
    setBusy(true);
    setError(null);
    playSound("ui.click");
    try {
      const v = await blackjackStart({ data: { bet } });
      setView(v);
      if (v.phase === "resolved") playSound(v.payout > 0 ? "reward" : "ui.click");
      await refreshBalance();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deal failed");
    } finally {
      setBusy(false);
    }
  }

  async function act(action: "hit" | "stand" | "double") {
    if (!view || busy) return;
    setBusy(true);
    setError(null);
    try {
      const v = await blackjackAction({ data: { sessionId: view.sessionId, action } });
      setView(v);
      if (v.phase === "resolved") playSound(v.payout > 0 ? "reward" : "ui.click");
      await refreshBalance();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="space-y-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Blackjack · Virtual only</p>
          <h2 className="font-display text-3xl">House 21</h2>
        </div>
        {balance !== null && (
          <p className="tabular-nums text-sm text-muted">Balance · {formatCoins(balance)}</p>
        )}
      </div>

      {view && (
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs text-muted uppercase">Dealer · {view.dealerTotal}</p>
            <div className="flex flex-wrap gap-2">
              {view.dealer.cards.map((c, i) => (
                <CardFace key={i} rank={c.rank} suit={c.suit} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-muted uppercase">You · {view.playerTotal}</p>
            <div className="flex flex-wrap gap-2">
              {view.player.cards.map((c, i) => (
                <CardFace key={i} rank={c.rank} suit={c.suit} />
              ))}
            </div>
          </div>
        </div>
      )}

      {view?.phase === "resolved" && (
        <p className={`text-lg ${view.payout > 0 ? "text-gold" : "text-muted"}`}>
          {view.result?.replace(/_/g, " ")} · {view.payout > 0 ? `+${formatCoins(view.payout)}` : "No payout"}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {(!view || view.phase === "resolved") && (
          <>
            <label className="text-sm text-muted">
              Bet{" "}
              <input
                type="number"
                min={10}
                max={10000}
                step={10}
                value={bet}
                disabled={busy}
                onChange={(e) => setBet(Number(e.target.value))}
                className="ml-2 w-24 rounded-lg border border-border bg-elevated px-2 py-1 text-fg"
              />
            </label>
            <Button onClick={() => void deal()} disabled={!user || busy}>
              {user ? "Deal" : "Sign in to play"}
            </Button>
          </>
        )}
        {view?.phase === "player" && (
          <>
            <Button onClick={() => void act("hit")} disabled={busy}>Hit</Button>
            <Button onClick={() => void act("stand")} disabled={busy} variant="outline">Stand</Button>
            <Button
              onClick={() => void act("double")}
              disabled={busy || view.player.cards.length !== 2}
              variant="outline"
            >
              Double
            </Button>
          </>
        )}
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <p className="text-xs text-muted">
        Server-authoritative. Dealer hits soft 17. Blackjack pays 3:2. Virtual coins only.
      </p>
    </Card>
  );
}
