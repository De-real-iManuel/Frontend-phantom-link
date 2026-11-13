import { SiteHeader } from "@/components/site-header";
import { ResurrectDemo } from "@/components/demo/resurrect-demo";
import { FogLayer } from "@/components/ghost-effects";

export function DemoPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader />
      <main className="relative isolate overflow-hidden">
        <FogLayer className="opacity-50" />
        <div className="relative mx-auto grid max-w-4xl grid-cols-[minmax(0,1fr)] gap-8 px-4 py-8 md:py-12">
          <div>
            <p className="font-mono text-xs tracking-widest text-signal uppercase">The Haunted Industrial Network</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Resurrect a legacy device</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
              Take a silent serial-bus machine, rebuild what it says, check the bytes, decode one value,
              record the evidence and hand the result to an AI agent. About two minutes, no Modbus
              knowledge needed. Open Technical details on any step if you want the engineering.
            </p>
          </div>
          <ResurrectDemo />
        </div>
      </main>
    </div>
  );
}
