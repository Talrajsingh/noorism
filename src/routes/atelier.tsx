import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { STORE } from "@/lib/store-config";
import atelierHands from "@/assets/atelier-hands.jpg";
import atelierMaterials from "@/assets/atelier-materials.jpg";
import atelierDetail from "@/assets/atelier-detail.jpg";

export const Route = createFileRoute("/atelier")({
  head: () => ({
    meta: [
      { title: "Atelier — Noorism" },
      {
        name: "description",
        content: "Step inside Noorism's handmade wrist charm atelier and book a private consultation.",
      },
      { property: "og:title", content: "Atelier — Noorism" },
      {
        property: "og:description",
        content: "A quiet look at Noorism's hand-strung charm-making process.",
      },
    ],
  }),
  component: AtelierPage,
});

function AtelierPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("Bespoke Commission");
  const [month, setMonth] = useState("");
  const [vision, setVision] = useState("");

  const requestAppointment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = [
      `Name: ${name || "—"}`,
      `Email: ${email || "—"}`,
      `Service: ${service}`,
      `Preferred month: ${month || "—"}`,
      ``,
      `Vision:`,
      vision || "—",
    ].join("\n");
    void import("@/lib/analytics").then((m) =>
      m.trackEvent("consultation_request", { service }),
    );
    const subject = "Private consultation request";
    window.location.href = `mailto:${STORE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 py-14 md:grid-cols-12 md:gap-16 md:px-8 md:py-24">
          <div className="md:col-span-6 md:pt-2">
            <p className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground">
              Our Philosophy
            </p>
            <h1 className="mt-5 font-serif text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95]">
              Crafting the <em>Invisible</em>
            </h1>
            <p className="mt-7 max-w-lg text-[15px] leading-8 text-muted-foreground">
              At Noorism, the atelier is more than a workspace; it is a sanctuary of silence and
              precision. Here, we honour the ancient dialogue between hand and precious detail,
              creating wrist charms that exist beyond the ephemeral cycles of fashion.
            </p>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <img
              src={atelierHands}
              alt="Hands threading pearl and gold charms in the Noorism atelier"
              width={1280}
              height={1600}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </section>

        <section className="bg-muted/35">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-5 py-20 md:grid-cols-12 md:px-8 md:py-32">
            <div className="relative md:col-span-5 md:col-start-2">
              <img
                src={atelierMaterials}
                alt="Pearls, letter beads and atelier tools arranged on linen"
                width={1408}
                height={1120}
                loading="lazy"
                className="aspect-[5/4] w-[82%] object-cover"
              />
              <img
                src={atelierDetail}
                alt="Soft light and display details inside the Noorism atelier"
                width={960}
                height={1280}
                loading="lazy"
                className="mt-[-18%] aspect-[4/5] w-[56%] border-8 border-background object-cover md:ml-[-16%]"
              />
            </div>
            <div className="md:col-span-5 md:col-start-8 md:pt-24">
              <h2 className="font-serif text-[clamp(2rem,4vw,3.25rem)] leading-tight">
                <em>The Hand-Forging Process</em>
              </h2>
              <div className="mt-8 space-y-5 text-[14px] leading-7 text-muted-foreground">
                <p>
                  Each Noorism piece begins as a considered arrangement of pearls, letter beads and
                  tiny keepsakes, brought to life through quiet repetition and the rhythm of the hand.
                </p>
                <div className="border-l border-border pl-6">
                  <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-foreground">
                    Sustainable Sourcing
                  </p>
                  <p className="mt-2">
                    We consciously use durable findings, small-batch beads and carefully selected
                    accents, traced from the origin to the final polish.
                  </p>
                </div>
                <p>
                  Our artisans spend focused hours on a single signature band, refining the surface
                  until it achieves the soft, tactile quietness Noorism is known for.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-20 text-center md:px-8 md:py-32">
          <p className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground">
            Exclusive Service
          </p>
          <h2 className="mt-5 font-serif text-[clamp(2.5rem,6vw,4.5rem)] leading-tight">
            Private Consultations
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[14px] leading-7 text-muted-foreground">
            Experience the atelier. Book a bespoke session to discuss custom commissions or view our
            permanent collection in person.
          </p>

          <form onSubmit={requestAppointment} className="mt-12 grid gap-x-10 gap-y-8 text-left sm:grid-cols-2">
            <label className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Full Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Alexandra Sterling"
                className="mt-3 w-full border-0 border-b border-border bg-transparent px-0 py-3 text-sm normal-case tracking-normal text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-foreground"
              />
            </label>
            <label className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Email Address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="alexandra@example.com"
                className="mt-3 w-full border-0 border-b border-border bg-transparent px-0 py-3 text-sm normal-case tracking-normal text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-foreground"
              />
            </label>
            <label className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Service Interest
              <select
                value={service}
                onChange={(event) => setService(event.target.value)}
                className="mt-3 w-full border-0 border-b border-border bg-transparent px-0 py-3 text-sm normal-case tracking-normal text-foreground outline-none focus:border-foreground"
              >
                <option>Bespoke Commission</option>
                <option>Collection Viewing</option>
                <option>Gift Consultation</option>
              </select>
            </label>
            <label className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Preferred Month
              <input
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                placeholder="September 2026"
                className="mt-3 w-full border-0 border-b border-border bg-transparent px-0 py-3 text-sm normal-case tracking-normal text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-foreground"
              />
            </label>
            <label className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:col-span-2">
              Narrative &amp; Vision
              <textarea
                value={vision}
                onChange={(event) => setVision(event.target.value)}
                placeholder="Tell us about the piece you wish to create..."
                rows={3}
                className="mt-3 w-full resize-none border-0 border-b border-border bg-transparent px-0 py-3 text-sm normal-case tracking-normal text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-foreground"
              />
            </label>
            <div className="sm:col-span-2 sm:mx-auto sm:w-72">
              <Button type="submit" className="w-full rounded-none">
                Request Appointment
              </Button>
              <p className="mt-4 text-center text-[10px] text-muted-foreground">
                A representative will reach out within 48 hours.
              </p>
            </div>
          </form>
        </section>

        <section className="bg-foreground px-5 py-20 text-center text-background md:py-28">
          <p className="text-[10px] uppercase tracking-[0.45em] text-background/60">The Journal</p>
          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-[clamp(1.6rem,4vw,2.5rem)] leading-tight">
            Essays on materiality, art, and the permanence of personal objects.
          </h2>
          <div className="mx-auto mt-10 flex max-w-md items-center justify-center gap-5 border-b border-background/35 pb-3 text-left">
            <span className="flex-1 text-[12px] text-background/55">Email Address</span>
            <span className="text-[10px] uppercase tracking-[0.35em] text-background">Subscribe</span>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}