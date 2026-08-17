export const EVN_VAT = 1.08;

/** Tiền điện chưa thuế VAT 8% — lấy từ số tiền kéo trên slider (đã gồm thuế). */
export function amountExclVat(gross: number) {
  return Math.round(Math.max(0, gross) / EVN_VAT);
}

export const EVN_TIERS = [
  { bac: 1, consumption: "0-50 kWh", price: 1984, limit: 50 },
  { bac: 2, consumption: "51-100 kWh", price: 2050, limit: 50 },
  { bac: 3, consumption: "101-200 kWh", price: 2380, limit: 100 },
  { bac: 4, consumption: "201-300 kWh", price: 2998, limit: 100 },
  { bac: 5, consumption: "301-400 kWh", price: 3350, limit: 100 },
  { bac: 6, consumption: "Từ 401 kWh trở lên", price: 3460, limit: Number.POSITIVE_INFINITY },
] as const;

export type EvnTierRow = {
  bac: number;
  consumption: string;
  price: number;
  limit: number;
  kwh: number;
  cost: number;
};

export type EvnBillResult = {
  bill: number;
  rows: EvnTierRow[];
  totalKwh: number;
  totalCost: number;
};

/** Quy đổi tiền điện → kWh theo bậc thang EVN (bảng Excel). Logic chi tiết có thể chỉnh sau. */
export function kwhFromBill(bill: number): EvnBillResult {
  let remaining = Math.max(0, Math.round(bill));
  let totalKwh = 0;
  let totalCost = 0;

  const rows: EvnTierRow[] = EVN_TIERS.map((tier) => {
    if (remaining <= 0) {
      return {
        bac: tier.bac,
        consumption: tier.consumption,
        price: tier.price,
        limit: tier.limit,
        kwh: 0,
        cost: 0,
      };
    }
    const maxCost = tier.limit * tier.price;
    if (remaining >= maxCost) {
      remaining -= maxCost;
      totalKwh += tier.limit;
      totalCost += maxCost;
      return {
        bac: tier.bac,
        consumption: tier.consumption,
        price: tier.price,
        limit: tier.limit,
        kwh: tier.limit,
        cost: maxCost,
      };
    }
    const kwh = Math.floor(remaining / tier.price);
    const cost = kwh * tier.price;
    remaining = 0;
    totalKwh += kwh;
    totalCost += cost;
    return {
      bac: tier.bac,
      consumption: tier.consumption,
      price: tier.price,
      limit: tier.limit,
      kwh,
      cost,
    };
  });

  return { bill, rows, totalKwh, totalCost };
}
