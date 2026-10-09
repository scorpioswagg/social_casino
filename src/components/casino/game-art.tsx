const THEMES: Record<string, { a: string; b: string; motif: "reels" | "wheel" | "cards" | "chips" | "stars" }> = {
  "midnight-reels": { a: "#1c2a44", b: "#c4a574", motif: "reels" },
  "velvet-wheel": { a: "#1e3d36", b: "#e0c99a", motif: "wheel" },
  "house-21": { a: "#171c27", b: "#c4a574", motif: "cards" },
  "orchid-draw": { a: "#2a1c2e", b: "#c4a574", motif: "cards" },
  "sapphire-keno": { a: "#13233d", b: "#9ab0d0", motif: "stars" },
  "crown-jacks": { a: "#2a2318", b: "#e0c99a", motif: "reels" },
  "noir-holdem": { a: "#10131a", b: "#c4a574", motif: "cards" },
  "gilded-baccarat": { a: "#1e3d36", b: "#c4a574", motif: "chips" },
  "ember-slots": { a: "#2a1a16", b: "#c45c5c", motif: "reels" },
  "aurora-poker": { a: "#162032", b: "#c4a574", motif: "cards" },
  "cosmic-fortune": { a: "#0f1a2e", b: "#9ab0d0", motif: "stars" },
  "pharaohs-gold": { a: "#2a2318", b: "#e0c99a", motif: "reels" },
};

export function GameArt({ slug, className = "" }: { slug: string; className?: string }) {
  const t = THEMES[slug] ?? { a: "#171c27", b: "#c4a574", motif: "chips" as const };
  return (
    <div className={`relative overflow-hidden ${className}`} aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(80% 80% at 20% 10%, ${t.b}33, transparent 55%), linear-gradient(160deg, ${t.a}, #07080c)`,
        }}
      />
      <svg viewBox="0 0 200 140" className="absolute inset-0 h-full w-full opacity-80">
        {t.motif === "reels" && (
          <>
            <rect x="40" y="28" width="36" height="84" rx="8" fill="none" stroke={t.b} strokeWidth="1.4" />
            <rect x="82" y="28" width="36" height="84" rx="8" fill="none" stroke={t.b} strokeWidth="1.4" />
            <rect x="124" y="28" width="36" height="84" rx="8" fill="none" stroke={t.b} strokeWidth="1.4" />
            <circle cx="100" cy="70" r="8" fill={t.b} opacity="0.7" />
          </>
        )}
        {t.motif === "wheel" && (
          <>
            <circle cx="100" cy="70" r="46" fill="none" stroke={t.b} strokeWidth="1.5" />
            <circle cx="100" cy="70" r="10" fill={t.b} />
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return (
                <line
                  key={i}
                  x1={100}
                  y1={70}
                  x2={100 + Math.cos(a) * 46}
                  y2={70 + Math.sin(a) * 46}
                  stroke={t.b}
                  strokeWidth="0.8"
                  opacity="0.7"
                />
              );
            })}
          </>
        )}
        {t.motif === "cards" && (
          <>
            <rect x="62" y="30" width="48" height="70" rx="6" transform="rotate(-12 86 65)" fill="none" stroke={t.b} />
            <rect x="86" y="26" width="48" height="70" rx="6" fill="#10131a" stroke={t.b} />
            <path d="M110 48 l8 12 -8 12 -8-12 z" fill={t.b} />
          </>
        )}
        {t.motif === "chips" && (
          <>
            <ellipse cx="78" cy="82" rx="28" ry="10" fill="none" stroke={t.b} />
            <ellipse cx="78" cy="74" rx="28" ry="10" fill="none" stroke={t.b} />
            <ellipse cx="124" cy="70" rx="22" ry="8" fill="none" stroke={t.b} />
            <ellipse cx="124" cy="64" rx="22" ry="8" fill={t.b} opacity="0.35" />
          </>
        )}
        {t.motif === "stars" && (
          <>
            {[[40, 40], [90, 28], [150, 46], [70, 90], [130, 100]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={3 + (i % 3)} fill={t.b} opacity="0.8" />
            ))}
          </>
        )}
      </svg>
    </div>
  );
}
