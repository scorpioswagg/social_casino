import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/casino/logo";
import { playSound } from "@/lib/casino/sound";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    playSound("ui.click");
    const { error: err } = await authClient.signIn.email({ email, password });
    setBusy(false);
    if (err) {
      setError(err.message ?? "Could not sign in");
      return;
    }
    void nav({ to: "/" });
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-4">
      <div className="glass w-full max-w-md rounded-[28px] p-8">
        <Logo />
        <h1 className="font-display mt-6 text-3xl">Sign in</h1>
        <p className="mt-1 text-sm text-muted">Members of the house, this way.</p>
        {authEnabled ? (
          <>
            <form className="mt-6 space-y-3" onSubmit={onSubmit}>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error ? <p className="text-sm text-danger">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Signing in…" : "Enter"}
              </Button>
            </form>
            <div className="my-5 gold-line" />
            <div className="space-y-2">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                >
                  Continue with {p.label}
                </Button>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-muted">Sign-in is disabled.</p>
        )}
        <p className="mt-6 text-sm text-muted">
          New guest?{" "}
          <Link to="/register" className="text-gold">
            Create an account
          </Link>
        </p>
        <p className="mt-2 text-sm">
          <Link to="/forgot-password" className="text-muted hover:text-fg">
            Forgot password
          </Link>
        </p>
      </div>
    </main>
  );
}
