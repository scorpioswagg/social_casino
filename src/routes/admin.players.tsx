import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listPlayersAdmin } from "@/lib/casino/fns";
import { formatCoins } from "@/lib/casino/format";

export const Route = createFileRoute("/admin/players")({ component: Players });

function Players() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listPlayersAdmin>>>([]);
  useEffect(() => {
    void listPlayersAdmin().then(setRows).catch(() => setRows([]));
  }, []);
  return (
    <div>
      <h1 className="font-display text-3xl">Players</h1>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="py-2">Username</th>
              <th>VIP</th>
              <th>Lv</th>
              <th>Coins</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.user_id} className="border-t border-border">
                <td className="py-2">{r.username}</td>
                <td className="capitalize">{r.vip_tier}</td>
                <td>{r.level}</td>
                <td className="tabular-nums">{formatCoins(r.casino_coins)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
