import { materialSpecLines, materials } from "@/data/materials";

export type SolarSolution = "Hòa lưới bám tải" | "Hybrid";

export const SOLAR_SOLUTIONS: SolarSolution[] = ["Hòa lưới bám tải", "Hybrid"];

export type SolarCatalogItem = {
  id: string;
  name: string;
  category: string;
  unit: string;
  unitCost: number;
  /** Số lượng ≈ công suất kWp × hệ số (làm tròn lên). */
  qtyPerKwp?: number;
  /** Số lượng cố định mỗi hệ thống. */
  qtyFixed?: number;
  /** true = nhân kWp không làm tròn lên (nhân công). */
  qtyExact?: boolean;
  /** Nếu có, chỉ áp dụng cho các giải pháp này. */
  appliesTo?: SolarSolution[];
};

export type SolarQuoteStatus = "draft" | "issued";

export type QuoteLineItem = {
  id: string;
  materialId: string;
  name: string;
  specs: string[];
  image: string;
  unit: string;
  qty: number;
  unitPrice: number;
};

export const PACKAGE_TYPES = ["Mái ngói", "Mái tôn", "Mái bằng"] as const;
export type PackageType = (typeof PACKAGE_TYPES)[number];

export type SolarQuote = {
  id: string;
  code: string;
  customer: string;
  address: string;
  phone: string;
  packageType: PackageType;
  systemTitle: string;
  solution: SolarSolution;
  capacityKwp: number;
  monthlyKwh: number;
  tariff: number;
  total: number;
  paybackYears: number;
  createdAt: string;
  status: SolarQuoteStatus;
  lines: QuoteLineItem[];
};

export const PANEL_WATT = 430;
export const ANNUAL_KWH_PER_KWP = 1450;
export const DEFAULT_TARIFF = 3500;
export const DEFAULT_MONTHLY_KWH = 550;
export const HYBRID_STORAGE_COST = 18_500_000;

export const QUOTES_KEY = "hv_solar_quotes_v3";
export const CATALOG_KEY = "hv_solar_catalog";

export const defaultSolarCatalog: SolarCatalogItem[] = [
  {
    id: "vt1",
    name: "Tấm pin JA Solar 430Wp mono",
    category: "Tấm pin",
    unit: "tấm",
    unitCost: 3_150_000,
    qtyPerKwp: 1000 / PANEL_WATT,
  },
  {
    id: "vt2",
    name: "Inverter hòa lưới Growatt MIN 5000TL-X",
    category: "Inverter",
    unit: "bộ",
    unitCost: 12_800_000,
    qtyFixed: 1,
    appliesTo: ["Hòa lưới bám tải"],
  },
  {
    id: "vt3",
    name: "Inverter hybrid Deye 8kW",
    category: "Inverter",
    unit: "bộ",
    unitCost: 24_900_000,
    qtyFixed: 1,
    appliesTo: ["Hybrid"],
  },
  {
    id: "vt4",
    name: "Khung nhôm mái tôn + kẹp pin",
    category: "Khung giá",
    unit: "bộ/tấm",
    unitCost: 420_000,
    qtyPerKwp: 1000 / PANEL_WATT,
  },
  {
    id: "vt5",
    name: "Cáp DC PV1-F 4mm²",
    category: "Cáp",
    unit: "m",
    unitCost: 28_000,
    qtyPerKwp: 12,
  },
  {
    id: "vt6",
    name: "Cáp AC Cu/XLPE 4×6mm²",
    category: "Cáp",
    unit: "m",
    unitCost: 52_000,
    qtyPerKwp: 8,
  },
  {
    id: "vt7",
    name: "Aptomat DC 1000V 20A",
    category: "Bảo vệ",
    unit: "cái",
    unitCost: 780_000,
    qtyFixed: 1,
  },
  {
    id: "vt8",
    name: "MCCB AC 3P 32A Schneider",
    category: "Bảo vệ",
    unit: "cái",
    unitCost: 1_150_000,
    qtyFixed: 1,
  },
  {
    id: "vt9",
    name: "Tủ điện AC/DC + SPD chống sét",
    category: "Phụ kiện",
    unit: "bộ",
    unitCost: 4_050_000,
    qtyFixed: 1,
  },
  {
    id: "vt10",
    name: "Nhân công lắp đặt, đấu nối, nghiệm thu EVN",
    category: "Thi công",
    unit: "kWp",
    unitCost: 3_120_000,
    qtyPerKwp: 1,
    qtyExact: true,
  },
];

function seedLine(materialId: string, qty: number): QuoteLineItem {
  const item = materials.find((m) => m.id === materialId);
  if (!item) {
    return {
      id: `ql-${materialId}`,
      materialId,
      name: "",
      specs: [],
      image: "",
      unit: "",
      qty,
      unitPrice: 0,
    };
  }
  return {
    id: `ql-${materialId}`,
    materialId: item.id,
    name: item.name,
    specs: materialSpecLines(item),
    image: item.image,
    unit: item.unit,
    qty,
    unitPrice: item.retailPrice,
  };
}

