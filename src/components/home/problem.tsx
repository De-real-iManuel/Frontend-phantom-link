const points = [
  [
    "The data-access problem",
    "Plants run on machines that were never built to share data. The values exist inside the equipment, but there is no simple way for a modern application to ask for them.",
  ],
  [
    "Why old equipment resists integration",
    "Serial buses, bare register numbers, vendor-specific maps and no record of where a number came from. A value without a name, a unit or a source is hard to trust and harder to hand to software.",
  ],
  [
    "What PhantomLink does about it",
    "It rebuilds the conversation with the device, checks every frame, decodes the value with device-aware knowledge, and keeps a record of how the reading was made.",
  ],
];

export function Problem() {
  return (
    <section id="problem" className="scroll-mt-20 border-t border-line" aria-labelledby="problem-title">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
        <h2 id="problem-title" className="max-w-xl text-2xl font-medium tracking-tight md:text-3xl">
          The last mile is the machine.
        </h2>
        <div className="mt-10 grid gap-px bg-line md:grid-cols-3">
          {points.map(([title, body], i) => (
            <article key={title} className="bg-bg p-6 md:p-8">
              <p className="font-mono text-xs text-signal">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-4 text-lg font-medium">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
