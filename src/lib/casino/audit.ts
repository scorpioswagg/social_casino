import { randomUUID } from "node:crypto";
import type { Sql } from "@/lib/db";

export async function writeAudit(
  sql: Sql,
  input: {
    actorId: string;
    action: string;
    targetType?: string | null;
    targetId?: string | null;
    ip?: string | null;
    ua?: string | null;
    previousState?: unknown;
    newState?: unknown;
    metadata?: unknown;
    asAdmin?: boolean;
  },
) {
  const id = randomUUID();
  const prev = JSON.stringify(input.previousState ?? null);
  const next = JSON.stringify(input.newState ?? null);
  const meta = JSON.stringify(input.metadata ?? {});
  await sql`
    insert into audit_logs (
      id, actor_id, action, target_type, target_id, ip_address, user_agent,
      previous_state, new_state, metadata
    ) values (
      ${id}, ${input.actorId}, ${input.action}, ${input.targetType ?? null},
      ${input.targetId ?? null}, ${input.ip ?? null}, ${input.ua ?? null},
      ${prev}::jsonb, ${next}::jsonb, ${meta}::jsonb
    )
  `;
  if (input.asAdmin) {
    const adminId = randomUUID();
    await sql`
      insert into admin_actions (id, audit_log_id, admin_id, action, target_type, target_id)
      values (${adminId}, ${id}, ${input.actorId}, ${input.action}, ${input.targetType ?? null}, ${input.targetId ?? null})
    `;
  }
  return id;
}

export async function requestMeta(): Promise<{ ip: string | null; ua: string | null }> {
  try {
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const forwarded = getRequestHeader("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? getRequestHeader("x-real-ip") ?? null;
    const ua = getRequestHeader("user-agent") ?? null;
    return { ip, ua };
  } catch {
    return { ip: null, ua: null };
  }
}
