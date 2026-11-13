import { createFileRoute } from "@tanstack/react-router";
import { DevicesPage } from "@/components/devices-page";

export const Route = createFileRoute("/devices")({
  head: () => ({ meta: [{ title: "Devices | Phantomlink" }] }),
  component: DevicesPage,
});
