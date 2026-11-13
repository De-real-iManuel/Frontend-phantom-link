/**
 * Device catalogue. Presence here means "documented or demonstrated", never
 * "connected" or "supported". Every field not confirmed from a manufacturer
 * source is null and renders as "Not verified". Sources: docs/device-research.md.
 */

export type DeviceCategory = "Energy meter" | "RS-485/Modbus gateway" | "Controller (PLC)" | "Edge gateway";

export type IntegrationStatus = "documented" | "simulated-demo" | "implemented-tested" | "planned";

export type RegisterMapStatus = "published-by-manufacturer" | "not-reviewed" | "not-available";

export type Model3dKind =
  | "manufacturer-cad-converted"
  | "licensed-third-party"
  | "procedural-placeholder"
  | "none";

export type SceneKind = "meter" | "gateway" | "controller" | "edge";

export type CatalogueDevice = {
  id: string;
  manufacturer: string;
  model: string;
  /** Exact variant or commercial reference, or null when not verified. */
  variant: string | null;
  category: DeviceCategory;
  /** Protocols as stated by manufacturer documentation, or null. */
  protocol: string | null;
  /** Physical interface as stated by manufacturer documentation, or null. */
  physicalInterface: string | null;
  productUrl: string;
  /** True only if the page content was actually read during research. */
  productPageRead: boolean;
  documentationUrl: string | null;
  registerMapStatus: RegisterMapStatus;
  integrationStatus: IntegrationStatus;
  model3d: Model3dKind;
  scene: SceneKind;
  assetAttribution: string | null;
  note: string;
};

export const STATUS_LABEL: Record<IntegrationStatus, string> = {
  documented: "Documented device",
  "simulated-demo": "Demonstration / simulated",
  "implemented-tested": "Implemented and tested",
  planned: "Planned integration",
};

export const STATUS_MEANING: Record<IntegrationStatus, string> = {
  documented: "Identified from manufacturer material. No PhantomLink driver exists.",
  "simulated-demo": "Shown with synthetic data only. Nothing is measured.",
  "implemented-tested": "A driver exists and was tested against hardware. No device currently has this status.",
  planned: "On the roadmap. Not built.",
};

export const REGISTER_MAP_LABEL: Record<RegisterMapStatus, string> = {
  "published-by-manufacturer": "Published by manufacturer",
  "not-reviewed": "Not reviewed",
  "not-available": "Not available",
};

export const MODEL3D_LABEL: Record<Model3dKind, string> = {
  "manufacturer-cad-converted": "Manufacturer CAD (converted)",
  "licensed-third-party": "Licensed third-party model",
  "procedural-placeholder": "Illustrative model, not manufacturer CAD",
  none: "No 3D model",
};

export const NOT_VERIFIED = "Not verified";

const PM_NOTE =
  "Identity taken from the product name only. The manufacturer page could not be read from the research environment, so interfaces, protocols and the register map are not verified. The PM5000 family does not share one register map; each variant needs its own manufacturer document.";

