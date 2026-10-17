import fs from "node:fs";

const payload = JSON.parse(fs.readFileSync("lib/retell-call.json", "utf8"));
const lines = payload.transcript_object.map((l) => ({
  role: l.role === "agent" ? "agent" : "user",
  content: l.content.replace(/Marit/g, "Rick").trim(),
  words: (l.words || []).map((w) => ({
    w: w.word.replace(/Marit/g, "Rick"),
    s: Math.round(w.start * 1000) / 1000,
    e: Math.round(w.end * 1000) / 1000,
  })),
  start: Math.round((l.words?.[0]?.start ?? 0) * 1000) / 1000,
  end: Math.round((l.words?.[l.words.length - 1]?.end ?? 0) * 1000) / 1000,
}));

/* friendly snippet: masked numbers, cut before spelled-out digits */
const spokenDigit = /^(seven|eight|nine|one|two|three|four|five|six|zero|hundred|point)$/i;
function snippetFor(l) {
  let text = l.content.replace(/792-170-0820/g, "92••••••20");
  const words = text.split(/\s+/);
  let run = 0;
  let cutAt = -1;
  for (let i = 0; i < words.length; i++) {
    run = spokenDigit.test(words[i]) ? run + 1 : 0;
    if (run >= 3) {
      cutAt = i - run + 1;
      break;
    }
  }
  if (cutAt >= 0) return words.slice(0, cutAt).join(" ") + " …";
  if (text.length > 92) return text.slice(0, 88).replace(/\s+\S*$/, "") + " …";
  return text;
}
lines.forEach((l) => {
  l.snippet = snippetFor(l);
});

const norm = (s) => String(s).toLowerCase().replace(/[^\w]/g, "");

function findSpan(lineIndex, predicate) {
  const words = lines[lineIndex].words;
  for (let i = 0; i < words.length; i++) {
    const hit = predicate(i, words[i].w);
    if (hit)
      return { line: lineIndex, start: i, end: i + (hit.length ?? 1) - 1 };
  }
  throw new Error("span not found at line " + lineIndex);
}

const spans = {
  name: findSpan(1, (_i, w) => norm(w) === "rick"),
  service: findSpan(1, (i) => wordsMatch(lines[1].words, i, ["plumbing", "consultation"])),
  slotB: { line: 2, start: 0, end: 1 },
  phone: { line: 3, start: 0, end: 0 },
  urgency: { line: 5, start: 0, end: 0 },
};

function wordsMatch(words, i, seq) {
  for (let j = 0; j < seq.length; j++) {
    if (norm(words[i + j]?.w ?? "") !== norm(seq[j])) return null;
  }
  return seq;
}

spans.location = findSpan(3, (i) =>
  wordsMatch(lines[3].words, i, ["San", "Jose", "Batangas."]),
);

spans.phone.start = lines[3].words.findIndex((w) => norm(w.w) === "seven");
spans.phone.end = lines[3].words.reduce(
  (acc, w, i) => (norm(w.w) === "zero" ? i : acc),
  spans.phone.start,
);

const uStart = findSpan(5, (i) => norm(lines[5].words[i].w) === "low").start;
spans.urgency = { line: 5, start: uStart, end: uStart + 1 };

const mk = (key, icon, text, span, at) => ({
  key,
  icon,
  text,
  line: span.line,
  wordStart: span.start,
  wordEnd: span.end,
  at,
});

const entities = [
  mk("name", "user", "Rick", spans.name, lines[spans.name.line].words[spans.name.end].e),
  mk("service", "wrench", "plumbing consultation", spans.service, lines[spans.service.line].words[spans.service.end].e),
  mk("slot", "clock", "tomorrow at 2 PM", spans.slotB, lines[2].end),
  mk("location", "pin", "San Jose, Batangas", spans.location, lines[3].words[spans.location.end].e),
  mk("phone", "phone", "92••••••20", spans.phone, lines[3].words[spans.phone.end].e),
  mk("urgency", "gauge", "low urgency", spans.urgency, lines[5].words[spans.urgency.end].e),
].sort((a, b) => a.at - b.at);

const callEnd = Math.max(...lines.map((l) => l.end));

const startDate = new Date(payload.start_timestamp);
const manila = new Date(startDate.getTime() + 8 * 3600 * 1000);
// mirrors the real workflow: the Parse node adds one day when the caller
// said "tomorrow" (transcript.includes('tomorrow') branch, 2026-09-04 + 1)
const saidTomorrow = lines.some((l) => l.content.toLowerCase().includes("tomorrow"));
if (saidTomorrow) manila.setDate(manila.getDate() + 1);
const day = {
  iso: manila.toISOString().slice(0, 10),
  label: manila.toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
  }),
};

const out = `export type ReplayWord = { w: string; s: number; e: number };
export type ReplayLine = {
  role: "agent" | "user";
  content: string;
  snippet: string;
  words: ReplayWord[];
  start: number;
  end: number;
};
export type ReplayEntity = {
  key: string;
  icon: "user" | "wrench" | "clock" | "pin" | "phone" | "gauge";
  text: string;
  line: number;
  wordStart: number;
  wordEnd: number;
  at: number;
};

// Every timestamp here is copied from docs/retell-payload.json. Word times
// are real; the only script is a separator. Marit is remapped to Rick,
// which is the correct name the caller states in the call.
export const replayLines: ReplayLine[] = ${JSON.stringify(lines)};

export const replayEntities: ReplayEntity[] = ${JSON.stringify(entities)};

export const replayCallEnd = ${callEnd.toFixed(3)};

export const replayNodes: { name: string; dim?: boolean }[] = [
  { name: "Retell Call Webhook" },
  { name: "Parse Retell Payload" },
  { name: "Check Existing Lead" },
  { name: "Lead Exists?" },
  { name: "Update Lead" },
  { name: "Insert Call Log" },
  { name: "Branch on Intent" },
  { name: "Check Availability" },
  { name: "Create Booking Hold" },
  { name: "Has Existing Event?" },
  { name: "Create Calendar Event" },
  { name: "Confirm Hold & Appointment" },
  { name: "Create Appointment" },
  { name: "Push to HubSpot" },
  { name: "Twilio SMS Confirmation", dim: true },
];

export const replayDay = ${JSON.stringify(day)};

export const replaySlotLabel = "2:00 PM";

export const replayEventTitle = "plumbing consultation - Rick";
`;

fs.writeFileSync("lib/replay-data.ts", out);
console.log("written lib/replay-data.ts, callEnd", callEnd);
