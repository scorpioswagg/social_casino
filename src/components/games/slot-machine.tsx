import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { spinSlot } from "@/lib/casino/fns-play";
import { formatCoins } from "@/lib/casino/format";
import { playSound } from "@/lib/casino/sound";
import { getSlotTheme } from "@/lib/casino/games/slot-themes";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { getMe } from "@/lib/casino/fns";

const SYMBOL_EMOJI: Record<string, string> = {
  cherry: "🍒", lemon: "🍋", bell: "🔔", bar: "▮", seven: "7️⃣", crown: "👑",
  wild: "✦", scatter: "🌙", ace: "A", king: "K", queen: "Q", jack: "J",
  diamond: "💎", royal: "♛", joker: "🃏", crest: "⚜", coal: "◾", spark: "✨",
  flame: "🔥", ruby: "🔴", phoenix: "🐦", ember: "🟠", wildfire: "🌋", ash: "☁",
  meteor: "☄", comet: "💫", planet: "🪐", nebula: "🌌", star: "⭐", galaxy: "🌀",
  void: "⬛", orbit: "🛸", scarab: "🪲", ankh: "☥", eye: "👁", urn: "🏺",
  sphinx: "🦁", pharaoh: "👴", anubis: "🐺", pyramid: "▲",
};

export function SlotMachine({ slug }: { slug: string }) {
  const user = useCurrentUser();
  const theme = getSlotTheme(slug);
  const [bet, setBet] = useState(theme?.minBet ?? 10);
  const [spinning, setSpinning] = useState(false);
  const [grid, setGrid] = useState<string[][] | null>(null);
  const [lastPayout, setLastPayout] = useState<number | null>(null);
  const [lineWins, setLineWins] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  if (!theme) {
    return <p className="text-muted">This slot theme is not yet available.</p>;
  }

  async function spin() {
    if (!user || spinning) return;
    setError(null);
    setSpinning(true);
    playSound("ui.click");
    try {
      const res = await spinSlot({ data: { slug, bet } });
      setGrid(res.grid);
      setLastPayout(res.totalPayout);
      setLineWins(res.lineWins.length);
      if (res.totalPayout > 0) playSound("reward");
      const me = await getMe();
      setBalance(me.coins);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Spin failed");
    } finally {
      setSpinning(false);
    }
  }

  return (
    <Card className="space-y-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Slots · Virtual only</p>
          <h2 className="font-display text-3xl">{theme.name}</h2>
        </div>
        {balance !== null && (
          <p className="tabular-nums text-sm text-muted">Balance · {formatCoins(balance)}</p>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2 rounded-[20px] border border-border bg-bg p-3">
        {(grid ?? Array.from({ length: theme.reels }, () => Array(theme.rows).fill("?"))).map(
          (col, ri) => (
            <div key={ri} className="flex flex-col gap-2">
              {col.map((sym, row) => (
                <div
                  key={row}
                  className={`flex aspect-square items-center justify-center rounded-xl border border-border bg-surface text-2xl transition-all ${
                    spinning ? "animate-pulse opacity-60" : ""
                  }`}
                >
                  {SYMBOL_EMOJI[sym] ?? sym}
                </div>
              ))}
            </div>
          ),
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-muted">
          Bet{" "}
          <input
            type="number"
            min={theme.minBet}
            max={theme.maxBet}
            step={10}
            value={bet}
            disabled={spinning}
            onChange={(e) => setBet(Number(e.target.value))}
            className="ml-2 w-24 rounded-lg border border-border bg-elevated px-2 py-1 text-fg"
          />
        </label>
        <Button onClick={() => void spin()} disabled={!user || spinning}>
          {spinning ? "Spinning…" : user ? "Spin" : "Sign in to play"}
        </Button>
        {lastPayout !== null && (
          <span className={`text-sm ${lastPayout > 0 ? "text-gold" : "text-muted"}`}>
            {lastPayout > 0
              ? `Won ${formatCoins(lastPayout)} · ${lineWins} line${lineWins === 1 ? "" : "s"}`
              : "No win this spin"}
          </span>
        )}
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <p className="text-xs text-muted">
        Outcomes are generated server-side. Casino Coins have no cash value and cannot be withdrawn.
      </p>
    </Card>
  );
}
