import type { Sql } from "@/lib/db";
import { STAFF_ROLES, type RoleId } from "./constants";

export class ForbiddenError extends Error {
  status = 403;
  constructor(message = "Forbidden") {
    super(message);
  }
}

export async function getRoles(sql: Sql, userId: string): Promise<RoleId[]> {
  const rows = await sql<{ role_id: RoleId }>`
    select role_id from user_roles where user_id = ${userId}
  `;
  return rows.map((r) => r.role_id);
}

export async function requireStaff(sql: Sql, userId: string, allowed?: readonly string[]) {
  const roles = await getRoles(sql, userId);
  const need = allowed ?? STAFF_ROLES;
  const ok = roles.some((r) => need.includes(r));
  if (!ok) throw new ForbiddenError("Staff access required");
  return roles;
}

export function isStaff(roles: string[]) {
  return roles.some((r) => (STAFF_ROLES as readonly string[]).includes(r));
}
