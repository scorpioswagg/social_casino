import { createFileRoute } from "@tanstack/react-router";
import { AdminSoon } from "@/components/admin/soon";
export const Route = createFileRoute("/admin/events")({
  component: () => <AdminSoon title="Events" />,
});
