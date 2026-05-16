import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { OrderDialog } from "@/components/OrderDialog";
import { type Product } from "@/lib/store-config";
import { supabase, supabaseEnabled, type ProductRow } from "@/lib/supabase";
import {
  Minus,
  Plus,
  Trash2,
  Loader2,
  Heart,
  HandMetal,
  Clock,
  ShieldCheck,
  MessageCircle,
  Instagram,
} from "lucide-react";
import { CustomisationDialog, type Customisation } from "@/components/CustomisationDialog";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Noorism Wrist Charms" },
      {
        name: "description",
        content: "Browse handmade wrist charms — pearls, pastels and personalised letters.",
      },
      { property: "og:title", content: "Shop — Noorism Wrist Charms" },
      {
        property: "og:description",
        content: "Hand-strung in small batches. Personalisation available.",
      },
    ],
  }),
  component: ShopPage,
});

type CartItem = { product: Product; qty: number; customisation?: Customisation };
type FilterType = "all" | "personalisable" | "signature";

function SectionLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-4 text-[10px] uppercase tracking-[0.45em] text-muted-foreground">
      <span>{n}</span>
      <span className="h-px w-8 bg-border" />
      {children}
    </p>
  );
}

async function withTimeout<T>(promise: PromiseLike<T>, ms = 8000): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Product request timed out")), ms);
  });
  return Promise.race([Promise.resolve(promise), timeout]).finally(() => clearTimeout(timeoutId));
}

const PASTEL_SWATCHES = [
  "#f9c5c5",
  "#f7d9b5",
  "#f9f0a4",
  "#b9eabd",
  "#b5d9f7",
  "#d9b5f7",
  "#f7b5d9",
];

