import { Link } from "@tanstack/react-router";
import { Mark } from "@/components/mark";
import { Device3D } from "@/components/device-view";
import { FogLayer, FloatingGhosts, Flashlight } from "@/components/ghost-effects";
import { SimBadge, SimulationBanner } from "@/components/simulation-banner";

export const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";

const hauntText =
  "slave01 fn03 reg0000 qty0001  01 03 00 00 00 01 84 0A  01 03 02 02 80 B8 44  crc ok  slave01 fn03 reg0000 qty0001  01 03 00 00 00 01 84 0A  01 03 02 02 80 B8 44  crc ok  slave01 fn03 reg0000 qty0001  01 03 00 00 00 01 84 0A  01 03 02 02 80 B8 44  crc ok  slave01 fn03 reg0000 qty0001  01 03 00 00 00 01 84 0A  01 03 02 02 80 B8 44  crc ok";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <FogLayer />
      <FloatingGhosts />
      <Flashlight
        hidden={hauntText}
        className="mx-auto grid max-w-6xl gap-10 px-5 pt-14 pb-16 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-center md:pt-20"
      >
        <div className="relative">
          <p className="rise flex items-center gap-3 font-mono text-xs tracking-widest text-signal uppercase">
            <Mark className="size-9" animated />
            The Haunted Industrial Network
          </p>
          <p className="rise rise-2 glitch mt-5 text-2xl font-medium tracking-tight text-muted md:text-3xl">
            Silent machines. <span className="text-signal">Speaking</span> models.
          </p>
          <h1 className="rise rise-2 mt-3 max-w-3xl text-4xl leading-[1.02] font-semibold tracking-tight md:text-6xl">
            Bring legacy industrial equipment back to life.
          </h1>
          <p className="rise rise-3 mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
            PhantomLink bridges legacy industrial protocols with modern applications and AI agents. It
            reconstructs and validates device communication, decodes verified telemetry, and preserves
            cryptographic evidence of how each reading was produced.
          </p>
          <div className="rise rise-4 mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/demo"
              className={`inline-flex h-11 items-center justify-center bg-signal px-5 text-sm font-medium text-bg transition-transform duration-150 ease-out active:scale-[0.96] ${focus}`}
            >
              Resurrect a device
            </Link>
            <Link
              to="/dashboard"
              className={`inline-flex h-11 items-center justify-center border border-line px-5 text-sm text-fg transition-colors duration-200 hover:border-signal active:scale-[0.96] ${focus}`}
            >
              Open the dashboard
            </Link>
          </div>
          <SimulationBanner className="rise rise-4 mt-5 max-w-xl" />
        </div>
        <div className="rise rise-3 relative" id="device-slot">
          <Device3D />
          <SimBadge className="absolute top-2 right-2" />
        </div>
      </Flashlight>
    </section>
  );
}
