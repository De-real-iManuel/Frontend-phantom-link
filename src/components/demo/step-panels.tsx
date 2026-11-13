import { useState, type ReactNode } from "react";
import { SimBadge } from "@/components/simulation-banner";
import { Flashlight, TinyGhost } from "@/components/ghost-effects";
import { devices, seriesSpecs } from "@/lib/mock-telemetry";
import { toHexByte } from "@/lib/modbus/crc16";
import {
  DEMO_REGISTER,
  DEMO_SCALE,
  mcpExchange,
  type DemoScenario,
  type SimProvenance,
} from "@/lib/demo/resurrect";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";

export function StepShell({
  index,
  title,
  plain,
  tone = "signal",
  mascot,
  children,
  technical,
}: {
  index: number;
  title: string;
  plain: string;
  tone?: "signal" | "warn";
  mascot?: ReactNode;
  children: ReactNode;
  technical?: ReactNode;
}) {
  return (
    <li
      className={`rise border bg-surface p-4 md:p-5 ${tone === "warn" ? "border-pumpkin" : "border-line"}`}
      aria-labelledby={`step-${index}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className={`font-mono text-xs ${tone === "warn" ? "text-pumpkin" : "text-signal"}`}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 id={`step-${index}`} className="text-lg font-medium">
          {title}
        </h3>
        <SimBadge />
        {mascot ? <span className="ml-auto size-8">{mascot}</span> : null}
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{plain}</p>
      <div className="mt-4">{children}</div>
      {technical ? (
        <details className="mt-4 border-t border-line pt-3">
          <summary className={`inline-flex min-h-11 cursor-pointer items-center font-mono text-xs text-muted hover:text-fg ${focus}`}>
            Technical details
          </summary>
          <div className="mt-2 font-mono text-xs leading-relaxed text-muted">{technical}</div>
        </details>
      ) : null}
    </li>
  );
}

export function Bytes({ bytes, label, bad = -1 }: { bytes: number[]; label: string; bad?: number }) {
  return (
    <div>
      <p className="font-mono text-xs text-muted">{label}</p>
      <p className="mt-1 flex flex-wrap gap-1 font-mono text-sm" aria-label={`${label}: ${bytes.map(toHexByte).join(" ")}`}>
        {bytes.map((b, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`border px-1.5 py-0.5 ${i === bad ? "border-pumpkin text-pumpkin" : i >= bytes.length - 2 ? "border-signal/50 text-signal" : "border-line text-fg"}`}
          >
            {toHexByte(b)}
          </span>
        ))}
      </p>
    </div>
  );
}

export function ConnectPanel({ s }: { s: DemoScenario }) {
  return (
    <>
      <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-fg">
        {s.connectLines.map((l) => `> ${l}`).join("\n")}
      </pre>
      {s.device.status === "offline" ? (
        <p className="mt-3 flex items-center gap-2 font-mono text-xs text-muted">
          <TinyGhost className="size-5 text-fg/60" /> This device shows as offline on the dashboard. The
          demonstration revives it with scripted bytes only.
        </p>
      ) : null}
    </>
  );
}

export function BytesPanel({ s }: { s: DemoScenario }) {
  return (
    <div className="grid gap-3">
      <Bytes bytes={s.request} label="Request from PhantomLink (simulated)" />
      <Bytes bytes={s.received} label="Response from the device (simulated)" bad={s.corrupted ? 3 : -1} />
    </div>
  );
}

export function CrcPanel({ s }: { s: DemoScenario }) {
  const ok = s.parsed.crcValid;
  return (
    <div className={`border p-3 ${ok ? "border-signal/60" : "border-pumpkin"}`} role="status">
      <p className={`font-mono text-sm ${ok ? "text-signal" : "text-pumpkin"}`}>
        {ok ? "Checksum matches. Frame accepted." : "Checksum mismatch. Frame rejected."}
      </p>
      <dl className="mt-2 grid grid-cols-[8rem_minmax(0,1fr)] gap-y-1 font-mono text-xs">
        <dt className="text-muted">carried in frame</dt>
        <dd>{s.parsed.crcCarried}</dd>
        <dt className="text-muted">computed here</dt>
        <dd>{s.parsed.crcComputed}</dd>
      </dl>
    </div>
  );
}

export function DecodePanel({ s }: { s: DemoScenario }) {
  const [shown, setShown] = useState(false);
  const notes = `register 0x${toHexByte(DEMO_REGISTER)}  raw ${s.rawValue} x ${DEMO_SCALE} = ${s.value.toFixed(2)} ${s.unit}`;
  return (
    <div>
      <p className="font-mono text-2xl text-fg tabular-nums">
        {s.value.toFixed(2)} <span className="text-base text-muted">{s.unit}</span>
      </p>
      <p className="mt-1 text-sm text-muted">{s.pointName} on {s.device.asset}</p>
      <p className="mt-2 font-mono text-xs text-pumpkin">Demonstration register, not a manufacturer map.</p>
      <Flashlight
        hidden={<span className="block p-2">{`${notes} `.repeat(6)}</span>}
        className="mt-3 min-h-14 border border-line bg-bg"
      >
        <p className="relative p-2 font-mono text-xs text-muted">
          {shown ? notes : "Move the light over this box, or use the button, to reveal the register notes."}
        </p>
      </Flashlight>
      <button
        type="button"
        aria-pressed={shown}
        onClick={() => setShown((v) => !v)}
        className={`mt-2 inline-flex h-11 items-center border border-line px-3 font-mono text-xs hover:border-signal ${focus}`}
      >
        {shown ? "Hide register notes" : "Reveal register notes"}
      </button>
    </div>
  );
}

export function ProvenancePanel({ p }: { p: SimProvenance | null }) {
  if (!p) return <p className="font-mono text-xs text-muted" role="status">Computing SHA-256 over the simulated payload...</p>;
  return (
    <dl className="grid grid-cols-[7rem_minmax(0,1fr)] gap-y-1 font-mono text-xs">
      <dt className="text-muted">event</dt>
      <dd>{p.eventId}</dd>
      <dt className="text-muted">algorithm</dt>
      <dd>{p.algorithm}</dd>
      <dt className="text-muted">hash</dt>
      <dd className="break-all">{p.hash}</dd>
      <dt className="text-muted">status</dt>
      <dd className="text-pumpkin">simulated record, not anchored to a backend</dd>
    </dl>
  );
}

export function TelemetryPanel({ s }: { s: DemoScenario }) {
  return (
    <ul className="border-t border-line font-mono text-sm">
      {devices.map((d) => {
        const spec = seriesSpecs[d.id];
        const mine = d.id === s.device.id;
        return (
          <li
            key={d.id}
            className={`grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-line py-2 ${mine ? "text-signal" : "text-muted"}`}
          >
            <span>
              {d.asset} / {spec.point} {mine ? "(new reading)" : ""}
            </span>
            <span className="tabular-nums">
              {(mine ? s.value : spec.base).toFixed(2)} {spec.unit}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function McpPanel({ s, p }: { s: DemoScenario; p: SimProvenance | null }) {
  if (!p) return null;
  const ex = mcpExchange(s, p);
  return (
    <div>
      <p className="font-mono text-xs text-pumpkin" role="status">
        Simulated. MCP service not connected.
      </p>
      <pre className="mt-2 overflow-x-auto bg-bg p-3 font-mono text-xs leading-relaxed text-fg">
        {`agent > ${JSON.stringify(ex.request)}\n\n${JSON.stringify(ex.response, null, 2)}`}
      </pre>
    </div>
  );
}

