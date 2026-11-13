import { createFileRoute } from "@tanstack/react-router";
import { DemoPage } from "@/components/demo/demo-page";

export const Route = createFileRoute("/demo")({
  head: () => ({ meta: [{ title: "Resurrect a device (simulated) | Phantomlink" }] }),
  component: DemoPage,
});
