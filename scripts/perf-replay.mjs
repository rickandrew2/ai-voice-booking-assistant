import { chromium } from "playwright";

const b = await chromium.launch();

for (const vp of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "phone", width: 390, height: 844 },
]) {
  const pg = await b.newPage({ viewport: { width: vp.width, height: vp.height } });
  const errs = [];
  pg.on("pageerror", (e) => errs.push(String(e)));
  await pg.goto("http://localhost:3111/");
  await pg.waitForTimeout(2500);
  const stats = await pg.evaluate(async () => {
    const el = document.querySelector("#replay-story");
    const span = window.innerWidth < 900 ? 2200 : 3500;
    const startY = el.getBoundingClientRect().top + window.scrollY;
    const gaps = [];
    let last = performance.now();
    let raf = 0;
    const tick = () => {
      const now = performance.now();
      gaps.push(now - last);
      last = now;
      raf = requestAnimationFrame(tick);
    };
    tick();
    for (let s = 0; s <= 100; s += 2) {
      window.scrollTo(0, startY + span * (s / 100));
      await new Promise((r) => setTimeout(r, 50));
    }
    cancelAnimationFrame(raf);
    gaps.shift();
    return {
      samples: gaps.length,
      avgMs: Math.round((gaps.reduce((a, b) => a + b, 0) / gaps.length) * 10) / 10,
      worstMs: Math.round(Math.max(...gaps)),
      longTasks: gaps.filter((g) => g > 50).length,
    };
  });
  console.log(vp.name, JSON.stringify({ stats, errs }));
  await pg.close();
}

const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
await pg.emulateMedia({ reducedMotion: "reduce" });
await pg.goto("http://localhost:3111/");
await pg.waitForTimeout(1200);
const el = await pg.locator(".replay.alternate");
await el.scrollIntoViewIfNeeded();
await pg.waitForTimeout(500);
await pg.screenshot({ path: "verification/replay/reduced-ledger.png" });
console.log("reduced screenshot saved");
await b.close();