export const seedSolarQuotes: SolarQuote[] = [
  {
    id: "q-seed-tese",
    code: "BG-2026-46966",
    customer: "Anh Nam",
    address: "12 Đường số 8, P. Tân Sơn Nhì, Q. Tân Phú, TP.HCM",
    phone: "0903 418 226",
    packageType: "Mái ngói",
    systemTitle: "Hệ thống điện năng lượng mặt trời hòa lưới 4.3 kWp",
    solution: "Hòa lưới bám tải",
    capacityKwp: 4.3,
    monthlyKwh: 550,
    tariff: DEFAULT_TARIFF,
    total: 0,
    paybackYears: 3.2,
    createdAt: "2026-06-18T09:30:00.000Z",
    status: "issued",
    lines: [
      seedLine("m-pin-1", 10),
      seedLine("m-inv-1", 1),
      seedLine("m-pk-2", 8),
    ],
  },
  {
    id: "q-seed-draft",
    code: "BG-2026-10241",
    customer: "Anh Minh – Q. Tân Phú",
    address: "",
    phone: "0912 774 310",
    packageType: "Mái tôn",
    systemTitle: "Hệ thống điện năng lượng mặt trời hybrid 8 kWp",
    solution: "Hybrid",
    capacityKwp: 8,
    monthlyKwh: 900,
    tariff: DEFAULT_TARIFF,
    total: 0,
    paybackYears: 0,
    createdAt: "2026-08-12T14:10:00.000Z",
    status: "draft",
    lines: [seedLine("m-pin-2", 16), seedLine("m-inv-2", 1)],
  },
];

seedSolarQuotes.forEach((q) => {
  q.total = q.lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);
});

export type QuoteLine = SolarCatalogItem & { qty: number; lineTotal: number };

export type QuoteSimulation = {
  lines: QuoteLine[];
  total: number;
  paybackYears: number;
  annualGen: number;
  annualSavings: number;
  panelCount: number;
};

export function panelCountFor(capacityKwp: number) {
  return Math.max(1, Math.ceil((capacityKwp * 1000) / PANEL_WATT));
}

export function qtyForItem(item: SolarCatalogItem, capacityKwp: number, solution: SolarSolution) {
  if (item.appliesTo && !item.appliesTo.includes(solution)) return 0;
  if (item.qtyPerKwp != null) {
    const raw = capacityKwp * item.qtyPerKwp;
    if (item.qtyExact) return Math.round(raw * 1000) / 1000;
    return Math.max(1, Math.ceil(raw - 1e-9));
  }
  return item.qtyFixed ?? 1;
}

export function computeQuote(input: {
  capacityKwp: number;
  solution: SolarSolution;
  monthlyKwh: number;
  tariff: number;
  catalog: SolarCatalogItem[];
}): QuoteSimulation {
  const capacityKwp = Math.max(0.1, input.capacityKwp || 0);
  const lines: QuoteLine[] = input.catalog
    .map((item) => {
      const qty = qtyForItem(item, capacityKwp, input.solution);
      return { ...item, qty, lineTotal: qty * item.unitCost };
    })
    .filter((line) => line.qty > 0);

  if (input.solution === "Hybrid") {
    lines.push({
      id: "vt-hybrid-bat",
      name: "Pin lưu trữ LiFePO4 5kWh (hybrid)",
      category: "Lưu trữ",
      unit: "bộ",
      unitCost: HYBRID_STORAGE_COST,
      qtyFixed: 1,
      appliesTo: ["Hybrid"],
      qty: 1,
      lineTotal: HYBRID_STORAGE_COST,
    });
  }

  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const annualGen = capacityKwp * ANNUAL_KWH_PER_KWP;
  const annualDemand = Math.max(0, input.monthlyKwh) * 12;
  const selfUseRatio = input.solution === "Hybrid" ? 0.95 : 0.8;
  const selfUse = Math.min(annualGen, annualDemand || annualGen) * selfUseRatio;
  const annualSavings = selfUse * Math.max(0, input.tariff);
  const paybackYears = annualSavings > 0 ? Math.round((total / annualSavings) * 10) / 10 : 0;

  return {
    lines,
    total,
    paybackYears,
    annualGen,
    annualSavings,
    panelCount: panelCountFor(capacityKwp),
  };
}

export function newQuoteCode(existing: SolarQuote[] = []) {
  const year = new Date().getFullYear();
  for (let i = 0; i < 20; i++) {
    const n = Math.floor(10000 + Math.random() * 90000);
    const code = `BG-${year}-${n}`;
    if (!existing.some((q) => q.code === code)) return code;
  }
  return `BG-${year}-${Date.now().toString().slice(-5)}`;
}

