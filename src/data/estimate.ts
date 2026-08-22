import {
  DEFAULT_PANEL_TYPES,
  findPanelTypeByName,
  getCatalogCabinetTypes,
  getCatalogInverterTypes,
} from "./panel-catalog";
import { persistLocalAndCloud } from "@/lib/cloud-state-client";

export const ESTIMATE_STORAGE_KEY = "hv_solar_estimate_v1";

export const PANEL_AREA_M2 = 2.75;

export const PANEL_TYPES = DEFAULT_PANEL_TYPES;

export const BATTERY_TYPES = [
  { id: "ejor-16", name: "EJOR 16 - BH7", kwh: 16, price: 36_500_000 },
  { id: "sofar-16", name: "SOFAR 16 - BH10", kwh: 16, price: 42_000_000 },
  { id: "pylon-10", name: "Pylontech 10.65", kwh: 10.65, price: 28_000_000 },
  { id: "dyness-10", name: "Dyness 10.24", kwh: 10.24, price: 30_500_000 },
  { id: "deye-15", name: "DEYE 15.36", kwh: 15.36, price: 39_800_000 },
] as const;

export const ROOF_TYPES = ["Mái ngói", "Mái tôn", "Khung giàn"] as const;

export const AC_WIRES = [
  "Dây điện 1 Pha Cadisun 2*4+1*2.5",
  "Dây điện 3 Pha Cadisun 3*6+1*4",
  "Dây điện 3 Pha Cadisun 3*10+1*6",
] as const;

export const INVERTER_KW_OPTIONS = [3, 4, 5, 6, 8, 10, 12, 15];

export type EstimateInputs = {
  customerId: string;
  customer: string;
  phone: string;
  address: string;
  summerBillAuto: number;
  summerBillManual: number;
  winterBillAuto: number;
  winterBillManual: number;
  dayRate: number;
  phase: "Điện 1 pha" | "Điện 3 pha";
  crane: number;
  craneShifts: number;
  cranePrice: number;
  roof: (typeof ROOF_TYPES)[number];
  remote: number;
  remoteDays: number;
  remotePrice: number;
  acWire: string;
  acWireM: number;
  dcWireM: number;
  pipeM: number;
  panelTypeAuto: string;
  panelTypeManual: string;
  panelCountManual: number;
  inverterKwManual: number;
  inverterTypeAuto: string;
  inverterTypeManual: string;
  batteryTypeAuto: string;
  batteryTypeManual: string;
  batteryQtyManual: number;
  cabinetType: string;
};

export const INVERTER_TYPES = getCatalogInverterTypes({ inStockOnly: false }).filter(
  (item): item is (typeof getCatalogInverterTypes)[number] & { id: string; capacityKw: number } =>
    Boolean(item.id) && typeof item.capacityKw === "number",
);

export function inverterOptionsForPhase(phase: EstimateInputs["phase"]) {
  const phaseToken = phase === "Điện 1 pha" ? /(?:1\s*PHA|\b1P\b)/i : /(?:3\s*PHA|\b3P\b)/i;

  return INVERTER_TYPES.filter((item) => phaseToken.test(item.inverterGroup ?? "")).sort(
    (a, b) => a.capacityKw - b.capacityKw,
  );
}

function inverterStock(item: (typeof INVERTER_TYPES)[number]) {
  const stock = Number(item.stockQuantity ?? 0);
  return Number.isFinite(stock) ? stock : 0;
}

function inverterPrice(item: (typeof INVERTER_TYPES)[number]) {
  return item.customerPrice ?? item.referencePrice ?? Number.POSITIVE_INFINITY;
}

function inverterBrandKey(item: (typeof INVERTER_TYPES)[number]) {
  const group = (item.inverterGroup ?? "").trim();
  const normalized = group.replace(/^\d+\.?\s*/, "");
  const brandMatch = normalized.match(
    /(SOLIS|LUXPOWER|SENEGRY|SOLAX|DEYE|SUNGROW|SOFAR|XINPZ|EJOR|HEROEE|VALLEY|CFE|LV\s*TOP\s*SUN|BATT?ENERGY|TCL)/i,
  );
  if (brandMatch?.[1]) return brandMatch[1].replace(/\s+/g, " ").toUpperCase();
  const words = normalized.split(/\s+/).filter(Boolean);
  return (words[0] ?? normalized).toUpperCase();
}

