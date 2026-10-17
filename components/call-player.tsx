"use client";

import { useRef, useState } from "react";

// Equalizer bars around the recording. The animation plays only while the
// audio is actually playing, so the visual reflects the real state of the
// player instead of pretending the call is live.
export function CallPlayer({ src }: { src: string }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const bars = 28;

  return (
    <div className="border border-line bg-surface p-5 sm:p-6">
      <div className="flex h-16 items-center justify-center gap-1" aria-hidden>
        {Array.from({ length: bars }).map((_, i) => (
          <span
            key={i}
            className={`wave-bar w-1.5 rounded-full bg-lime/80 ${playing ? "" : "wave-still"}`}
            style={{ animationDelay: `${(i % 7) * 0.12}s` }}
          />
        ))}
      </div>
      {src ? (
        <audio
          ref={audioRef}
          controls
          preload="none"
          src={src}
          className="mt-4 w-full"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        >
          <track kind="captions" />
        </audio>
      ) : (
        <p className="mt-4 text-muted">No recording URL in the payload.</p>
      )}
      <p className="mt-3 font-mono text-xs text-muted">
        The player follows the browser. It animates only while the recording is
        playing. If the URL has expired, the transcript below is the same call.
      </p>
    </div>
  );
}
