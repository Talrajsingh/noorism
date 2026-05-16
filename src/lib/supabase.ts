import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

const isRealUrl = (v?: string) =>
  !!v && v.startsWith("https://") && !v.includes("your-project-id") && v.endsWith(".supabase.co");

const isRealKey = (v?: string) => !!v && v.length > 20 && !v.includes("your-anon-key");

export const supabaseEnabled = isRealUrl(SUPABASE_URL) && isRealKey(SUPABASE_ANON_KEY);

if (!supabaseEnabled) {
  console.warn("[Noorism] Supabase not configured — products will load from static config.");
}

export const supabase = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_ANON_KEY || "placeholder-anon-key-not-real",
);

export type OrderRow = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  items: Array<{ product_name: string; qty: number; price: number }>;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
};

export type ReviewRow = {
  id: string;
  created_at: string;
  product_id: string;
  name: string;
  rating: number;
  comment: string;
};

export type EventRow = {
  id: string;
  created_at: string;
  type: string;
  metadata: Record<string, unknown> | null;
};

export type ProductRow = {
  id: string;
  created_at: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  customizable: boolean;
  active: boolean;
  sort_order: number;
};
