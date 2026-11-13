import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Wordmark, Mark } from "@/components/mark";
import { Device3D } from "@/components/device-view";
import { FogLayer, FloatingGhosts, Flashlight } from "@/components/ghost-effects";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";

const samples = [
  {
    id: "boiler",
    place: "Boiler house",
    bus: "Modbus RTU",
    lines: ["slave 01   fn 03", "addr 000B  qty 0001", "raw  19 40"],
    caption: "Holding 40012 · 4–20 mA",
    asset: "boiler-3",
    point: "discharge pressure",
    value: "6.4 bar",
    state: "drifting",
    confidence: "0.91",
  },
  {
    id: "cold",
    place: "Cold room",
    bus: "4–20 mA",
    lines: ["loop AI-14", "12.80 mA", "span 0–10 °C"],
    caption: "Analog input · unscaled",
    asset: "line-2",
    point: "room temperature",
    value: "4.1 °C",
    state: "steady",
    confidence: "0.97",
  },
  {
    id: "ahu",
    place: "Air handler",
    bus: "BACnet",
    lines: ["device 2401", "AV:22 present-value", "71.4"],
    caption: "OPC classic mirror",
    asset: "ahu-1",
    point: "supply air",
    value: "71.4 °F",
    state: "high",
    confidence: "0.88",
  },
] as const;

type Sample = (typeof samples)[number];

const miles = [
  ["01", "Most industrial points predate an API."],
  ["02", "Historians trap the data and never name it."],
  ["03", "The work dies on the machine, not the model."],
];

const steps = [
  {
    k: "01",
    name: "Haunt",
    body: "An edge agent sits on the bus you already have. No firmware rewrite. The PLC keeps its job.",
    detail: "Modbus · OPC classic · BACnet · S7 · serial",
  },
  {
    k: "02",
    name: "Name",
    body: "Holding register 40012 becomes discharge pressure. Units align. Time aligns. The point gets an asset.",
    detail: "40012  →  discharge pressure",
  },
  {
    k: "03",
    name: "Speak",
    body: "Agents don't get another dashboard. They get tools: read a point, explain a drift, subscribe to an alarm.",
    detail: "read_asset · explain_drift · subscribe_alarm",
  },
];

const protocols = [
  ["Modbus RTU / TCP", "Registers, coils, raw frames"],
  ["OPC Classic", "DA servers with no REST port"],
  ["BACnet", "Points still named AV:22"],
  ["Siemens S7", "DB blocks, left untouched"],
  ["Allen-Bradley", "Tags behind a serial rack"],
  ["4–20 mA & serial", "Loops and ports with no packet"],
];

const facts = [
  ["Commissioned", "1998"],
  ["Points", "140"],
  ["APIs", "0"],
  ["To a reason", "40 min"],
];

const hauntText =
  "40012:19 40  40013:00 00  AV:22=71.4  AI-14=12.80mA  0x03 0x0B 0x00 0x01  DB1.DBW4=0x2A  slave01 fn03 crc=A4F1  40012:19 40  40013:00 00  AV:22=71.4  AI-14=12.80mA  0x03 0x0B 0x00 0x01  DB1.DBW4=0x2A  slave01 fn03 crc=A4F1  40012:19 40  40013:00 00  AV:22=71.4  AI-14=12.80mA  0x03 0x0B 0x00 0x01  DB1.DBW4=0x2A  slave01 fn03 crc=A4F1  40012:19 40  40013:00 00  AV:22=71.4  AI-14=12.80mA  0x03 0x0B";

function signalState(state: Sample["state"]) {
  return state === "steady" ? "text-fg" : "text-signal";
}

