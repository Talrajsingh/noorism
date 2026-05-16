import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import heroImg from "@/assets/hero-bracelet.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Noorism — Handmade Wrist Charms" },
      {
        name: "description",
        content: "Noorism — handmade wrist charms made to carry your story.",
      },
      { property: "og:title", content: "Noorism — Handmade Wrist Charms" },
      {
        property: "og:description",
        content: "Handmade, customisable wrist charms made to carry your story.",
      },
    ],
  }),
  component: Index,
});

function SectionLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-4 text-[10px] uppercase tracking-[0.45em] text-muted-foreground">
      <span>{n}</span>
      <span className="h-px w-8 bg-border" />
      {children}
    </p>
  );
}

// ── Developer / "Built by" section ───────────────────────────
// Replace DEVELOPER_PHOTO_URL with your actual photo URL or a relative path like /your-photo.jpg
// Replace the name and comment with your own
const DEVELOPER = {
  name: "Your Name",
  role: "Developer",
  photoUrl: "", // ← paste your photo URL here, e.g. "https://avatars.githubusercontent.com/u/..."
  comment: `I built this store for Noorism to help bring these beautiful handmade 
charms to more people. It was a joy to craft — clean design, fast performance, 
and a smooth order flow powered by Supabase. If you need a custom shop or web 
project, feel free to reach out.`,
};

function DeveloperSection() {
  return (
    <section id="developer" className="border-t border-border/60 scroll-mt-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 py-20 md:grid-cols-12 md:gap-16 md:px-8 md:py-28">
        <div className="md:col-span-4">
          <SectionLabel n="03">Built by</SectionLabel>
          <h2 className="mt-6 font-serif text-[clamp(2rem,5vw,3rem)] leading-tight">
            <em>{DEVELOPER.name}</em>
          </h2>
          <p className="mt-2 text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
            {DEVELOPER.role}
          </p>

          {/* Photo */}
          <div className="mt-8">
            {DEVELOPER.photoUrl ? (
              <img
                src={DEVELOPER.photoUrl}
                alt={DEVELOPER.name}
                className="h-40 w-40 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-full bg-muted text-[10px] uppercase tracking-widest text-muted-foreground ring-1 ring-border">
                Add photo
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5 text-[15px] leading-relaxed text-muted-foreground md:col-span-7 md:col-start-6 md:pt-4">
          {DEVELOPER.comment
            .split("\n")
            .filter(Boolean)
            .map((para, i) => (
              <p key={i} className={i === 0 ? "text-foreground" : undefined}>
                {para}
              </p>
            ))}
        </div>
      </div>
    </section>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 py-16 md:grid-cols-12 md:gap-16 md:px-8 md:py-36">
        <div className="md:col-span-5 md:pt-12">
          <SectionLabel n="01">Wrist Charms</SectionLabel>
          <h1 className="mt-8 font-serif text-[clamp(2.5rem,8vw,4.5rem)] leading-[1.02] md:mt-10">
            Your name.
            <br />
            <em>Your signature.</em>
          </h1>
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-muted-foreground md:mt-8">
            Hand-strung in small batches — pearls, pastels and personal letters, quietly considered.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6 md:mt-12 md:gap-8">
            <Button asChild size="lg" className="rounded-none px-8">
              <Link to="/shop">Shop the collection</Link>
            </Button>
            <a
              href="#about"
              className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Our story →
            </a>
          </div>
        </div>
        <div className="md:col-span-7">
          <img
            src={heroImg}
            alt="Handmade pearl wrist charm by Noorism"
            width={1600}
            height={1200}
            className="aspect-[5/6] w-full object-cover"
          />
        </div>
      </section>

      <div className="border-y border-border/60 py-5">
        <p className="px-4 text-center text-[10px] uppercase tracking-[0.5em] text-muted-foreground">
          Made to order · Personalisation available
        </p>
      </div>

      {/* About */}
      <section id="about" className="scroll-mt-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 py-20 md:grid-cols-12 md:gap-16 md:px-8 md:py-32">
          <div className="md:col-span-4">
            <SectionLabel n="02">Atelier</SectionLabel>
            <h2 className="mt-6 font-serif text-[clamp(2.25rem,6vw,3.25rem)] leading-tight">
              <em>Quietly</em>
              <br />
              made by hand.
            </h2>
          </div>
          <div className="space-y-6 text-[15px] leading-relaxed text-muted-foreground md:col-span-7 md:col-start-6 md:pt-3">
            <p className="text-foreground">
              Noorism began at a single workbench, with a fistful of beads and a quiet idea — that
              the smallest objects can hold the most meaning.
            </p>
            <p>
              Every charm is hand-strung in small, considered batches. No two are quite the same;
              each carries the rhythm of the hand that made it.
            </p>
            <p>
              Pieces can be personalised with names, dates and colour palettes. Drop a note at
              checkout and your order is made just for you.
            </p>
            <div className="pt-4">
              <Button asChild variant="outline" className="rounded-none px-8">
                <Link to="/shop">Browse the collection</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Developer section */}
      {/* <DeveloperSection /> */}

      <SiteFooter />
    </div>
  );
}
