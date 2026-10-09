import { createFileRoute } from "@tanstack/react-router";
import { HomeLobby } from "@/components/lobby/home-lobby";

export const Route = createFileRoute("/_app/")({
  component: HomeLobby,
});
