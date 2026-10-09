import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/casino/logo";

export const Route = createFileRoute("/forgot-password")({ component: Forgot });

function Forgot() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void email;
    setMsg(
      "Password reset mail is not wired on this host yet. This page is the player-facing reset entry.",
    );
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-4">
      <div className="glass w-full max-w-md rounded-[28px] p-8">
        <Logo />
        <h1 className="font-display mt-6 text-3xl">Reset password</h1>
        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full">
            Send reset
          </Button>
        </form>
        {msg ? <p className="mt-4 text-sm text-muted">{msg}</p> : null}
        <Link to="/login" className="mt-6 inline-block text-sm text-gold">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
