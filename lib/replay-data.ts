export type ReplayWord = { w: string; s: number; e: number };
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
export const replayLines: ReplayLine[] = [{"role":"agent","content":"Hello! Thanks for calling. I'm your booking assistant. Would you like to book, reschedule, or cancel an appointment today?","words":[{"w":"Hello! ","s":0.285,"e":0.685},{"w":"Thanks ","s":1.04,"e":1.44},{"w":"for ","s":1.44,"e":1.84},{"w":"calling. ","s":1.84,"e":2.24},{"w":"I'm ","s":2.131,"e":2.531},{"w":"your ","s":2.531,"e":2.931},{"w":"booking ","s":2.931,"e":3.331},{"w":"assistant. ","s":3.331,"e":3.731},{"w":"Would ","s":3.698,"e":4.098},{"w":"you ","s":4.098,"e":4.498},{"w":"like ","s":4.498,"e":4.898},{"w":"to ","s":4.898,"e":5.298},{"w":"book, ","s":5.298,"e":5.698},{"w":"reschedule, ","s":5.698,"e":6.098},{"w":"or ","s":6.098,"e":6.498},{"w":"cancel ","s":6.498,"e":6.898},{"w":"an ","s":6.898,"e":7.298},{"w":"appointment ","s":7.298,"e":7.698},{"w":"today?","s":7.698,"e":8.098}],"start":0.285,"end":8.098,"snippet":"Hello! Thanks for calling. I'm your booking assistant. Would you like to book, …"},{"role":"user","content":"Hi. I'm Rick. I'd like to book a plumbing consultation tomorrow.","words":[{"w":"Hi. ","s":8.299,"e":8.699},{"w":"I'm ","s":8.699,"e":8.939},{"w":"Rick. ","s":8.939,"e":9.259},{"w":"I'd ","s":9.429,"e":9.829},{"w":"like ","s":9.829,"e":9.909},{"w":"to ","s":9.909,"e":10.069},{"w":"book ","s":10.069,"e":10.309},{"w":"a ","s":10.309,"e":10.549},{"w":"plumbing ","s":10.549,"e":11.109},{"w":"consultation ","s":11.109,"e":11.989},{"w":"tomorrow. ","s":11.989,"e":12.549}],"start":8.299,"end":12.549,"snippet":"Hi. I'm Rick. I'd like to book a plumbing consultation tomorrow."},{"role":"user","content":"at two PM","words":[{"w":"at ","s":13.109,"e":13.429},{"w":"two ","s":13.429,"e":13.589},{"w":"PM ","s":13.589,"e":13.989}],"start":13.109,"end":13.989,"snippet":"at two PM"},{"role":"user","content":"at San Jose Batangas. So you can have my number at seven nine two one seven hundred eight two point zero.","words":[{"w":"at ","s":14.479,"e":14.879},{"w":"San ","s":15.019,"e":15.339},{"w":"Jose ","s":15.339,"e":15.579},{"w":"Batangas. ","s":15.579,"e":16.459},{"w":"So ","s":16.459,"e":16.779},{"w":"you ","s":16.779,"e":17.019},{"w":"can ","s":17.019,"e":17.419},{"w":"have ","s":17.419,"e":17.739},{"w":"my ","s":17.739,"e":17.899},{"w":"number ","s":17.899,"e":18.139},{"w":"at ","s":18.139,"e":18.379},{"w":"seven ","s":18.789,"e":19.109},{"w":"nine ","s":19.109,"e":19.349},{"w":"two ","s":19.349,"e":19.509},{"w":"one ","s":19.509,"e":19.749},{"w":"seven ","s":19.749,"e":20.149},{"w":"hundred ","s":20.149,"e":20.469},{"w":"eight ","s":20.469,"e":20.789},{"w":"two ","s":20.789,"e":21.029},{"w":"point ","s":21.029,"e":21.269},{"w":"zero. ","s":21.269,"e":21.589}],"start":14.479,"end":21.589,"snippet":"at San Jose Batangas. So you can have my number at …"},{"role":"agent","content":"Thanks, Rick. To confirm, you’d like to book a plumbing consultation tomorrow at 2 PM in San Jose, Batangas, and your number is 792-170-0820. Could you let me know how urgent this consultation is—low, medium, high, or urgent?","words":[{"w":"Thanks, ","s":23.14,"e":23.54},{"w":"Rick.","s":23.54,"e":23.94},{"w":" To ","s":24.022,"e":24.422},{"w":"confirm, ","s":24.422,"e":24.822},{"w":"you’d ","s":24.822,"e":25.222},{"w":"like ","s":25.222,"e":25.622},{"w":"to ","s":25.622,"e":26.022},{"w":"book ","s":26.022,"e":26.422},{"w":"a ","s":26.422,"e":26.822},{"w":"plumbing ","s":26.822,"e":27.222},{"w":"consultation ","s":27.222,"e":27.622},{"w":"tomorrow ","s":27.622,"e":28.022},{"w":"at ","s":28.022,"e":28.422},{"w":"2 ","s":28.422,"e":28.822},{"w":"PM ","s":28.822,"e":29.222},{"w":"in ","s":29.222,"e":29.622},{"w":"San ","s":29.622,"e":30.022},{"w":"Jose, ","s":30.022,"e":30.422},{"w":"Batangas, ","s":30.422,"e":30.822},{"w":"and ","s":30.822,"e":31.222},{"w":"your ","s":31.222,"e":31.622},{"w":"number ","s":31.622,"e":32.022},{"w":"is ","s":32.022,"e":32.422},{"w":"792-170-0820. ","s":32.422,"e":32.822},{"w":"Could ","s":35.156,"e":35.556},{"w":"you ","s":35.556,"e":35.956},{"w":"let ","s":35.956,"e":36.356},{"w":"me ","s":36.356,"e":36.756},{"w":"know ","s":36.756,"e":37.156},{"w":"how ","s":37.156,"e":37.556},{"w":"urgent ","s":37.556,"e":37.956},{"w":"this ","s":37.956,"e":38.356},{"w":"consultation ","s":38.356,"e":38.756},{"w":"is—low, ","s":38.756,"e":39.156},{"w":"medium, ","s":39.156,"e":39.556},{"w":"high, ","s":39.556,"e":39.956},{"w":"or ","s":39.956,"e":40.356},{"w":"urgent?","s":40.356,"e":40.756}],"start":23.14,"end":40.756,"snippet":"Thanks, Rick. To confirm, you’d like to book a plumbing consultation tomorrow at 2 PM …"},{"role":"user","content":"My name is Rick. And then my number is zero nine two one seven hundred eight two point zero. And then it is low urgency.","words":[{"w":"My ","s":41.719,"e":42.119},{"w":"name ","s":42.119,"e":42.359},{"w":"is ","s":42.359,"e":42.519},{"w":"Rick. ","s":42.519,"e":42.919},{"w":"And ","s":43.179,"e":43.419},{"w":"then ","s":43.419,"e":43.659},{"w":"my ","s":43.659,"e":43.819},{"w":"number ","s":43.819,"e":44.059},{"w":"is ","s":44.059,"e":44.219},{"w":"zero ","s":44.219,"e":44.459},{"w":"nine ","s":44.459,"e":44.699},{"w":"two ","s":44.699,"e":44.939},{"w":"one ","s":44.939,"e":45.339},{"w":"seven ","s":45.339,"e":45.739},{"w":"hundred ","s":45.739,"e":46.059},{"w":"eight ","s":46.299,"e":46.539},{"w":"two ","s":46.539,"e":46.859},{"w":"point ","s":46.859,"e":47.259},{"w":"zero. ","s":47.259,"e":47.819},{"w":"And ","s":47.979,"e":48.219},{"w":"then ","s":48.219,"e":48.379},{"w":"it ","s":48.379,"e":48.539},{"w":"is ","s":48.539,"e":48.699},{"w":"low ","s":48.699,"e":49.019},{"w":"urgency. ","s":49.019,"e":49.579}],"start":41.719,"end":49.579,"snippet":"My name is Rick. And then my number is …"},{"role":"agent","content":"Thanks, Rick. To confirm, you’d like to book a plumbing consultation tomorrow at 2","words":[{"w":"Thanks, ","s":50.477,"e":50.877},{"w":"Rick.","s":50.877,"e":51.277},{"w":" To ","s":51.359,"e":51.759},{"w":"confirm, ","s":51.759,"e":52.159},{"w":"you’d ","s":52.159,"e":52.559},{"w":"like ","s":52.559,"e":52.959},{"w":"to ","s":52.959,"e":53.359},{"w":"book ","s":53.359,"e":53.759},{"w":"a ","s":53.759,"e":54.159},{"w":"plumbing ","s":54.159,"e":54.559},{"w":"consultation ","s":54.559,"e":54.959},{"w":"tomorrow ","s":54.959,"e":55.359},{"w":"at ","s":55.359,"e":55.759},{"w":"2 ","s":55.759,"e":56.159}],"start":50.477,"end":56.159,"snippet":"Thanks, Rick. To confirm, you’d like to book a plumbing consultation tomorrow at 2"}];

export const replayEntities: ReplayEntity[] = [{"key":"name","icon":"user","text":"Rick","line":1,"wordStart":2,"wordEnd":2,"at":9.259},{"key":"service","icon":"wrench","text":"plumbing consultation","line":1,"wordStart":8,"wordEnd":9,"at":11.989},{"key":"slot","icon":"clock","text":"tomorrow at 2 PM","line":2,"wordStart":0,"wordEnd":1,"at":13.989},{"key":"location","icon":"pin","text":"San Jose, Batangas","line":3,"wordStart":1,"wordEnd":3,"at":16.459},{"key":"phone","icon":"phone","text":"92••••••20","line":3,"wordStart":11,"wordEnd":20,"at":21.589},{"key":"urgency","icon":"gauge","text":"low urgency","line":5,"wordStart":23,"wordEnd":24,"at":49.579}];

export const replayCallEnd = 56.159;

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

export const replayDay = {"iso":"2026-09-05","label":"Saturday, September 5"};

export const replaySlotLabel = "2:00 PM";

export const replayEventTitle = "plumbing consultation - Rick";
