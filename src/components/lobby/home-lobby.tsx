import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Gift, Crown, Trophy, Sparkles } from "lucide-react";
import { GameCard, type GameCardModel } from "@/components/casino/game-card";
import { GoldDust } from "@/components/casino/particles";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { claimDaily, getLobby, getMe, getMyExtras, openGame, toggleFavorite } from "@/lib/casino/fns";
import { DAILY_REWARD_AMOUNT, VIP_XP, type VipTier } from "@/lib/casino/constants";
import { formatCoins } from "@/lib/casino/format";
import { playSound } from "@/lib/casino/sound";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import type { PlayerSnapshot } from "@/lib/casino/player";
import { AvatarMark } from "@/components/casino/avatar-mark";

function vipProgress(xp: number, tier: string) {
  const order: VipTier[] = ["bronze", "silver", "gold", "platinum", "diamond"];
  const i = order.indexOf(tier as VipTier);
  const cur = VIP_XP[order[Math.max(0, i)]];
  const next = i >= 0 && i < order.length - 1 ? VIP_XP[order[i + 1]] : cur;
  if (next === cur) return 100;
  return Math.min(100, ((xp - cur) / (next - cur)) * 100);
}

export function HomeLobby() {
  const { user } = useCurrentUserState();
  const [games, setGames] = useState<GameCardModel[]>([]);
  const [board, setBoard] = useState<
    { username: string; avatar_id: string; vip_tier: string; xp: number; level: number }[]
  >([]);
  const [missions, setMissions] = useState<
    { id: string; name: string; description: string | null; coin_reward: number; goal_value: number }[]
  >([]);
  const [favs, setFavs] = useState<string[]>([]);
  const [recent, setRecent] = useState<{ slug: string; name: string; category: string }[]>([]);
  const [player, setPlayer] = useState<PlayerSnapshot | null>(null);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    void getLobby().then((d) => {
      setGames(d.games);
      setBoard(d.board);
      setMissions(d.missions);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    void getMe().then(setPlayer).catch(() => setPlayer(null));
    void getMyExtras()
      .then((e) => {
        setFavs(e.favoriteIds);
        setRecent(e.recent);
      })
      .catch(() => undefined);
  }, [user?.id]);

  const featured = games.find((g) => g.is_featured) ?? games[0];
  const hot = games.filter((g) => g.is_hot);
  const neu = games.filter((g) => g.is_new);
  const popular = useMemo(() => games.slice(0, 6), [games]);

  async function fav(id: string) {
    if (!user) return;
    const r = await toggleFavorite({ data: id });
    setFavs((prev) => (r.favorited ? [...prev, id] : prev.filter((x) => x !== id)));
  }

  async function play(slug: string) {
    if (user) await openGame({ data: slug }).catch(() => undefined);
  }

  async function daily() {
    if (!user) return;
    const r = await claimDaily();
    if (r.ok) {
      playSound("reward");
      setBurst(true);
      setPlayer(await getMe());
      setTimeout(() => setBurst(false), 1200);
    }
  }

  return (
    <div className="space-y-12 page-enter">
      <section className="relative overflow-hidden rounded-[28px] border border-border bg-sapphire p-6 sm:p-10">
        <GoldDust />
        <p className="text-[11px] tracking-[0.28em] text-gold uppercase">Private salon · Social play</p>
        <h1 className="font-display mt-3 max-w-xl text-4xl text-fg sm:text-6xl">
          The house is open. The stakes are stories.
        </h1>
        <p className="mt-4 max-w-lg text-muted">
          Nocturne is a free-to-play social casino. Casino Coins cannot be withdrawn, sold, or
          converted to money.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/games">Enter the floor</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/rewards">Evening envelope</Link>
          </Button>
        </div>
      </section>

      {featured ? (
        <section>
          <SectionTitle kicker="Tonight" title="Featured table" />
          <div className="grid gap-6 lg:grid-cols-2">
            <GameCard game={featured} favorited={favs.includes(featured.id)} onFavorite={fav} onPlay={play} />
            <Card className="flex flex-col justify-between">
              <div>
                <Badge>Cinematic table</Badge>
                <h3 className="font-display mt-3 text-3xl">{featured.name}</h3>
                <p className="mt-2 text-muted">{featured.description}</p>
              </div>
              <Button asChild className="mt-6 w-fit">
                <Link to="/games/$slug" params={{ slug: featured.slug }} onClick={() => play(featured.slug)}>
                  Play featured
                </Link>
              </Button>
            </Card>
          </div>
        </section>
      ) : null}

      <GameRow title="Hot games" kicker="On the floor" games={hot} favs={favs} onFav={fav} onPlay={play} />
      <GameRow title="New games" kicker="Just unveiled" games={neu} favs={favs} onFav={fav} onPlay={play} />
      <GameRow title="Popular games" kicker="House favorites" games={popular} favs={favs} onFav={fav} onPlay={play} />

      <section>
        <SectionTitle kicker="Your evening" title="Recently played" />
        {recent.length === 0 ? (
          <p className="text-sm text-muted">Open a table to start a private history. Gameplay arrives in a later step.</p>
        ) : (
          <div className="flex max-w-full gap-3 overflow-x-auto pb-2">
            {recent.map((r) => (
              <Link
                key={r.slug + r.name}
                to="/games/$slug"
                params={{ slug: r.slug }}
                className="min-w-40 rounded-[20px] border border-border bg-surface px-4 py-3"
              >
                <p className="text-[11px] text-muted uppercase">{r.category}</p>
                <p className="font-display text-lg">{r.name}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="relative overflow-hidden">
          {burst ? <GoldDust /> : null}
          <Gift className="text-gold" />
          <h3 className="font-display mt-3 text-2xl">Daily reward</h3>
          <p className="mt-1 text-sm text-muted">
            Evening envelope · {formatCoins(DAILY_REWARD_AMOUNT)} Casino Coins. Virtual only.
          </p>
          <Button className="mt-4" disabled={!user || player?.dailyClaimed} onClick={() => void daily()}>
            {!user ? "Sign in to claim" : player?.dailyClaimed ? "Claimed today" : "Collect envelope"}
          </Button>
        </Card>
        <Card>
          <Sparkles className="text-gold" />
          <h3 className="font-display mt-3 text-2xl">Missions</h3>
          <ul className="mt-3 space-y-3">
            {missions.map((m) => (
              <li key={m.id}>
                <p className="text-sm text-fg">{m.name}</p>
                <p className="text-xs text-muted">{m.description}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <Crown className="text-gold" />
          <h3 className="font-display mt-3 text-2xl">VIP progress</h3>
          {player ? (
            <>
              <p className="mt-2 text-sm text-muted capitalize">
                {player.vipTier} · Level {player.level}
              </p>
              <Progress className="mt-3" value={vipProgress(player.xp, player.vipTier)} />
            </>
          ) : (
            <p className="mt-2 text-sm text-muted">Sign in to wear a house tier.</p>
          )}
          <Button asChild variant="outline" className="mt-4">
            <Link to="/vip">VIP salon</Link>
          </Button>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <Trophy className="text-gold" />
          <h3 className="font-display mt-3 text-2xl">Leaderboard</h3>
          <ol className="mt-4 space-y-3">
            {board.map((row, i) => (
              <li key={row.username} className="flex items-center gap-3">
                <span className="w-6 tabular-nums text-muted">{i + 1}</span>
                <AvatarMark id={row.avatar_id} size="sm" />
                <span className="flex-1">{row.username}</span>
                <span className="text-xs text-gold uppercase">{row.vip_tier}</span>
                <span className="tabular-nums text-sm text-muted">{row.xp} XP</span>
              </li>
            ))}
          </ol>
        </Card>
        <Card className="bg-jewel">
          <Badge>Seasonal</Badge>
          <h3 className="font-display mt-3 text-3xl">Midnight Garden</h3>
          <p className="mt-2 text-sm text-fg/80">
            A limited salon event. Tables, missions, and a seasonal envelope will open here — still
            virtual, still no cash.
          </p>
        </Card>
      </section>
    </div>
  );
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] tracking-[0.22em] text-gold uppercase">{kicker}</p>
      <h2 className="font-display text-3xl">{title}</h2>
    </div>
  );
}

function GameRow({
  title,
  kicker,
  games,
  favs,
  onFav,
  onPlay,
}: {
  title: string;
  kicker: string;
  games: GameCardModel[];
  favs: string[];
  onFav: (id: string) => void;
  onPlay: (slug: string) => void;
}) {
  if (!games.length) return null;
  return (
    <section>
      <SectionTitle kicker={kicker} title={title} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((g) => (
          <GameCard key={g.id} game={g} favorited={favs.includes(g.id)} onFavorite={onFav} onPlay={onPlay} />
        ))}
      </div>
    </section>
  );
}
