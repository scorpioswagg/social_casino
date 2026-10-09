import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/casino/catalog-page";

export const Route = createFileRoute("/_app/games")({
  component: () => <CatalogPage title="The floor" kicker="All tables" />,
});
