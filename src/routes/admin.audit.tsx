import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listAuditAdmin } from "@/lib/casino/fns";

export const Route = createFileRoute("/admin/audit")({ component: Audit });

function Audit() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listAuditAdmin>>>([]);
  useEffect(() => {
    void listAuditAdmin().then(setRows).catch(() => setRows([]));
  }, []);
  return (
    <div>
      <h1 className="font-display text-3xl">Audit logs</h1>
      <p className="mt-1 text-sm text-muted">Append-only. No edit or delete APIs.</p>
      <ul className="mt-6 space-y-2 text-sm">
        {rows.map((r) => (
          <li key={r.id} className="border-b border-border py-2">
            <span className="text-gold">{r.action}</span>
            <span className="ml-2 text-muted">{r.target_type}</span>
            <span className="ml-2 text-xs text-muted">{String(r.created_at)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