export function newQuoteId() {
  return `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function quoteLineTotal(line: QuoteLineItem) {
  return Math.max(0, line.qty) * Math.max(0, line.unitPrice);
}

export function quoteTotal(lines: QuoteLineItem[]) {
  return lines.reduce((sum, line) => sum + quoteLineTotal(line), 0);
}

export function estimateQuoteTotal(input: {
  summerBillAuto: number;
  winterBillAuto: number;
  crane: number;
  craneShifts: number;
  cranePrice: number;
  remote: number;
  remoteDays: number;
  remotePrice: number;
  acWireM: number;
  dcWireM: number;
  pipeM: number;
}) {
  const ac = 52_000;
  const dc = 28_000;
  const pipe = 12_000;
  const baseHardware = Math.round(
    input.summerBillAuto * 0.18 + input.winterBillAuto * 0.12,
  );
  const extras =
    (input.crane ? input.cranePrice * Math.max(0, input.craneShifts) : 0) +
    (input.remote ? input.remotePrice * Math.max(0, input.remoteDays) : 0) +
    input.acWireM * ac +
    input.dcWireM * dc +
    input.pipeM * pipe;
  return Math.max(0, baseHardware + extras);
}

export function makeEstimateQuote(input: {
  customer: string;
  phone: string;
  address: string;
  systemTitle: string;
  summary: string;
  total: number;
  estimateDate?: string;
}): SolarQuote {
  return {
    id: newQuoteId(),
    code: `DT-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`,
    customer: input.customer.trim() || "Quý Khách Hàng",
    address: input.address.trim(),
    phone: input.phone.trim(),
    packageType: "Mái tôn",
    systemTitle: input.systemTitle.trim() || "Báo giá dự toán",
    solution: "Hòa lưới bám tải",
    capacityKwp: 0,
    monthlyKwh: 0,
    tariff: 0,
    total: input.total,
    paybackYears: 0,
    createdAt: input.estimateDate ?? new Date().toISOString(),
    status: "draft",
    lines: [
      {
        id: newQuoteLineId(),
        materialId: "",
        name: input.summary,
        specs: [],
        image: "",
        unit: "gói",
        qty: 1,
        unitPrice: input.total,
      },
    ],
  };
}

export function newQuoteLineId() {
  return `ql-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function emptyQuoteLine(): QuoteLineItem {
  return {
    id: newQuoteLineId(),
    materialId: "",
    name: "",
    specs: [],
    image: "",
    unit: "",
    qty: 1,
    unitPrice: 0,
  };
}

export function quoteLineFromMaterial(
  item: { id: string; name: string; size: string; description: string; warranty: string; note: string; image: string; unit: string; retailPrice: number },
  qty = 1,
): QuoteLineItem {
  return {
    id: newQuoteLineId(),
    materialId: item.id,
    name: item.name,
    specs: materialSpecLines(item),
    image: item.image,
    unit: item.unit,
    qty,
    unitPrice: item.retailPrice,
  };
}

function parseQuotes(raw: string | null): SolarQuote[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed
      .filter(
        (q): q is SolarQuote =>
          !!q &&
          typeof q === "object" &&
          typeof (q as SolarQuote).id === "string" &&
          typeof (q as SolarQuote).code === "string" &&
          typeof (q as SolarQuote).customer === "string" &&
          typeof (q as SolarQuote).total === "number",
      )
      .map((q) => {
        const lines = Array.isArray(q.lines) ? q.lines : [];
        const packageType: PackageType = PACKAGE_TYPES.includes(q.packageType as PackageType)
          ? (q.packageType as PackageType)
          : "Mái tôn";
        return {
          ...q,
          address: q.address ?? "",
          phone: q.phone ?? "",
          packageType,
          systemTitle: q.systemTitle ?? "",
          status: q.status === "draft" ? "draft" : "issued",
          lines,
          total: lines.length ? quoteTotal(lines) : q.total,
        };
      });
  } catch {
    return null;
  }
}

function parseCatalog(raw: string | null): SolarCatalogItem[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const items = parsed.filter(
      (c): c is SolarCatalogItem =>
        !!c &&
        typeof c === "object" &&
        typeof (c as SolarCatalogItem).id === "string" &&
        typeof (c as SolarCatalogItem).name === "string" &&
        typeof (c as SolarCatalogItem).unitCost === "number",
    );
    return items.length ? items : null;
  } catch {
    return null;
  }
}

export function loadSolarQuotes(): SolarQuote[] {
  if (typeof window === "undefined") return seedSolarQuotes;
  const parsed = parseQuotes(localStorage.getItem(QUOTES_KEY));
  if (!parsed) {
    localStorage.setItem(QUOTES_KEY, JSON.stringify(seedSolarQuotes));
    return seedSolarQuotes;
  }
  return parsed;
}

export function saveSolarQuotes(quotes: SolarQuote[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
}

export function loadSolarCatalog(): SolarCatalogItem[] {
  if (typeof window === "undefined") return defaultSolarCatalog;
  const parsed = parseCatalog(localStorage.getItem(CATALOG_KEY));
  if (!parsed) {
    localStorage.setItem(CATALOG_KEY, JSON.stringify(defaultSolarCatalog));
    return defaultSolarCatalog;
  }
  return parsed;
}

export function saveSolarCatalog(catalog: SolarCatalogItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog));
}
