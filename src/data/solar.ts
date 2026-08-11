/**
 * Dữ liệu & kiểu dữ liệu cho module Báo giá EPC Điện mặt trời.
 * Toàn bộ là mock data phía frontend (không cần backend).
 */

export type SolarCategory = "panel" | "inverter" | "battery" | "accessory" | "labor";

export const categoryLabel: Record<SolarCategory, string> = {
  panel: "Tấm pin",
  inverter: "Biến tần (Inverter)",
  battery: "Pin lưu trữ",
  accessory: "Vật tư – phụ kiện",
  labor: "Nhân công – thi công",
};

/** Bảng sản phẩm (PIM) */
export type SolarProduct = {
  id: string;
  sku: string;
  name: string;
  category: SolarCategory;
  unit: string;
  /** Giá vốn (VNĐ) */
  costPrice: number;
  /** Thông số kỹ thuật dạng JSON */
  specs: Record<string, string | number>;
  /** Thông tin bảo hành */
  warrantyInfo: string;
  image: string;
};

/** Quy tắc lợi nhuận theo bậc số lượng */
export type PricingRule = {
  id: string;
  category: SolarCategory;
  minQty: number;
  /** null = không giới hạn */
  maxQty: number | null;
  /** Lợi nhuận cộng thêm trên mỗi đơn vị (VNĐ) */
  profitAmount: number;
};

/** Bậc thang giá điện EVN */
export type EvnTariff = {
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  label: string;
  /** Giới hạn kWh của bậc, null = không giới hạn */
  limitKwh: number | null;
  /** Đơn giá VNĐ/kWh (chưa VAT) */
  pricePerKwh: number;
};

/** Dòng báo giá – có snapshot giá vốn & đơn giá bán tại thời điểm tạo */
export type QuoteLine = {
  productId: string;
  /** Snapshot */
  sku: string;
  name: string;
  category: SolarCategory;
  unit: string;
  specsSnapshot: Record<string, string | number>;
  warrantySnapshot: string;
  image: string;
  costPriceSnapshot: number;
  unitPriceSnapshot: number;
  quantity: number;
};

export type QuoteScenario = "ongrid" | "hybrid";

export const scenarioLabel: Record<QuoteScenario, string> = {
  ongrid: "Hòa lưới bám tải",
  hybrid: "Hybrid (có lưu trữ)",
};

export type Quote = {
  id: string;
  code: string;
  createdAt: string;
  createdByEmail: string;
  createdByName: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    email: string;
    note: string;
  };
  input: {
    summerBill: number;
    winterBill: number;
    summerFactor: number;
    winterFactor: number;
    dayNightRatio: number;
  };
  scenario: QuoteScenario;
  /** kWp hệ thống chốt */
  systemKwp: number;
  lines: QuoteLine[];
  /** Snapshot tổng tiền */
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  totalCost: number;
  /** Snapshot kết quả mô phỏng */
  roiYears: number;
  yearlySaving: number;
};

export const VAT_RATE = 0.08;
export const SUN_HOURS_PER_DAY = 4.2;
export const DAYS_PER_MONTH = 30;

export const defaultEvnTariffs: EvnTariff[] = [
  { tier: 1, label: "Bậc 1: 0 – 50 kWh", limitKwh: 50, pricePerKwh: 1806 },
  { tier: 2, label: "Bậc 2: 51 – 100 kWh", limitKwh: 50, pricePerKwh: 1866 },
  { tier: 3, label: "Bậc 3: 101 – 200 kWh", limitKwh: 100, pricePerKwh: 2167 },
  { tier: 4, label: "Bậc 4: 201 – 300 kWh", limitKwh: 100, pricePerKwh: 2729 },
  { tier: 5, label: "Bậc 5: 301 – 400 kWh", limitKwh: 100, pricePerKwh: 3050 },
  { tier: 6, label: "Bậc 6: từ 401 kWh", limitKwh: null, pricePerKwh: 3151 },
];

const IMG_PANEL =
  "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=70";
const IMG_INVERTER =
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=70";
const IMG_BATTERY =
  "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=800&q=70";
const IMG_ACC =
  "https://images.unsplash.com/photo-1591955506264-3f5a6834570a?auto=format&fit=crop&w=800&q=70";
const IMG_LABOR =
  "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=70";

