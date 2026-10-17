import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

const payload = JSON.parse(
  readFileSync(path.join(__dirname, "..", "lib", "retell-call.json"), "utf8"),
);

// The raw caller number from the payload. It must never appear on the page.
const rawDigits = ["921700820", "0921700820", "7921700820"];

test.describe("demo page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/demo");
  });

  test("renders the real transcript with speakers", async ({ page }) => {
    await expect(
      page.getByText("I'm your booking assistant", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByText("plumbing consultation tomorrow", { exact: false }).first(),
    ).toBeVisible();
    await expect(page.getByText("Agent", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Caller", { exact: true }).first()).toBeVisible();
  });

  test("does not expose the raw phone number", async ({ page }) => {
    const body = await page.locator("body").innerText();
    for (const digits of rawDigits) {
      expect(body, `page must not contain ${digits}`).not.toContain(digits);
    }
    // The masked rendering must still exist.
    expect(body).toContain("\u2022");
  });

  test("shows the recording player with the payload url", async ({ page }) => {
    const audio = page.locator("audio");
    await expect(audio).toHaveCount(1);
    if (payload.recording_url) {
      await expect(audio).toHaveAttribute("src", payload.recording_url);
    }
  });

  test("answers on a phone sized viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/demo");
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    const boxes = await heading.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, width: r.width };
    });
    expect(boxes.width).toBeLessThanOrEqual(375);
  });
});
