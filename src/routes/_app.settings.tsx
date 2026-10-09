import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { isSoundEnabled, setSoundEnabled, hydrateSound, subscribeSound } from "@/lib/casino/sound";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/_app/settings")({ component: Settings });

function Settings() {
  const { user, isPending } = useCurrentUserState();
  const [sound, setSound] = useState(true);
  useEffect(() => {
    hydrateSound();
    setSound(isSoundEnabled());
    return subscribeSound(setSound);
  }, []);
  if (isPending) return <div className="h-32 animate-pulse rounded-[28px] bg-surface" />;
  if (!user) return <RedirectToSignIn />;
  return (
    <div className="page-enter">
      <h1 className="font-display text-4xl">Settings</h1>
      <Card className="mt-6">
        <p className="text-sm text-fg">Sound</p>
        <p className="text-sm text-muted">Button, reward, and table cues. Respects reduced motion.</p>
        <button
          type="button"
          className="mt-3 rounded-[12px] border border-border px-4 py-2 text-sm"
          onClick={() => setSoundEnabled(!sound)}
        >
          {sound ? "Sound on" : "Sound off"}
        </button>
      </Card>
    </div>
  );
}