export const catalogue: CatalogueDevice[] = [
  {
    id: "se-pm5350",
    manufacturer: "Schneider Electric",
    model: "PowerLogic PM5350",
    variant: null,
    category: "Energy meter",
    protocol: null,
    physicalInterface: null,
    productUrl: "https://www.se.com/ww/en/product/METSEPM5350/",
    productPageRead: false,
    documentationUrl: null,
    registerMapStatus: "not-reviewed",
    integrationStatus: "documented",
    model3d: "procedural-placeholder",
    scene: "meter",
    assetAttribution: null,
    note: PM_NOTE,
  },
  {
    id: "se-pm5110",
    manufacturer: "Schneider Electric",
    model: "PowerLogic PM5110",
    variant: null,
    category: "Energy meter",
    protocol: null,
    physicalInterface: null,
    productUrl: "https://www.se.com/ww/en/product/METSEPM5110/",
    productPageRead: false,
    documentationUrl: null,
    registerMapStatus: "not-reviewed",
    integrationStatus: "documented",
    model3d: "procedural-placeholder",
    scene: "meter",
    assetAttribution: null,
    note: PM_NOTE,
  },
  {
    id: "moxa-mb3170",
    manufacturer: "Moxa",
    model: "MGate MB3170",
    variant: "1-port variant of the MB3170/MB3270 series",
    category: "RS-485/Modbus gateway",
    protocol: "Modbus TCP to Modbus RTU/ASCII conversion",
    physicalInterface: "Serial port (electrical standard not verified) and 10/100BaseT(X) Ethernet; fibre models exist",
    productUrl:
      "https://www.moxa.com/en/products/industrial-edge-connectivity/protocol-gateways/modbus-tcp-gateways/mgate-mb3170-mb3270-series",
    productPageRead: true,
    documentationUrl: null,
    registerMapStatus: "not-available",
    integrationStatus: "documented",
    model3d: "procedural-placeholder",
    scene: "gateway",
    assetAttribution: null,
    note: "A protocol gateway has no device register map of its own; it forwards requests to serial devices. Moxa lists the series as not recommended for new design.",
  },
  {
    id: "moxa-mb3270",
    manufacturer: "Moxa",
    model: "MGate MB3270",
    variant: "2-port variant of the MB3170/MB3270 series",
    category: "RS-485/Modbus gateway",
    protocol: "Modbus TCP to Modbus RTU/ASCII conversion",
    physicalInterface: "Two serial ports (electrical standard not verified) and 10/100BaseT(X) Ethernet",
    productUrl:
      "https://www.moxa.com/en/products/industrial-edge-connectivity/protocol-gateways/modbus-tcp-gateways/mgate-mb3170-mb3270-series",
    productPageRead: true,
    documentationUrl: null,
    registerMapStatus: "not-available",
    integrationStatus: "documented",
    model3d: "procedural-placeholder",
    scene: "gateway",
    assetAttribution: null,
    note: "Treated separately from the MB3170. Moxa lists the series as not recommended for new design.",
  },
  {
    id: "waveshare-rs485-eth-b",
    manufacturer: "Waveshare",
    model: "RS485 TO ETH (B)",
    variant: "Common Ethernet port, rail-mount plastic case (a PoE variant exists separately)",
    category: "RS-485/Modbus gateway",
    protocol: "Modbus TCP to RTU gateway, transparent serial server, MQTT gateway",
    physicalInterface: "RS-485 and Ethernet",
    productUrl: "https://www.waveshare.com/wiki/RS485_TO_ETH_(B)",
    productPageRead: true,
    documentationUrl: "https://www.waveshare.com/wiki/RS485_TO_ETH_(B)",
    registerMapStatus: "not-available",
    integrationStatus: "documented",
    model3d: "procedural-placeholder",
    scene: "gateway",
    assetAttribution: null,
    note: "Gateway, so no register map of its own.",
  },
  {
    id: "wago-750-8101",
    manufacturer: "WAGO",
    model: "Controller PFC100 750-8101",
    variant: "Item no. 750-8101, listed as 2 x ETHERNET",
    category: "Controller (PLC)",
    protocol: null,
    physicalInterface: "2 x Ethernet (from the product title)",
    productUrl: "https://www.wago.com/global/plcs/compact-controller-pfc100/p/750-8101",
    productPageRead: true,
    documentationUrl: null,
    registerMapStatus: "not-reviewed",
    integrationStatus: "documented",
    model3d: "procedural-placeholder",
    scene: "controller",
    assetAttribution: null,
    note: "Only the item number and title were readable. Protocol support was not confirmed.",
  },
  {
    id: "phantomlink-edge",
    manufacturer: "PhantomLink",
    model: "Edge gateway (concept)",
    variant: null,
    category: "Edge gateway",
    protocol: "RS-485, 4-20 mA and Ethernet as shown in the demonstration",
    physicalInterface: "Demonstration only. No hardware exists.",
    productUrl: "https://github.com/De-real-iManuel/Frontend-phantom-link",
    productPageRead: true,
    documentationUrl: null,
    registerMapStatus: "not-available",
    integrationStatus: "simulated-demo",
    model3d: "procedural-placeholder",
    scene: "edge",
    assetAttribution: null,
    note: "The PhantomLink demonstration gateway. It is our own illustration and not a manufacturer product.",
  },
];

export function getDevice(id: string): CatalogueDevice | undefined {
  return catalogue.find((d) => d.id === id);
}

export function orNotVerified(value: string | null): string {
  return value ?? NOT_VERIFIED;
}

export type CatalogueFilter = {
  status?: IntegrationStatus | "all";
  category?: DeviceCategory | "all";
  manufacturer?: string | "all";
};

export function filterCatalogue(list: CatalogueDevice[], f: CatalogueFilter): CatalogueDevice[] {
  return list.filter(
    (d) =>
      (!f.status || f.status === "all" || d.integrationStatus === f.status) &&
      (!f.category || f.category === "all" || d.category === f.category) &&
      (!f.manufacturer || f.manufacturer === "all" || d.manufacturer === f.manufacturer),
  );
}
