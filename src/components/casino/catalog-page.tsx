import { useEffect, useState } from "react";
import { GameCard, type GameCardModel } from "./game-card";
import { getCatalog, getMyExtras, openGame, toggleFavorite } from "@/lib/casino/fns";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export function CatalogPage({
  title,
  kicker,
  category,
}: {
  title: string;
  kicker: string;
  category?: string;
}) {
  const user = useCurrentUser();
  const [games, setGames] = useState<GameCardModel[]>([]);
  const [favs, setFavs] = useState<string[]>([]);

  useEffect(() => {
    void getCatalog().then((rows) => {
      setGames(category ? rows.filter((g) => g.category === category) : rows);
    });
    if (user) {
      void getMyExtras()
        .then((e) => setFavs(e.favoriteIds))
        .catch(() => undefined);
    }
  }, [category, user?.id]);

  return (
    <div className="page-enter">
      <p className="text-[11px] tracking-[0.22em] text-gold uppercase">{kicker}</p>
      <h1 className="font-display mt-2 text-4xl">{title}</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((g) => (
          <GameCard
            key={g.id}
            game={g}
            favorited={favs.includes(g.id)}
            onFavorite={(id) => {
              if (!user) return;
              void toggleFavorite({ data: id }).then((r) => {
                setFavs((prev) => (r.favorited ? [...prev, id] : prev.filter((x) => x !== id)));
              });
            }}
            onPlay={(slug) => {
              if (user) void openGame({ data: slug }).catch(() => undefined);
            }}
          />
        ))}
      </div>
    </div>
  );
}