export function HomePage() {
  return (
    <div id="top" className="bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5">
          <a href="#top" className={focus} aria-label="Phantomlink, top">
            <Wordmark />
          </a>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Page">
            <a href="#bridge" className={`text-sm text-muted hover:text-fg ${focus}`}>
              Protocol
            </a>
            <a href="#agents" className={`text-sm text-muted hover:text-fg ${focus}`}>
              Agents
            </a>
            <a href="#deploy" className={`text-sm text-muted hover:text-fg ${focus}`}>
              Deploy
            </a>
            <Link to="/dashboard" className={`text-sm text-signal hover:text-fg ${focus}`}>
              Dashboard
            </Link>
          </nav>
          <a
            href="#walk"
            className={`inline-flex h-11 shrink-0 items-center bg-signal px-4 text-sm font-medium whitespace-nowrap text-bg transition-transform duration-150 ease-out active:scale-[0.96] ${focus}`}
          >
            Walk my plant
          </a>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden">
          <FogLayer />
          <FloatingGhosts />
          <Flashlight
            hidden={hauntText}
            className="mx-auto grid max-w-6xl gap-10 px-5 pt-16 pb-16 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-center md:pt-24"
          >
            <div className="relative">
              <p className="rise font-mono text-xs tracking-widest text-signal uppercase">
                <span aria-hidden="true" className="flicker mr-1 inline-block size-2 rounded-full bg-signal align-middle" />{" "}Registers in. Reasons out.
              </p>
              <h1 className="rise rise-2 glitch mt-4 max-w-3xl text-5xl leading-[0.98] font-semibold tracking-tight md:text-7xl">
                Silent machines.
                <br />
                <span className="text-signal">Speaking</span> models.
              </h1>
              <p className="rise rise-3 mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
                Phantomlink reads Modbus, BACnet, OPC and 4-20 mA from the plant you already run. It
                names each point and sends agents events they can act on. No PLC rewrite.
              </p>
              <div className="rise rise-4 mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#translate"
                  className={`inline-flex h-11 items-center justify-center bg-signal px-5 text-sm font-medium text-bg transition-transform duration-150 ease-out active:scale-[0.96] ${focus}`}
                >
                  Summon a device
                </a>
                <Link
                  to="/dashboard"
                  className={`inline-flex h-11 items-center justify-center border border-line px-5 text-sm text-fg transition-colors duration-200 hover:border-signal active:scale-[0.96] ${focus}`}
                >
                  Open the dashboard
                </Link>
              </div>
            </div>
            <div className="rise rise-3 relative" id="device-slot">
              <Device3D />
            </div>
          </Flashlight>
        </section>

        <Translator />

        <section className="mx-auto max-w-6xl px-5 py-20 md:py-28" aria-labelledby="mile-title">
          <h2 id="mile-title" className="max-w-xl text-2xl font-medium tracking-tight md:text-3xl">
            The last mile is the machine.
          </h2>
          <ol className="mt-10 border-t border-line">
            {miles.map(([n, line]) => (
              <li
                key={n}
                className="grid grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-4 border-b border-line py-5"
              >
                <span className="font-mono text-sm text-muted">{n}</span>
                <span className="text-lg text-fg md:text-xl">{line}</span>
              </li>
            ))}
          </ol>
        </section>

        <section id="bridge" className="scroll-mt-20 border-t border-line">
          <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
            <p className="font-mono text-xs tracking-widest text-muted uppercase">The bridge</p>
            <h2 className="mt-4 max-w-xl text-2xl font-medium tracking-tight md:text-3xl">
              Haunt the bus. Name the point. Let the agent speak.
            </h2>
            <div className="mt-12 grid gap-px bg-line md:grid-cols-3">
              {steps.map((step) => (
                <article key={step.k} className="bg-bg p-6 md:p-8">
                  <p className="font-mono text-xs text-signal">{step.k}</p>
                  <h3 className="mt-4 text-xl font-medium">{step.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{step.body}</p>
                  <p className="mt-6 font-mono text-xs leading-relaxed text-fg">{step.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-line" aria-labelledby="bus-title">
          <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
            <h2 id="bus-title" className="text-2xl font-medium tracking-tight md:text-3xl">
              What it already speaks.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
              Not a rip-and-replace. The buses that are still running the building, the line, and
              the boiler house.
            </p>
            <ul className="mt-10 border-t border-line">
              {protocols.map(([name, note]) => (
                <li
                  key={name}
                  className="grid gap-1 border-b border-line py-4 sm:grid-cols-[16rem_minmax(0,1fr)] sm:items-baseline sm:gap-8"
                >
                  <span className="text-fg">{name}</span>
                  <span className="font-mono text-xs text-muted">{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Ask />

        <section id="deploy" className="scroll-mt-20 border-t border-line">
          <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
            <h2 className="max-w-2xl text-2xl leading-tight font-medium tracking-tight md:text-4xl">
              We don't replace the PLC. The phantom stays on your network. Only the meaning leaves.
            </h2>
            <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm text-signal">
              <li>On-prem</li>
              <li>VPC</li>
              <li>Air-gap</li>
            </ul>
          </div>
        </section>

        <section className="border-t border-line" aria-labelledby="plant-title">
          <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
            <p className="font-mono text-xs tracking-widest text-muted uppercase">One plant</p>
            <h2
              id="plant-title"
              className="mt-4 max-w-2xl text-2xl font-medium tracking-tight md:text-3xl"
            >
              A boiler house the last vendor told them to replace.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
              One hundred forty points on a serial bus. Zero APIs. Forty minutes from the first
              frame to a reason for the drift at shift change.
            </p>
            <dl className="mt-10 grid grid-cols-2 border-t border-l border-line md:grid-cols-4">
              {facts.map(([label, value]) => (
                <div key={label} className="border-r border-b border-line p-5">
                  <dt className="font-mono text-xs text-muted">{label}</dt>
                  <dd className="mt-2 font-mono text-3xl text-fg">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <Walk />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <Wordmark markClass="size-6" />
          <p className="font-mono text-xs text-muted">Registers in. Reasons out.</p>
        </div>
      </footer>
    </div>
  );
}

function Translator() {
  const [id, setId] = useState<Sample["id"]>("boiler");
  const sample = samples.find((item) => item.id === id) ?? samples[0];

  return (
    <section id="translate" className="scroll-mt-20 mx-auto max-w-6xl px-5 pb-20 md:pb-28">
      <div className="grid gap-2 sm:grid-cols-3">
        {samples.map((item) => {
          const on = item.id === sample.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={on}
              onClick={() => setId(item.id)}
              className={`flex h-11 items-center justify-between gap-3 border px-3 text-left text-sm transition-colors duration-200 active:scale-[0.96] ${focus} ${
                on ? "border-signal text-fg" : "border-line text-muted hover:border-muted"
              }`}
            >
              <span>{item.place}</span>
              <span className="font-mono text-xs">{item.bus}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid border border-line bg-surface md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="min-w-0 p-5">
          <p className="font-mono text-xs tracking-widest text-muted uppercase">Register</p>
          <pre
            key={`${sample.id}-raw`}
            className="rise mt-4 font-mono text-sm leading-relaxed text-fg"
          >
            {sample.lines.join("\n")}
          </pre>
          <p className="mt-4 font-mono text-xs text-muted">{sample.caption}</p>
        </div>

        <div className="h-0.5 bg-signal md:hidden" aria-hidden="true" />
        <div className="hidden w-0.5 bg-signal md:block" aria-hidden="true" />

        <div className="min-w-0 p-5">
          <p className="font-mono text-xs tracking-widest text-muted uppercase">Event</p>
          <dl
            key={`${sample.id}-event`}
            className="rise mt-4 grid grid-cols-[7.5rem_minmax(0,1fr)] gap-y-2 font-mono text-sm"
          >
            <dt className="text-muted">asset</dt>
            <dd className="text-fg">{sample.asset}</dd>
            <dt className="text-muted">point</dt>
            <dd className="text-fg">{sample.point}</dd>
            <dt className="text-muted">value</dt>
            <dd className="text-fg">{sample.value}</dd>
            <dt className="text-muted">state</dt>
            <dd className={signalState(sample.state)}>{sample.state}</dd>
            <dt className="text-muted">confidence</dt>
            <dd className="text-fg tabular-nums">{sample.confidence}</dd>
          </dl>
        </div>
      </div>
    </section>
  );
}

function Ask() {
  const [open, setOpen] = useState(false);

  return (
    <section id="agents" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <p className="font-mono text-xs tracking-widest text-muted uppercase">For agents</p>
        <h2 className="mt-4 max-w-2xl text-2xl font-medium tracking-tight md:text-3xl">
          Why does steam pressure drift at shift change?
        </h2>
        <ul className="mt-6 flex flex-wrap gap-2">
          {["read_asset", "explain_drift", "subscribe_alarm"].map((tool) => (
            <li key={tool} className="border border-line px-3 py-2 font-mono text-xs text-fg">
              {tool}
            </li>
          ))}
        </ul>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className={`mt-8 inline-flex h-11 items-center bg-signal px-5 text-sm font-medium text-bg transition-transform duration-150 ease-out active:scale-[0.96] ${focus}`}
        >
          {open ? "Hide the reason" : "Ask the plant"}
        </button>
        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <p className="max-w-2xl pt-6 text-base leading-relaxed text-fg">
            boiler-3 discharge pressure falls 0.6 bar in the first nine minutes of second shift. The
            drop lines up with ahu-1 supply air opening, not with fuel rate. The register was always
            there. The historian never named the coincidence.
          </p>
        </div>
      </div>
    </section>
  );
}

function Walk() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const device = String(data.get("device") ?? "").trim();
    if (device.length < 2) {
      setError("Name the device. That's the whole request.");
      return;
    }
    setError("");
    setSent(true);
  }

  return (
    <section id="walk" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2 md:py-28">
        <div>
          <h2 className="text-2xl font-medium tracking-tight md:text-3xl">
            Bring us one device nobody can query.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            A register, a loop, a serial port. One is enough to start the walk. The request stays in
            this browser.
          </p>
        </div>
        {sent ? (
          <div className="border border-line bg-surface p-6">
            <Mark className="size-10" animated />
            <p className="mt-5 text-lg text-fg">Noted. Nothing left this browser.</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              A walk starts with one device. Bring the frame when you're ready.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4" noValidate>
            <label className="grid gap-2 text-sm text-muted">
              Name
              <input
                name="name"
                autoComplete="name"
                className={`h-11 border border-line bg-bg px-3 text-fg outline-none placeholder:text-muted ${focus}`}
                placeholder="Who walks the plant"
              />
            </label>
            <label className="grid gap-2 text-sm text-muted">
              Site
              <input
                name="site"
                className={`h-11 border border-line bg-bg px-3 text-fg outline-none placeholder:text-muted ${focus}`}
                placeholder="Boiler house, line, building"
              />
            </label>
            <label className="grid gap-2 text-sm text-muted">
              The device
              <input
                name="device"
                required
                className={`h-11 border border-line bg-bg px-3 text-fg outline-none placeholder:text-muted ${focus}`}
                placeholder="Modbus slave 01, AI-14, AV:22"
              />
            </label>
            {error ? (
              <p role="alert" className="text-sm text-signal">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className={`inline-flex h-11 items-center justify-center bg-signal px-5 text-sm font-medium text-bg transition-transform duration-150 ease-out active:scale-[0.96] ${focus}`}
            >
              Send the device
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
