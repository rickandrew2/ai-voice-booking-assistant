import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { flowSteps, labelNotes } from "@/lib/flow";
import { call, dialogue } from "@/lib/call";

export const metadata: Metadata = {
  title: "How it works",
};

const parsedRows: { field: string; from: string; what: string }[] = [
  {
    field: "phone",
    from: "from_number is an empty string in the payload",
    what: "The node falls back to custom_analysis_data.phone, a number that reads 92\u2022\u2022\u2022\u2022\u202220 with the leading zero dropped. The caller said 0921700820 out loud, which is masked here.",
  },
  {
    field: "requested_slot",
    from: "custom_analysis_data.requested_slot is 2026, a bare number",
    what: "The node never reads that field. It builds the slot from the transcript words. This call said tomorrow and 2 pm, so the slot becomes the next day, 2:00 PM Manila.",
  },
  {
    field: "existing_event_id",
    from: "custom_analysis_data.existing_event_id is 0",
    what: "The parser turns 0 into null. Has Existing Event? compares against an empty string, so null takes the create path and Create Calendar Event runs. The outcome is correct, but it rests on 0 being falsy.",
  },
  {
    field: "intent",
    from: "custom_analysis_data.intent is book",
    what: "Branch on Intent sends this call down the booking path.",
  },
];

const pipeline = [
  "Retell Call Webhook",
  "Parse Retell Payload",
  "Check Existing Lead",
  "Lead Exists?",
  "Update Lead or Create Lead",
  "Insert Call Log",
  "Branch on Intent",
  "Check Availability",
  "Create Booking Hold",
  "Has Existing Event?",
  "Create Calendar Event",
  "Confirm Hold & Appointment",
  "Create Appointment",
  "Push to HubSpot",
  "Twilio SMS Confirmation",
];

export default function HowItWorks() {
  const nodeLabel = (name: string) =>
    labelNotes.find((n) => n.nodes.includes(name))?.label;
  const durationSeconds =
    call.duration_ms !== undefined ? Math.round(call.duration_ms / 1000) : null;
  const transcriptPreview = dialogue.slice(0, 4);

  return (
    <main>
      <section className="hero-band relative overflow-hidden">
        <div aria-hidden className="hero-glow pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-20 sm:px-8 sm:pt-24">
          <h1 className="max-w-3xl text-balance text-4xl font-semibold text-hero-fg sm:text-5xl">
            How it actually{" "}
            <span className="serif-accent text-[#9db4ff]">works</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-hero-muted">
            This page is the honest one. It follows the workflow export node by
            node, then checks the parser against a real payload. Every node
            name below is copied, not paraphrased.
          </p>
          <div className="mt-10">
            <div className="flex flex-wrap gap-2 font-mono text-xs sm:text-[13px]">
              {pipeline.map((name, i) => (
                <span
                  key={name}
                  className="node-run rounded-sm border border-white/20 bg-white/5 px-2 py-1 text-hero-muted"
                  style={{
                    animationDelay: `${(i * 12) / pipeline.length}s`,
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
            <p className="mt-3 font-mono text-xs text-hero-muted">
              The real execution order, from the workflow export. The demo call
              ran {durationSeconds} seconds, then this chain ran.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Flow */}
        <section className="pt-4">
          {flowSteps.map((step, i) => (
            <Reveal key={step.id}>
              <div
                id={step.id}
                className={`scroll-mt-24 border-b border-line py-10 ${i % 2 === 1 ? "sm:pl-10" : ""}`}
              >
                <div className="grid gap-4 sm:grid-cols-[4rem_1fr] sm:gap-8">
                  <div className="font-mono text-sm text-accent">
                    {step.number}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      {step.title}
                    </h2>
                    <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs sm:text-[13px]">
                      {step.nodes.map((name) => (
                        <span
                          key={name}
                          className={`rounded-sm border px-2 py-1 ${
                            nodeLabel(name)
                              ? "border-accent/50 bg-accent-soft text-accent"
                              : "border-line bg-surface text-muted"
                          }`}
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                    {step.nodes.some(nodeLabel) && (
                      <p className="mt-3 font-mono text-xs text-accent">
                        {step.nodes.map(nodeLabel).find(Boolean)}
                      </p>
                    )}
                    <div className="mt-4 space-y-3">
                      {step.prose.map((p, j) => (
                        <p
                          key={j}
                          className="max-w-[65ch] text-base leading-relaxed text-muted"
                        >
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </section>

        {/* Payload check */}
        <Reveal>
          <section className="border-b border-line py-12">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              What the parser reads, what the payload holds
            </h2>
            <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-muted">
              One real Retell payload was checked field by field against Parse
              Retell Payload. The call lasted {durationSeconds} seconds and
              ended with the caller hanging up. These are the findings.
            </p>
            <div className="mt-8 space-y-6">
              {parsedRows.map((row) => (
                <div
                  key={row.field}
                  className="grid gap-2 font-mono text-sm sm:grid-cols-[10rem_18rem_1fr] sm:gap-6"
                >
                  <div className="text-accent">{row.field}</div>
                  <div className="text-muted">{row.from}</div>
                  <div className="text-muted">{row.what}</div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Transcript excerpt */}
        <Reveal>
          <section className="border-b border-line py-12">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              The call, in its own words
            </h2>
            <div className="mt-8 max-w-2xl space-y-4 font-mono text-sm leading-relaxed">
              {transcriptPreview.map((line, i) => (
                <p key={i}>
                  <span
                    className={line.role === "agent" ? "text-accent" : "text-muted"}
                  >
                    {line.role === "agent" ? "Agent" : "Caller"}
                  </span>
                  <span className="text-fg"> {line.content}</span>
                </p>
              ))}
            </div>
            <Link
              href="/demo"
              className="mt-8 inline-block text-lg text-accent no-underline hover:underline"
            >
              Play the recording
            </Link>
          </section>
        </Reveal>

        {/* Data */}
        <Reveal>
          <section className="py-12">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              The data behind it
            </h2>
            <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-muted">
              The workflow writes to four Supabase tables: leads, call_logs,
              booking_holds and appointments. The dashboard reads read only
              views over them with the anon key. Phone numbers are masked.
              Counts come from queries at load time, not from marketing copy.
            </p>
            <Link
              href="/dashboard"
              className="mt-8 inline-block rounded-sm bg-accent px-5 py-2.5 font-mono text-sm text-white no-underline hover:brightness-110"
            >
              Open the dashboard
            </Link>
          </section>
        </Reveal>
      </div>
    </main>
  );
}
