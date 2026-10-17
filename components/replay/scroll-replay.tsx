"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import {
  replayLines,
  replayCallEnd,
  replayDay,
  replaySlotLabel,
  replayEventTitle,
} from "@/lib/replay-data";

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(ScrollTrigger);

/* Friendly retelling of the one real call, Telegram style: big centered
   statement, then the actual chat bubbles, scattered, appearing on their
   real timestamps (bubble order/timing from docs/retell-payload.json via
   lib/replay-data.ts). Story map, percent of the pinned scroll:
   headline 0-8, bubbles 8-56, summary 56-70, calendar booked 70-100. */

const CONV_START = 8;
const CONV_END = 56;

const CAL_DATE = new Date(`${replayDay.iso}T00:00:00`);
const CAL_WD = CAL_DATE.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
const CAL_DAY = CAL_DATE.getDate();

const GCAL_URL =
  `https://calendar.google.com/calendar/render?action=TEMPLATE` +
  `&text=${encodeURIComponent(replayEventTitle)}` +
  `&dates=20260905T060000Z/20260905T063000Z` +
  `&details=${encodeURIComponent("Booked by the AI voice agent over a phone call.")}`;

const BUBBLE_POS = [
  { left: "7%", top: "44%" },
  { left: "22%", top: "64%" },
  { left: "47%", top: "34%" },
  { left: "8%", top: "76%" },
  { left: "52%", top: "46%" },
  { left: "46%", top: "82%" },
  { left: "66%", top: "62%" },
];

const BUBBLE_W = [null, null, 160, 340, 400, 300, 340];

function timeLabel(sec: number) {
  const s = Math.max(0, Math.min(56, Math.floor(sec)));
  return `0:${String(s).padStart(2, "0")}`;
}

const HEADLINE = [
  "One phone call.",
  "The appointment is already on",
  "the calendar before the caller hangs up.",
];

let lenisRef: Lenis | null = null;

