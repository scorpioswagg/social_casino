export function AdminSoon({ title }: { title: string }) {
  return (
    <div>
      <h1 className="font-display text-3xl">{title}</h1>
      <p className="mt-3 text-muted">Coming soon. The desk is reserved; tools land with later steps.</p>
    </div>
  );
}
