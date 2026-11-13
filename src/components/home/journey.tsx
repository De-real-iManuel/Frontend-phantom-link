import { useState } from "react";
import { focus } from "@/components/home/hero";

type Stage = { name: string; body: string; status: string; detail: string };

const stages: Stage[] = [
  {
    name: "Legacy device",
    body: "A meter, controller or gateway that talks over a serial bus and has no modern interface.",
    status: "Shown as simulated devices",
    detail: "Demonstration devices are synthetic. No physical device is connected to this site.",
  },
  {
    name: "Protocol reconstruction",
    body: "PhantomLink rebuilds the request and response bytes of the conversation so the exchange can be inspected.",
    status: "Modbus RTU, in the demonstration",
    detail: "The frontend builds Modbus RTU read requests and exception responses and parses frames by position.",
  },
  {
    name: "Frame validation",
    body: "Each frame carries a checksum. A damaged frame is rejected before anything is decoded.",
    status: "Real CRC-16/Modbus algorithm",
    detail: "The checksum shown in the demo is computed live in your browser from the frame bytes.",
  },
  {
    name: "Device-aware decoding",
    body: "A validated register becomes a named reading with a unit, using what is known about that device.",
    status: "Demonstration register only",
    detail: "The demo decodes one invented register. No manufacturer register map is claimed.",
  },
  {
    name: "Provenance record",
    body: "A cryptographic fingerprint links the reading to the exact bytes behind it, so it can be traced.",
    status: "SHA-256 in browser, record is simulated",
    detail: "Signing, storage and verification need the backend. The demo labels its record as simulated.",
  },
  {
    name: "MCP",
    body: "Model Context Protocol tools expose readings and their evidence to AI agents in a standard way.",
    status: "Simulated, service not connected",
    detail: "The demo shows the shape of a read_asset tool call and a scripted answer.",
  },
  {
    name: "AI agent",
    body: "An agent asks for a value and gets the number together with where it came from.",
    status: "Simulated exchange",
    detail: "No real agent or model is contacted from this site.",
  },
];

export function Journey() {
  const [active, setActive] = useState(0);
  const stage = stages[active];

  function onKey(e: React.KeyboardEvent<HTMLButtonElement>, i: number) {
    let next = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % stages.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + stages.length) % stages.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = stages.length - 1;
    else return;
    e.preventDefault();
    setActive(next);
    document.getElementById(`stage-${next}`)?.focus();
  }

  return (
    <section id="journey" className="scroll-mt-20 border-t border-line" aria-labelledby="journey-title">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
        <p className="font-mono text-xs tracking-widest text-muted uppercase">The journey of a reading</p>
        <h2 id="journey-title" className="mt-4 max-w-2xl text-2xl font-medium tracking-tight md:text-3xl">
          From a silent register to an answer an agent can trust.
        </h2>
        <p className="mt-3 font-mono text-xs leading-relaxed text-muted">
          Legacy device → Protocol reconstruction → Frame validation → Device-aware decoding → Provenance
          record → MCP → AI agent
        </p>

        <div role="tablist" aria-label="Product journey" className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
          {stages.map((s, i) => (
            <button
              key={s.name}
              id={`stage-${i}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-controls="stage-panel"
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKey(e, i)}
              className={`min-h-14 border px-3 py-2 text-left text-sm transition-colors duration-200 ${focus} ${
                i === active ? "border-signal text-fg" : "border-line text-muted hover:border-muted"
              }`}
            >
              <span className="block font-mono text-xs text-signal">{String(i + 1).padStart(2, "0")}</span>
              {s.name}
            </button>
          ))}
        </div>

        <div
          id="stage-panel"
          role="tabpanel"
          aria-labelledby={`stage-${active}`}
          className="mt-3 border border-line bg-surface p-5 md:p-6"
        >
          <h3 className="text-xl font-medium">{stage.name}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{stage.body}</p>
          <p className="mt-4 font-mono text-xs text-signal">{stage.status}</p>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted">{stage.detail}</p>
        </div>
      </div>
    </section>
  );
}