function ensureLenis(): Lenis | null {
  if (typeof window === "undefined") return null;
  if (lenisRef) return lenisRef;
  const lenis = new Lenis({ lerp: 0.12 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
  lenisRef = lenis;
  return lenis;
}

export default function ScrollReplay() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const isReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (isReduced) return;
      ensureLenis();

      try {
        const mm = gsap.matchMedia();

        let tlRef: gsap.core.Timeline | null = null;

        const build = (mobile: boolean) => {
          const convSpan = CONV_END - CONV_START;
          const at = (start: number) =>
            CONV_START + Math.max(0, (start / replayCallEnd) * convSpan - 1.6);

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: mobile ? "+=2200" : "+=3500",
              scrub: 1,
              pin: true,
              anticipatePin: 1,
              onUpdate: (self) => {
                section.style.setProperty("--rs-track", String(self.progress));
              },
            },
          });
          tlRef = tl;

          ScrollTrigger.create({
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            onToggle: (self) => {
              if (self.isActive) tlRef?.play();
              else tlRef?.pause();
            },
          });

          /* headline 0-8 */
          tl.fromTo(
            ".rs-hw",
            { opacity: 0, y: 26 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              stagger: { each: 0.22, from: "start" },
              ease: "power3.out",
            },
            1.2,
          );

          /* bubbles 8-56 */
          replayLines.forEach((line, li) => {
            const bubble = section.querySelectorAll<HTMLElement>(".replay-msg")[li];
            if (!bubble) return;
            const base = at(line.start);
            const isAgent = line.role === "agent";
            const typing = section.querySelector<HTMLElement>(".rs-typing");

            if (isAgent && typing) {
              tl.set(typing, { visibility: "visible", opacity: 0 }, base - 1.2);
              tl.to(typing, { opacity: 1, duration: 0.3, ease: "power2.out" }, base - 1.1);
              tl.to(
                typing.children,
                { opacity: 0.25, yoyo: true, repeat: 1, duration: 0.24, stagger: 0.1, ease: "sine.inOut" },
                base - 0.9,
              );
              tl.to(typing, { opacity: 0, duration: 0.22 }, base - 0.2);
            }

            tl.set(bubble, { visibility: "visible" }, base - 0.2);
            tl.fromTo(
              bubble,
              { opacity: 0, y: 26, scale: 0.92 },
              { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.6)" },
              base - 0.2,
            );
          });

          /* soften bubbles, bring the summary forward */
          tl.to(
            ".replay-msg",
            { opacity: 0.45, scale: 0.96, y: -8, duration: 2, stagger: { each: 0.12 }, ease: "power2.inOut" },
            55.6,
          );
          tl.set(".rs-typing", { visibility: "hidden", opacity: 0 }, 57);
          tl.set(".rs-callnote", { visibility: "visible" }, 57.6);
          tl.set(".rs-toast", { visibility: "visible" }, 57.8);
          tl.fromTo(
            ".rs-callnote",
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            57.8,
          );
          tl.fromTo(
            ".rs-toast",
            { opacity: 0, y: 26, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "back.out(1.5)" },
            58.4,
          );
          tl.to(".rs-toast", { opacity: 0, y: -18, scale: 0.98, duration: 0.8, ease: "power2.in" }, 67.5);
          tl.set(".rs-toast", { visibility: "hidden" }, 68.4);

          /* calendar 70-100, replaces the summary in the same spot */
          tl.set(".replay-cal", { visibility: "visible" }, 69.4);
          tl.fromTo(
            ".replay-cal",
            { opacity: 0, y: 30, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "back.out(1.4)" },
            69.6,
          );
          tl.to(
            ".replay-gcal-event",
            { opacity: 0.55, yoyo: true, repeat: 4, duration: 0.7, ease: "sine.inOut" },
            74,
          );
          tl.to(
            ".replay-gcal-event",
            {
              backgroundColor: "#2455f2",
              borderColor: "#2455f2",
              color: "#ffffff",
              duration: 0.35,
              ease: "power2.out",
            },
            85.8,
          );
          tl.to(
            ".replay-gcal-event",
            { scale: 1.04, yoyo: true, repeat: 1, duration: 0.18, ease: "power2.out" },
            86.15,
          );
          tl.set(".replay-cal-actions", { visibility: "visible", opacity: 1 }, 88.2);
          tl.fromTo(
            ".replay-sync",
            { opacity: 0, y: 10, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.8)" },
            88.4,
          );
          tl.fromTo(
            ".replay-open",
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
            90.2,
          );

          tl.to({}, { duration: 3 });

          /* skip control */
          const skip = section.querySelector<HTMLElement>(".replay-skip");
          const onSkip = (e: Event) => {
            e.preventDefault();
            const st = tl.scrollTrigger;
            if (st) {
              const target = st.end + 4;
              if (lenisRef) lenisRef.scrollTo(target, { immediate: true });
              else window.scrollTo(0, target);
            } else {
              const endEl = document.getElementById("replay-end");
              endEl?.scrollIntoView();
            }
          };
          skip?.addEventListener("click", onSkip);
          return () => skip?.removeEventListener("click", onSkip);
        };

        mm.add("(min-width: 900px)", () => build(false));
        mm.add("(max-width: 899px)", () => build(true));

        const refresh = () => ScrollTrigger.refresh();
        document.fonts?.ready.then(refresh);
        window.addEventListener("load", refresh);

        return () => {
          mm.revert();
          window.removeEventListener("load", refresh);
        };
      } catch (err) {
        console.error("[replay]", err);
      }
    },
    { scope: sectionRef },
  );

  return (
    <>
      <section ref={sectionRef} className="replay replay-motion" id="replay-story">
        <a className="replay-skip" href="#replay-end">
          skip this story →
        </a>
        <div className="replay-rail" aria-hidden>
          <div className="replay-rail-fill" />
        </div>
        <p className="replay-progress-label">a real call, retold</p>

        <div className="replay-stage">
          <h2 className="rs-headline">
            {HEADLINE.map((l, li) => (
              <span key={li} className="rs-line">
                {l.split(" ").map((w, wi) => (
                  <span key={`${li}-${wi}`} className="rs-hw">
                    {w}{" "}
                  </span>
                ))}
              </span>
            ))}
          </h2>

          <div className="replay-flow">
            <div className="rs-typing" aria-hidden>
              <i />
              <i />
              <i />
            </div>

            <p className="rs-callnote">after 56 seconds, the call ends</p>

            {replayLines.map((line, li) => (
              <article
                key={li}
                className={`replay-msg ${line.role}`}
                style={{
                  left: BUBBLE_POS[li].left,
                  top: BUBBLE_POS[li].top,
                  width: BUBBLE_W[li] ? BUBBLE_W[li] : undefined,
                }}
              >
                <div className="rs-in">
                  <Avatar agent={line.role === "agent"} />
                  <p className="rs-txt">
                    {line.snippet} <span className="rs-time">{timeLabel(line.start)}</span>
                  </p>
                </div>
              </article>
            ))}

            <div className="rs-toast">
              <span className="rs-toast-kicker">got it</span>
              <p className="rs-toast-line">
                Rick · plumbing consultation
                <br />
                tomorrow at 2 PM · San Jose, Batangas
                <br />
                92••••••20
              </p>
            </div>

            <CalCard filled={false} />
          </div>
        </div>
      </section>
      <StaticLedger />
      <div id="replay-end" />
    </>
  );
}

