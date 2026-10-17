import Image from "next/image";

const logos: { src: string; alt: string }[] = [
  { src: "/logos/Retell.png", alt: "Retell AI" },
  { src: "/logos/N8n.svg", alt: "n8n" },
  { src: "/logos/Supabase.svg", alt: "Supabase" },
  { src: "/logos/Calendar.svg", alt: "Google Calendar" },
  { src: "/logos/HubSpot.svg", alt: "HubSpot" },
  { src: "/logos/Twilio.ico", alt: "Twilio" },
  { src: "/logos/Nextjs.svg", alt: "Next.js" },
];

// Six copies with one uniform gap and matching trailing padding: the -50%
// translate lands exactly on copy 3, so the loop wraps with no blank tail.
// Every logo sits in a fixed-width slot, so widths never jitter while
// images stream in.
export function TechMarquee() {
  const track = [...logos, ...logos, ...logos, ...logos, ...logos, ...logos];

  return (
    <section
      aria-label="Technologies used in this system"
      className="marquee overflow-hidden border-y border-line bg-surface py-5"
    >
      <div className="marquee-track flex w-max items-center gap-14 pr-14">
        {track.map((logo, i) => (
          <span key={`${logo.alt}-${i}`} className="flex w-32 justify-center">
            <Image
              src={logo.src}
              alt={i < logos.length ? logo.alt : ""}
              aria-hidden={i >= logos.length}
              width={30}
              height={24}
              unoptimized
              loading="eager"
              className="h-6 w-auto max-w-28 object-contain opacity-45 grayscale transition duration-200 hover:opacity-100 hover:grayscale-0"
            />
          </span>
        ))}
      </div>
      <p className="sr-only">
        This system is built with Retell AI, n8n, Supabase, Google Calendar,
        HubSpot, Twilio and Next.js.
      </p>
    </section>
  );
}
