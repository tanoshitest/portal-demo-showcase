/**
 * Bộ tính toán (Sizing Engine) cho module báo giá điện mặt trời.
 * Tất cả đều là hàm thuần (pure) – không phụ thuộc UI.
 */
import {
  DAYS_PER_MONTH,
  SUN_HOURS_PER_DAY,
  VAT_RATE,
  defaultEvnTariffs,
  type EvnTariff,
  type PricingRule,
  type SolarCategory,
} from "@/data/solar";

/** Tính tiền điện EVN từ số kWh tiêu thụ (chưa VAT) */
export function calculateEVNMoney(kwh: number, tariffs: EvnTariff[] = defaultEvnTariffs): number {
  let remain = Math.max(0, kwh);
  let money = 0;
  for (const t of tariffs) {
    if (remain <= 0) break;
    const limit = t.limitKwh ?? remain;
    const used = Math.min(remain, limit);
    money += used * t.pricePerKwh;
    remain -= used;
  }
  return Math.round(money);
}

/**
 * Tính ngược số kWh từ tiền điện hằng tháng theo 6 bậc thang EVN.
 * @param totalMoney tiền điện (VNĐ, chưa VAT)
 */
export function calculateEVNKwh(
  totalMoney: number,
  tariffs: EvnTariff[] = defaultEvnTariffs,
): number {
  let remainMoney = Math.max(0, totalMoney);
  let kwh = 0;
  for (const t of tariffs) {
    if (remainMoney <= 0) break;
    const limit = t.limitKwh ?? Infinity;
    const tierMoney = limit === Infinity ? Infinity : limit * t.pricePerKwh;
    if (remainMoney >= tierMoney) {
      kwh += limit;
      remainMoney -= tierMoney;
    } else {
      kwh += remainMoney / t.pricePerKwh;
      remainMoney = 0;
    }
  }
  return Math.round(kwh * 10) / 10;
}

export type SolarYield = {
  /** kWh trung bình tháng dùng cho tính toán */
  monthlyKwh: number;
  /** kWh sử dụng vào ban ngày (có thể bù trực tiếp bằng PV) */
  dayKwh: number;
  nightKwh: number;
  /** Công suất khuyến nghị (kWp) */
  recommendedKwp: number;
  /** Sản lượng PV dự kiến mỗi tháng (kWh) */
  monthlyPvKwh: number;
  /** Số tấm pin gợi ý theo công suất tấm */
  panelCount: (panelWatt: number) => number;
};

/**
 * Mô phỏng sản lượng & quy mô hệ thống.
 * @param kwh kWh tháng cơ sở (thường lấy trung bình mùa hè/đông)
 * @param summerFactor hệ số mùa hè (vd 1.2)
 * @param winterFactor hệ số mùa đông (vd 0.85)
 * @param dayNightRatio tỉ lệ điện dùng ban ngày (0 – 1)
 */
export function simulateSolarYield(
  kwh: number,
  summerFactor = 1.2,
  winterFactor = 0.85,
  dayNightRatio = 0.6,
): SolarYield {
  const avgFactor = (summerFactor + winterFactor) / 2;
  const monthlyKwh = Math.max(0, kwh) * avgFactor;
  const ratio = Math.min(1, Math.max(0, dayNightRatio));
  const dayKwh = monthlyKwh * ratio;
  const nightKwh = monthlyKwh - dayKwh;
  const dailyDayKwh = dayKwh / DAYS_PER_MONTH;
  const recommendedKwp = Math.round((dailyDayKwh / SUN_HOURS_PER_DAY) * 10) / 10;
  const monthlyPvKwh = Math.round(recommendedKwp * SUN_HOURS_PER_DAY * DAYS_PER_MONTH);
  return {
    monthlyKwh: Math.round(monthlyKwh * 10) / 10,
    dayKwh: Math.round(dayKwh * 10) / 10,
    nightKwh: Math.round(nightKwh * 10) / 10,
    recommendedKwp,
    monthlyPvKwh,
    panelCount: (panelWatt: number) =>
      panelWatt > 0 ? Math.max(1, Math.ceil((recommendedKwp * 1000) / panelWatt)) : 0,
  };
}

export type RoiScenario = {
  key: "ongrid" | "hybrid";
  label: string;
  /** kWh/tháng được bù bởi hệ thống */
  offsetKwh: number;
  monthlySavingBeforeVat: number;
  /** Tiết kiệm đã gồm 8% VAT (tiền điện thực trả) */
  monthlySaving: number;
  yearlySaving: number;
  investment: number;
  roiYears: number;
  savings25Years: number;
};

