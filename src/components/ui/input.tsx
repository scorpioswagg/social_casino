import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-[12px] border border-border bg-elevated px-3 text-sm text-fg placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50",
        className,
      )}
      {...props}
    />
  );
}