function PersonalisationRow({ customizable }: { customizable?: boolean }) {
  if (!customizable) {
    return (
      <span className="inline-block border border-border/60 px-2 py-0.5 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
        Signature piece
      </span>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      {PASTEL_SWATCHES.map((c) => (
        <span
          key={c}
          className="inline-block h-3 w-3 rounded-full border border-border/40"
          style={{ backgroundColor: c }}
        />
      ))}
      <span className="ml-1 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
        +more
      </span>
    </div>
  );
}

const TESTIMONIALS = [
  { quote: "The name charm arrived beautifully — exactly what I wanted.", name: "Aisha R." },
  {
    quote: "Ordered a custom candy band for my friend's birthday. She loved it!",
    name: "Mehak S.",
  },
  { quote: "So delicate and pretty. Will definitely be ordering again.", name: "Zara T." },
];

const IG_TILES = [
  { bg: "#f9e4e4" },
  { bg: "#f0e6d3" },
  { bg: "#d9eaf5" },
  { bg: "#e8f5e2" },
  { bg: "#f7e8f5" },
  { bg: "#fdf5e0" },
];

function ShopPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderOpen, setOrderOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [customiseTarget, setCustomiseTarget] = useState<Product | null>(null);
  const [customiseOpen, setCustomiseOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabaseEnabled) {
        if (!cancelled) {
          setProducts([]);
          setLoading(false);
        }
        return;
      }
      try {
        const { data, error } = await withTimeout(
          supabase
            .from("products")
            .select("id,name,price,description,image_url,customizable,active,sort_order,created_at")
            .eq("active", true)
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: true }),
        );
        if (cancelled) return;
        if (!error && data) {
          setProducts(
            (data as ProductRow[]).map((r) => ({
              id: r.id,
              name: r.name,
              price: r.price,
              description: r.description,
              image: r.image_url,
              customizable: r.customizable,
            })),
          );
        }
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    if (filter === "personalisable") return products.filter((p) => p.customizable);
    if (filter === "signature") return products.filter((p) => !p.customizable);
    return products;
  }, [products, filter]);

  const totalQty = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const total = useMemo(() => cart.reduce((s, i) => s + i.product.price * i.qty, 0), [cart]);

  const handleAddToCart = (p: Product) => {
    if (p.customizable) {
      setCustomiseTarget(p);
      setCustomiseOpen(true);
    } else {
      addToCart(p, undefined);
    }
  };

  const addToCart = (p: Product, customisation?: Customisation) => {
    setCart((c) => {
      const ex = c.find((i) => i.product.id === p.id);
      if (ex && !customisation)
        return c.map((i) => (i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { product: p, qty: 1, customisation }];
    });
  };

  const setQty = (id: string, qty: number) =>
    setCart((c) =>
      qty <= 0
        ? c.filter((i) => i.product.id !== id)
        : c.map((i) => (i.product.id === id ? { ...i, qty } : i)),
    );

  const toggleWishlist = (id: string) =>
    setWishlist((w) => {
      const next = new Set(w);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "personalisable", label: "Personalisable" },
    { key: "signature", label: "Signature" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader cartCount={totalQty} />

      {/* Collection header + filter + grid */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="mb-10 grid grid-cols-1 gap-8 md:mb-14 md:grid-cols-12">
          <div className="md:col-span-6">
            <SectionLabel n="01">The Collection</SectionLabel>
            <h1 className="mt-6 font-serif text-[clamp(2.25rem,5vw,3.5rem)] leading-tight">
              Charms, made by hand.
            </h1>
          </div>
          <p className="text-[15px] leading-relaxed text-muted-foreground md:col-span-5 md:col-start-8 md:pt-2">
            Each piece is made to order in our atelier. Customisations — names, colours, sizing —
            are welcomed at checkout.
          </p>
        </div>

        {/* Filter pills */}
        <div className="mb-10 flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={[
                "border px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] transition-colors",
                filter === f.key
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground",
              ].join(" ")}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted-foreground">
            No pieces found. Please check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((p, idx) => (
              <article key={p.id} className="group">
                {/* Image + wishlist */}
                <div className="relative overflow-hidden">
                  <Link to="/shop/$productId" params={{ productId: p.id }} className="block">
                    <img
                      src={p.image}
                      alt={p.name}
                      width={900}
                      height={900}
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                    />
                  </Link>
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center bg-background/80 backdrop-blur-sm transition hover:bg-background"
                    aria-label="Toggle wishlist"
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors ${
                        wishlist.has(p.id)
                          ? "fill-foreground text-foreground"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                </div>

                <Link to="/shop/$productId" params={{ productId: p.id }} className="block">
                  <div className="mt-5 flex items-baseline justify-between gap-3">
                    <h2 className="font-serif text-xl">
                      <span className="mr-2 text-[10px] tracking-[0.3em] text-muted-foreground">
                        N°{String(idx + 1).padStart(2, "0")}
                      </span>
                      {p.name}
                    </h2>
                    <span className="text-sm tabular-nums text-muted-foreground">₹{p.price}</span>
                  </div>
                  <div className="mt-2">
                    <PersonalisationRow customizable={p.customizable} />
                  </div>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                    Made to order · dispatches in 3–5 days
                  </p>
                </Link>

                <button
                  onClick={() => handleAddToCart(p)}
                  className="mt-4 text-[11px] uppercase tracking-[0.3em] text-foreground underline-offset-[6px] transition hover:underline"
                >
                  Add to cart +
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
          <SectionLabel n="02">Happy customers</SectionLabel>
          <h2 className="mt-6 font-serif text-[clamp(1.75rem,4vw,2.75rem)] leading-tight">
            What our customers say.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="border border-border/60 bg-background p-7">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <svg key={n} className="h-3.5 w-3.5 fill-foreground" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                  "{t.quote}"
                </p>
                <p className="mt-5 text-[11px] uppercase tracking-[0.35em] text-foreground">
                  — {t.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cart */}
      <section id="cart" className="border-t border-border/60 scroll-mt-24">
        <div className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
          <SectionLabel n="03">Your Selection</SectionLabel>
          <h2 className="mt-6 font-serif text-[clamp(2rem,5vw,3rem)]">Cart.</h2>

          {cart.length === 0 ? (
            <p className="mt-12 text-[15px] text-muted-foreground">
              Your cart is empty.{" "}
              <Link to="/shop" className="underline-offset-4 hover:underline">
                Add a charm
              </Link>{" "}
              to begin.
            </p>
          ) : (
            <ul className="mt-12 divide-y divide-border/60 border-y border-border/60">
              {cart.map((i) => (
                <li key={i.product.id} className="flex items-center gap-4 py-6 md:gap-6">
                  <img
                    src={i.product.image}
                    alt={i.product.name}
                    width={88}
                    height={88}
                    className="h-20 w-16 object-cover md:h-22 md:w-20"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-lg truncate">{i.product.name}</h3>
                    <p className="mt-1 text-sm tabular-nums text-muted-foreground">
                      ₹{i.product.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <button
                      onClick={() => setQty(i.product.id, i.qty - 1)}
                      className="p-2 hover:text-foreground"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm tabular-nums text-foreground">
                      {i.qty}
                    </span>
                    <button
                      onClick={() => setQty(i.product.id, i.qty + 1)}
                      className="p-2 hover:text-foreground"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => setQty(i.product.id, 0)}
                    className="p-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-10 flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground">
              Total
            </span>
            <span className="font-serif text-3xl tabular-nums">₹{total}</span>
          </div>
          <Button
            onClick={() => setOrderOpen(true)}
            disabled={cart.length === 0}
            size="lg"
            className="mt-8 w-full rounded-none"
          >
            Place order
          </Button>
          <p className="mt-4 text-center text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
            Sent directly to the atelier · Reply within 24 hours
          </p>
        </div>
      </section>

      {/* Trust bar */}
      <div className="border-y border-border/60 bg-muted/20">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-5 py-6 md:gap-16 md:px-8">
          {[
            { icon: <HandMetal className="h-4 w-4" />, label: "Handmade in small batches" },
            { icon: <Clock className="h-4 w-4" />, label: "Reply within 24 hours" },
            { icon: <ShieldCheck className="h-4 w-4" />, label: "Secure checkout" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2.5 text-muted-foreground">
              {item.icon}
              <span className="text-[10px] uppercase tracking-[0.35em]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Instagram section */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
          <SectionLabel n="04">Instagram</SectionLabel>
          <h2 className="mt-6 font-serif text-[clamp(1.75rem,4vw,2.75rem)] leading-tight">
            As seen on Instagram.
          </h2>
          <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-6">
            {IG_TILES.map((tile, i) => (
              <a
                key={i}
                href="https://instagram.com/shopnoorism"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden transition"
                style={{ backgroundColor: tile.bg }}
              >
                <div className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/8" />
              </a>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a
              href="https://instagram.com/shopnoorism"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-border px-6 py-3 text-[11px] uppercase tracking-[0.35em] text-foreground transition hover:bg-foreground hover:text-background"
            >
              <Instagram className="h-3.5 w-3.5" />
              Follow @shopnoorism
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
      <OrderDialog open={orderOpen} onOpenChange={setOrderOpen} items={cart} />

      <CustomisationDialog
        open={customiseOpen}
        onOpenChange={setCustomiseOpen}
        product={customiseTarget}
        onConfirm={(customisation) => {
          if (customiseTarget) addToCart(customiseTarget, customisation);
        }}
      />

      {/* Floating WhatsApp / Chat button */}
      {/* <a
        href="https://wa.me/91XXXXXXXXXX?text=Hi!%20I%20have%20a%20question%20about%20a%20Noorism%20charm."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 border border-border bg-background px-4 py-2.5 shadow-sm text-[11px] uppercase tracking-[0.25em] text-foreground transition hover:bg-foreground hover:text-background"
        aria-label="Chat with us on WhatsApp"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        Chat with us
      </a> */}
    </div>
  );
}
