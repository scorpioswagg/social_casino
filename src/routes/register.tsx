import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/casino/logo";
import { getMe } from "@/lib/casino/fns";

export const Route = createFileRoute("/register")({ component: Register });

function Register() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await authClient.signUp.email({ email, password, name });
    if (err) {
      setBusy(false);
      setError(err.message ?? "Could not register");
      return;
    }
    await getMe().catch(() => undefined);
    setBusy(false);
    void nav({ to: "/" });
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-4">
      <div className="glass w-full max-w-md rounded-[28px] p-8">
        <Logo />
        <h1 className="font-display mt-6 text-3xl">Request a seat</h1>
        <p className="mt-1 text-sm text-muted">Free to play. Casino Coins never convert to cash.</p>
        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Creating…" : "Join Nocturne"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted">
          Already a member?{" "}
          <Link to="/login" className="text-gold">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
