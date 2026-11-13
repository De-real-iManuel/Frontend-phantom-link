import { useState } from "react";
import { Wordmark } from "@/components/mark";
import { MASCOTS } from "@/components/mascots";
import { focus } from "@/components/home/hero";

export function Footer() {
  const [boo, setBoo] = useState(false);
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8">
        <ul className="flex flex-wrap gap-x-8 gap-y-3" aria-label="Mascots">
          {MASCOTS.map(({ name, role, Art }) => (
            <li key={name} className="flex items-center gap-3">
              <Art className="size-8" />
              <span className="text-sm">
                {name}
                <span className="block font-mono text-xs text-muted">{role}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Wordmark markClass="size-6" />
          <p className="font-mono text-xs text-muted">The Haunted Industrial Network. Kiroween 2026 demonstration.</p>
          <button
            type="button"
            aria-expanded={boo}
            onClick={() => setBoo((v) => !v)}
            className={`inline-flex h-11 items-center px-3 font-mono text-xs text-muted hover:text-fg ${focus}`}
          >
            {boo ? "Nothing here is haunted. It is all simulated." : "Press for a boo"}
          </button>
        </div>
      </div>
    </footer>
  );
}
