import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-gold uppercase",
        className,
      )}
      {...props}
    />
  );
}
