import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listTicketsAdmin } from "@/lib/casino/fns";

export const Route = createFileRoute("/admin/support")({ component: AdminSupport });

function AdminSupport() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listTicketsAdmin>>>([]);
  useEffect(() => {
    void listTicketsAdmin().then(setRows).catch(() => setRows([]));
  }, []);
  return (
    <div>
      <h1 className="font-display text-3xl">Support</h1>
      <ul className="mt-6 space-y-2 text-sm">
        {rows.map((r) => (
          <li key={r.id} className="flex justify-between border-b border-border py-2">
            <span>{r.subject}</span>
            <span className="text-muted">{r.status}</span>
          </li>
        ))}
        {rows.length === 0 ? <li className="text-muted">No tickets.</li> : null}
      </ul>
    </div>
  );
}
