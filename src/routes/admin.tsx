import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase, supabaseEnabled, type EventRow, type ProductRow } from "@/lib/supabase";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  RefreshCw,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  Package,
  BarChart3,
  Pencil,
  Trash2,
  Plus,
  X,
  Upload,
  ImageIcon,
  Check,
  Mail,
  Eye as EyeIcon,
  ShoppingBag,
  Star,
  MessageSquare,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Noorism" }] }),
  component: AdminPage,
});

// ─── helpers ──────────────────────────────────────────────────
// (status colors removed — orders tab no longer used)

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

async function withTimeout<T>(promise: PromiseLike<T>, ms = 8000): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Request timed out")), ms);
  });
  return Promise.race([Promise.resolve(promise), timeout]).finally(() => clearTimeout(timeoutId));
}

// ─── Login ────────────────────────────────────────────────────
function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) setError(err.message);
    else onLogin();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Logo />
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Admin Portal
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
            />
          </Field>
          <Field label="Password">
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-border bg-background px-3 py-2 pr-10 text-sm outline-none focus:border-foreground"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>
          {error && <p className="rounded-sm bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full rounded-none">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign in
          </Button>
        </form>
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            ← Go to home
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Product Form (add / edit) ────────────────────────────────
type ProductFormData = {
  name: string;
  price: string;
  description: string;
  image_url: string;
  customizable: boolean;
  active: boolean;
};
const EMPTY_FORM: ProductFormData = {
  name: "",
  price: "",
  description: "",
  image_url: "",
  customizable: false,
  active: true,
};

function ProductForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: ProductRow | null;
  onSave: (data: ProductFormData, imageFile: File | null) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ProductFormData>(
    initial
      ? {
          name: initial.name,
          price: String(initial.price),
          description: initial.description,
          image_url: initial.image_url,
          customizable: initial.customizable,
          active: initial.active,
        }
      : EMPTY_FORM,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(initial?.image_url ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof ProductFormData, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.description) {
      setError("Name, price, and description are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(form, imageFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Image upload */}
      <div>
        <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Product Image
        </p>
        <div className="flex items-start gap-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="relative flex h-28 w-28 shrink-0 cursor-pointer items-center justify-center overflow-hidden border border-dashed border-border bg-muted/40 hover:bg-muted transition-colors"
          >
            {preview ? (
              <img src={preview} alt="preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <ImageIcon className="h-6 w-6" />
                <span className="text-[10px]">Upload</span>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
              <Upload className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex-1 space-y-2 text-xs text-muted-foreground">
            <p>Click the box to upload a photo from your device.</p>
            <p>JPG or PNG, max 5 MB recommended.</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] hover:bg-muted transition-colors"
            >
              <Upload className="h-3 w-3" /> Choose file
            </button>
            {imageFile && <p className="text-green-700">✓ {imageFile.name}</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Product name">
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            className="w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
          />
        </Field>
        <Field label="Price (₹)">
          <input
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            required
            className="w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          required
          className="w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground resize-none"
        />
      </Field>

      <div className="flex flex-wrap gap-6">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <div
            onClick={() => set("customizable", !form.customizable)}
            className={`h-4 w-4 border flex items-center justify-center transition-colors ${form.customizable ? "bg-foreground border-foreground" : "border-border"}`}
          >
            {form.customizable && <Check className="h-3 w-3 text-background" />}
          </div>
          Customisable (personalisation available)
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <div
            onClick={() => set("active", !form.active)}
            className={`h-4 w-4 border flex items-center justify-center transition-colors ${form.active ? "bg-foreground border-foreground" : "border-border"}`}
          >
            {form.active && <Check className="h-3 w-3 text-background" />}
          </div>
          Active (visible in shop)
        </label>
      </div>

      {error && <p className="rounded-sm bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving} className="rounded-none px-6">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initial ? "Save changes" : "Add product"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-none px-6">
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ─── Products tab ─────────────────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProductRow | null | "new">(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await withTimeout(
        supabase.from("products").select("*").order("sort_order").order("created_at"),
      );
      if (data) setProducts(data as ProductRow[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async (
    form: {
      name: string;
      price: string;
      description: string;
      image_url: string;
      customizable: boolean;
      active: boolean;
    },
    imageFile: File | null,
    existingProduct: ProductRow | null,
  ) => {
    let image_url = form.image_url;
    if (imageFile) image_url = await uploadImage(imageFile);

    const payload = {
      name: form.name,
      price: parseInt(form.price, 10),
      description: form.description,
      image_url,
      customizable: form.customizable,
      active: form.active,
      sort_order: existingProduct?.sort_order ?? products.length,
    };

    if (existingProduct) {
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", existingProduct.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) throw error;
    }
    await fetchProducts();
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await supabase.from("products").delete().eq("id", id);
    setProducts((p) => p.filter((x) => x.id !== id));
    setDeleting(null);
    setConfirmDelete(null);
  };

  if (editing !== null) {
    return (
      <div>
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-serif text-2xl">
            {editing === "new" ? "Add product" : "Edit product"}
          </h2>
          <button
            onClick={() => setEditing(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <ProductForm
          initial={editing === "new" ? null : editing}
          onSave={(form, file) => handleSave(form, file, editing === "new" ? null : editing)}
          onCancel={() => setEditing(null)}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl">Products</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} item{products.length !== 1 ? "s" : ""} in catalogue
          </p>
        </div>
        <Button onClick={() => setEditing("new")} className="gap-2 rounded-none">
          <Plus className="h-4 w-4" /> Add product
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center text-muted-foreground">
          <Package className="h-10 w-10 opacity-30" />
          <p className="text-sm">No products yet. Add your first one.</p>
          <Button
            onClick={() => setEditing("new")}
            variant="outline"
            className="gap-2 rounded-none"
          >
            <Plus className="h-4 w-4" /> Add product
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-4 border border-border/60 p-4">
              {/* Image */}
              <div className="h-16 w-16 shrink-0 overflow-hidden bg-muted">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-serif text-lg">{p.name}</span>
                  {!p.active && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                      Hidden
                    </span>
                  )}
                  {p.customizable && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] uppercase tracking-widest text-blue-700">
                      Personalisable
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{p.description}</p>
                <p className="mt-1 font-medium tabular-nums">₹{p.price.toLocaleString()}</p>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => setEditing(p)}
                  className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                {confirmDelete === p.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deleting === p.id}
                      className="flex items-center gap-1 bg-red-600 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-white hover:bg-red-700 transition-colors"
                    >
                      {deleting === p.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="border border-border px-2 py-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(p.id)}
                    className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:border-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Insights tab ─────────────────────────────────────────────
const EVENT_LABELS: Record<string, { label: string; icon: typeof Mail }> = {
  page_view: { label: "Page views", icon: EyeIcon },
  product_view: { label: "Product views", icon: ShoppingBag },
  email_click: { label: "Email clicks", icon: Mail },
  order_placed: { label: "Orders placed", icon: ShoppingBag },
  consultation_request: { label: "Consultation requests", icon: MessageSquare },
  review_submitted: { label: "Reviews left", icon: Star },
};

function InsightsTab() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await withTimeout(
        supabase
          .from("events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500),
      );
      if (data) setEvents(data as EventRow[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Aggregate counts by type
  const counts: Record<string, number> = {};
  for (const e of events) counts[e.type] = (counts[e.type] ?? 0) + 1;

  // Last 7 days activity
  const now = Date.now();
  const last7 = events.filter((e) => now - new Date(e.created_at).getTime() < 7 * 86400_000).length;
  const last24 = events.filter((e) => now - new Date(e.created_at).getTime() < 86400_000).length;

  // Top products by views
  const productViews: Record<string, number> = {};
  for (const e of events) {
    if (e.type === "product_view" && e.metadata && typeof e.metadata.product_id === "string") {
      const id = e.metadata.product_id;
      productViews[id] = (productViews[id] ?? 0) + 1;
    }
  }
  const topProducts = Object.entries(productViews)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl">Insights</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Activity across your shop — visitors, clicks and engagement.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchEvents} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : (
        <>
          {/* Top stats */}
          <div className="mb-10 grid grid-cols-2 gap-5 md:grid-cols-4">
            {[
              { label: "Total events", value: events.length },
              { label: "Last 24 hours", value: last24 },
              { label: "Last 7 days", value: last7 },
              { label: "Email clicks", value: counts.email_click ?? 0 },
            ].map((s) => (
              <div key={s.label} className="border border-border/60 p-5">
                <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                  {s.label}
                </p>
                <p className="mt-2 font-serif text-3xl">{s.value}</p>
              </div>
            ))}
          </div>

          {/* By event type */}
          <div className="mb-10">
            <h3 className="mb-4 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              Activity by type
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(EVENT_LABELS).map(([key, meta]) => {
                const Icon = meta.icon;
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between border border-border/60 px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{meta.label}</span>
                    </div>
                    <span className="font-serif text-2xl tabular-nums">{counts[key] ?? 0}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top viewed products */}
          {topProducts.length > 0 && (
            <div className="mb-10">
              <h3 className="mb-4 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                Most viewed products
              </h3>
              <ul className="divide-y divide-border/60 border border-border/60">
                {topProducts.map(([id, n]) => (
                  <li key={id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span className="truncate font-mono text-xs text-muted-foreground">{id}</span>
                    <span className="font-medium tabular-nums">{n} views</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recent events */}
          <div>
            <h3 className="mb-4 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              Recent activity
            </h3>
            {events.length === 0 ? (
              <p className="border border-border/60 px-5 py-10 text-center text-sm text-muted-foreground">
                No activity yet. Once visitors browse the shop, you'll see stats here.
              </p>
            ) : (
              <ul className="divide-y divide-border/60 border border-border/60">
                {events.slice(0, 30).map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] uppercase tracking-widest">
                        {EVENT_LABELS[e.type]?.label ?? e.type}
                      </span>
                      {e.metadata && Object.keys(e.metadata).length > 0 && (
                        <span className="truncate text-xs text-muted-foreground">
                          {Object.entries(e.metadata)
                            .map(([k, v]) => `${k}: ${String(v)}`)
                            .join(" · ")}
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground">
                      {new Date(e.created_at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Dashboard shell ──────────────────────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<"insights" | "products">("insights");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-6">
            <Logo />
            <nav className="flex gap-1">
              <button
                onClick={() => setTab("insights")}
                className={`flex items-center gap-2 px-3 py-1.5 text-[11px] uppercase tracking-[0.25em] transition-colors ${tab === "insights" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
              >
                <BarChart3 className="h-3.5 w-3.5" /> Insights
              </button>
              <button
                onClick={() => setTab("products")}
                className={`flex items-center gap-2 px-3 py-1.5 text-[11px] uppercase tracking-[0.25em] transition-colors ${tab === "products" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Package className="h-3.5 w-3.5" /> Products
              </button>
            </nav>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Sign out</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        {tab === "insights" ? <InsightsTab /> : <ProductsTab />}
      </main>
    </div>
  );
}

// ─── Page root: auth gate ─────────────────────────────────────
function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  if (!supabaseEnabled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <Logo />
          <h2 className="mt-8 font-serif text-2xl">Admin not configured</h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Supabase credentials are missing. Copy{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">.env.example</code> to{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code> and add your{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">VITE_SUPABASE_URL</code> and{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">VITE_SUPABASE_ANON_KEY</code>,
            then restart.
          </p>
          <a
            href="/"
            className="mt-6 inline-block text-[11px] uppercase tracking-[0.3em] text-muted-foreground underline-offset-4 hover:underline"
          >
            ← Back to site
          </a>
        </div>
      </div>
    );
  }

  useEffect(() => {
    withTimeout(supabase.auth.getSession(), 8000)
      .then(({ data: { session } }) => setAuthed(!!session))
      .catch(() => setAuthed(false));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => setAuthed(!!session));
    return () => subscription.unsubscribe();
  }, []);

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return authed ? (
    <Dashboard
      onLogout={async () => {
        await supabase.auth.signOut();
        setAuthed(false);
      }}
    />
  ) : (
    <LoginForm onLogin={() => setAuthed(true)} />
  );
}
