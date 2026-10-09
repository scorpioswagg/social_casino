import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GameArt } from "@/components/casino/game-art";
import { Button } from "@/components/ui/button";
import { getCatalog, openGame } from "@/lib/casino/fns";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/_app/games/$slug")({
  component: GameDetail,
});

function GameDetail() {
  const { slug } = Route.useParams();
  const user = useCurrentUser();
  const [name, setName] = useState(slug);
  const [desc, setDesc] = useState("");

  useEffect(() => {
    void getCatalog().then((rows) => {
      const g = rows.find((r) => r.slug === slug);
      if (g) {
        setName(g.name);
        setDesc(g.description ?? "");
      }
    });
    if (user) void openGame({ data: slug }).catch(() => undefined);
  }, [slug, user?.id]);

  return (
    <div className="page-enter grid gap-6 lg:grid-cols-2">
      <GameArt slug={slug} className="min-h-64 rounded-[28px]" />
      <div>
        <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Table preview</p>
        <h1 className="font-display mt-2 text-4xl">{name}</h1>
        <p className="mt-3 text-muted">{desc || "This table is dressed. Gameplay arrives in the next build step."}</p>
        <p className="mt-4 text-sm text-muted">
          Casino Coins are virtual. No cash wagering, deposits, or withdrawals.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/games">Back to the floor</Link>
        </Button>
      </div>
    </div>
  );
}
