import { cn } from "@/lib/utils";

export function Separator({ className }: { className?: string }) {
  return <div className={cn("gold-line w-full", className)} />;
}
