# Claims to evidence

Every factual sentence on the site, mapped to what supports it. Rule: a sentence with no match gets removed. Sources are the workflow export `docs/03-ai-voice-booking-assistant.json` (node names, connections, node configs, sticky notes), the real payload `docs/retell-payload.json`, and live Supabase queries against read only views.

Note on one edit: the payload transcript contains two broken UTF-8 sequences around an apostrophe and an opening quote. The site renders them as the intended `'` and `"`. Everything else is verbatim.

| Claim (page, sentence) | Evidence |
| --- | --- |
| Home, hero: the caller talks to a Retell agent; after the call ends the workflow runs | Workflow: trigger node `Retell Call Webhook` (webhook POST, path `ai-voice-booking-assistant`); sticky note `note_trigger`: "Retell calls this webhook when a call ends" |
| Home, hero: finds or creates the lead | Nodes `Check Existing Lead`, `Lead Exists?`, `Update Lead`, `Create Lead`; sticky note `note_lead` |
| Home, hero: logs the call | Node `Insert Call Log`, table `call_logs`; sticky note `note_calllog` |
| Home, hero: routes the intent | Node `Branch on Intent` (switch on Extract Lead intent: book, reschedule, cancel, fallback) |
| Home, hero: books or cancels a Google Calendar event | Nodes `Create Calendar Event`, `Update Calendar Event`, `Cancel Calendar Event`, `Check Availability` (calendar rickandrew.macapagal@gmail.com); sticky note `note_cancel` |
| Home, hero: pushes a contact to HubSpot | Node `Push to HubSpot` (POST api.hubapi.com/crm/v3/objects/contacts, properties phone, firstname, lifecyclestage) |
| Home, hero: prepares an SMS | Node `Prepare Notification` builds `sms_message`; node `Twilio SMS Confirmation` |
| Home, hero: nothing runs during the call | Trigger is `Retell Call Webhook`, fired on call end (Retell post-call webhook), per node type and sticky note |
| Home, hero: every node name is copied from the workflow export | Node names rendered verbatim from the export |
| Flow 01: the parser outputs call_id, phone, name, service, location, urgency, intent, requested_slot, end_slot, existing_event_id, transcript, duration_seconds | Source code of `Parse Retell Payload` (jsCode return object keys) |
| Flow 01: transcript containing "tomorrow" adds one day; "2 pm" sets 2:00 PM Manila | Source code of `Parse Retell Payload` (transcript.includes checks) |
| Flow 02: lookup by phone on leads | `Check Existing Lead` (getAll, tableId leads, filter phone eq) |
| Flow 02: existing caller updated, status qualified | `Update Lead` (update leads, fields name, service, location, urgency, status: qualified) |
| Flow 02: new caller created with status new | `Create Lead` (insert leads, fields including status: new) |
| Flow 02: Merge Lead produces one lead_id | Node `Normalize Lead Check` sets lead_found / existing_lead_id; node `Extract Lead` returns lead_id from whichever Supabase node ran; node `Merge Lead` |
| Flow 03: call_logs row gets lead_id, retell_call_id, transcript, outcome, duration_seconds | `Insert Call Log` fieldValues |
| Flow 03: every call gets the row | Sticky note `note_calllog`: "regardless of what the caller wanted" |
| Flow 04: book and reschedule go to the top path, cancel to the bottom, anything else skips calendar work | `Branch on Intent` connections: output 0 Check Availability, output 1 Cancel Calendar Event, output 2 Prepare Notification, output 3 (fallback) empty in JSON, fallbackOutput extra; sticky note `note_branch` |
| Flow 05: availability read covers the hour window around the requested slot | `Check Availability` timeMin = requested_slot, timeMax = requested_slot + 60 min |
| Flow 05: hold written to booking_holds, pending, two minute expiry | `Create Booking Hold` (booking_holds, status pending, expires_at = now + 2 minutes) |
| Flow 05: no node reads the availability result | Connections: `Check Availability` output 0 goes to `Create Booking Hold`; nothing reads its returned events |
| Flow 05: the constraints export gives appointments only a primary key, a status check and a foreign key | `docs/supabase-constraints.json`, appointments rows |
| Flow 06: existing_event_id present updates the event, absent creates one | `Has Existing Event?` (string notEquals ""), true to `Update Calendar Event`, false to `Create Calendar Event` |
| Flow 06: appointment row gets event id, slot, status booked or rescheduled | `Confirm Hold & Appointment` (calendar_event_id, appointment_status) and `Create Appointment` (appointments fields) |
| Flow 06: hold row flipped to confirmed | `Update Booking Hold` (status confirmed, matched on lead_id) |
| Flow 07: cancel deletes the event named by existing_event_id | `Cancel Calendar Event` (operation delete, eventId = existing_event_id) |
| Flow 07: matching appointments row set to cancelled | `Cancel Appointment` (update appointments, status cancelled, matched on lead_id) |
| Flow 08: all three paths close into the same notification node | Connections into `Prepare Notification` from `Merge Book Path` (main from Branch on Intent output 2) and from the cancel/notify paths; sticky note `note_notify`: "All three paths (book, reschedule, cancel) converge here" |
| Flow 08: sms text per intent | `Prepare Notification` jsCode (book, reschedule, cancel cases) |
| Flow 08: HubSpot contact gets phone, first name, lifecycle stage | `Push to HubSpot` jsonBody |
| Flow 08: Twilio SMS is built, not run live, no free trial in this region | Workflow: node exists with from "+15555550100" and message expression; user statement: no Twilio trial in region, never sent live. No test exists. Label kept. |
| Flow 08: a HubSpot failure stops the flow before the SMS step, no error output wired | Connections and onError flags: `Push to HubSpot` has no `onError: continueErrorOutput` while `Check Availability`, `Update Calendar Event`, `Create Calendar Event`, `Cancel Calendar Event`, `Twilio SMS Confirmation` do; sticky `note_errors` claims six, the JSON shows five |
| Flow 09: five nodes carry error outputs, named | onError flags on the five nodes listed above |
| Flow 09: errors appended to the call_logs row of that call, matched on retell_call_id | `Format Error` (error_note), `Log Error to Call Log` (update call_logs matching retell_call_id, outcome = error_note) |
| Payload check: the call lasted 56 seconds and ended with the caller hanging up | `duration_ms: 56404` and `disconnection_reason: user_hangup` in docs/retell-payload.json |
| Payload check: phone row (from_number empty, fallback to analysis.phone, leading zero dropped) | `from_number: ""`, `custom_analysis_data.phone: 921700820`, Parse node `call.from_number || analysis.phone`; caller words in transcript say 0921700820 |
| Payload check: requested_slot row (field is 2026, node ignores it, derives from transcript) | `custom_analysis_data.requested_slot: 2026`; Parse node never references analysis.requested_slot; transcript contains "tomorrow" and "at two PM" |
| Payload check: existing_event_id row (0, parsed to null, create path taken) | `custom_analysis_data.existing_event_id: 0`; Parse node `analysis.existing_event_id || null`; `Has Existing Event?` comparison renders null as empty string, false branch = `Create Calendar Event` |
| Payload check: intent row (book, booking path) | `custom_analysis_data.intent: "book"`; `Branch on Intent` rule 1 |
| Transcript excerpt: the four lines shown | `transcript_object` lines in docs/retell-payload.json, digits masked |
| Built vs live: the three honesty cards were removed from the landing; the required single label lives in the footer | Footer on every page reads "Twilio SMS is built but not run live"; the not-prevention wording moved to step 05 and the constraints row below |
| Hero execution strip: node chain in real order, lighting up in sequence | Node list assembled from connections in the workflow export; the CSS run animation encodes the sequence, text is verbatim |
| Hero: the demo call ran N seconds, then the chain ran | `duration_ms: 56404` in docs/retell-payload.json |
| Hero counts: calls logged, leads, appointments placed, errors caught | Head counts against calls_public, leads_public, appointments_public (booked + cancelled) and errors_public at request time, via `lib/counts.ts`; strip renders nothing if queries fail |
| Data section: the workflow writes to four Supabase tables: leads, call_logs, booking_holds, appointments | tableId on the six Supabase nodes; confirmed column by column in `docs/supabase-columns.json` |
| Data section: dashboard reads read only views with anon key, phones masked | `lib/supabase.ts` (createClient with anon key, no session) and `supabase/views.sql`, applied to the live project on 2026-10-17; a probe with the anon key returned view GET 200 and masked phone values like 92•••••20 |
| Dashboard: counts come from queries at load time | `app/dashboard/page.tsx` runs `Promise.all` of four selects on render (`connection()`, `instant = false`) |
| Dashboard empty state: anon key only, service role never in client code | Repo search: no SUPABASE_SERVICE_ROLE / SB_SECRET anywhere under app/ or lib/ |
| Demo page: the call facts (status, duration, hangup reason, sentiment, intent, service, location, urgency, name) | docs/retell-payload.json fields |
| Demo page: the recording URL comes from the payload and may expire | `recording_url` field; cloudfront link without known TTL handling |
| Demo page: two broken quote characters restored | The mojibake sequences in `transcript_object` |
| Footer: numbers come from queries against the data; node names, tables and fields from the export and schema | This table binds every number-bearing statement to a source |

## Sentences flagged for removal if their evidence disappears

- "The workflow is working" is the user's statement, not a test. If an execution log appears in the repo this becomes verifiable.
- The `92XXXXXXX0`-style masked phone rendering depends on the payload file remaining at `lib/retell-call.json` with the same analysis.phone value.
- Demo slot display "tomorrow, 2:00 PM Manila" is derived for display only. The workflow computes it at run time. It is not a stored value.
