import type { Metadata } from "next";
import { connection } from "next/server";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Dashboard",
};

// This page always renders from live queries, so it is allowed to block.
export const instant = false;

// Queries run at request time against the live database, so counts can never
// drift from the copy about them. connection() opts this page out of static
// prerender under cacheComponents.

type Row = Record<string, unknown>;

function short(value: unknown, max = 90): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return s.length > max ? `${s.slice(0, max)}\u2026` : s;
}

function table(rows: Row[], columns: string[]) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse font-mono text-xs sm:text-sm">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c}
                className="border-b border-line py-2 pr-6 text-left font-normal text-muted"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c} className="border-b border-line/40 py-2 pr-6 align-top text-fg">
                  {short(r[c])}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="py-3 text-muted">
                No rows yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default async function Dashboard() {
  await connection();

  if (!supabaseConfigured()) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-6 max-w-[65ch] text-base leading-relaxed text-muted">
          The Supabase environment variables are not set yet, so there is
          nothing to query. Add NEXT_PUBLIC_SUPABASE_URL and
          NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local and redeploy. Only the
          anon key is used here, and only against read only views. The service
          role key is never present in client code.
        </p>
      </main>
    );
  }

  const supabase = getSupabase();

  if (!supabase) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-6 text-muted">Client initialisation failed.</p>
      </main>
    );
  }

  const [calls, leads, appts, errors] = await Promise.all([
    supabase.from("calls_public").select("*").limit(10),
    supabase.from("leads_public").select("*").limit(10),
    supabase.from("appointments_public").select("*").limit(10),
    supabase.from("errors_public").select("*").limit(10),
  ]);

  const sections: { title: string; hint: string; res: { data: Row[] | null; error: { message: string } | null }; columns: string[] }[] = [
    {
      title: "Recent calls",
      hint: "from calls_public, newest first, ten rows",
      res: calls,
      columns: ["created_at", "retell_call_id", "outcome", "duration_seconds"],
    },
    {
      title: "Leads",
      hint: "from leads_public, phone stored masked by the view",
      res: leads,
      columns: ["created_at", "name", "phone_masked", "service", "status"],
    },
    {
      title: "Appointments by status",
      hint: "from appointments_public, newest first",
      res: appts,
      columns: ["scheduled_at", "status", "calendar_event_id"],
    },
    {
      title: "Errors from the call log",
      hint: "from errors_public, rows whose outcome starts with error:",
      res: errors,
      columns: ["created_at", "retell_call_id", "outcome"],
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-5 pt-16 pb-20 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Dashboard
      </h1>
      <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-muted">
        Read only views over leads, call_logs, appointments and call log errors,
        queried with the anon key at page load. Phone numbers are masked in the
        views. No rows on this page are edited by hand.
      </p>

      <div className="mt-12 space-y-14">
        {sections.map((s) => (
          <section key={s.title}>
            <div className="flex flex-wrap items-baseline gap-x-5">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {s.title}
              </h2>
              <span className="font-mono text-xs text-muted">{s.hint}</span>
            </div>
            <div className="mt-4">
              {s.res.error ? (
                <p className="font-mono text-sm text-muted">
                  The view did not answer: {s.res.error.message}
                </p>
              ) : (
                table(s.res.data ?? [], s.columns)
              )}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
