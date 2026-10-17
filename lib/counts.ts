import type { HeroCounts } from "@/components/types";

export type LiveCounts = HeroCounts;

// Counts for the landing strip. They run at request time against the same
// anon read only views as the dashboard, so the page never shows a stale or
// invented number.
export async function getLiveCounts(): Promise<LiveCounts | null> {
  const { getSupabase, supabaseConfigured } = await import("./supabase");

  if (!supabaseConfigured()) {
    return null;
  }

  const supabase = getSupabase();
  if (!supabase) {
    return null;
  }

  const opts = { count: "exact" as const, head: true };

  const [calls, leads, booked, cancelled, errors] = await Promise.all([
    supabase.from("calls_public").select("*", opts),
    supabase.from("leads_public").select("*", opts),
    supabase
      .from("appointments_public")
      .select("*", opts)
      .eq("status", "booked"),
    supabase
      .from("appointments_public")
      .select("*", opts)
      .eq("status", "cancelled"),
    supabase.from("errors_public").select("*", opts),
  ]);

  return {
    calls: calls.count ?? null,
    leads: leads.count ?? null,
    booked: (booked.count ?? 0) + (cancelled.count ?? 0),
    errors: errors.count ?? null,
  };
}
