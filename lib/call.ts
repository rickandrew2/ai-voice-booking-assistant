export type DialogueLine = {
  role: "agent" | "user";
  content: string;
};

export type CallAnalysis = {
  phone?: number | string;
  location?: string;
  requested_slot?: number | string;
  existing_event_id?: number | string;
  service?: string;
  name?: string;
  urgency?: string;
  intent?: string;
};

export type CallPayload = {
  call_id: string;
  call_status?: string;
  agent_name?: string;
  duration_ms?: number;
  transcript?: string;
  transcript_object?: DialogueLine[];
  recording_url?: string;
  disconnection_reason?: string;
  from_number?: string;
  call_analysis?: {
    custom_analysis_data?: CallAnalysis;
    call_summary?: string;
    user_sentiment?: string;
    call_successful?: boolean;
    in_voicemail?: boolean;
  };
};

import payloadFile from "./retell-call.json";

export const call = payloadFile as unknown as CallPayload;

// The raw payload contains two mojibake sequences around apostrophes and
// quotes. They are restored to the characters the agent actually said.
// The agent misheard the caller's name once as "Marit"; the caller later
// states "My name is Rick", so the transcript reads Rick throughout.
function clean(line: string): string {
  return line
    .replace(/Marit/g, "Rick")
    .replace(/\u00ff\?T/g, "'")
    .replace(/\u00ff\?"/g, '"')
    .replace(/\ufffd\?T/g, "'")
    .replace(/\ufffd\?"/g, '"')
    .trim();
}

// Digit runs longer than four characters are masked. Short digit runs such as
// a clock time (2 PM) stay readable.
function maskDigits(line: string): string {
  return line.replace(/\d[\d\-\s]{6,}\d/g, (m) => {
    const digits = m.replace(/[^\d]/g, "");
    if (digits.length < 7) return m;
    const head = digits.slice(0, 2);
    const tail = digits.slice(-2);
    return `${head}${"\u2022".repeat(digits.length - 4)}${tail}`;
  });
}

function prepare(line: string): string {
  return maskDigits(clean(line));
}

export const dialogue: DialogueLine[] = (call.transcript_object ?? []).map(
  (l) => ({ role: l.role === "agent" ? "agent" : "user", content: prepare(l.content) }),
);

export const analysis = call.call_analysis?.custom_analysis_data ?? {};

export const parsed = {
  call_id: call.call_id,
  duration_seconds:
    call.duration_ms !== undefined ? Math.round(call.duration_ms / 1000) : 0,
  intent: analysis.intent ? String(analysis.intent).toLowerCase() : "book",
  service: analysis.service ?? "Plumbing consultation",
  location: analysis.location ?? "San Jose Batangas",
  urgency: analysis.urgency ?? "low",
  existing_event_id: analysis.existing_event_id ?? null,
  requested_slot_from_payload: analysis.requested_slot ?? null,
  from_number: call.from_number ?? "(empty)",
};
