import { test, expect } from "@playwright/test";

const rawDigits = ["921700820", "0921700820", "7921700820"];

test.describe("dashboard page", () => {
  test("renders the read only data sections", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(
      page.getByRole("heading", { name: "Recent calls" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Leads" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Appointments by status" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Errors from the call log" }),
    ).toBeVisible();
  });

  test("shows either live view data, a view error, or the setup empty state", async ({ page }) => {
    await page.goto("/dashboard");
    const emptyState = page.getByText(
      "The Supabase environment variables are not set yet",
    );
    const rows = page.locator("table");
    const viewError = page.getByText("The view did not answer", { exact: false });

    if ((await emptyState.count()) > 0) {
      await expect(emptyState).toBeVisible();
    } else if ((await rows.count()) > 0) {
      await expect(rows.first()).toBeVisible();
    } else {
      await expect(viewError.first()).toBeVisible();
    }
  });

  test("does not expose the real caller phone number", async ({ page }) => {
    await page.goto("/dashboard");
    const body = await page.locator("body").innerText();
    for (const digits of rawDigits) {
      expect(body, `dashboard must not contain ${digits}`).not.toContain(digits);
    }
  });

  test("fits a phone sized viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/dashboard");
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    const width = await heading.evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeLessThanOrEqual(375);
  });
});
