import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { AvatarMark } from "@/components/casino/avatar-mark";
import { getLobby } from "@/lib/casino/fns";

export const Route = createFileRoute("/_app/leaderboards")({ component: Board });

function Board() {
  const [rows, setRows] = useState<
    { username: string; avatar_id: string; vip_tier: string; xp: number; level: number }[]
  >([]);
  useEffect(() => {
    void getLobby().then((d) => setRows(d.board));
  }, []);
  return (
    <div className="page-enter">
      <h1 className="font-display text-4xl">Leaderboard</h1>
      <p className="mt-2 text-muted">Standing by XP. Social prestige only.</p>
      <Card className="mt-8">
        <ol className="space-y-4">
          {rows.map((row, i) => (
            <li key={row.username} className="flex items-center gap-3">
              <span className="w-6 tabular-nums text-muted">{i + 1}</span>
              <AvatarMark id={row.avatar_id} size="sm" />
              <span className="flex-1">{row.username}</span>
              <span className="text-xs text-gold uppercase">{row.vip_tier}</span>
              <span className="tabular-nums text-muted">Lv {row.level}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
