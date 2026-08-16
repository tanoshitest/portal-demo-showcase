export const EVN_VAT = 1.08;

/** Tiền điện chưa thuế VAT 8% — lấy từ số tiền kéo trên slider (đã gồm thuế). */
export function amountExclVat(gross: number) {
  return Math.round(Math.max(0, gross) / EVN_VAT);
}

export const EVN_TIERS = [
  { bac: 1, price: 1984, limit: 52 },
  { bac: 2, price: 2050, limit: 52 },
  { bac: 3, price: 2380, limit: 103 },
  { bac: 4, price: 2998, limit: 103 },
  { bac: 5, price: 3350, limit: 103 },
  { bac: 6, price: 3460, limit: 10_000 },
] as const;

export type EvnTierRow = {
  bac: number;
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
      return { bac: tier.bac, price: tier.price, limit: tier.limit, kwh: 0, cost: 0 };
    }
    const maxCost = tier.limit * tier.price;
    if (remaining >= maxCost) {
      remaining -= maxCost;
      totalKwh += tier.limit;
      totalCost += maxCost;
      return { bac: tier.bac, price: tier.price, limit: tier.limit, kwh: tier.limit, cost: maxCost };
    }
    const kwh = Math.floor(remaining / tier.price);
    const cost = kwh * tier.price;
    remaining = 0;
    totalKwh += kwh;
    totalCost += cost;
    return { bac: tier.bac, price: tier.price, limit: tier.limit, kwh, cost };
  });

  return { bill, rows, totalKwh, totalCost };
}
