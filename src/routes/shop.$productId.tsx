import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { OrderDialog } from "@/components/OrderDialog";
import { PRODUCTS, type Product } from "@/lib/store-config";
import { supabase, supabaseEnabled, type ProductRow, type ReviewRow } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";
import { Star, Loader2, ArrowLeft, Check, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/shop/$productId")({
  head: ({ params }) => {
    const product = PRODUCTS.find((p) => p.id === params.productId);
    const baseUrl = "https://noorism.lovable.app";
    const pageUrl = `${baseUrl}/shop/${params.productId}`;
    const title = product ? `${product.name} — Noorism` : `${params.productId} — Noorism`;
    const description = product?.description ?? "Handmade customisable wrist charm by Noorism.";
    const imageUrl = product ? `${baseUrl}${product.image}` : `${baseUrl}/favicon.png`;

    const productSchema = product
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          image: [imageUrl],
          description: product.description,
          sku: product.id,
          brand: { "@type": "Brand", name: "Noorism" },
          offers: {
            "@type": "Offer",
            url: pageUrl,
            price: product.price.toFixed(2),
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: "Noorism" },
          },
        }
      : null;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: pageUrl },
        { property: "og:image", content: imageUrl },
      ],
      links: [{ rel: "canonical", href: pageUrl }],
      scripts: productSchema
        ? [{ type: "application/ld+json", children: JSON.stringify(productSchema) }]
        : [],
    };
  },
  component: ProductDetailPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-5 py-32 text-center">
        <h1 className="font-serif text-3xl">Piece not found</h1>
        <p className="mt-4 text-muted-foreground">This charm is no longer in the collection.</p>
        <Link to="/shop" className="mt-8 inline-block text-[11px] uppercase tracking-[0.3em] underline-offset-4 hover:underline">
          ← Back to the collection
        </Link>
      </div>
      <SiteFooter />
    </div>
  ),
});

// Per-product extra detail data
const PRODUCT_DETAILS: Record<string, {
  materials: string;
  care: string;
  sizes: { label: string; range: string }[];
}> = {
  "name-charm": {
    materials: "Glass seed beads, waxed cotton cord, brass lobster clasp",
    care: "Keep away from water · Store in pouch when not wearing",
    sizes: [
      { label: "S", range: "14–15 cm" },
      { label: "M", range: "15–17 cm" },
      { label: "L", range: "17–19 cm" },
    ],
  },
  "pearl-stack": {
    materials: "Freshwater pearls, gold-tone brass beads, waxed cord",
    care: "Keep away from water · Store in pouch when not wearing",
    sizes: [
      { label: "S", range: "14–15 cm" },
      { label: "M", range: "15–17 cm" },
      { label: "L", range: "17–19 cm" },
    ],
  },
  "onyx-pearl": {
    materials: "Matte black onyx, freshwater pearl, gold-tone brass clasp",
    care: "Keep away from water · Avoid perfume contact · Store in pouch",
    sizes: [
      { label: "S", range: "14–15 cm" },
      { label: "M", range: "15–17 cm" },
      { label: "L", range: "17–19 cm" },
    ],
  },
  "candy-band": {
    materials: "Polymer clay heishi beads, elastic cord",
    care: "Keep away from water · Handle gently to preserve shape",
    sizes: [
      { label: "S", range: "14–15 cm" },
      { label: "M", range: "15–17 cm" },
      { label: "L", range: "17–19 cm" },
    ],
  },
};

const DEFAULT_DETAILS = {
  materials: "High-quality beads, waxed cotton cord, brass clasp",
  care: "Keep away from water · Store in pouch when not wearing",
  sizes: [
    { label: "S", range: "14–15 cm" },
    { label: "M", range: "15–17 cm" },
    { label: "L", range: "17–19 cm" },
  ],
};

