import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/casino/catalog-page";

export const Route = createFileRoute("/_app/slots")({
  component: () => <CatalogPage title="Slots" kicker="Reels" category="slots" />,
});
