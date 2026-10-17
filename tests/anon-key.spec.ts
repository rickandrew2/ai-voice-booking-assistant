// Security test: the anon key must not allow writes, and must not read
// unmasked phone numbers.
//
// Requirements:
//   .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
//   the public views (supabase/views.sql) applied to the project
//
// Run: npx playwright test tests/anon-key.spec.ts

import { test, expect } from "@playwright/test";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Corrections and inserts against the four base tables must all fail.
const targets = ["leads", "call_logs", "booking_holds", "appointments"];

test.skip(!url || !key, "Supabase env vars are not set, skipping");

test.describe("anon key permissions", () => {
  const headers = new Headers({
    apikey: key!,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  });

  test("cannot insert into base tables", async () => {
    for (const t of targets) {
      const res = await fetch(`${url}/rest/v1/${t}`, {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      });
      expect(res.status, `${t} insert should fail`).not.toBe(201);
    }
  });

  test("cannot update base tables", async () => {
    for (const t of targets) {
      const res = await fetch(`${url}/rest/v1/${t}?id=eq.1`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: "hacked" }),
      });
      const text = await res.text();
      expect(res.status, `${t} update should fail (${text})`).not.toBe(204);
    }
  });

  test("cannot delete from base tables", async () => {
    for (const t of targets) {
      const res = await fetch(`${url}/rest/v1/${t}?id=eq.1`, {
        method: "DELETE",
        headers,
      });
      expect(res.status, `${t} delete should fail`).not.toBe(204);
    }
  });

  test("cannot read a full phone number from public views", async () => {
    const res = await fetch(`${url}/rest/v1/leads_public?select=*`, {
      headers: new Headers({ apikey: key!, Authorization: `Bearer ${key}` }),
    });
    expect(res.ok).toBe(true);
    const rows = await res.json();
    for (const row of rows as Record<string, unknown>[]) {
      for (const [col, value] of Object.entries(row)) {
        if (!/phone/i.test(col)) continue;
        const s = String(value);
        // A masked value contains bullet characters or is empty. A full
        // phone number never does.
        expect(
          s === "" || s.includes("\u2022"),
          `${col} looked unmasked: ${s}`,
        ).toBe(true);
      }
    }
  });
});
