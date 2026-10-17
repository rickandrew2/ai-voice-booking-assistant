# AI Voice Booking Assistant — case study site

A marketing/case-study site for one n8n workflow: an AI voice agent that answers phone calls and books appointments into Google Calendar automatically. The site is built so every sentence of copy on it can be traced back to real source material — a recorded demo call, the workflow export, and a live Supabase project.

## What you'll find

- **`/` — landing.** Pitch sections over the site's token colors, and a pinned, scroll-scrubbed retelling of the one recorded call: a centered statement ("One phone call…"), the seven transcript snippets appearing as floating chat bubbles at their real timestamps, a summary card, and a Google Calendar finale — the day chip, the event block that pulses as a dashed slot and fills blue (`plumbing consultation - Rick`, `2:00 PM – 2:30 PM · San Jose, Batangas`), a green "added to Google Calendar" confirmation, and a real prefilled "Add to Google Calendar" link. The section is built with GSAP ScrollTrigger + Lenis, stays honest ("a real call, retold"), skips cleanly past the pin, and swaps to a static version under `prefers-reduced-motion`.
- **`/how-it-works` —** the nine-step workflow walked in execution order, using the exact node names from the n8n export. Twilio SMS is labeled "built, not run live" because it never fired in the evidence at hand.
- **`/demo` —** the actual recorded call: audio player, parsed fields (intent, name, service, slot, phone, urgency), and the word-level transcript with timings.
- **`/dashboard` —** read-only views over the Supabase tables (leads, call_logs, appointments, errors) queried with the anon key only. Phone numbers arrive pre-masked in the views. If a query can't run, the strip simply doesn't render.

## How it stays honest

- Every factual sentence maps to its source in `docs/claims-to-evidence.md`, including the exhaustive route: the workflow export, `docs/supabase-columns.json`, `docs/supabase-constraints.json`, and the probe results (all base tables reject anon reads and writes; only the four views are public).
- The caller's phone never appears raw anywhere in the UI — the generated data (`lib/replay-data.ts`) masks it to `92••••••20` and cuts spoken digit sequences before they can surface.
- The real recorded outcome is preserved as story beats: the caller said "tomorrow" on Friday Sep 4, 2026, so the booking lands on Saturday Sep 5, 2026 at 2:00 PM Manila. The replay's calendar card and demo page both reflect that exact event.
- What cannot be proven is labeled as assumed rather than claimed (workflow reliability, Twilio delivery, second-call holds); the "what is verified / what is assumed" breakdown lives in `docs/design-notes.md` and `docs/claims-to-evidence.md`.

## Stack

Next.js 16 (App Router, cache components), React 19, Tailwind v4 on the token palette, Framer Motion (`motion`) for transitions, GA4-safe analytics none, GSAP + Lenis for the pinned replay, Supabase JS client (anon key, no session) for the dashboard, Playwright for gated verification suites (page tests, anon-key security probe, and the replay contact-sheet/skip/reduced-motion/perf suite whose artifacts live in `verification/replay/`).

## Local-only source material

`docs/retell-payload.json` (the real caller's raw payload) and `docs/03-ai-voice-booking-assistant.json` (the workflow export, which embeds runtime tokens) contain personal data and credentials, so they are deliberately excluded from this repository and kept local. Schema exports, probe results, and the generated, masked data file are safe and included.
