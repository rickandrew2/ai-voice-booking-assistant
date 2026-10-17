"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { PhoneRinger } from "./phone-ringer";

const ease = [0.22, 1, 0.36, 1] as const;

export function SiteHero() {
  return (
    <section className="relative h-[calc(100dvh-11.5rem)] min-h-[34rem] overflow-hidden sm:h-[calc(100dvh-10.5rem)]">
      <video
        src="/video/call-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover object-[68%_center]"
        aria-hidden
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(10,20,53,0.95) 10%, rgba(10,20,53,0.8) 48%, rgba(22,38,111,0.3) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-44"
        style={{
          background:
            "linear-gradient(to top, rgba(10,20,53,0.92), transparent)",
        }}
      />

      <div className="relative mx-auto flex h-full max-w-6xl flex-col px-5 pb-6 sm:px-8">
        {/* type specimen headline: line 1 left, line 2 shifted right */}
        <div className="flex flex-1 flex-col justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease }}
            className="text-5xl leading-[0.98] font-semibold tracking-tight text-white sm:text-7xl"
          >
            <span className="block">The line answers itself,</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18, ease }}
            className="mt-1 flex flex-wrap items-center justify-end gap-x-5 sm:pl-24"
          >
            <PhoneRinger className="h-10 w-10 shrink-0 text-[#9db4ff] sm:h-12 sm:w-12" />
            <h1 className="text-5xl leading-[1.02] font-semibold tracking-tight text-white sm:text-7xl">
              the paperwork{" "}
              <span className="serif-accent text-[#9db4ff]">just happens</span>.
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32, ease }}
            className="mt-7 max-w-md text-sm leading-relaxed text-white/75 sm:text-base"
          >
            No phone trees. No unheard voicemails. After each call, the slot is
            booked and the record is written, and this site lets you check
            both.
          </motion.p>
        </div>

        {/* bottom strip */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.63, delay: 0.42, ease }}
          className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/15 pt-4"
        >
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link
              href="/demo"
              className="rounded-full bg-[#dbe6ff] px-5 py-2.5 font-mono text-xs font-medium text-[#0a1435] no-underline hover:bg-white sm:text-sm"
            >
              hear a real call
            </Link>
            <Link
              href="/dashboard"
              className="font-mono text-xs text-white/80 no-underline hover:text-white sm:text-sm"
            >
              see the records →
            </Link>
          </div>
          <span aria-hidden className="flex items-end gap-1">
            {[10, 22, 14, 30, 8].map((h, i) => (
              <span
                key={i}
                className="wave-bar w-1 rounded-full bg-white/40"
                style={{ height: Math.max(8, h), animationDelay: `${i * 0.14}s` }}
              />
            ))}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
