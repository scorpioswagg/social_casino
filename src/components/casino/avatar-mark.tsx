const GLYPH: Record<string, string> = {
  lion: "L",
  raven: "R",
  stag: "S",
  koi: "K",
  orchid: "O",
  compass: "C",
  crown: "N",
  fox: "F",
};

export function AvatarMark({ id, size = "md" }: { id: string; size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? "size-8 text-xs" : size === "lg" ? "size-16 text-xl" : "size-10 text-sm";
  return (
    <span className={`grid ${dim} place-items-center rounded-full border border-gold/40 bg-elevated font-display text-gold`}>
      {GLYPH[id] ?? "N"}
    </span>
  );
}
