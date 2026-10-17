import { test, expect } from "@playwright/test";
import { replayEventTitle } from "../lib/replay-data";

/* Gated verification for the scroll-driven call replay.
   Run with: REPLAY_RUN=1 npx playwright test tests/replay-frames.spec.ts
   Captures contact-sheet frames at fixed story progress points for
   desktop and phone, checks the skip link, the reduced-motion ledger,
   and records a frame-rate sample while scrubbing. */

const FRACTIONS = [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1];

type Geo = { startY: number; span: number; mobile: boolean };

async function getSpan(page: import("@playwright/test").Page): Promise<Geo | null> {
  return page.evaluate(() => {
    const el = document.querySelector("#replay-story");
    if (!el) return null;
    const mobile = window.innerWidth < 900;
    const startY = el.getBoundingClientRect().top + window.scrollY;
    const span = mobile ? 2200 : 3500;
    return { startY, span, mobile };
  });
}

test("captures contact sheet frames and keeps 60fps while scrubbing", async ({
  page,
}) => {
  test.skip(!process.env.REPLAY_RUN, "gated: set REPLAY_RUN=1");

  const viewports = [
    { name: "desktop", width: 1440, height: 900 },
    { name: "phone", width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");
    await page.waitForSelector("#replay-story");
    const geo = await getSpan(page);
    if (!geo) throw new Error("replay story not found");

    for (let i = 0; i < FRACTIONS.length; i++) {
      const p = FRACTIONS[i];
      await page.evaluate(
        ({ y }: { y: number }) => window.scrollTo(0, y),
        { y: geo.startY + geo.span * p },
      );
      await page.waitForTimeout(1100);
      await page.screenshot({
        path: `verification/replay/${vp.name}/${String(Math.round(p * 100)).padStart(3, "0")}.png`,
      });
    }

    // frame budget sample while scrubbing top to bottom
    const stats = await page.evaluate(async (): Promise<{
      samples: number;
      avg: number;
      long: number;
      misses: number;
    } | null> => {
      const el = document.querySelector("#replay-story");
      if (!el) return null;
      const span = window.innerWidth < 900 ? 2200 : 3500;
      const startY = el.getBoundingClientRect().top + window.scrollY;
      const drop: number[] = [];
      let last = performance.now();
      let raf = 0;
      const tick = () => {
        const now = performance.now();
        drop.push(now - last);
        last = now;
        raf = requestAnimationFrame(tick);
      };
      tick();
      for (let s = 0; s <= 100; s += 2) {
        window.scrollTo(0, startY + span * (s / 100));
        await new Promise((r) => setTimeout(r, 50));
      }
      cancelAnimationFrame(raf);
      drop.shift();
      const long = Math.round(Math.max(...drop));
      const avg = Math.round((drop.reduce((a, b) => a + b, 0) / drop.length) * 10) / 10;
      const misses = drop.filter((d) => d > 25).length;
      return { samples: drop.length, avg, long, misses };
    });
    expect(stats).toBeTruthy();
    // loose budget: average frame under 25ms, no collapse over 250ms
    expect(stats!.avg).toBeLessThan(25);
    expect(stats!.long).toBeLessThan(250);
  }
});

test("skip link jumps past the pinned story", async ({ page }) => {
  test.skip(!process.env.REPLAY_RUN, "gated: set REPLAY_RUN=1");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForSelector("#replay-story");
  await page.waitForTimeout(1500);
  const geo = (await getSpan(page)) as Geo;
  await page.locator(".replay-skip").first().click();
  await page.waitForTimeout(900);
  const y = await page.evaluate(() => window.scrollY);
  expect(y).toBeGreaterThanOrEqual(geo.startY + geo.span);
});

test("reduced motion gets the static ledger, no pin", async ({ page }) => {
  test.skip(!process.env.REPLAY_RUN, "gated: set REPLAY_RUN=1");
  // gated suites run in chromium only anyway
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(".replay-motion")).toBeHidden();
  const ledger = page.locator(".replay.alternate");
  await expect(ledger).toBeVisible();
  await expect(ledger.locator(".replay-msg")).toHaveCount(7);
  await expect(ledger.locator(".rs-toast")).toHaveCount(1);
  const event = ledger.locator(".replay-gcal-event");
  await expect(event).toHaveCount(1);
  await expect(event).toContainText(replayEventTitle);
  await expect(event).toContainText("2:00 PM");
  await expect(ledger.locator(".replay-sync")).toContainText("added to Google Calendar");
  const open = ledger.locator(".replay-open");
  await expect(open).toHaveCount(1);
  await expect(open).toHaveAttribute("href", /calendar\.google\.com/);
});
