import { Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GameArt } from "./game-art";
import { playSound } from "@/lib/casino/sound";
import { cn } from "@/lib/utils";

export type GameCardModel = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  category: string;
  is_hot?: boolean;
  is_new?: boolean;
  is_featured?: boolean;
};

export function GameCard({
  game,
  favorited,
  onFavorite,
  onPlay,
}: {
  game: GameCardModel;
  favorited?: boolean;
  onFavorite?: (id: string) => void;
  onPlay?: (slug: string) => void;
}) {
  return (
    <article
      className="group relative overflow-hidden rounded-[28px] border border-border bg-surface transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1"
      onMouseEnter={() => playSound("ui.hover")}
    >
      <GameArt slug={game.slug} className="aspect-[16/10] w-full" />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-3">
        <div className="flex gap-1.5">
          {game.is_hot ? <Badge>Hot</Badge> : null}
          {game.is_new ? <Badge className="border-fg/20 bg-fg/10 text-fg">New</Badge> : null}
        </div>
      </div>
      <div className="p-4">
        <p className="text-[11px] tracking-[0.16em] text-muted uppercase">{game.category}</p>
        <h3 className="font-display mt-1 text-xl text-fg">{game.name}</h3>
        {game.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted">{game.description}</p>
        ) : null}
        <div className="mt-4 flex items-center gap-2">
          <Button asChild size="sm" className="flex-1">
            <Link
              to="/games/$slug"
              params={{ slug: game.slug }}
              onClick={() => {
                playSound("ui.click");
                onPlay?.(game.slug);
              }}
            >
              Play
            </Link>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-9"
            aria-label={favorited ? "Remove favorite" : "Add favorite"}
            onClick={() => {
              playSound("ui.click");
              onFavorite?.(game.id);
            }}
          >
            <Heart className={cn("size-4", favorited && "fill-gold text-gold")} />
          </Button>
        </div>
      </div>
    </article>
  );
}
