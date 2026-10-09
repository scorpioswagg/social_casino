import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { AvatarMark } from "@/components/casino/avatar-mark";
import { CoinDisplay } from "@/components/casino/coin-display";
import { AVATAR_PRESETS } from "@/lib/casino/constants";
import { getMe, updateProfile } from "@/lib/casino/fns";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import type { PlayerSnapshot } from "@/lib/casino/player";

export const Route = createFileRoute("/_app/profile")({ component: Profile });

function Profile() {
  const { user, isPending } = useCurrentUserState();
  const [player, setPlayer] = useState<PlayerSnapshot | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!user) return;
    void getMe().then((p) => {
      setPlayer(p);
      setUsername(p.username);
      setBio(p.bio ?? "");
    });
  }, [user?.id]);

  if (isPending) return <div className="h-40 animate-pulse rounded-[28px] bg-surface" />;
  if (!user) return <RedirectToSignIn />;
  if (!player) return <div className="h-40 animate-pulse rounded-[28px] bg-surface" />;

  return (
    <div className="page-enter grid gap-6 lg:grid-cols-[1fr_20rem]">
      <Card>
        <h1 className="font-display text-4xl">Profile</h1>
        <div className="mt-6 flex items-center gap-4">
          <AvatarMark id={player.avatarId} size="lg" />
          <div>
            <p className="text-lg">{player.username}</p>
            <p className="text-sm text-muted">
              Level {player.level} · {player.vipTier}
            </p>
            <div className="mt-2">
              <CoinDisplay amount={player.coins} />
            </div>
          </div>
        </div>
        <form
          className="mt-6 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const next = await updateProfile({ data: { username, bio } });
            setPlayer(next);
          }}
        >
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Input id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <Button type="submit">Save</Button>
        </form>
      </Card>
      <Card>
        <h2 className="font-display text-2xl">Avatar</h2>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {AVATAR_PRESETS.map((a) => (
            <button
              key={a.id}
              type="button"
              className="grid place-items-center"
              onClick={async () => {
                const next = await updateProfile({ data: { avatarId: a.id } });
                setPlayer(next);
              }}
            >
              <AvatarMark id={a.id} />
            </button>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted">Member since {String(player.createdAt).slice(0, 10)}</p>
      </Card>
    </div>
  );
}
