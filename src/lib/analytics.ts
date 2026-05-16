import { supabase, supabaseEnabled } from "@/lib/supabase";

export type EventType =
  | "page_view"
  | "product_view"
  | "email_click"
  | "order_placed"
  | "consultation_request"
  | "review_submitted";

export async function trackEvent(type: EventType, metadata: Record<string, unknown> = {}) {
  if (!supabaseEnabled) return;
  try {
    await supabase.from("events").insert({ type, metadata });
  } catch {
    /* swallow */
  }
}
