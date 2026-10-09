import { Link } from "@tanstack/react-router";
import { APP_NAME } from "@/lib/casino/constants";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-full border border-gold/40 bg-elevated">
        <svg viewBox="0 0 32 32" className="size-5 text-gold" aria-hidden>
          <circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M12 22 V10 h5.2 c2.8 0 4.6 1.6 4.6 4.1 0 2.4-1.8 4-4.6 4H12" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </span>
      {!compact && (
        <span className="font-display text-xl tracking-[0.18em] text-fg uppercase">{APP_NAME}</span>
      )}
    </Link>
  );
}
