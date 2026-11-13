import type { ReactNode } from "react";
import { TinyGhost } from "@/components/ghost-effects";
import type { DataSourceState } from "@/lib/data/contracts";

export const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";

export function Panel({
  id,
  title,
  children,
  right,
}: {
  id: string;
  title: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="min-w-0 border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 id={`${id}-h`} className="font-mono text-xs tracking-widest text-muted uppercase">
          {title}
        </h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function Notice({
  title,
  detail,
  ghost,
  tone = "text-muted",
}: {
  title: string;
  detail: string;
  ghost?: boolean;
  tone?: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4" role="status">
      {ghost ? <TinyGhost className="mt-0.5 size-6 shrink-0 text-fg/30" /> : null}
      <div>
        <p className={`font-mono text-sm ${tone}`}>{title}</p>
        <p className="mt-1 text-sm text-muted">{detail}</p>
      </div>
    </div>
  );
}

/** Renders loading, empty, error and unavailable states; calls children when ready. */
export function StateGate<T>({
  state,
  emptyText = "Nothing to show yet.",
  children,
}: {
  state: DataSourceState<T>;
  emptyText?: string;
  children: (data: T) => ReactNode;
}) {
  switch (state.status) {
    case "loading":
      return (
        <p className="p-4 font-mono text-xs text-muted" role="status">
          Reading the bus...
        </p>
      );
    case "empty":
      return <Notice ghost title="Empty" detail={emptyText} />;
    case "error":
      return <Notice title="Error" detail={state.message} tone="text-pumpkin" />;
    case "unavailable":
      return <Notice ghost title="Service unavailable" detail={state.reason} tone="text-pumpkin" />;
    case "ready":
      return <>{children(state.data)}</>;
  }
}

export function Th({ children }: { children: ReactNode }) {
  return (
    <th scope="col" className="px-3 py-2 font-normal whitespace-nowrap">
      {children}
    </th>
  );
}
