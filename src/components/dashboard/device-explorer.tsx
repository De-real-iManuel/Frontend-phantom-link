import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Device3D, type DevicePart } from "@/components/device-view";
import { SimBadge } from "@/components/simulation-banner";
import { catalogue, orNotVerified, STATUS_LABEL } from "@/lib/devices/catalogue";
import { devices as mockDevices, partDetails } from "@/lib/mock-telemetry";
import type { ConnectionState } from "@/lib/data/contracts";
import type { DashboardData } from "./use-dashboard-data";
import { Panel, StateGate, Th, focus } from "./common";

const dot: Record<ConnectionState, string> = {
  connected: "bg-signal",
  connecting: "bg-pumpkin",
  degraded: "bg-pumpkin",
  disconnected: "bg-muted",
  unavailable: "bg-muted",
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm break-words">{value}</dd>
    </div>
  );
}

export function DeviceExplorer({ data }: { data: DashboardData }) {
  const [selected, setSelected] = useState<string>("sim-a");
  const [part, setPart] = useState<DevicePart | null>(null);

  return (
    <div className="grid min-w-0 gap-4">
      <Panel id="devices" title="Device explorer" right={<SimBadge />}>
        <StateGate state={data.devices} emptyText="No devices reported.">
          {(list) => {
            const device = list.find((d) => d.id === selected) ?? list[0];
            const mock = mockDevices.find((m) => m.id === device.id);
            return (
              <div className="grid min-w-0 gap-px bg-line lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
                <ul className="bg-surface" aria-label="Devices">
                  {list.map((d) => (
                    <li key={d.id} className="border-t border-line first:border-t-0">
                      <button
                        type="button"
                        aria-pressed={d.id === device.id}
                        onClick={() => {
                          setSelected(d.id);
                          setPart(null);
                        }}
                        className={`flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-bg ${d.id === device.id ? "bg-bg" : ""} ${focus}`}
                      >
                        <span className="min-w-0">
                          <span className="block text-sm">{d.name}</span>
                          <span className="block font-mono text-xs text-muted">
                            {d.interface ?? "Interface not verified"} · {d.telemetryPoints} points
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2 font-mono text-xs text-muted">
                          <span className={`size-2 rounded-full ${dot[d.connection]}`} aria-hidden="true" />
                          {d.connection}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="min-w-0 bg-surface">
                  <dl className="grid grid-cols-2 gap-4 p-4">
                    <Field label="Identity" value={device.name} />
                    <Field label="Manufacturer" value={orNotVerified(device.manufacturer)} />
                    <Field label="Model" value={orNotVerified(device.model)} />
                    <Field label="Protocol" value={orNotVerified(device.protocol)} />
                    <Field label="Interface" value={orNotVerified(device.interface)} />
                    <Field label="Connection" value={`${device.connection} (simulated)`} />
                    <Field label="Telemetry points" value={String(device.telemetryPoints)} />
                    <Field label="Asset" value={mock?.asset ?? "Not verified"} />
                  </dl>
                  {mock ? (
                    <>
                      <Device3D selected={part} onSelect={setPart} className="h-52 border-t border-line" />
                      <div className="border-t border-line p-4" aria-live="polite">
                        {part ? (
                          <>
                            <p className="font-mono text-sm text-signal">{partDetails(mock, part).title}</p>
                            <p className="mt-1 text-sm text-muted">{partDetails(mock, part).detail}</p>
                          </>
                        ) : (
                          <p className="text-sm text-muted">
                            Illustrative gateway. Drag to turn it, or select a port for details.
                          </p>
                        )}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            );
          }}
        </StateGate>
      </Panel>

      <Panel
        id="catalogue"
        title="Documented devices (not connected)"
        right={
          <Link to="/devices" className={`font-mono text-xs text-signal underline ${focus}`}>
            Open catalogue
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse font-mono text-xs">
            <caption className="sr-only">
              Real device identities from the catalogue. None is connected to PhantomLink.
            </caption>
            <thead>
              <tr className="text-left text-muted">
                <Th>Manufacturer</Th>
                <Th>Model</Th>
                <Th>Interface</Th>
                <Th>Protocol</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {catalogue.map((d) => (
                <tr key={d.id} className="border-t border-line align-top">
                  <td className="px-3 py-2">{d.manufacturer}</td>
                  <td className="px-3 py-2">{d.model}</td>
                  <td className="px-3 py-2 text-muted">{orNotVerified(d.physicalInterface)}</td>
                  <td className="px-3 py-2 text-muted">{orNotVerified(d.protocol)}</td>
                  <td className="px-3 py-2 text-muted">{STATUS_LABEL[d.integrationStatus]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