export function recommendedInverterOptionsForPhase(
  phase: EstimateInputs["phase"],
  recommendedKw: number,
) {
  const phaseOptions = inverterOptionsForPhase(phase).filter(
    (item) => inverterStock(item) > 0 && item.capacityKw >= recommendedKw,
  );
  const grouped = new Map<string, (typeof INVERTER_TYPES)[number]>();

  for (const item of phaseOptions) {
    const key = inverterBrandKey(item);
    const current = grouped.get(key);
    if (!current || inverterPrice(item) < inverterPrice(current)) {
      grouped.set(key, item);
    }
  }

  return [...grouped.values()].sort((a, b) => inverterPrice(a) - inverterPrice(b));
}

export function inverterById(id: string) {
  return getCatalogInverterTypes({ inStockOnly: false }).find((item) => item.id === id) ??
    INVERTER_TYPES.find((item) => item.id === id);
}

export function inverterLabel(id: string) {
  const item = inverterById(id);
  if (!item) return "Chọn biến tần";
  return `${item.code.split("\n")[0]?.trim()} - ${item.capacityKw} kW`;
}

export function autoInverterType(phase: EstimateInputs["phase"], recommendedKw: number) {
  return recommendedInverterOptionsForPhase(phase, recommendedKw)[0]?.id ?? "";
}

export function allCabinetOptions() {
  return getCatalogCabinetTypes().sort((a, b) => {
    if (a.phase !== b.phase) return a.phase.localeCompare(b.phase);
    return (a.capacityKw ?? 0) - (b.capacityKw ?? 0);
  });
}

export function cabinetOptionsForPhase(phase: EstimateInputs["phase"]) {
  const want = phase === "Điện 1 pha" ? "1 pha" : "3 pha";
  return allCabinetOptions().filter((item) => item.phase === want);
}

export function phaseFromCabinet(cabinetId: string): EstimateInputs["phase"] | undefined {
  const phase = cabinetById(cabinetId)?.phase;
  if (phase === "1 pha") return "Điện 1 pha";
  if (phase === "3 pha") return "Điện 3 pha";
  return undefined;
}

export function cabinetById(id: string) {
  return getCatalogCabinetTypes().find((item) => item.id === id);
}

export function cabinetLabel(id: string) {
  const item = cabinetById(id);
  if (!item) return "Chọn tủ điện";
  return item.capacityKw != null ? `${item.name} · ${item.capacityKw} kW` : item.name;
}

export function equipmentWarranty(
  item?: { warrantyYears?: number; specification?: string; note?: string } | null,
) {
  if (item?.warrantyYears) return `${item.warrantyYears} năm`;
  const text = `${item?.note ?? ""}\n${item?.specification ?? ""}`;
  const numbered = text.match(/bảo hành\s*[:\-]?\s*(0?\d+\s*năm[^.\n]*)/i);
  if (numbered?.[1]) return numbered[1].replace(/^0/, "").trim();
  const loose = text.match(/bảo hành[^\n.]{0,40}/i);
  return loose?.[0]?.replace(/^bảo hành\s*[:\-]?\s*/i, "").trim() || "5 năm";
}

export function autoCabinetType(phase: EstimateInputs["phase"]) {
  return cabinetOptionsForPhase(phase)[0]?.id ?? "";
}

export function autoAcWire(phase: EstimateInputs["phase"]) {
  return phase === "Điện 1 pha" ? AC_WIRES[0] : AC_WIRES[1];
}

export type EstimateScenario = {
  panelType: string;
  panelWatt: number;
  panelCount: number;
  capacityKw: number;
  areaM2: number;
  inverterKw: number;
  batteryName: string;
  batteryKwh: number;
  batteryQty: number;
  storageKwh: number;
  summerBill: number;
  winterBill: number;
};

type PackageCoef = {
  category: string;
  name: string;
  hybrid: boolean;
  intercept: number;
  perPanel: number;
  profitIntercept: number;
  profitPerPanel: number;
  batteryProfit: number;
};

