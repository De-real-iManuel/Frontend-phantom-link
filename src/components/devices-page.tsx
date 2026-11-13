import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Equipment3D } from "@/components/device-view";
import { SCENES } from "@/components/three/equipment-parts";
import {
  MODEL3D_LABEL,
  REGISTER_MAP_LABEL,
  STATUS_LABEL,
  STATUS_MEANING,
  catalogue,
  filterCatalogue,
  orNotVerified,
  type CatalogueDevice,
  type DeviceCategory,
  type IntegrationStatus,
} from "@/lib/devices/catalogue";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";

const statuses = Object.keys(STATUS_LABEL) as IntegrationStatus[];
const categories = [...new Set(catalogue.map((d) => d.category))] as DeviceCategory[];
const manufacturers = [...new Set(catalogue.map((d) => d.manufacturer))];

function StatusTag({ status }: { status: IntegrationStatus }) {
  const tone = status === "simulated-demo" ? "border-pumpkin text-pumpkin" : "border-line text-muted";
  return (
    <span className={`inline-block border px-1.5 py-0.5 font-mono text-[10px] tracking-widest uppercase ${tone}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function Select<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T | "all";
  onChange: (v: T | "all") => void;
  options: { value: T; label: string }[];
}) {
  return (
    <label className="grid gap-1 font-mono text-xs text-muted">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T | "all")}
        className={`h-11 border border-line bg-surface px-2 text-sm text-fg ${focus}`}
      >
        <option value="all">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  const missing = v === "Not verified";
  return (
    <div className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-3 border-b border-line py-2 text-sm">
      <dt className="font-mono text-xs text-muted">{k}</dt>
      <dd className={missing ? "text-muted italic" : "text-fg"}>{v}</dd>
    </div>
  );
}

function Detail({ device }: { device: CatalogueDevice }) {
  const [selected, setSelected] = useState<string | null>(null);
  const spec = SCENES[device.scene];
  const part = spec.parts.find((p) => p.id === selected) ?? null;
  const is3dIllustrative = device.model3d === "procedural-placeholder";
  return (
    <section aria-labelledby="device-title" className="grid gap-4">
      <div>
        <StatusTag status={device.integrationStatus} />
        <h2 id="device-title" className="mt-2 text-xl font-medium">
          {device.manufacturer} {device.model}
        </h2>
      </div>

      <Equipment3D
        key={device.id}
        kind={device.scene}
        label={`${device.manufacturer} ${device.model}`}
        selected={selected}
        onSelect={setSelected}
      />
      {is3dIllustrative ? (
        <p className="font-mono text-xs text-pumpkin">
          Illustrative model, not manufacturer CAD. Shapes show generic component types only.
        </p>
      ) : null}

      <div>
        <h3 className="font-mono text-xs text-muted">Components</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {spec.parts.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                aria-pressed={selected === p.id}
                onClick={() => setSelected(selected === p.id ? null : p.id)}
                className={`h-11 border px-3 text-sm ${selected === p.id ? "border-signal text-signal" : "border-line text-fg"} ${focus}`}
              >
                {p.label}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 min-h-12 text-sm text-muted" aria-live="polite">
          {part ? part.description : "Select a component, in the model or from this list."}
        </p>
      </div>

      <dl>
        <Row k="Manufacturer" v={device.manufacturer} />
        <Row k="Exact model" v={device.model} />
        <Row k="Variant" v={orNotVerified(device.variant)} />
        <Row k="Category" v={device.category} />
        <Row k="Protocol" v={orNotVerified(device.protocol)} />
        <Row k="Physical interface" v={orNotVerified(device.physicalInterface)} />
        <Row k="Register map" v={REGISTER_MAP_LABEL[device.registerMapStatus]} />
        <Row k="Integration" v={`${STATUS_LABEL[device.integrationStatus]}. ${STATUS_MEANING[device.integrationStatus]}`} />
        <Row k="3D model" v={MODEL3D_LABEL[device.model3d]} />
        <Row k="Asset attribution" v={device.assetAttribution ?? "None required, no third-party asset used"} />
      </dl>

      <p className="text-sm text-muted">{device.note}</p>

      <div className="flex flex-wrap gap-3 text-sm">
        <a href={device.productUrl} target="_blank" rel="noreferrer" className={`text-signal underline ${focus}`}>
          Product page{device.productPageRead ? "" : " (link not verified)"}
        </a>
        {device.documentationUrl ? (
          <a
            href={device.documentationUrl}
            target="_blank"
            rel="noreferrer"
            className={`text-signal underline ${focus}`}
          >
            Documentation
          </a>
        ) : (
          <span className="text-muted italic">Documentation link: Not verified</span>
        )}
      </div>
    </section>
  );
}

export function DevicesPage() {
  const [status, setStatus] = useState<IntegrationStatus | "all">("all");
  const [category, setCategory] = useState<DeviceCategory | "all">("all");
  const [manufacturer, setManufacturer] = useState<string | "all">("all");
  const [activeId, setActiveId] = useState(catalogue[0].id);

  const list = filterCatalogue(catalogue, { status, category, manufacturer });
  const active = list.find((d) => d.id === activeId) ?? list[0] ?? null;

  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader />

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6">
        <div>
          <h1 className="text-2xl font-medium">Devices</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            A catalogue of real industrial hardware we have researched. Appearing here does not mean a device is
            connected or supported. Fields we could not confirm from manufacturer material read Not verified.
          </p>
        </div>

        <section aria-labelledby="legend" className="grid gap-2">
          <h2 id="legend" className="font-mono text-xs text-muted">
            Status legend
          </h2>
          <ul className="grid gap-2 md:grid-cols-2">
            {statuses.map((s) => (
              <li key={s} className="border border-line p-3">
                <StatusTag status={s} />
                <p className="mt-2 text-sm text-muted">{STATUS_MEANING[s]}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Filters" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select
            label="Status"
            value={status}
            onChange={setStatus}
            options={statuses.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
          />
          <Select
            label="Category"
            value={category}
            onChange={setCategory}
            options={categories.map((c) => ({ value: c, label: c }))}
          />
          <Select
            label="Manufacturer"
            value={manufacturer}
            onChange={setManufacturer}
            options={manufacturers.map((m) => ({ value: m, label: m }))}
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <section aria-label="Device list">
            {list.length === 0 ? (
              <p className="border border-line p-3 text-sm text-muted">No devices match these filters.</p>
            ) : (
              <ul className="grid gap-2">
                {list.map((d) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      aria-pressed={active?.id === d.id}
                      onClick={() => setActiveId(d.id)}
                      className={`grid w-full gap-1 border p-3 text-left ${active?.id === d.id ? "border-signal" : "border-line"} ${focus}`}
                    >
                      <span className="font-mono text-xs text-muted">{d.manufacturer}</span>
                      <span className="text-sm font-medium">{d.model}</span>
                      <span className="text-xs text-muted">{d.category}</span>
                      <StatusTag status={d.integrationStatus} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          {active ? <Detail key={active.id} device={active} /> : null}
        </div>
      </main>
    </div>
  );
}
