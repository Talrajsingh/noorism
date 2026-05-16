import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Menu, X } from "lucide-react";

const NAV = [
  { to: "/shop", label: "Shop" },
  { to: "/atelier", label: "Atelier" },
  { to: "/#contact", label: "Contact" },
] as const;

export function SiteHeader({ cartCount = 0 }: { cartCount?: number }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-3 items-center px-5 py-5 md:px-8">
        {/* Left: nav (desktop) / menu (mobile) */}
        <div className="flex items-center justify-start">
          <nav className="hidden gap-10 text-[11px] uppercase tracking-[0.25em] text-muted-foreground md:flex">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="transition-colors hover:text-foreground">
                {n.label}
              </Link>
            ))}
          </nav>
          <button
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden -ml-1 p-2 text-muted-foreground hover:text-foreground"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Center: logo */}
        <div className="flex justify-center">
          <Link to="/" aria-label="Noorism — Home">
            <Logo />
          </Link>
        </div>

        {/* Right: cart */}
        <div className="flex justify-end">
          <Link
            to="/shop"
            hash="cart"
            className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Cart {cartCount > 0 && <span className="text-foreground">({cartCount})</span>}
          </Link>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="border-t border-border/60 md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4 text-[12px] uppercase tracking-[0.3em] text-muted-foreground">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-2 transition-colors hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
