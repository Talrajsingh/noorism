import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { STORE } from "@/lib/store-config";
import { trackEvent } from "@/lib/analytics";

export function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-border/60">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 py-20 md:grid-cols-2 md:px-8">
        <div>
          <Logo />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Handmade wrist charms — hand-strung in small batches.
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground">Contact</p>
          <ul className="mt-5 space-y-2 text-sm">
            <li>
              <a
                href={`mailto:${STORE.email}`}
                onClick={() => trackEvent("email_click", { source: "footer" })}
                className="underline-offset-4 hover:underline"
              >
                {STORE.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-6 md:px-8">
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            © {new Date().getFullYear()} Noorism
          </p>
          <Link
            to="/admin"
            className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground/70 hover:text-foreground"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
