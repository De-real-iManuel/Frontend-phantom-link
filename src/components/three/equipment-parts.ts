import type { SceneKind } from "@/lib/devices/catalogue";

export type EquipmentPart = {
  id: string;
  label: string;
  /** Functional description of this kind of component. Not a model-specific claim. */
  description: string;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
};

export type SceneSpec = {
  body: { size: [number, number, number]; color: string };
  parts: EquipmentPart[];
};

export const SCENES: Record<SceneKind, SceneSpec> = {
  meter: {
    body: { size: [2.2, 2.2, 0.9], color: "#2a2638" },
    parts: [
      {
        id: "display",
        label: "Display area",
        description: "Front panel area where a meter shows measured values. Illustrative position only.",
        position: [0, 0.35, 0.47],
        size: [1.6, 0.9, 0.06],
        color: "#10231a",
      },
      {
        id: "buttons",
        label: "Navigation buttons",
        description: "Front keys used to move through menus on panel meters. Count and layout are not verified for this model.",
        position: [0, -0.55, 0.47],
        size: [1.3, 0.3, 0.06],
        color: "#4a4560",
      },
      {
        id: "comms",
        label: "Communication terminals",
        description: "Rear or side terminals for serial or Ethernet links. The actual interface for this model is shown in the metadata panel, or Not verified.",
        position: [0.6, -1.15, 0],
        size: [0.8, 0.12, 0.5],
        color: "#ff8a2b",
      },
      {
        id: "power",
        label: "Voltage and current inputs",
        description: "Terminals where phase voltage and current transformer wiring connect. Ratings are not verified here.",
        position: [-0.6, -1.15, 0],
        size: [0.8, 0.12, 0.5],
        color: "#b9b4cc",
      },
    ],
  },
  gateway: {
    body: { size: [2.6, 1.4, 1.1], color: "#2d3a46" },
    parts: [
      {
        id: "serial",
        label: "Serial port",
        description: "Serial side of a Modbus gateway. Electrical standard and settings come from the manufacturer document, not from this illustration.",
        position: [-0.8, -0.3, 0.57],
        size: [0.7, 0.4, 0.06],
        color: "#ff8a2b",
      },
      {
        id: "ethernet",
        label: "Ethernet port",
        description: "Network side of the gateway where Modbus TCP clients connect.",
        position: [0.45, -0.3, 0.57],
        size: [0.5, 0.4, 0.06],
        color: "#7dffa1",
      },
      {
        id: "leds",
        label: "Status indicators",
        description: "Indicator lights for power and link activity. Meaning varies by model.",
        position: [0.95, 0.35, 0.57],
        size: [0.3, 0.3, 0.06],
        color: "#7dffa1",
      },
      {
        id: "power",
        label: "Power input",
        description: "Supply terminals. Voltage range is not verified here.",
        position: [-0.8, 0.45, 0.57],
        size: [0.7, 0.25, 0.06],
        color: "#b9b4cc",
      },
    ],
  },
  controller: {
    body: { size: [1.1, 2.6, 1.2], color: "#3a3a3a" },
    parts: [
      {
        id: "ethernet",
        label: "Ethernet ports",
        description: "Network ports for the controller. Port count for a specific model comes from its title or datasheet.",
        position: [0, 0.5, 0.62],
        size: [0.7, 0.4, 0.06],
        color: "#7dffa1",
      },
      {
        id: "leds",
        label: "Status indicators",
        description: "Run and fault indicators. Meaning varies by model.",
        position: [0, 1.05, 0.62],
        size: [0.7, 0.2, 0.06],
        color: "#ff8a2b",
      },
      {
        id: "io",
        label: "I/O expansion side",
        description: "Where modular controllers connect I/O modules. Not verified for this model.",
        position: [0.57, -0.4, 0],
        size: [0.06, 1.2, 0.8],
        color: "#b9b4cc",
      },
      {
        id: "power",
        label: "Power supply",
        description: "Supply connection. Ratings are not verified here.",
        position: [0, -1.05, 0.62],
        size: [0.7, 0.3, 0.06],
        color: "#4a4560",
      },
    ],
  },
  edge: {
    body: { size: [2.6, 1.6, 1.0], color: "#2a2638" },
    parts: [
      {
        id: "rs485",
        label: "RS-485 port",
        description: "Serial bus input in the PhantomLink demonstration gateway concept.",
        position: [-0.8, -0.45, 0.52],
        size: [0.5, 0.4, 0.06],
        color: "#ff8a2b",
      },
      {
        id: "analog",
        label: "Analog terminals",
        description: "Illustrative terminals on the concept gateway. Not a supported input.",
        position: [-0.2, -0.45, 0.52],
        size: [0.5, 0.4, 0.06],
        color: "#b9b4cc",
      },
      {
        id: "ethernet",
        label: "Ethernet port",
        description: "Uplink in the demonstration concept.",
        position: [0.4, -0.45, 0.52],
        size: [0.5, 0.4, 0.06],
        color: "#7dffa1",
      },
      {
        id: "status",
        label: "Status light",
        description: "Glowing status light in the demonstration concept.",
        position: [1.0, -0.45, 0.52],
        size: [0.2, 0.2, 0.06],
        color: "#7dffa1",
      },
    ],
  },
};
