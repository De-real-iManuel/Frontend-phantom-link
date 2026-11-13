import { Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/mark";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";

const links = [
  ["/demo", "Demo"],
  ["/devices", "Devices"],
  ["/dashboard", "Dashboard"],
] as const;

/** Shared top navigation for /, /devices and /demo. The dashboard has its own sidebar. */
export function SiteHeader({ sticky = false }: { sticky?: boolean }) {
  return (
    <header
      className={`border-b border-line bg-bg/90 backdrop-blur-md ${sticky ? "sticky top-0 z-20" : ""}`}
    >
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2">
        <Link to="/" className={focus} aria-label="Phantomlink home">
          <Wordmark />
        </Link>
        <nav className="flex gap-1" aria-label="Site">
          {links.map(([to, label]) => (
            <Link
              key={to}
              to={to}
              className={`inline-flex h-11 items-center px-3 text-sm text-muted hover:text-fg ${focus}`}
              activeProps={{ className: "text-fg", "aria-current": "page" }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
