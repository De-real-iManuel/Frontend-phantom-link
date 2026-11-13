import { useState, type FormEvent } from "react";
import { Mark } from "@/components/mark";
import { focus } from "@/components/home/hero";

export function Contact() {
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

  const input = `h-11 border border-line bg-bg px-3 text-fg outline-none placeholder:text-muted ${focus}`;

  return (
    <section id="walk" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2 md:py-24">
        <div>
          <h2 className="text-2xl font-medium tracking-tight md:text-3xl">Name one device nobody can query.</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            Tell us about a machine you would like to hear from. This form is a demonstration: the request
            stays in this browser and nothing is sent.
          </p>
        </div>
        {sent ? (
          <div className="border border-line bg-surface p-6" role="status">
            <Mark className="size-10" />
            <p className="mt-5 text-lg text-fg">Noted. Nothing left this browser.</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              The demonstration does not submit requests. Try the resurrection demo to see the flow.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4" noValidate>
            <label className="grid gap-2 text-sm text-muted">
              Name
              <input name="name" autoComplete="name" className={input} placeholder="Who is asking" />
            </label>
            <label className="grid gap-2 text-sm text-muted">
              Site
              <input name="site" className={input} placeholder="Boiler house, line, building" />
            </label>
            <label className="grid gap-2 text-sm text-muted">
              The device
              <input name="device" required className={input} placeholder="Modbus RTU slave 01" />
            </label>
            {error ? (
              <p role="alert" className="text-sm text-pumpkin">
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
