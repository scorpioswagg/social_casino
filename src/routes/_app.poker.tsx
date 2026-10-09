import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/casino/catalog-page";

export const Route = createFileRoute("/_app/poker")({
  component: () => <CatalogPage title="Poker" kicker="Private rooms" category="poker" />,
});
