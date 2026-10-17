# Voice Booking Assistant site

A small site about one n8n workflow. The case study page walks the workflow in execution order using the node names from the export. The dashboard reads read only views over the Supabase tables with the anon key. The demo page plays one real recorded call with its transcript.

- `/` case study with the nine-step flow, plus a scroll-driven retelling of one real call
- `/demo` recorded call, parsed fields, transcript
- `/dashboard` read only views over leads, call_logs, appointments, errors
- `docs/claims-to-evidence.md` every factual sentence mapped to its source
- `docs/design-notes.md` the visual direction that was followed
- `supabase/views.sql` the read only views (proposal, see below)

Run locally:

```
npm install
cp .env.example .env.local   # or use .env, both are read by Next
npm run build
npm run start
npm run test:e2e             # needs the server running or PLAYWRIGHT_BASE_URL set
npm run test:security        # needs Supabase env vars and the views applied
```

The scroll-replay section has its own gated suite (also runs the page tests' skip and reduced-motion checks inside it):

```
npm run start -- -p 3111
REPLAY_RUN=1 PLAYWRIGHT_BASE_URL=http://localhost:3111 npx playwright test tests/replay-frames.spec.ts
```

It regenerates `verification/replay/**` contact-sheet frames for desktop and phone, tests the skip control, tests the reduced-motion static ledger, and samples frame timing while scrubbing. `node scripts/perf-replay.mjs` captures the same numbers plus a screenshot in one run. The replay data itself is generated: `node scripts/gen-replay-data.mjs` reads `docs/retell-payload.json` and writes `lib/replay-data.ts`, masking the caller phone number (`92••••••20`) and cutting spoken digit runs so raw digits never reach the page.

## Versions installed

| Package | Version |
| --- | --- |
| next | 16.4.2 |
| react | 19.3.0 |
| react-dom | 19.3.0 |
| tailwindcss | 4.3.3 (via @tailwindcss/turbopack ^4) |
| gsap | ^3.15.0 (with @gsap/react ^2.1.2) |
| lenis | ^1.3.27 |
| motion | ^14.3.0 |
| @supabase/supabase-js | 2.118.0 |
| @supabase/ssr | 0.12.7 |
| @playwright/test | 1.64.1 |
| typescript | 5.9.3 |
| eslint | 9.39.5 |

## Landing replay section

The landing ends with a pinned, scroll-scrubbed retelling of the one recorded call, built with GSAP ScrollTrigger and Lenis smooth scrolling (motion stays Framer for every other section). It follows a chat reference rather than the node pipeline: a centered statement reveals (`One phone call…`), then all seven transcript snippets appear as floating chat bubbles at their real timestamps, a summary card condenses the booking, and a Google Calendar card closes the story: the day chip (Sat 5), the event block that pulses as a dashed slot then fills blue (`plumbing consultation - Rick`, `2:00 PM – 2:30 PM · San Jose, Batangas`), a green `added to Google Calendar` confirmation, and a real `Add to Google Calendar` template link prefilled with the same event data the workflow's `Create Calendar Event` node used. No raw caller digits appear anywhere; everything on the section traces to the recorded call in `docs/retell-payload.json`. `prefers-reduced-motion` swaps the pinned story for a static version of the same section, and a skip control jumps past the pin.

## What is verified

- The workflow description was read node by node from `docs/03-ai-voice-booking-assistant.json`. All node names, tables, fields and branch behavior on the site come from that file. See `docs/claims-to-evidence.md` for the per sentence mapping.
- The payload findings were checked field by field against `docs/retell-payload.json`: `from_number` is empty so the parser falls back to `custom_analysis_data.phone` with the leading zero dropped; `requested_slot` in the payload is the bare number 2026 and the node ignores it and derives the slot from the transcript words; `existing_event_id` is 0, parsed to null, so `Has Existing Event?` takes the create branch. The outcome is correct for this call.
- The Supabase schema export (`docs/supabase-columns.json`, `docs/supabase-constraints.json`) matches the dashboard queries column for column. The constraints contain no rule against two appointments at the same `scheduled_at`, and `leads.phone` is not unique, so the schema alone does not stop duplicate leads for one caller. The indexes file still needs a clean re-export (see gaps).
- The views in `supabase/views.sql` were applied to the live project on 2026-10-17. Probe results with the anon key: every `GET /rest/v1/<base table>` returns 401, every `POST` returns 401, `PATCH` and `DELETE` return 400, so no write succeeds and no base row is readable through the anon key. All four views return 200 and real rows; `phone_masked` values arrive masked, for example `92•••••20`.
- `npm run build` and `npm run lint` pass.
- Playwright page tests pass (8 of 8): transcript renders, recording player carries the payload URL, the raw caller digits never appear on `/` or `/demo` or `/dashboard`, both pages fit a 375 px viewport.
- Contrast: lime `#B9F73E` on `#060606` is about 13:1, body text `#F1F1EA` about 18:1, muted `#A8A8A0` about 9:1.

## What is assumed

- The indexes export (`docs/supabase-indexes.json`) was accidentally pasted as a duplicate of the constraints export. Until it is re-exported with the `pg_indexes` query, the site cannot state that no unique index adds a one-appointment-per-slot rule; it only states the constraints finding.
- "The workflow works" is your statement. No execution history was shared, so no claim on the site cites executions. The real rows visible through the views show the workflow produced data, but they say nothing about reliability.
- The recording URL in the payload is treated as possibly expired. The player is rendered but the demo page keeps working from the transcript if it fails.

## What I still need to test myself

- Call the Retell demo number from a phone that is not mine and watch the webhook fire.
- Watch the Twilio SMS arrive on a real handset once a trial or paid number exists. Until then the label stays "Built, not run live."
- A HubSpot contact appearing after a real run, plus a deliberate HubSpot failure to observe that the flow indeed stops before SMS with no error output on that node.
- A reschedule call with a real `existing_event_id` to prove `Has Existing Event?` takes the update branch. The one payload in hand only proves the create branch.
- A second live call to see whether the two minute hold stops a genuinely identical second booking, and whether that matters given the schema findings.
- Lighthouse on the deployed Vercel URL, reported as the numbers land. Nothing is deployed yet, so no scores exist. Run `npx lighthouse <deployed url> --output json` or PageSpeed Insights and record the four scores in this file.

## Known gaps

- `docs/supabase-indexes.json` is a duplicate of the constraints file and must be re-exported with:

  ```sql
  select json_agg(t) from (
    select tablename, indexname, indexdef
    from pg_indexes
    where schemaname = 'public'
    order by tablename, indexname
  ) t;
  ```
- The sticky note in the workflow says six nodes route errors. The JSON shows five. The site says five and explains the discrepancy in step 08 and on `docs/claims-to-evidence.md`.