/** Hệ số khớp bảng Excel khi 12 tấm (auto) và 20 tấm (thủ công). */
export const PRICE_PACKAGES: PackageCoef[] = [
  {
    category: "Biến tần Hybrid 1 pha",
    name: "Senegry Hybrid 1P",
    hybrid: true,
    intercept: 37_798_000,
    perPanel: 5_533_500,
    profitIntercept: 6_359_550,
    profitPerPanel: 785_337.5,
    batteryProfit: 5_000_000,
  },
  {
    category: "Biến tần Hybrid 1 pha",
    name: "Solis Hybrid 1P",
    hybrid: true,
    intercept: 70_798_000,
    perPanel: 3_556_000,
    profitIntercept: 10_609_550,
    profitPerPanel: 472_837.5,
    batteryProfit: 5_000_000,
  },
  {
    category: "Biến tần Hybrid 1 pha",
    name: "Solax Hybrid 1P",
    hybrid: true,
    intercept: 71_223_000,
    perPanel: 3_682_250,
    profitIntercept: 11_859_550,
    profitPerPanel: 410_337.5,
    batteryProfit: 5_000_000,
  },
  {
    category: "Biến tần Hybrid 1 pha",
    name: "Luxpower Hybrid 1P",
    hybrid: true,
    intercept: 52_073_000,
    perPanel: 4_519_750,
    profitIntercept: 9_359_550,
    profitPerPanel: 535_337.5,
    batteryProfit: 5_000_000,
  },
  {
    category: "Biến tần Hybrid 3 pha",
    name: "Solis Hybrid 3P",
    hybrid: true,
    intercept: 64_723_000,
    perPanel: 2_657_250,
    profitIntercept: 11_959_550,
    profitPerPanel: 410_337.5,
    batteryProfit: 5_000_000,
  },
  {
    category: "Biến tần Hybrid 3 pha",
    name: "Solax Hybrid 3P",
    hybrid: true,
    intercept: 98_573_000,
    perPanel: 3_157_250,
    profitIntercept: 1_959_550,
    profitPerPanel: 910_337.5,
    batteryProfit: 5_000_000,
  },
  {
    category: "Biến tần Hybrid 3 pha",
    name: "Luxpower Hybrid 3P",
    hybrid: true,
    intercept: 109_223_000,
    perPanel: 2_657_250,
    profitIntercept: 12_959_550,
    profitPerPanel: 410_337.5,
    batteryProfit: 5_000_000,
  },
  {
    category: "Hệ bám tải",
    name: "Solis Bám tải 1P",
    hybrid: false,
    intercept: 26_348_000,
    perPanel: 3_121_000,
    profitIntercept: 6_709_550,
    profitPerPanel: 422_837.5,
    batteryProfit: 0,
  },
  {
    category: "Hệ bám tải",
    name: "Solis Bám tải 3P",
    hybrid: false,
    intercept: 29_218_443,
    perPanel: 3_042_478,
    profitIntercept: 6_959_550,
    profitPerPanel: 410_337.5,
    batteryProfit: 0,
  },
];

export function defaultEstimateInputs(): EstimateInputs {
  return {
    customerId: "",
    customer: "Quý Khách Hàng",
    phone: "",
    address: "",
    summerBillAuto: 2_000_000,
    summerBillManual: 3_481_833,
    winterBillAuto: 1_500_000,
    winterBillManual: 2_285_459,
    dayRate: 40,
    phase: "Điện 3 pha",
    crane: 0,
    craneShifts: 0,
    cranePrice: 1_500_000,
    roof: "Mái tôn",
    remote: 1,
    remoteDays: 1,
    remotePrice: 500_000,
    acWire: "Dây điện 3 Pha Cadisun 3*6+1*4",
    acWireM: 10,
    dcWireM: 60,
    pipeM: 60,
    panelTypeAuto: "JINKO 625",
    panelTypeManual: "VSUN 580",
    panelCountManual: 20,
    inverterKwManual: 8,
    inverterTypeAuto: "",
    inverterTypeManual: "",
    batteryTypeAuto: "EJOR 16 - BH7",
    batteryTypeManual: "SOFAR 16 - BH10",
    batteryQtyManual: 1,
    cabinetType: autoCabinetType("Điện 3 pha"),
  };
}

