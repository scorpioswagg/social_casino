import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { spinRouletteFn } from "@/lib/casino/fns-play";
import { formatCoins } from "@/lib/casino/format";
import { playSound } from "@/lib/casino/sound";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { getMe } from "@/lib/casino/fns";
import type { BetKind, RouletteBet } from "@/lib/casino/games/roulette";
import { numberColor } from "@/lib/casino/games/roulette";

const OUTSIDE: { kind: BetKind; label: string }[] = [
  { kind: "red", label: "Red" },
  { kind: "black", label: "Black" },
  { kind: "even", label: "Even" },
  { kind: "odd", label: "Odd" },
  { kind: "low", label: "1–18" },
  { kind: "high", label: "19–36" },
  { kind: "dozen1", label: "1st 12" },
  { kind: "dozen2", label: "2nd 12" },
  { kind: "dozen3", label: "3rd 12" },
];

export function RouletteTable() {
  const user = useCurrentUser();
  const [chip, setChip] = useState(50);
  const [bets, setBets] = useState<RouletteBet[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [payout, setPayout] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  function addBet(kind: BetKind, number?: number) {
    setBets((prev) => [...prev, { kind, number, amount: chip }]);
    playSound("ui.click");
  }

  function clearBets() {
    setBets([]);
    setResult(null);
    setPayout(null);
  }

  async function spin() {
    if (!user || spinning || !bets.length) return;
    setSpinning(true);
    setError(null);
    try {
      const res = await spinRouletteFn({ data: { bets } });
      setResult(res.result);
      setPayout(res.totalPayout);
      if (res.totalPayout > 0) playSound("reward");
      const me = await getMe();
      setBalance(me.coins);
      setBets([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Spin failed");
    } finally {
      setSpinning(false);
    }
  }

  const totalBet = bets.reduce((s, b) => s + b.amount, 0);

  return (
    <Card className="space-y-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-gold uppercase">European Roulette · Virtual only</p>
          <h2 className="font-display text-3xl">Velvet Wheel</h2>
        </div>
        {balance !== null && (
          <p className="tabular-nums text-sm text-muted">Balance · {formatCoins(balance)}</p>
        )}
      </div>

      <div className="flex flex-col items-center gap-3">
        <div
          className={`flex h-28 w-28 items-center justify-center rounded-full border-4 border-gold bg-surface text-3xl font-display ${
            spinning ? "animate-pulse" : ""
          }`}
          style={{
            color:
              result === null
                ? undefined
                : numberColor(result) === "red"
                  ? "#c45c5c"
                  : numberColor(result) === "black"
                    ? "#f3eee4"
                    : "#1e3d36",
          }}
        >
          {result === null ? "·" : result}
        </div>
        {payout !== null && (
          <p className={`text-sm ${payout > 0 ? "text-gold" : "text-muted"}`}>
            {payout > 0 ? `Won ${formatCoins(payout)}` : "No win"}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {[10, 50, 100, 500].map((v) => (
          <Button
            key={v}
            size="sm"
            variant={chip === v ? "default" : "outline"}
            onClick={() => setChip(v)}
          >
            {v}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {OUTSIDE.map((o) => (
          <Button key={o.kind} size="sm" variant="outline" onClick={() => addBet(o.kind)}>
            {o.label}
          </Button>
        ))}
      </div>

      <div>
        <p className="mb-2 text-xs text-muted uppercase">Straight (0–36)</p>
        <div className="grid max-h-40 grid-cols-6 gap-1 overflow-y-auto sm:grid-cols-12">
          {Array.from({ length: 37 }, (_, n) => (
            <button
              key={n}
              type="button"
              className="rounded border border-border bg-elevated py-1 text-xs hover:border-gold"
              onClick={() => addBet("straight", n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted">Wager · {formatCoins(totalBet)} · {bets.length} chip(s)</p>
        <Button onClick={() => void spin()} disabled={!user || spinning || !bets.length}>
          {spinning ? "Spinning…" : user ? "Spin" : "Sign in to play"}
        </Button>
        <Button variant="outline" onClick={clearBets} disabled={spinning}>
          Clear
        </Button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <p className="text-xs text-muted">
        European single-zero wheel. Past results do not predict future outcomes. Virtual coins only.
      </p>
    </Card>
  );
}
