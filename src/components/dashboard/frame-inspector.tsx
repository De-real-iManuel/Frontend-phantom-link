import { useState } from "react";
import { SimBadge } from "@/components/simulation-banner";
import { parseFrame, type FrameField } from "@/lib/modbus/frame";
import type { FrameStatus, RawFrame } from "@/lib/data/contracts";
import { formatClock } from "@/lib/mock-telemetry";
import type { DashboardData } from "./use-dashboard-data";
import { Panel, StateGate, focus } from "./common";

const fieldTone: Record<FrameField, string> = {
  address: "border-signal text-signal",
  function: "border-pumpkin text-pumpkin",
  register: "border-fg text-fg",
  data: "border-muted text-muted",
  crc: "border-line bg-bg text-fg",
};

const fieldLabel: Record<FrameField, string> = {
  address: "Slave address",
  function: "Function code",
  register: "Register address",
  data: "Data",
  crc: "CRC (low byte, high byte)",
};

const statusLabel: Record<FrameStatus, string> = {
  ok: "CRC valid",
  "crc-error": "CRC mismatch, rejected",
  exception: "Exception response, CRC valid",
  timeout: "Timeout",
  unparsed: "Too short to parse",
};

function hex(n: number | null, width = 2) {
  return n == null ? "n/a" : `0x${n.toString(16).toUpperCase().padStart(width, "0")}`;
}

function Detail({ frame }: { frame: RawFrame }) {
  const bytes = frame.hexBytes.map((b) => parseInt(b, 16));
  const parsed = parseFrame(bytes);
  const bad = parsed.status === "crc-error";
  const good = parsed.status === "ok";
  return (
    <div className="grid gap-4 p-4">
      <div
        className={`border p-3 ${bad ? "border-pumpkin" : good ? "border-signal motion-safe:animate-pulse" : "border-line"}`}
      >
        <p className="mb-2 font-mono text-xs text-muted">
          Frame {frame.id} <SimBadge className="ml-2" />
        </p>
        <ol className="flex flex-wrap gap-1" aria-label="Frame bytes grouped by field">
          {parsed.segments.map((seg) => (
            <li
              key={`${seg.field}-${seg.start}`}
              className={`border px-1.5 py-1 font-mono text-sm ${fieldTone[seg.field]}`}
              title={fieldLabel[seg.field]}
            >
              <span className="sr-only">{fieldLabel[seg.field]}: </span>
              {frame.hexBytes.slice(seg.start, seg.end).join(" ")}
            </li>
          ))}
        </ol>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-muted">
          {(["address", "function", "register", "data", "crc"] as FrameField[]).map((f) => (
            <li key={f}>
              <span className={`mr-1 inline-block size-2 border ${fieldTone[f]}`} aria-hidden="true" />
              {fieldLabel[f]}
            </li>
          ))}
        </ul>
      </div>
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          ["Slave address", hex(frame.slaveAddress)],
          ["Function code", hex(frame.functionCode)],
          ["Register address", frame.registerAddress == null ? "n/a (not in this frame type)" : hex(frame.registerAddress, 4)],
          ["CRC in frame", frame.crcExpected ?? "n/a"],
          ["CRC computed here", frame.crcComputed ?? "n/a"],
          ["Validation", statusLabel[frame.status]],
        ].map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="font-mono text-xs text-muted">{k}</dt>
            <dd className={`mt-0.5 text-sm break-words ${k === "Validation" && bad ? "text-pumpkin" : ""}`}>
              {v}
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-muted">
        The CRC is a real CRC-16/Modbus calculation run in this browser over a generated frame. The frame
        was not read from a device, and register content is demonstration only, not from any manufacturer
        register map.
      </p>
    </div>
  );
}

export function FrameInspector({ data }: { data: DashboardData }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  return (
    <Panel id="frames" title="Raw frame inspector" right={<SimBadge />}>
      <StateGate state={data.frames} emptyText="No frames captured.">
        {(frames) => {
          const frame = frames.find((f) => f.id === selectedId) ?? frames[0];
          return (
            <div className="grid min-w-0 gap-px bg-line xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
              <div className="min-w-0 overflow-x-auto bg-surface">
                <table className="w-full min-w-[22rem] border-collapse font-mono text-xs">
                  <caption className="sr-only">Generated frames. Select a row to inspect it.</caption>
                  <thead>
                    <tr className="text-left text-muted">
                      <th scope="col" className="px-3 py-2 font-normal">Time</th>
                      <th scope="col" className="px-3 py-2 font-normal">Frame</th>
                      <th scope="col" className="px-3 py-2 font-normal">Validation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {frames.map((f) => (
                      <tr key={f.id} className={`border-t border-line ${f.id === frame.id ? "bg-bg" : ""}`}>
                        <td className="px-3 py-1 text-muted tabular-nums">{formatClock(f.timestamp)}</td>
                        <td className="px-1 py-1">
                          <button
                            type="button"
                            aria-pressed={f.id === frame.id}
                            onClick={() => setSelectedId(f.id)}
                            className={`min-h-11 px-2 text-left underline-offset-2 hover:underline ${focus}`}
                          >
                            {f.id}
                          </button>
                        </td>
                        <td className={`px-3 py-1 ${f.status === "crc-error" ? "text-pumpkin" : "text-muted"}`}>
                          {f.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="min-w-0 bg-surface" aria-live="off">
                <Detail frame={frame} />
              </div>
            </div>
          );
        }}
      </StateGate>
    </Panel>
  );
}
