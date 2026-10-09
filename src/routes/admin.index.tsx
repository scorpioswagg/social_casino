import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getAdminOverview } from "@/lib/casino/fns";
import { formatCoins } from "@/lib/casino/format";

export const Route = createFileRoute("/admin/")({ component: Dash });

function Dash() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getAdminOverview>> | null>(null);
  useEffect(() => {
    void getAdminOverview()
      .then(setData)
      .catch(() => setData(null));
  }, []);
  if (!data) return <p className="text-muted">Loading desk…</p>;
  return (
    <div>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Players" value={String(data.players)} />
        <Stat label="Coins in salon" value={formatCoins(data.coinsInCirculation)} />
        <Stat label="Ledger lines" value={String(data.transactions)} />
        <Stat label="Open tickets" value={String(data.openTickets)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-xs tracking-[0.16em] text-muted uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl tabular-nums">{value}</p>
    </Card>
  );
}
