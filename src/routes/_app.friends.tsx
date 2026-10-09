import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/_app/friends")({ component: Friends });

function Friends() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <div className="h-32 animate-pulse rounded-[28px] bg-surface" />;
  if (!user) return <RedirectToSignIn />;
  return (
    <div className="page-enter">
      <h1 className="font-display text-4xl">Friends</h1>
      <Card className="mt-6">
        <p className="text-muted">
          Friend requests and private messages are architected in the database. Social graph UI
          arrives after the tables themselves.
        </p>
      </Card>
    </div>
  );
}
