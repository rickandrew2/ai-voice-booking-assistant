/*
 * A ringing phone: the handset wobbles like a handset vibrating on a desk
 * while two sound arcs pulse outward. Pure svg and css, no images. Global
 * keyframes live in app/globals.css.
 */

export function PhoneRinger({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      className={className}
      role="img"
      aria-label="Phone ringing"
    >
      <g className="phone-shake">
        <path
          d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
          transform="translate(7 14) scale(1.2)"
          stroke="currentColor"
          strokeWidth="2"
        />
      </g>
      <circle
        className="ring-pulse"
        cx="35"
        cy="9"
        r="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        className="ring-pulse ring-pulse-late"
        cx="35"
        cy="9"
        r="5"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
