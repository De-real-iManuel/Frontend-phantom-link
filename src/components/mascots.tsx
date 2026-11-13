/**
 * Original mascot family in the Mark style. Decorative, aria-hidden.
 * Phantom: platform. Byte: protocol inspection. Cipher: cryptographic
 * evidence. Echo: AI agent communication.
 */
type MascotProps = { className?: string };

const BODY = "M9 41V22a15 15 0 0 1 30 0v19l-5-5-5 5-5-5-5 5-5-5z";

function Base({ className, children }: MascotProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true" focusable="false">
      <path d={BODY} className="fill-fg" />
      {children}
    </svg>
  );
}

export function Phantom({ className }: MascotProps) {
  return (
    <Base className={className}>
      <circle cx="18" cy="22" r="3" className="fill-bg" />
      <circle cx="30" cy="22" r="3" className="fill-signal" />
    </Base>
  );
}

/** Byte wears square inspection lenses. */
export function Byte({ className }: MascotProps) {
  return (
    <Base className={className}>
      <rect x="13" y="18" width="10" height="8" className="stroke-bg" strokeWidth="2" />
      <rect x="25" y="18" width="10" height="8" className="stroke-bg" strokeWidth="2" />
      <path d="M23 22h2" className="stroke-bg" strokeWidth="2" />
      <circle cx="30" cy="22" r="2" className="fill-signal" />
      <circle cx="18" cy="22" r="1.5" className="fill-bg" />
    </Base>
  );
}

/** Cipher carries a key. */
export function Cipher({ className }: MascotProps) {
  return (
    <Base className={className}>
      <circle cx="18" cy="21" r="3" className="fill-bg" />
      <circle cx="30" cy="21" r="3" className="fill-signal" />
      <circle cx="20" cy="32" r="3" className="stroke-bg" strokeWidth="2" />
      <path d="M23 32h9m-3 0v3m-3-3v2" className="stroke-bg" strokeWidth="2" strokeLinecap="round" />
    </Base>
  );
}

/** Echo emits signal arcs. */
export function Echo({ className }: MascotProps) {
  return (
    <Base className={className}>
      <circle cx="18" cy="22" r="3" className="fill-bg" />
      <circle cx="30" cy="22" r="3" className="fill-signal" />
      <path d="M40 14a10 10 0 0 1 0 12M44 11a15 15 0 0 1 0 18" className="stroke-signal" strokeWidth="2" strokeLinecap="round" />
    </Base>
  );
}

export const MASCOTS = [
  { name: "Phantom", role: "The platform", Art: Phantom },
  { name: "Byte", role: "Protocol inspection", Art: Byte },
  { name: "Cipher", role: "Cryptographic evidence", Art: Cipher },
  { name: "Echo", role: "AI agent communication", Art: Echo },
] as const;