export const defaultSolarProducts: SolarProduct[] = [
  {
    id: "p-jinko-580",
    sku: "PV-JK-580N",
    name: "Tấm pin Jinko Tiger Neo 580W N-Type",
    category: "panel",
    unit: "tấm",
    costPrice: 2150000,
    specs: { "Công suất": "580 Wp", "Hiệu suất": "22,5%", "Loại cell": "N-Type TOPCon", "Kích thước": "2278×1134×30 mm" },
    warrantyInfo: "Bảo hành sản phẩm 12 năm, bảo hành hiệu suất 30 năm (≥87,4%).",
    image: IMG_PANEL,
  },
  {
    id: "p-ja-565",
    sku: "PV-JA-565M",
    name: "Tấm pin JA Solar DeepBlue 565W Mono",
    category: "panel",
    unit: "tấm",
    costPrice: 1980000,
    specs: { "Công suất": "565 Wp", "Hiệu suất": "21,9%", "Loại cell": "Mono PERC", "Kích thước": "2278×1134×30 mm" },
    warrantyInfo: "Bảo hành sản phẩm 12 năm, hiệu suất 25 năm.",
    image: IMG_PANEL,
  },
  {
    id: "p-sma-5k",
    sku: "INV-SMA-5K",
    name: "Inverter hòa lưới SMA Sunny Boy 5kW 1 pha",
    category: "inverter",
    unit: "bộ",
    costPrice: 18500000,
    specs: { "Công suất": "5 kW", "Pha": "1 pha 220V", "MPPT": 2, "Hiệu suất": "97,6%" },
    warrantyInfo: "Bảo hành chính hãng 10 năm.",
    image: IMG_INVERTER,
  },
  {
    id: "p-huawei-10k",
    sku: "INV-HW-10KTL",
    name: "Inverter hòa lưới Huawei SUN2000 10KTL 3 pha",
    category: "inverter",
    unit: "bộ",
    costPrice: 27500000,
    specs: { "Công suất": "10 kW", "Pha": "3 pha 380V", "MPPT": 2, "Hiệu suất": "98,4%" },
    warrantyInfo: "Bảo hành chính hãng 10 năm, hỗ trợ giám sát FusionSolar.",
    image: IMG_INVERTER,
  },
  {
    id: "p-deye-8k-hybrid",
    sku: "INV-DEYE-8KH",
    name: "Inverter Hybrid Deye SUN-8K-SG04LP3",
    category: "inverter",
    unit: "bộ",
    costPrice: 34500000,
    specs: { "Công suất": "8 kW", "Pha": "3 pha 380V", "Loại": "Hybrid lưu trữ", "Hiệu suất": "97,6%" },
    warrantyInfo: "Bảo hành chính hãng 5 năm (gia hạn tối đa 10 năm).",
    image: IMG_INVERTER,
  },
  {
    id: "p-pylon-5k",
    sku: "BAT-PYL-5K",
    name: "Pin lưu trữ Pylontech US5000 LiFePO4 4,8kWh",
    category: "battery",
    unit: "module",
    costPrice: 29500000,
    specs: { "Dung lượng": "4,8 kWh", "Điện áp": "48V", "Chu kỳ sạc": "6000 cycles", "DoD": "95%" },
    warrantyInfo: "Bảo hành 10 năm hoặc 6.000 chu kỳ sạc.",
    image: IMG_BATTERY,
  },
  {
    id: "p-rack",
    sku: "ACC-RACK-AL",
    name: "Khung giá đỡ nhôm định hình + bulong inox",
    category: "accessory",
    unit: "tấm",
    costPrice: 480000,
    specs: { "Vật liệu": "Nhôm 6005-T5", "Chống ăn mòn": "Anode 15µm", "Tải trọng gió": "150 km/h" },
    warrantyInfo: "Bảo hành kết cấu 10 năm.",
    image: IMG_ACC,
  },
  {
    id: "p-dcbox",
    sku: "ACC-DCBOX",
    name: "Tủ điện DC/AC, CB, chống sét lan truyền",
    category: "accessory",
    unit: "bộ",
    costPrice: 5600000,
    specs: { "Chuẩn": "IP65", "Chống sét": "DC + AC Type II", "Thương hiệu CB": "Schneider" },
    warrantyInfo: "Bảo hành thiết bị 24 tháng.",
    image: IMG_ACC,
  },
  {
    id: "p-cable",
    sku: "ACC-CABLE-PV",
    name: "Dây DC solar 1x4mm² + đầu MC4 (mét)",
    category: "accessory",
    unit: "mét",
    costPrice: 32000,
    specs: { "Tiết diện": "4 mm²", "Chuẩn": "TÜV H1Z2Z2-K", "Chịu nhiệt": "-40°C ~ 120°C" },
    warrantyInfo: "Bảo hành vật tư 12 tháng.",
    image: IMG_ACC,
  },
  {
    id: "p-labor",
    sku: "LAB-EPC-KWP",
    name: "Nhân công thi công – lắp đặt trọn gói (theo kWp)",
    category: "labor",
    unit: "kWp",
    costPrice: 1350000,
    specs: { "Hạng mục": "Lắp khung, đi dây, cấu hình, test", "Thời gian": "2 – 5 ngày" },
    warrantyInfo: "Bảo hành thi công 24 tháng, bảo trì miễn phí 2 lần/năm.",
    image: IMG_LABOR,
  },
];

export const defaultPricingRules: PricingRule[] = [
  { id: "r-panel-1", category: "panel", minQty: 1, maxQty: 10, profitAmount: 450000 },
  { id: "r-panel-2", category: "panel", minQty: 11, maxQty: 30, profitAmount: 330000 },
  { id: "r-panel-3", category: "panel", minQty: 31, maxQty: null, profitAmount: 240000 },
  { id: "r-inv-1", category: "inverter", minQty: 1, maxQty: 2, profitAmount: 4500000 },
  { id: "r-inv-2", category: "inverter", minQty: 3, maxQty: null, profitAmount: 3200000 },
  { id: "r-bat-1", category: "battery", minQty: 1, maxQty: 2, profitAmount: 5500000 },
  { id: "r-bat-2", category: "battery", minQty: 3, maxQty: null, profitAmount: 4200000 },
  { id: "r-acc-1", category: "accessory", minQty: 1, maxQty: 50, profitAmount: 120000 },
  { id: "r-acc-2", category: "accessory", minQty: 51, maxQty: null, profitAmount: 80000 },
  { id: "r-lab-1", category: "labor", minQty: 1, maxQty: null, profitAmount: 350000 },
];

export const demoQuotes: Quote[] = [];
