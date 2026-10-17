import Link from "next/link";
import { connection } from "next/server";
import { SiteHero } from "@/components/site-hero";
import { Reveal } from "@/components/reveal";
import { TechMarquee } from "@/components/tech-marquee";
import ScrollReplay from "@/components/replay/scroll-replay";

// Counts run at request time against the live read only views.
export const instant = false;

const bookingSteps = ["slot held", "calendar written", "CRM updated"];

const faqs = [
  {
    q: "What is this exactly?",
    a: "An AI booking assistant. Callers ring, a voice agent answers and handles the request, and a workflow behind it files the result: lead updated, slot booked, calendar and CRM written.",
  },
  {
    q: "What do I need to run it?",
    a: "Retell for the voice side, n8n for the workflow, Supabase for records, a Google Calendar, HubSpot and Twilio for the text confirmation. The how it works page lists every node.",
  },
  {
    q: "Can I try it right now?",
    a: "The demo page plays a real recorded call with its transcript, and the dashboard shows the records the system wrote. Live calls are not open to the public while the build is validated.",
  },
  {
    q: "Is caller data exposed?",
    a: "No. This site only ever reads masked views with a public read only key. Phone numbers show like 92••••••20, unmasked data never reaches the browser.",
  },
  {
    q: "What happens when something breaks?",
    a: "It gets logged. Every failure lands in an errors table with the step that failed, visible on the dashboard instead of lost in silence.",
  },
];

function CardFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col rounded-xl border p-6 transition-colors hover:border-accent/60 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
export default async function Home() {
  await connection();

  return (
    <main>
      <SiteHero />

      <TechMarquee />

      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Bento: what it handles daily */}
        <Reveal>
          <div className="py-16">
            <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              What the assistant handles{" "}
              <span className="serif-accent text-accent">daily</span>.
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <CardFrame className="sm:col-span-2 border-line bg-accent-soft">
                <h3 className="text-lg font-semibold tracking-tight">
                  Answers every call
                </h3>
                <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-muted">
                  Nights, weekends, while you are elbow-deep in a sink. The
                  caller gets answers in conversation, not a phone tree.
                </p>
                <div className="mt-auto flex h-12 items-end gap-2 pt-6" aria-hidden>
                  {[28, 44, 20, 36, 12].map((h, i) => (
                    <span
                      key={i}
                      className="wave-bar w-2.5 rounded-full bg-accent"
                      style={{ height: h, animationDelay: `${i * 0.18}s` }}
                    />
                  ))}
                  <span className="ml-3 self-end font-mono text-xs text-muted">
                    voice in, booking out
                  </span>
                </div>
              </CardFrame>

              <CardFrame className="border-line bg-surface">
                <h3 className="text-lg font-semibold tracking-tight">
                  Knows who is calling
                </h3>
                <div className="mt-4 flex" aria-hidden>
                  {["R", "M", "+"].map((c, i) => (
                    <span
                      key={i}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface bg-accent-soft text-xs font-semibold text-accent"
                      style={{ marginLeft: i === 0 ? 0 : "-0.75rem" }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  Returning callers keep one history with the business. New
                  callers get a record the moment they hang up.
                </p>
              </CardFrame>

              <CardFrame className="hero-band border-transparent">
                <h3 className="text-lg font-semibold tracking-tight text-hero-fg">
                  Books the appointment
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-hero-muted">
                  Nothing is promised before it exists.
                </p>
                <div className="mt-4 rounded-md border border-white/15 px-3 py-2 font-mono text-xs text-hero-fg w-max">
                  tomorrow · 2:00 PM
                </div>
                <ul className="mt-4 space-y-1.5 font-mono text-xs text-hero-muted">
                  {bookingSteps.map((s) => (
                    <li key={s} className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span> {s}
                    </li>
                  ))}
                </ul>
                <span
                  className="mt-auto pt-5 font-mono text-[11px] text-hero-muted"
                >
                  in that order, always
                </span>
              </CardFrame>

              <CardFrame className="border-line bg-surface">
                <h3 className="text-lg font-semibold tracking-tight">
                  CRM stays current
                </h3>
                <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs">
                  <span className="rounded-sm border border-line px-2 py-1">
                    call ends
                  </span>
                  <span aria-hidden className="text-muted">
                    →
                  </span>
                  <span className="rounded-sm bg-accent px-2 py-1 text-white">
                    HubSpot updated
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  The next person who talks to the caller already knows the
                  story.
                </p>
              </CardFrame>

              <CardFrame className="border-line bg-surface">
                <h3 className="text-lg font-semibold tracking-tight">
                  Failures get written down
                </h3>
                <p className="mt-2 rounded-md bg-fg p-3 font-mono text-xs leading-relaxed text-white/90">
                  error · step name · cause · logged
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  Quiet breakdowns are how automations lose trust. This one
                  refuses to go quiet.
                </p>
              </CardFrame>

              <CardFrame className="sm:col-span-2 border-line bg-surface">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-[42ch]">
                    <h3 className="text-lg font-semibold tracking-tight">
                      A confirmation by text, next up
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      After a booking, an SMS confirmation is drafted for the
                      caller. This step is built and next in line to run.
                    </p>
                  </div>
                  <div className="rounded-lg rounded-tl-sm bg-accent-soft px-3 py-2 text-sm text-fg">
                    You’re booked for tomorrow at 2:00 PM. Reply 1 to confirm.
                  </div>
                </div>
              </CardFrame>

              <CardFrame className="border-line bg-surface">
                <h3 className="text-lg font-semibold tracking-tight">
                  One screen with the truth
                </h3>
                <ul className="mt-4 space-y-2 font-mono text-xs">
                  {["calls", "appointments", "errors"].map((t) => (
                    <li
                      key={t}
                      className="flex items-center justify-between border-b border-line pb-1.5 text-muted last:border-0"
                    >
                      {t}
                      <span className="text-fg">live</span>
                    </li>
                  ))}
                </ul>
              </CardFrame>
            </div>
          </div>
        </Reveal>

        {/* From one real call */}
        <ScrollReplay />

        {/* FAQ */}
        <Reveal>
          <div className="py-16">
            <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Questions, answered{" "}
              <span className="serif-accent text-accent">plainly</span>.
            </h2>
            <div className="mt-10 max-w-3xl divide-y divide-line border-y border-line">
              {faqs.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium">
                    {f.q}
                    <span
                      aria-hidden
                      className="font-mono text-muted transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-muted">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Final CTA */}
        <Reveal>
          <div className="py-16 text-center">
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to hear it{" "}
              <span className="serif-accent text-accent">work</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
              One recorded call and one live dashboard tell the story better
              than this page can.
            </p>
            <Link
              href="/demo"
              className="mt-8 inline-block rounded-sm bg-accent px-6 py-3 font-mono text-sm text-white no-underline hover:brightness-110"
            >
              Play the recorded call
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