function CalCard({ filled }: { filled: boolean }) {
  return (
    <div className="replay-cal">
      <div className="replay-cal-head">
        <span className="replay-cal-chip" aria-hidden>
          <em>{CAL_WD}</em>
          <strong>{CAL_DAY}</strong>
        </span>
        <span className="replay-cal-titles">
          <strong>{replayDay.label}</strong>
          <span>the caller said tomorrow · manila</span>
        </span>
      </div>
      <div className="replay-cal-body">
        <div className={`replay-gcal-event${filled ? "" : " ghost"}`}>
          <strong>{replayEventTitle}</strong>
          <span>{replaySlotLabel} – 2:30 PM · San Jose, Batangas</span>
        </div>
        <div className="replay-cal-actions">
          <span className="replay-sync">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="11" fill="#188038" />
              <path
                d="m7.5 12.2 3 3 6-6.4"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            added to Google Calendar
          </span>
          <a className="replay-open" href={GCAL_URL} target="_blank" rel="noreferrer">
            open in Google Calendar ↗
          </a>
        </div>
      </div>
    </div>
  );
}

function Avatar({ agent }: { agent: boolean }) {
  return agent ? (
    <span className="av av-agent" aria-hidden>
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none">
        <path
          d="M4 13a8 8 0 0 1 16 0M3 14.5A2.5 2.5 0 0 1 5.5 12h.5v5h-.5A2.5 2.5 0 0 1 3 14.5Zm18 0a2.5 2.5 0 0 0-2.5-2.5h-.5v5h.5a2.5 2.5 0 0 0 2.5-2.5ZM12 19a3 3 0 0 1-3-3v-2h6v2a3 3 0 0 1-3 3Z"
          stroke="#ffffff"
          strokeWidth="1.6"
        />
      </svg>
    </span>
  ) : (
    <span className="av av-user" aria-hidden>
      R
    </span>
  );
}

/* reduced motion: same story, everything readable, no pin */
function StaticLedger() {
  return (
    <section className="replay alternate">
      <a className="replay-skip" href="#replay-end">
        skip this story →
      </a>
      <div className="replay-stage">
        <h2 className="rs-headline">
          {HEADLINE.map((l) => (
            <span key={l} className="rs-line">
              {l}
            </span>
          ))}
        </h2>

        <div className="replay-flow">
          <p className="rs-callnote">after 56 seconds, the call ends</p>
          {replayLines.map((line, li) => (
            <article key={li} className={`replay-msg ${line.role}`}>
              <div className="rs-in">
                <Avatar agent={line.role === "agent"} />
                <p className="rs-txt">
                  {line.snippet} <span className="rs-time">{timeLabel(line.start)}</span>
                </p>
              </div>
            </article>
          ))}

          <div className="rs-toast">
            <span className="rs-toast-kicker">got it</span>
            <p className="rs-toast-line">
              Rick · plumbing consultation
              <br />
              tomorrow at 2 PM · San Jose, Batangas
              <br />
              92••••••20
            </p>
          </div>

          <CalCard filled={true} />
        </div>
      </div>
    </section>
  );
}
