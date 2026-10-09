import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { createTicket, listMyTickets } from "@/lib/casino/fns";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/_app/support")({ component: Support });

function Support() {
  const { user, isPending } = useCurrentUserState();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [tickets, setTickets] = useState<{ id: string; subject: string; status: string }[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) void listMyTickets().then(setTickets).catch(() => undefined);
  }, [user?.id]);

  if (isPending) return <div className="h-32 animate-pulse rounded-[28px] bg-surface" />;
  if (!user) return <RedirectToSignIn />;

  return (
    <div className="page-enter grid gap-6 lg:grid-cols-2">
      <div>
        <h1 className="font-display text-4xl">Support</h1>
        <form
          className="mt-6 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            await createTicket({ data: { subject, body } });
            setSubject("");
            setBody("");
            setMsg("Ticket received.");
            setTickets(await listMyTickets());
          }}
        >
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="body">Details</Label>
            <textarea
              id="body"
              className="min-h-32 w-full rounded-[12px] border border-border bg-elevated p-3 text-sm"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>
          <Button type="submit">Send</Button>
          {msg ? <p className="text-sm text-gold">{msg}</p> : null}
        </form>
      </div>
      <Card>
        <h2 className="font-display text-2xl">Your tickets</h2>
        <ul className="mt-4 space-y-3">
          {tickets.map((t) => (
            <li key={t.id} className="flex justify-between text-sm">
              <span>{t.subject}</span>
              <span className="text-muted">{t.status}</span>
            </li>
          ))}
          {tickets.length === 0 ? <li className="text-sm text-muted">No tickets yet.</li> : null}
        </ul>
      </Card>
    </div>
  );
}