function Stars({ value, onChange, size = "sm" }: { value: number; onChange?: (v: number) => void; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          aria-label={`${n} stars`}
        >
          <Star className={`${cls} ${n <= value ? "fill-foreground text-foreground" : "text-muted-foreground/40"}`} />
        </button>
      ))}
    </div>
  );
}

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(() => PRODUCTS.find((p) => p.id === productId) ?? null);
  const [loading, setLoading] = useState(supabaseEnabled);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [orderOpen, setOrderOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("M");
  const [activeImg, setActiveImg] = useState(0);

  // Review form
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    trackEvent("product_view", { product_id: productId });
  }, [productId]);

  useEffect(() => {
    let cancelled = false;
    if (!supabaseEnabled) { setLoading(false); return; }
    (async () => {
      try {
        const { data } = await supabase.from("products").select("*").eq("id", productId).maybeSingle();
        if (cancelled) return;
        if (data) {
          const r = data as ProductRow;
          setProduct({ id: r.id, name: r.name, price: r.price, description: r.description, image: r.image_url, customizable: r.customizable });
        }
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [productId]);

  const loadReviews = async () => {
    if (!supabaseEnabled) { setReviewsLoading(false); return; }
    setReviewsLoading(true);
    try {
      const { data } = await supabase.from("reviews").select("*").eq("product_id", productId).order("created_at", { ascending: false });
      if (data) setReviews(data as ReviewRow[]);
    } finally { setReviewsLoading(false); }
  };

  useEffect(() => { loadReviews(); }, [productId]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  }, [reviews]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !comment || !supabaseEnabled) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({ product_id: productId, name: reviewerName, rating, comment });
      if (!error) {
        trackEvent("review_submitted", { product_id: productId, rating });
        setSubmitted(true);
        setReviewerName(""); setComment(""); setRating(5);
        await loadReviews();
        setTimeout(() => setSubmitted(false), 3000);
      }
    } finally { setSubmitting(false); }
  };

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (!product) throw notFound();

  const details = PRODUCT_DETAILS[productId] ?? DEFAULT_DETAILS;

  // Photo gallery: use same image 3 times as placeholder slots
  const gallery = [product.image, product.image, product.image];
  const galleryLabels = ["Flat lay", "Wrist shot", "Close-up"];

  const features = [
    product.customizable ? "Personalisation available (name, colour, size)" : "Signature one-of-a-kind piece",
    "Hand-strung in small batches",
    "Sustainably sourced beads & findings",
    "Made to order — dispatches in 3–5 days",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <Link to="/shop" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Back to collection
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Thumbnail rail */}
          <div className="hidden lg:col-span-1 lg:block">
            <div className="flex flex-col gap-3">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square w-full overflow-hidden border-2 transition ${activeImg === i ? "border-foreground" : "border-border/40 hover:border-border"}`}
                  aria-label={galleryLabels[i]}
                >
                  <img src={img} alt={galleryLabels[i]} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Main image */}
          <div className="lg:col-span-6">
            <div className="bg-muted/30">
              <img src={gallery[activeImg]} alt={product.name} className="aspect-square w-full object-contain" />
            </div>
            {/* Mobile thumbnail strip */}
            <div className="mt-3 flex gap-2 lg:hidden">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-14 w-14 overflow-hidden border-2 transition ${activeImg === i ? "border-foreground" : "border-border/40"}`}
                >
                  <img src={img} alt={galleryLabels[i]} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details panel */}
          <div className="lg:col-span-5">
            <p className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground">
              {product.customizable ? "Personalisable" : "Signature piece"}
            </p>
            <h1 className="mt-3 font-serif text-2xl leading-snug md:text-3xl">{product.name}</h1>

            <div className="mt-3 flex items-center gap-2 border-b border-border/60 pb-4">
              <span className="text-sm font-medium tabular-nums">{reviews.length === 0 ? "—" : avgRating.toFixed(1)}</span>
              <Stars value={Math.round(avgRating)} />
              <span className="text-sm text-muted-foreground">({reviews.length})</span>
            </div>

            <p className="mt-5 font-serif text-4xl tabular-nums">₹{product.price}</p>
            <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>

            <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">{product.description}</p>

            {/* Size selector */}
            <div className="mt-6">
              <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Size</p>
              <div className="mt-3 flex gap-2">
                {details.sizes.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setSelectedSize(s.label)}
                    className={[
                      "flex flex-col items-center border px-4 py-2 text-left transition",
                      selectedSize === s.label
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-foreground hover:border-foreground",
                    ].join(" ")}
                  >
                    <span className="text-sm font-medium">{s.label}</span>
                    <span className="text-[9px] text-inherit opacity-70">{s.range}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">
                Measure your wrist and choose the size closest to it.
              </p>
            </div>

            {/* Materials */}
            <div className="mt-6 border-t border-border/60 pt-5">
              <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Materials</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{details.materials}</p>
            </div>

            {/* Care */}
            <div className="mt-4 border-t border-border/60 pt-5">
              <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Care</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{details.care}</p>
            </div>

            {/* Features */}
            <div className="mt-6">
              <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Features</p>
              <ul className="mt-4 space-y-2 text-sm">
                {features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground/70" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Buy box */}
            <div className="mt-8 border border-border/80 p-5">
              <p className="text-lg font-medium">In stock</p>
              <p className="mt-1 text-xs text-muted-foreground">Made to order — dispatches in 3–5 days.</p>
              <Button onClick={() => setOrderOpen(true)} size="lg" className="mt-5 w-full rounded-none">
                Order this piece
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-24">
          <p className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground">Reviews & comments</p>
          <h2 className="mt-4 font-serif text-3xl">What people are saying</h2>

          {reviewsLoading ? (
            <p className="mt-10 text-sm text-muted-foreground">Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <p className="mt-10 text-sm text-muted-foreground">Be the first to leave a review.</p>
          ) : (
            <ul className="mt-10 divide-y divide-border/60">
              {reviews.map((r) => (
                <li key={r.id} className="py-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{r.name}</p>
                      <Stars value={r.rating} />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.comment}</p>
                </li>
              ))}
            </ul>
          )}

          {supabaseEnabled && (
            <form onSubmit={submitReview} className="mt-12 border-t border-border/60 pt-10">
              <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Leave a review</p>
              <div className="mt-6 grid gap-4">
                <Input placeholder="Your name" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} required />
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Rating:</span>
                  <Stars value={rating} onChange={setRating} size="lg" />
                </div>
                <Textarea placeholder="Share your thoughts on this piece…" value={comment} onChange={(e) => setComment(e.target.value)} rows={4} required />
                <Button type="submit" disabled={submitting} className="rounded-none">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {submitted ? "Thank you ✓" : "Post review"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>

      <SiteFooter />
      <OrderDialog open={orderOpen} onOpenChange={setOrderOpen} items={[{ product, qty: 1 }]} />

      {/* Floating WhatsApp / Chat button */}
      <a
        href="https://wa.me/91XXXXXXXXXX?text=Hi!%20I%20have%20a%20question%20about%20a%20Noorism%20charm."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 border border-border bg-background px-4 py-2.5 shadow-sm text-[11px] uppercase tracking-[0.25em] text-foreground transition hover:bg-foreground hover:text-background"
        aria-label="Chat with us on WhatsApp"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        Chat with us
      </a>
    </div>
  );
}
