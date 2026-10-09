export function GoldDust() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden" aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="absolute size-1 rounded-full bg-gold/50"
          style={{
            left: `${8 + i * 7}%`,
            bottom: `${10 + (i % 5) * 8}%`,
            animation: `nocturne-dust ${3 + (i % 4)}s ${i * 0.2}s ease-in infinite`,
          }}
        />
      ))}
    </div>
  );
}