export type RoiResult = {
  ongrid: RoiScenario;
  hybrid: RoiScenario;
  baselineMonthlyKwh: number;
  baselineMonthlyBill: number;
};

/**
 * So sánh 2 phương án: Hòa lưới bám tải (không lưu trữ) và Hybrid (có pin lưu trữ).
 * Tiết kiệm cuối cùng đã bao gồm 8% VAT.
 */
export function calculateROI(params: {
  monthlyKwh: number;
  dayKwh: number;
  nightKwh: number;
  monthlyPvKwh: number;
  ongridInvestment: number;
  hybridInvestment: number;
  /** Dung lượng pin lưu trữ (kWh) dùng cho ban đêm */
  batteryKwh?: number;
  tariffs?: EvnTariff[];
}): RoiResult {
  const {
    monthlyKwh,
    dayKwh,
    nightKwh,
    monthlyPvKwh,
    ongridInvestment,
    hybridInvestment,
    batteryKwh = 0,
    tariffs = defaultEvnTariffs,
  } = params;

  const baselineMonthlyBill = calculateEVNMoney(monthlyKwh, tariffs);

  const build = (key: "ongrid" | "hybrid", label: string, offsetKwh: number, investment: number) => {
    const offset = Math.min(monthlyKwh, Math.max(0, offsetKwh));
    const newKwh = Math.max(0, monthlyKwh - offset);
    const newBill = calculateEVNMoney(newKwh, tariffs);
    const monthlySavingBeforeVat = baselineMonthlyBill - newBill;
    const monthlySaving = Math.round(monthlySavingBeforeVat * (1 + VAT_RATE));
    const yearlySaving = monthlySaving * 12;
    return {
      key,
      label,
      offsetKwh: Math.round(offset * 10) / 10,
      monthlySavingBeforeVat: Math.round(monthlySavingBeforeVat),
      monthlySaving,
      yearlySaving,
      investment: Math.round(investment),
      roiYears: yearlySaving > 0 ? Math.round((investment / yearlySaving) * 10) / 10 : 0,
      savings25Years: yearlySaving * 25,
    } satisfies RoiScenario;
  };

  // Hòa lưới bám tải: chỉ bù được phần điện dùng ban ngày
  const ongridOffset = Math.min(dayKwh, monthlyPvKwh);
  // Hybrid: bù ban ngày + phần dư nạp pin dùng cho ban đêm
  const surplus = Math.max(0, monthlyPvKwh - dayKwh);
  const batteryMonthly = batteryKwh * 0.9 * DAYS_PER_MONTH;
  const hybridOffset = ongridOffset + Math.min(nightKwh, Math.min(surplus, batteryMonthly));

  return {
    baselineMonthlyKwh: Math.round(monthlyKwh * 10) / 10,
    baselineMonthlyBill,
    ongrid: build("ongrid", "Hòa lưới bám tải", ongridOffset, ongridInvestment),
    hybrid: build("hybrid", "Hybrid (có lưu trữ)", hybridOffset, hybridInvestment),
  };
}

/** Tìm quy tắc lợi nhuận phù hợp với danh mục + số lượng */
export function findPricingRule(
  category: SolarCategory,
  qty: number,
  rules: PricingRule[],
): PricingRule | undefined {
  return rules
    .filter((r) => r.category === category)
    .find((r) => qty >= r.minQty && (r.maxQty === null || qty <= r.maxQty));
}

/**
 * Tính đơn giá bán theo giá vốn + bậc số lượng.
 * @returns đơn giá bán trên 1 đơn vị (VNĐ)
 */
export function calculateFinalPrice(
  costPrice: number,
  qty: number,
  pricingRules: PricingRule[],
  category?: SolarCategory,
): number {
  const rule = category ? findPricingRule(category, qty, pricingRules) : undefined;
  const profit = rule?.profitAmount ?? 0;
  return Math.round(costPrice + profit);
}

export type QuoteTotals = {
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  totalCost: number;
  grossProfit: number;
};

export function calculateQuoteTotals(
  lines: { unitPriceSnapshot: number; costPriceSnapshot: number; quantity: number }[],
): QuoteTotals {
  const subtotal = lines.reduce((s, l) => s + l.unitPriceSnapshot * l.quantity, 0);
  const totalCost = lines.reduce((s, l) => s + l.costPriceSnapshot * l.quantity, 0);
  const vatAmount = Math.round(subtotal * VAT_RATE);
  return {
    subtotal: Math.round(subtotal),
    vatRate: VAT_RATE,
    vatAmount,
    total: Math.round(subtotal) + vatAmount,
    totalCost: Math.round(totalCost),
    grossProfit: Math.round(subtotal - totalCost),
  };
}
