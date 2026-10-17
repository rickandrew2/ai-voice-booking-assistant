import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { CallPlayer } from "@/components/call-player";
import { call, dialogue, analysis, parsed } from "@/lib/call";

export const metadata: Metadata = {
  title: "Demo",
};

function formatSlot(): string {
  // For this call the transcript contains the word tomorrow and 2 pm, so the
  // node derives the slot: one day after the call, 2:00 PM Manila time.
  const now = new Date();
  const manila = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  manila.setDate(manila.getDate() + 1);
  const day = manila.toLocaleDateString("en-US", {
    timeZone: "Asia/Manila",
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return `${day}, 2:00 PM Manila time`;
}

const meta: { label: string; value: string }[] = [
  { label: "call_status", value: call.call_status ?? "" },
  { label: "duration", value: `${parsed.duration_seconds} seconds` },
  { label: "disconnection_reason", value: call.disconnection_reason ?? "" },
  { label: "user_sentiment", value: call.call_analysis?.user_sentiment ?? "" },
  { label: "intent", value: parsed.intent },
  { label: "service", value: parsed.service },
  { label: "location", value: parsed.location },
  { label: "urgency", value: parsed.urgency },
  { label: "name", value: analysis.name ?? "" },
  {
    label: "existing_event_id",
    value:
      parsed.existing_event_id === 0 || parsed.existing_event_id === null
        ? "0 in payload, null after parse"
        : String(parsed.existing_event_id),
  },
  { label: "requested_slot", value: formatSlot() },
];

export default function Demo() {
  const audioSrc = call.recording_url ?? "";

  return (
    <main className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
      <section className="pt-16 pb-10">
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
          One real call,
          <span className="serif-accent text-accent"> played</span> for you.
        </h1>
        <p className="mt-6 max-w-[65ch] text-base leading-relaxed text-muted">
          A caller named Rick asked for a plumbing consultation tomorrow at 2
          PM in San Jose, Batangas. Press play: the equalizer animates while
          the recording runs. Phone numbers are masked. Two broken quote
          characters from encoding were restored, the rest is as the payload
          arrived.
        </p>
      </section>

      <Reveal>
        <section className="border-t border-line pt-10">
          <CallPlayer src={audioSrc} />
        </section>
      </Reveal>

      <Reveal>
        <section className="border-t border-line py-10">
          <h2 className="font-mono text-sm text-fg">
            Fields the workflow parsed
          </h2>
          <div className="mt-6 grid gap-x-8 gap-y-3 rounded-lg border border-line bg-surface p-6 font-mono text-sm sm:grid-cols-[12rem_1fr]">
            {meta.map((m) => (
              <div key={m.label} className="contents">
                <div className="text-muted">{m.label}</div>
                <div className="text-fg">{m.value}</div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="border-t border-line py-10">
          <h2 className="font-mono text-sm text-fg">Transcript</h2>
          <div className="mt-6 max-w-2xl space-y-4 font-mono text-sm leading-relaxed">
            {dialogue.map((line, i) => (
              <Reveal key={i} delay={Math.min(i * 0.05, 0.4)}>
                <p>
                  <span
                    className={line.role === "agent" ? "text-accent" : "text-muted"}
                  >
                    {line.role === "agent" ? "Agent" : "Caller"}
                  </span>
                  <span className="text-fg"> {line.content}</span>
                </p>
              </Reveal>
            ))}
            {dialogue.length === 0 && (
              <p className="text-muted">No transcript lines in the payload.</p>
            )}
          </div>
          <p className="mt-8 max-w-[65ch] text-sm leading-relaxed text-muted">
            After this call ends, Parse Retell Payload reads the transcript,
            finds tomorrow and 2 pm, and hands the booking path a slot. That is
            where the case study picks the flow back up.
          </p>
        </section>
      </Reveal>
    </main>
  );
}
