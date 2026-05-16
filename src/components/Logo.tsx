export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-serif text-xl tracking-[0.32em] text-foreground ${className}`}>
      NOORISM
    </span>
  );
}
