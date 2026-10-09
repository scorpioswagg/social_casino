import { cn } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-1.5 overflow-hidden rounded-full bg-elevated", className)}>
      <div className="h-full rounded-full bg-gold transition-[width] duration-300" style={{ width: `${v}%` }} />
    </div>
  );
}
