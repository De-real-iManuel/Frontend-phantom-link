import { Link } from "@tanstack/react-router";
import { focus } from "@/components/home/hero";
import { MASCOTS } from "@/components/mascots";

const blocks = [
  {
    id: "provenance",
    label: "Traceability",
    title: "Every reading remembers how it was made.",
    body: "A provenance record binds a value to the request, the response bytes and the decoder used, and fingerprints them with a cryptographic hash. Anyone reviewing a reading can ask where it came from and check that the bytes still match.",
    note: "In this build the record is generated in the browser and labelled simulated. Backend signing and storage are still required.",
    mascot: "Cipher",
  },
  {
    id: "mcp",
    label: "For AI agents",
    title: "MCP makes telemetry something an agent can ask for.",
    body: "Instead of another dashboard, agents get tools. They can read a named point and receive the value with its unit and its evidence, rather than guessing from a raw register number.",
    note: "The MCP service is not connected here. The demo shows a scripted tool call.",
    mascot: "Echo",
  },
  {
    id: "operators",
    label: "For operators",
    title: "Operators inspect the same data, frame by frame.",
    body: "The dashboard lists devices, raw frames with their checksum results, decoded telemetry, provenance records and agent activity, so a human can follow any reading back to its bytes.",
    note: "The dashboard runs on synthetic data and is clearly labelled.",
    mascot: "Byte",
  },
];

export function Evidence() {
  return (
    <section id="evidence" className="scroll-mt-20 border-t border-line" aria-labelledby="evidence-title">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
        <h2 id="evidence-title" className="sr-only">
          Provenance, MCP and operator inspection
        </h2>
        <div className="grid gap-px bg-line md:grid-cols-3">
          {blocks.map((b) => {
            const M = MASCOTS.find((m) => m.name === b.mascot)!.Art;
            return (
              <article key={b.id} id={b.id} className="scroll-mt-20 bg-bg p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs tracking-widest text-muted uppercase">{b.label}</p>
                  <M className="size-8 opacity-90" />
                </div>
                <h3 className="mt-4 text-lg font-medium">{b.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{b.body}</p>
                <p className="mt-4 font-mono text-xs leading-relaxed text-pumpkin">{b.note}</p>
              </article>
            );
          })}
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/demo"
            className={`inline-flex h-11 items-center justify-center bg-signal px-5 text-sm font-medium text-bg ${focus}`}
          >
            Try the two-minute demo
          </Link>
          <Link
            to="/devices"
            className={`inline-flex h-11 items-center justify-center border border-line px-5 text-sm text-fg hover:border-signal ${focus}`}
          >
            Browse documented devices
          </Link>
        </div>
      </div>
    </section>
  );
}
