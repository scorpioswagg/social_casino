import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GameArt } from "@/components/casino/game-art";
import { Button } from "@/components/ui/button";
import { getCatalog, openGame } from "@/lib/casino/fns";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { SlotMachine } from "@/components/games/slot-machine";
import { BlackjackTable } from "@/components/games/blackjack-table";
import { RouletteTable } from "@/components/games/roulette-table";
import { getSlotTheme } from "@/lib/casino/games/slot-themes";

export const Route = createFileRoute("/_app/games/$slug")({
  component: GameDetail,
});

function GameDetail() {
  const { slug } = Route.useParams();
  const user = useCurrentUser();
  const [name, setName] = useState(slug);
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("coming_soon");

  useEffect(() => {
    void getCatalog().then((rows) => {
      const g = rows.find((r) => r.slug === slug);
      if (g) {
        setName(g.name);
        setDesc(g.description ?? "");
        setCategory(g.category);
        setStatus(g.status);
      }
    });
    if (user) void openGame({ data: slug }).catch(() => undefined);
  }, [slug, user?.id]);

  const isSlot = Boolean(getSlotTheme(slug)) || category === "slots";
  const isRoulette = slug === "velvet-wheel";
  const isBlackjack = slug === "house-21";
  const isLive = status === "live" || isSlot || isRoulette || isBlackjack;

  return (
    <div className="page-enter space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <GameArt slug={slug} className="min-h-48 rounded-[28px]" />
        <div>
          <p className="text-[11px] tracking-[0.22em] text-gold uppercase">
            {isLive ? "Live table" : "Table preview"}
          </p>
          <h1 className="font-display mt-2 text-4xl">{name}</h1>
          <p className="mt-3 text-muted">{desc || "A house table."}</p>
          <p className="mt-4 text-sm text-muted">
            Casino Coins are virtual. No cash wagering, deposits, or withdrawals.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/games">Back to the floor</Link>
          </Button>
        </div>
      </div>

      {isLive && isSlot && <SlotMachine slug={slug} />}
      {isLive && isBlackjack && <BlackjackTable />}
      {isLive && isRoulette && <RouletteTable />}

      {!isLive && (
        <p className="rounded-[20px] border border-border bg-surface p-6 text-sm text-muted">
          This table is dressed. Full gameplay for this title arrives in a later build step.
        </p>
      )}
    </div>
  );
}
