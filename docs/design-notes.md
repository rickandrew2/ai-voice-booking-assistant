# Design notes

## Visual direction

The site is a case study about a single phone call that becomes a database row, a calendar event, a CRM contact and an SMS. The design treats the page like the n8n canvas flattened into a column: the real execution order, node names shown exactly as they appear in the workflow, connected by one vertical rule. Black background and lime accent are fixed by the brief (they match rick-ai-automation-portfolio.vercel.app); everything distinctive happens in how the real material is staged. The one bold element is the transcript and node chain set in large mono chips; everything around it stays quiet, dark, and typographic.

Note: near-black with a single acid-green accent is listed as a common generated-design default. The brief pins it explicitly, so it stands. Distinctiveness comes from typography, from using real node names, real transcript lines and real payload fields as the visual content, and from NOT adding the usual kit (no rounded card grids, no icon rows, no stat strips, no decorative blobs, no ALL-CAPS eyebrow labels, no arrows appended to links, no middle-dot meta strings).

## Fonts

| Role | Face | Why |
| --- | --- | --- |
| Display + body | Bricolage Grotesque (variable, opsz axis) | A grotesque with a lot of personality at large optical sizes, still calm for body text. Not Inter, not Roboto, not a default. |
| Code, node names, payload fields, dialogue labels | JetBrains Mono | The subject matter is a JSON workflow; the vernacular of this project is node names and JSON keys. A mono face is used because the content is literally code and execution data, not as a decorative tell. |

Loaded with `next/font/google`, exported as CSS variables `--font-display` and `--font-mono`, wired into Tailwind v4 through `@theme inline`.

## Color tokens

| Token | Value | Contrast on bg |
| --- | --- | --- |
| `--color-bg` | `#060606` (near-black page) | base |
| `--color-surface` | `#101010` (raised areas) | ~1.1:1 vs bg, used with borders |
| `--color-line` | `#262626` (rules, borders) | decorative only |
| `--color-fg` | `#F1F1EA` (body text) | 17.9:1 on bg |
| `--color-muted` | `#A8A8A0` (secondary text) | 8.9:1 on bg |
| `--color-lime` | `#B9F73E` (accent) | 12.7:1 on bg |
| `--color-lime-dk` | `#060606` (text on lime fills) | 12.7:1 reversed |

Lime `#B9F73E` on `#060606` computes to roughly 12+:1, comfortably past WCAG AA for any size; muted `#A8A8A0` on `#060606` sits near 9:1, past AA for body text. Lime is never used for long paragraphs; it marks node chips, the active step, and links.

## Layout concept

Single column, left-aligned, max 72rem with the flow column capped near 68ch. The page reads top to bottom as the workflow actually executes:

```
| wordmark            dashboard  demo |
| "A call ends. A row, an event,      |
|  a contact and an SMS follow."      |
| [Retell Call Webhook] -> [Parse     |
|  Retell Payload] -> ... real chain  |
|-------------------------------------|
| 01 Call ends           [node chips] |
|   | short prose, real field values  |
| 02 Lead found or created            |
|   |                                 |
| ... real execution order ...        |
|-------------------------------------|
| real transcript excerpt, dialogue   |
|-------------------------------------|
| what runs live, what does not yet   |
|-------------------------------------|
| dashboard + demo                    |
```

Steps are numbered because the content genuinely is a sequence. No cards, no shadows, no border radius games; hierarchy comes from type size, the vertical rule, and node name chips.

## Motion

Motion (formerly Framer Motion, the `motion` npm package) drives three moments, and nothing else:

1. On load, the hero headline, intro and counts arrive once. The execution strip then lights one node at a time in the real order from the workflow export, on a 12 second loop, like an n8n run.
2. On scroll, sections and transcript lines slide up once, via a transform-only `Reveal`. No fading to invisible: content can never be hidden if animations are throttled.
3. On the demo page, an equalizer bar row animates only while the recording is actually playing, and pauses with the player. The visual reflects the true state of the audio, it does not pretend a call is live.

All three honor `prefers-reduced-motion`. No hover effects beyond color changes.

## Motion on the landing replay section (GSAP, scroll driven)

The "one real call" section on the landing is a separate motion system from the rest of the site:

- Library: GSAP 3.15 with ScrollTrigger, via `@gsap/react useGSAP`; Lenis 1.3 provides smooth scrolling, bridged through the GSAP ticker per the official pattern. The rest of the site still uses `motion` (formerly Framer Motion); the two never mix inside a component.
- Palette: the section reuses the site tokens directly (light `--bg` canvas, navy `--fg` text, blue `--accent` rail/highlights), so it reads as part of the site rather than a specialist panel.
- Structure: a friendly Telegram-style retelling. Big centered statement ("One phone call…") at the top, then the seven real transcript snippets as floating chat bubbles scattered around the canvas, a "got it" summary toast, and finally the calendar card that fills with the booked slot and gets a "Booked" sticker. No node names, no pipelines, no raw phone digits (the generator masks `792-170-0820` to `92••••••20` and cuts before spoken digit runs).
- One pinned stage of 86svh with breathing room below (5rem) instead of a full-viewport takeover. One scrubbed timeline of 3500px desktop, 2200px phone. Statement 0-8%, bubbles at their real timestamps 8-56%, call note + summary ~58-68%, calendar booked 70-100%.
- Every bubble appears at its real timestamp from `docs/retell-payload.json` (via `scripts/gen-replay-data.mjs` into `lib/replay-data.ts`). Typing dots precede agent lines. "Marit" is rendered as "Rick" in transcript and summary.
- The calendar shows the real booked day: the caller said "tomorrow", the call was Friday September 4, 2026, so the event lands on Saturday September 5 at 2:00 PM Manila. Twilio SMS stays "built, not run live" in the footer and ledger.
- Guardrails: `prefers-reduced-motion: reduce` swaps the pinned story for a static full-transcript ledger (same section, CSS-driven, no JS). Scrolling is never hijacked beyond the pin, transforms/opacity only, the timeline pauses when the section is offscreen, `ScrollTrigger.refresh()` runs after fonts are ready, and a skip control jumps past the whole pinned range.
- Idle drift on bubbles runs as a CSS keyframe on an inner wrapper so it can never fight the GSAP reveal transforms.

## Real numbers

The landing strip shows counts queried from the anon read only views at request time: calls logged, leads, appointments placed, errors caught. If the query cannot run, the strip simply does not render. No invented numbers anywhere.

## On the honesty labels

The three-card "Built, running, and not yet proven" display was removed from the landing at the owner's request so the page reads confidently for clients. In its place the single sentence the brief requires, "Twilio SMS is built but not run live", lives in the site footer on every page, small and plain. The fact is kept, not the display.

## Principles

1. The material is the decoration. If a section cannot be backed by a node name, a payload field or a table row, it does not exist on the page.
2. One accent, used sparingly. Lime points at the real system, never at filler.
3. Numbers only from queries. If a count cannot be produced from the data, the page says nothing.
