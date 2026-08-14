export const ESTIMATE_STORAGE_KEY = "hv_solar_estimate_v1";

export const PANEL_AREA_M2 = 2.75;

export const PANEL_TYPES = [
  { id: "jinko-625", name: "JINKO 625", watt: 625, areaM2: 2.75 },
  { id: "vsun-580", name: "VSUN 580", watt: 580, areaM2: 2.7 },
  { id: "longi-575", name: "Longi 575", watt: 575, areaM2: 2.6 },
  { id: "canadian-430", name: "Canadian Solar 430", watt: 430, areaM2: 2.2 },
] as const;

export const BATTERY_TYPES = [
  { id: "ejor-16", name: "EJOR 16 - BH7", kwh: 16, price: 36_500_000 },
  { id: "sofar-16", name: "SOFAR 16 - BH10", kwh: 16, price: 42_000_000 },
  { id: "pylon-10", name: "Pylontech 10.65", kwh: 10.65, price: 28_000_000 },
] as const;

export const ROOF_TYPES = ["Mái tôn", "Mái ngói", "Mái bằng"] as const;

export const AC_WIRES = [
  "Dây điện 1 Pha Cadisun 2*4+1*2.5",
  "Dây điện 3 Pha Cadisun 3*6+1*4",
  "Dây điện 3 Pha Cadisun 3*10+1*6",
] as const;

export const INVERTER_KW_OPTIONS = [3, 4, 5, 6, 8, 10, 12, 15];

export type EstimateInputs = {
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
  cranePrice: number;
  roof: (typeof ROOF_TYPES)[number];
  remote: number;
  remotePrice: number;
  acWire: string;
  acWireM: number;
  dcWireM: number;
  pipeM: number;
  panelTypeAuto: string;
  panelTypeManual: string;
  panelCountManual: number;
  inverterKwManual: number;
  batteryTypeAuto: string;
  batteryTypeManual: string;
  batteryQtyManual: number;
};

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
    cranePrice: 1_500_000,
    roof: "Mái tôn",
    remote: 1,
    remotePrice: 500_000,
    acWire: "Dây điện 3 Pha Cadisun 3*6+1*4",
    acWireM: 10,
    dcWireM: 60,
    pipeM: 60,
    panelTypeAuto: "JINKO 625",
    panelTypeManual: "VSUN 580",
    panelCountManual: 20,
    inverterKwManual: 8,
    batteryTypeAuto: "EJOR 16 - BH7",
    batteryTypeManual: "SOFAR 16 - BH10",
    batteryQtyManual: 1,
  };
}

function panelByName(name: string) {
  return PANEL_TYPES.find((p) => p.name === name) ?? PANEL_TYPES[0];
}

function batteryByName(name: string) {
  return BATTERY_TYPES.find((b) => b.name === name) ?? BATTERY_TYPES[0];
}

export function autoPanelCount(summerBillAuto: number) {
  return Math.min(40, Math.max(6, Math.round((summerBillAuto / 2_000_000) * 12)));
}

export function autoInverterKw(capacityKw: number) {
  if (capacityKw < 8) return 4;
  if (capacityKw < 12) return 8;
  if (capacityKw < 16) return 12;
  return 15;
}

export function extrasTotal(form: EstimateInputs) {
  const ac = 52_000;
  const dc = 28_000;
  const pipe = 12_000;
  return (
    (form.crane ? form.cranePrice : 0) +
    (form.remote ? form.remotePrice : 0) +
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
    areaM2: Math.round(panelCount * PANEL_AREA_M2),
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
    return { ...seed, ...parsed };
  } catch {
    return seed;
  }
}

export function saveEstimateInputs(form: EstimateInputs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ESTIMATE_STORAGE_KEY, JSON.stringify(form));
}
