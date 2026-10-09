import { useEffect, useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Menu, Volume2, VolumeX } from "lucide-react";
import { Logo } from "@/components/casino/logo";
import { CoinDisplay } from "@/components/casino/coin-display";
import { VipBadge } from "@/components/casino/vip-badge";
import { AvatarMark } from "@/components/casino/avatar-mark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PLAYER_NAV, APP_NAME, STAFF_ROLES } from "@/lib/casino/constants";
import { getMe } from "@/lib/casino/fns";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  hydrateSound,
  isSoundEnabled,
  playSound,
  setSoundEnabled,
  subscribeSound,
} from "@/lib/casino/sound";
import type { PlayerSnapshot } from "@/lib/casino/player";

function SoundToggle() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    hydrateSound();
    setOn(isSoundEnabled());
    return subscribeSound(setOn);
  }, []);
  return (
    <button
      type="button"
      aria-label={on ? "Mute sounds" : "Enable sounds"}
      className="grid size-11 place-items-center rounded-[12px] text-muted hover:text-fg"
      onClick={() => {
        setSoundEnabled(!on);
        if (!on) playSound("ui.click");
      }}
    >
      {on ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
    </button>
  );
}

export function AppShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, isPending } = useCurrentUserState();
  const [player, setPlayer] = useState<PlayerSnapshot | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setPlayer(null);
      return;
    }
    void getMe()
      .then(setPlayer)
      .catch(() => setPlayer(null));
  }, [user?.id]);

  const staff = player
    ? player.roles.some((r) => (STAFF_ROLES as readonly string[]).includes(r))
    : false;

  return (
    <div className="min-h-dvh overflow-x-hidden bg-bg text-fg">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Logo />
          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            {PLAYER_NAV.slice(0, 8).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-[12px] px-3 py-2 text-sm ${path === item.to ? "text-gold" : "text-muted hover:text-fg"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {isPending ? (
              <div className="h-8 w-24 animate-pulse rounded-full bg-elevated" />
            ) : player ? (
              <div className="hidden items-center gap-2 sm:flex">
                <CoinDisplay amount={player.coins} />
                <VipBadge tier={player.vipTier} />
                <span className="hidden text-xs text-muted tabular-nums md:inline">
                  Lv {player.level} · {player.xp} XP
                </span>
                <AvatarMark id={player.avatarId} size="sm" />
              </div>
            ) : null}
            <SoundToggle />
            <SignedIn>
              <div className="hidden md:block">
                <UserButton />
              </div>
            </SignedIn>
            <SignedOut>
              <Button asChild size="sm">
                <Link to="/login">Sign in</Link>
              </Button>
            </SignedOut>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-[12px] lg:hidden"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <div className="mt-8 flex flex-col gap-1">
            {PLAYER_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex min-h-11 items-center rounded-[12px] px-3 text-fg"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {staff ? (
              <Link
                to="/admin"
                className="flex min-h-11 items-center px-3 text-gold"
                onClick={() => setOpen(false)}
              >
                Admin
              </Link>
            ) : null}
            <Link
              to="/settings"
              className="flex min-h-11 items-center px-3 text-muted"
              onClick={() => setOpen(false)}
            >
              Settings
            </Link>
          </div>
        </SheetContent>
      </Sheet>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border px-4 py-8 text-center text-xs text-muted">
        {APP_NAME} is free-to-play social entertainment. Casino Coins have no
        cash value and cannot be withdrawn.
        {staff ? (
          <div className="mt-3">
            <Link to="/admin" className="text-gold">
              House desk
            </Link>
          </div>
        ) : null}
      </footer>
    </div>
  );
}
