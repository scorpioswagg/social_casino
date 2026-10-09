import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { ADMIN_NAV, STAFF_ROLES } from "@/lib/casino/constants";
import { getMe } from "@/lib/casino/fns";
import { Logo } from "@/components/casino/logo";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";
import type { RoleId } from "@/lib/casino/constants";

export function AdminShell() {
  const { user, isPending } = useCurrentUserState();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [roles, setRoles] = useState<RoleId[] | null>(null);

  useEffect(() => {
    if (!user) return;
    void getMe()
      .then((p) => {
        const ok = p.roles.some((r) => (STAFF_ROLES as readonly string[]).includes(r));
        if (!ok) {
          void nav({ to: "/" });
          return;
        }
        setRoles(p.roles);
      })
      .catch(() => nav({ to: "/" }));
  }, [user?.id, nav]);

  if (isPending) return <div className="min-h-dvh bg-bg" />;
  if (!user) return <RedirectToSignIn />;
  if (!roles) return <div className="min-h-dvh bg-bg" />;

  const items = ADMIN_NAV.filter((i) => i.roles.some((r) => roles.includes(r as RoleId)));

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="flex items-center gap-4 border-b border-border px-4 py-3">
        <Logo compact />
        <span className="text-sm tracking-[0.18em] text-gold uppercase">House desk</span>
        <Link to="/" className="ml-auto text-sm text-muted hover:text-fg">
          Back to floor
        </Link>
      </header>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <nav className="flex gap-2 overflow-x-auto lg:w-52 lg:flex-col">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`min-h-11 shrink-0 rounded-[12px] px-3 py-2 text-sm ${path === item.to ? "text-gold" : "text-muted hover:text-fg"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
