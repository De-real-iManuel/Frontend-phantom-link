import { useEffect, useMemo, useRef, useState } from "react";
import { SimulationBanner } from "@/components/simulation-banner";
import { Phantom } from "@/components/mascots";
import { TinyGhost } from "@/components/ghost-effects";
import { devices } from "@/lib/mock-telemetry";
import {
  buildProvenance,
  buildScenario,
  DEMO_STEPS,
  type SimProvenance,
} from "@/lib/demo/resurrect";
import { MASCOT_FOR } from "@/components/demo/mascot-for";
import {
  BytesPanel,
  ConnectPanel,
  CrcPanel,
  DecodePanel,
  McpPanel,
  ProvenancePanel,
  StepShell,
  TelemetryPanel,
} from "@/components/demo/step-panels";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";
const btn = `inline-flex h-11 items-center justify-center px-5 text-sm font-medium transition-transform duration-150 active:scale-[0.96] ${focus}`;

export function ResurrectDemo() {
  const [deviceId, setDeviceId] = useState(devices[0].id);
  const [corrupt, setCorrupt] = useState(false);
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [prov, setProv] = useState<SimProvenance | null>(null);
  const [provError, setProvError] = useState(false);
  const endRef = useRef<HTMLLIElement>(null);

  const scenario = useMemo(() => buildScenario(deviceId, corrupt), [deviceId, corrupt]);
  const rejected = !scenario.parsed.crcValid;
  const lastStep = rejected ? 2 : DEMO_STEPS.length - 1;
  const started = step >= 0;
  const done = step >= lastStep;

  const wantsProv = step >= 4;
  useEffect(() => {
    setProv(null);
    setProvError(false);
    if (!wantsProv || rejected) return;
    let live = true;
    buildProvenance(scenario)
      .then((p) => live && setProv(p))
      .catch(() => live && setProvError(true));
    return () => {
      live = false;
    };
  }, [wantsProv, scenario, rejected]);

  useEffect(() => {
    if (!playing) return;
    if (done) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), 1600);
    return () => window.clearTimeout(t);
  }, [playing, step, done]);

  useEffect(() => {
    if (!started) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    endRef.current?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [step, started]);

  function reset() {
    setPlaying(false);
    setStep(-1);
  }

  function pick(id: string) {
    setDeviceId(id);
    reset();
  }

  const visible = DEMO_STEPS.slice(0, step + 1);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <SimulationBanner />

      <section aria-labelledby="pick-title" className="grid gap-3">
        <h2 id="pick-title" className="text-lg font-medium">
          1. Choose a silent machine
        </h2>
        <div role="radiogroup" aria-labelledby="pick-title" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {devices.map((d) => {
            const on = d.id === deviceId;
            return (
              <button
                key={d.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => pick(d.id)}
                className={`flex min-h-11 items-center justify-between gap-2 border px-3 py-2 text-left text-sm transition-colors duration-200 ${focus} ${on ? "border-signal text-fg" : "border-line text-muted hover:border-muted"}`}
              >
                <span>
                  {d.name}
                  <span className="block font-mono text-xs text-muted">{d.asset} / {d.bus}</span>
                </span>
                {d.status === "offline" ? <TinyGhost className="size-5 shrink-0 text-fg/60" /> : null}
                <span className="sr-only">{d.status === "offline" ? "offline" : ""}</span>
              </button>
            );
          })}
        </div>
        <label className="flex min-h-11 items-center gap-3 text-sm text-muted">
          <input
            type="checkbox"
            checked={corrupt}
            onChange={(e) => {
              setCorrupt(e.target.checked);
              reset();
            }}
            className={`size-5 accent-[#ff8a2b] ${focus}`}
          />
          Damage one byte on the wire (shows the invalid frame path)
        </label>
        <div className="flex flex-wrap gap-2">
          {!started ? (
            <button type="button" onClick={() => setStep(0)} className={`${btn} bg-signal text-bg`}>
              Resurrect device
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={done}
                onClick={() => {
                  setPlaying(false);
                  setStep((s) => Math.min(s + 1, lastStep));
                }}
                className={`${btn} bg-signal text-bg disabled:opacity-40`}
              >
                Next step
              </button>
              <button
                type="button"
                disabled={done}
                aria-pressed={playing}
                onClick={() => setPlaying((p) => !p)}
                className={`${btn} border border-line text-fg hover:border-signal disabled:opacity-40`}
              >
                {playing ? "Pause" : "Play through"}
              </button>
              <button type="button" onClick={reset} className={`${btn} border border-line text-fg hover:border-signal`}>
                Start over
              </button>
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="run-title" aria-live="polite" className="grid grid-cols-[minmax(0,1fr)] gap-3">
        <h2 id="run-title" className="text-lg font-medium">
          2. Watch what PhantomLink does
        </h2>
        {!started ? (
          <div className="flex items-center gap-4 border border-dashed border-line p-6">
            <Phantom className="ghost-float size-12 shrink-0 opacity-80" />
            <p className="text-sm text-muted">
              Nothing has been resurrected yet. Press Resurrect device. Every step below is scripted and
              labelled simulated. No hardware is read.
            </p>
          </div>
        ) : (
          <ol className="grid grid-cols-[minmax(0,1fr)] gap-3">
            {visible.map((st, i) => (
              <StepShell
                key={st.id}
                index={i}
                title={st.title}
                plain={st.plain}
                tone={st.id === "crc" && rejected ? "warn" : "signal"}
                mascot={MASCOT_FOR[st.id as keyof typeof MASCOT_FOR]}
                technical={technicalFor(st.id)}
              >
                {st.id === "connect" && <ConnectPanel s={scenario} />}
                {st.id === "bytes" && <BytesPanel s={scenario} />}
                {st.id === "crc" && <CrcPanel s={scenario} />}
                {st.id === "decode" && <DecodePanel s={scenario} />}
                {st.id === "provenance" &&
                  (provError ? (
                    <p role="alert" className="text-sm text-pumpkin">Could not compute the hash in this browser.</p>
                  ) : (
                    <ProvenancePanel p={prov} />
                  ))}
                {st.id === "telemetry" && <TelemetryPanel s={scenario} />}
                {st.id === "mcp" && <McpPanel s={scenario} p={prov} />}
              </StepShell>
            ))}
            <li ref={endRef} aria-hidden="true" />
          </ol>
        )}
        {started && rejected && done ? (
          <p role="alert" className="border border-pumpkin p-3 text-sm text-pumpkin">
            The frame failed its checksum, so PhantomLink refuses to decode it. Nothing is recorded and no
            agent sees it. Start over without the damaged byte to see the full path.
          </p>
        ) : null}
        {started && !rejected && done ? (
          <p className="border border-signal/60 p-3 text-sm text-signal" role="status">
            Complete. A silent machine now speaks to an AI agent, with evidence. All of it simulated.
          </p>
        ) : null}
      </section>
    </div>
  );
}

function technicalFor(id: string) {
  switch (id) {
    case "connect":
      return "Scripted sequence. No serial port is opened by this page.";
    case "bytes":
      return "Modbus RTU, function 0x03 (read holding registers). Response layout: address, function, byte count, data, CRC low, CRC high.";
    case "crc":
      return "CRC-16/Modbus, polynomial 0xA001 reflected, init 0xFFFF. Computed by src/lib/modbus/crc16.ts, which is the real algorithm.";
    case "decode":
      return "Raw 16-bit value times a demonstration scale of 0.01. The scale is invented for this demo and is not a manufacturer register map.";
    case "provenance":
      return "SHA-256 over request bytes, response bytes, register and decoded value, computed in this browser. It is not signed or stored; a backend must do that.";
    case "telemetry":
      return "Other rows are deterministic synthetic values from src/lib/mock-telemetry.ts.";
    case "mcp":
      return "Shows the shape of a read_asset tool call. No MCP server is contacted.";
    default:
      return null;
  }
}
