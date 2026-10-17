export type NodeRef = string;

export type FlowStep = {
  id: string;
  number: string;
  title: string;
  nodes: NodeRef[];
  prose: string[];
  label?: string;
};

export const flowSteps: FlowStep[] = [
  {
    id: "step-call-ends",
    number: "01",
    title: "The call ends",
    nodes: ["Retell Call Webhook", "Parse Retell Payload"],
    prose: [
      "Retell calls this webhook when a call ends. The agent's post-call data lands as one JSON object.",
      "Parse Retell Payload turns that object into the eleven fields the rest of the flow uses: call_id, phone, name, service, location, urgency, intent, requested_slot, end_slot, existing_event_id, transcript and duration_seconds.",
      "If the transcript says tomorrow, the parser adds one day. If it says 2 pm, the slot is set to 2:00 PM Manila time. The slot is computed from the transcript words, not from the payload's requested_slot field.",
    ],
  },
  {
    id: "step-lead",
    number: "02",
    title: "The caller is found or created",
    nodes: [
      "Check Existing Lead",
      "Normalize Lead Check",
      "Lead Exists?",
      "Update Lead",
      "Create Lead",
      "Merge Lead",
    ],
    prose: [
      "Check Existing Lead looks up the leads table on phone. If a row comes back, Lead Exists? sends the flow to Update Lead, which rewrites name, service, location, urgency and sets status to qualified.",
      "If nothing comes back, Create Lead writes a new row with status set to new.",
      "Merge Lead puts both paths back together so the rest of the flow only sees one lead_id.",
    ],
  },
  {
    id: "step-calllog",
    number: "03",
    title: "The call is logged",
    nodes: ["Insert Call Log"],
    prose: [
      "Insert Call Log writes a row to call_logs with the lead_id, the Retell call id, the transcript, the intent as the outcome and the duration in seconds.",
      "Every call gets this row, whatever the caller asked for.",
    ],
  },
  {
    id: "step-intent",
    number: "04",
    title: "The intent is routed",
    nodes: ["Branch on Intent"],
    prose: [
      "Branch on Intent reads the intent field.",
      "book and reschedule go to the top path. cancel goes to the bottom path. Anything else goes straight to the CRM and SMS steps with no calendar work.",
    ],
  },
  {
    id: "step-hold",
    number: "05",
    title: "The slot is checked and held",
    nodes: ["Check Availability", "Create Booking Hold"],
    prose: [
      "Check Availability opens the Google Calendar for this project and reads the hour window around the requested slot.",
      "Create Booking Hold writes a pending row to booking_holds with a two minute expiry. The sticky note calls this a short lived hold to stop two callers grabbing the same slot.",
      "One honest observation from the JSON: no node reads what Check Availability returned. A hold is placed even if the calendar is busy. The hold is a mechanism in the flow, but nothing in the JSON evaluates it against the result.",
      "The database adds no protection either. The constraints export gives appointments only a primary key, a status check and a foreign key. Nothing there stops two appointment rows carrying the same scheduled_at.",
    ],
  },
  {
    id: "step-book",
    number: "06",
    title: "The calendar is booked or updated",
    nodes: [
      "Has Existing Event?",
      "Create Calendar Event",
      "Update Calendar Event",
      "Merge Calendar Result",
      "Confirm Hold & Appointment",
      "Create Appointment",
      "Update Booking Hold",
    ],
    prose: [
      "Has Existing Event? checks the existing_event_id field. With an id, the flow updates that event. Without one, it creates a new event on the project calendar.",
      "Confirm Hold & Appointment folds the calendar event id back in, then Create Appointment writes an appointments row with the event id, the slot and the status, booked or rescheduled.",
      "Update Booking Hold flips the hold row to confirmed.",
    ],
  },
  {
    id: "step-cancel",
    number: "07",
    title: "The cancel path",
    nodes: ["Cancel Calendar Event", "Cancel Appointment"],
    prose: [
      "On intent cancel, Cancel Calendar Event deletes the event named by existing_event_id.",
      "Cancel Appointment sets the matching appointments row to cancelled.",
    ],
  },
  {
    id: "step-notify",
    number: "08",
    title: "CRM and the SMS step",
    nodes: ["Merge Book Path", "Prepare Notification", "Twilio SMS Confirmation"],
    prose: [
      "All three paths close into the same notification node. Prepare Notification writes the sms_message text per intent, then Push to HubSpot posts the contact with the phone, the first name and the lifecycle stage.",
      "Push to HubSpot has one caveat visible in the JSON: it is one of five risky nodes, but it is the sixth risky node that has no error output wired. A HubSpot failure there stops the flow before the SMS step.",
    ],
  },
  {
    id: "step-errors",
    number: "09",
    title: "When a step fails",
    nodes: ["Format Error", "Log Error to Call Log"],
    prose: [
      "Five nodes carry error outputs instead of crashing the flow: Check Availability, Update Calendar Event, Create Calendar Event, Cancel Calendar Event and Twilio SMS Confirmation.",
      "Format Error writes a short error string and Log Error to Call Log appends it to the call_logs row of that call, matched on retell_call_id.",
    ],
  },
];

export const labelNotes: { nodes: NodeRef[]; label: string }[] = [
  {
    nodes: ["Twilio SMS Confirmation"],
    label: "Built, not run live. Twilio has no free trial in this region.",
  },
];
