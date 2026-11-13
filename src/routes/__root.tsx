import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

const APP_NAME = "Phantomlink";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Phantomlink: Silent machines. Speaking models." },
      {
        name: "description",
        content:
          "PhantomLink bridges legacy industrial protocols with modern applications and AI agents. It reconstructs and validates device communication, decodes verified telemetry, and preserves cryptographic evidence. Demonstration build with simulated data.",
      },
      { name: "theme-color", content: "#0a0813" },
    ],
    links: [
      { rel: "icon", href: "/phantom/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/phantom/favicon-16.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/phantom/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "48x48", href: "/phantom/favicon-48.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/phantom/favicon-180.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});

export { APP_NAME };
