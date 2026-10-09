import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { economySnapshot } from "@/lib/casino/fns";
import { formatCoins } from "@/lib/casino/format";

export const Route = createFileRoute("/admin/economy")({ component: Economy });

function Economy() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof economySnapshot>>>([]);
  useEffect(() => {
    void economySnapshot().then(setRows).catch(() => setRows([]));
  }, []);
  return (
    <div>
      <h1 className="font-display text-3xl">Economy</h1>
      <p className="mt-1 text-sm text-muted">Virtual Casino Coins only. No cash ledger exists.</p>
      <ul className="mt-6 space-y-2 text-sm">
        {rows.map((r) => (
          <li key={r.type} className="flex justify-between border-b border-border py-2">
            <span>{r.type}</span>
            <span className="tabular-nums text-muted">
              {r.n} · {formatCoins(r.volume)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
