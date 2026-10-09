import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/casino/catalog-page";

export const Route = createFileRoute("/_app/table-games")({
  component: () => <CatalogPage title="Table games" kicker="Felt" category="table" />,
});