function panelByName(name: string) {
  return findPanelTypeByName(name);
}

function batteryByName(name: string) {
  return BATTERY_TYPES.find((b) => b.name === name) ?? BATTERY_TYPES[0];
}

export function autoPanelCount(summerBillAuto: number) {
  return Math.min(40, Math.max(6, Math.round((summerBillAuto / 2_000_000) * 12)));
}

export function autoInverterKw(capacityKw: number) {
  return Math.round((capacityKw / 2) * 10) / 10;
}

export function extrasTotal(form: EstimateInputs) {
  const ac = 52_000;
  const dc = 28_000;
  const pipe = 12_000;
  return (
    (form.crane ? form.cranePrice * Math.max(0, form.craneShifts) : 0) +
    (form.remote ? form.remotePrice * Math.max(0, form.remoteDays) : 0) +
    form.acWireM * ac +
    form.dcWireM * dc +
    form.pipeM * pipe
  );
}

export function scenarioFrom(form: EstimateInputs, mode: "auto" | "manual"): EstimateScenario {
  const panelType = mode === "auto" ? form.panelTypeAuto : form.panelTypeManual;
  const panel = panelByName(panelType);
  const panelCount = mode === "auto" ? autoPanelCount(form.summerBillAuto) : form.panelCountManual;
  const capacityKw = Math.round(((panelCount * panel.watt) / 1000) * 10) / 10;
  const batteryName = mode === "auto" ? form.batteryTypeAuto : form.batteryTypeManual;
  const battery = batteryByName(batteryName);
  const batteryQty = mode === "auto" ? 1 : form.batteryQtyManual;
  const inverterKw = mode === "auto" ? autoInverterKw(capacityKw) : form.inverterKwManual;

  return {
    panelType: panel.name,
    panelWatt: panel.watt,
    panelCount,
    capacityKw,
    areaM2: Math.round(panelCount * panel.areaM2),
    inverterKw,
    batteryName: battery.name,
    batteryKwh: battery.kwh,
    batteryQty,
    storageKwh: Math.round(battery.kwh * batteryQty * 10) / 10,
    summerBill: mode === "auto" ? form.summerBillAuto : form.summerBillManual,
    winterBill: mode === "auto" ? form.winterBillAuto : form.winterBillManual,
  };
}

export function packagePrice(pkg: PackageCoef, panelCount: number) {
  const total = Math.round(pkg.intercept + pkg.perPanel * panelCount);
  const profitWith = Math.round(pkg.profitIntercept + pkg.profitPerPanel * panelCount);
  const profitWithout = pkg.hybrid ? profitWith - pkg.batteryProfit : profitWith;
  return { total, profitWith, profitWithout };
}

export function loadEstimateInputs(): EstimateInputs {
  const seed = defaultEstimateInputs();
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(ESTIMATE_STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as Partial<EstimateInputs>;
    const merged = { ...seed, ...parsed };
    if (!ROOF_TYPES.includes(merged.roof as (typeof ROOF_TYPES)[number])) {
      merged.roof = seed.roof;
    }
    const cabinetOptions = cabinetOptionsForPhase(merged.phase);
    if (!cabinetOptions.some((item) => item.id === merged.cabinetType)) {
      merged.cabinetType = cabinetOptions[0]?.id ?? "";
    }
    const inverterMatchesPhase = inverterOptionsForPhase(merged.phase).some(
      (item) => item.id === merged.inverterTypeAuto,
    );
    if (!parsed.inverterTypeAuto || !inverterMatchesPhase) {
      merged.inverterTypeAuto = "";
    }
    const manualInverterMatchesPhase = inverterOptionsForPhase(merged.phase).some(
      (item) => item.id === merged.inverterTypeManual,
    );
    if (!parsed.inverterTypeManual || !manualInverterMatchesPhase) {
      merged.inverterTypeManual = "";
    }
    return merged;
  } catch {
    return seed;
  }
}

export function saveEstimateInputs(form: EstimateInputs) {
  if (typeof window === "undefined") return;
  persistLocalAndCloud(ESTIMATE_STORAGE_KEY, form);
}
