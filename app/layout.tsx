import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Instrument_Serif,
  JetBrains_Mono,
} from "next/font/google";
import Link from "next/link";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-bricolage",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  style: ["italic"],
  weight: "400",
  display: "swap",
  variable: "--font-instrument",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: {
    default: "Voice Booking Assistant",
    template: "%s | Voice Booking Assistant",
  },
  description:
    "An AI voice agent that finishes the paperwork after every call: one workflow that books the slot, updates the CRM and logs everything, visible in a live dashboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bricolage.variable} ${instrument.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen">
        <header className="sticky top-0 z-50 border-b border-line/60 bg-bg/85 backdrop-blur">
          <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto] items-center px-5 sm:px-8 lg:grid-cols-[1fr_auto_1fr]">
            <Link
              href="/"
              className="flex items-center gap-2 no-underline"
              aria-label="Home"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden
              >
                <rect x="3" y="7" width="3" height="6" rx="1.5" fill="#2455f2" />
                <rect
                  x="8.5"
                  y="4"
                  width="3"
                  height="12"
                  rx="1.5"
                  fill="#0a102e"
                />
                <rect x="14" y="6" width="3" height="8" rx="1.5" fill="#2455f2" />
              </svg>
              <span className="text-lg font-semibold tracking-tight text-fg">
                Voice{" "}
                <span className="serif-accent text-accent">Booking</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
              <Link
                href="/how-it-works"
                className="text-sm font-medium text-fg no-underline opacity-80 hover:opacity-100"
              >
                How it works
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-fg no-underline opacity-80 hover:opacity-100"
              >
                Dashboard
              </Link>
              <Link
                href="/demo"
                className="text-sm font-medium text-fg no-underline opacity-80 hover:opacity-100"
              >
                Call demo
              </Link>
            </nav>

            <div className="flex items-center justify-end gap-3">
              <Link
                href="/demo"
                className="rounded-full bg-fg px-5 py-2 text-sm font-medium text-white no-underline hover:opacity-90"
              >
                Hear a call
              </Link>
            </div>
          </div>

          <nav
            className="flex items-center gap-6 border-t border-line/60 px-5 py-3 sm:px-8 lg:hidden"
            aria-label="Mobile"
          >
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-fg no-underline opacity-80 hover:opacity-100"
            >
              How it works
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-fg no-underline opacity-80 hover:opacity-100"
            >
              Dashboard
            </Link>
            <Link
              href="/demo"
              className="text-sm font-medium text-fg no-underline opacity-80 hover:opacity-100"
            >
              Call demo
            </Link>
          </nav>
        </header>
        {children}
        <footer className="border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
            <p className="font-mono text-xs leading-relaxed text-muted">
              Every number on this site comes from a live query against the
              data. The Twilio SMS step is built but not run live.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
