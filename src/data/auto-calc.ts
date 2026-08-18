import { autoInverterKw, BATTERY_TYPES } from "@/data/estimate";
import { findPanelTypeByName } from "@/data/panel-catalog";
import { persistLocalAndCloud } from "@/lib/cloud-state-client";
import { getCatalogBatteryTypes, type CatalogBatteryType } from "@/data/panel-catalog";

export const AUTO_CALC_KEY = "hv_auto_calc_v1";
export const DEFAULT_TARIFF_VND = 2954;
export const PSH_SUMMER = 4.6;
export const PSH_WINTER = 2.3;
export const DAYS_PER_MONTH = 30;

export type AutoCalcInputs = {
  summerBill: number;
  winterBill: number;
  tariff: number;
  pshSummer: number;
  pshWinter: number;
  panelName: string;
  dayRate: number;
  dischargeEff: number;
  batteryName: string;
  panelCount: number;
  batteryQty: number;
  summerKwh?: number;
  winterKwh?: number;
};

export function defaultAutoCalcInputs(): AutoCalcInputs {
  return {
    summerBill: 1_851_852,
    winterBill: 1_388_889,
    tariff: DEFAULT_TARIFF_VND,
    pshSummer: PSH_SUMMER,
    pshWinter: PSH_WINTER,
    panelName: "JINKO 625",
    dayRate: 40,
    dischargeEff: 80,
    batteryName: "EJOR 16 - BH7",
    panelCount: 0,
    batteryQty: 0,
  };
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function round3(n: number) {
  return Math.round(n * 1000) / 1000;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function panelByName(name: string) {
  return findPanelTypeByName(name);
}

function batteryByName(name: string) {
  return BATTERY_TYPES.find((b) => b.name === name) ?? BATTERY_TYPES[0];
}

export type BatteryComboItem = {
  name: string;
  kwh: number;
  price: number;
  qty: number;
};

export type BatteryCombo = {
  totalKwh: number;
  totalPrice: number;
  items: BatteryComboItem[];
  label: string;
  primary: CatalogBatteryType | null;
};

function roundCapacityKey(kwh: number) {
  return Math.round(kwh * 100);
}

function buildBatteryCombo(targetKwh: number, batteries: CatalogBatteryType[]): BatteryCombo {
  const usable = batteries
    .filter((battery) => battery.stock > 0 && battery.price > 0 && battery.kwh > 0)
    .sort((a, b) => a.price / b.kwh - b.price / b.kwh || a.price - b.price);

  if (!usable.length) {
    const fallback = batteryByName("EJOR 16 - BH7");
    const qty = Math.max(1, Math.ceil(targetKwh / fallback.kwh));
    return {
      totalKwh: roundCapacityKey(fallback.kwh * qty) / 100,
      totalPrice: fallback.price * qty,
      items: [{ name: fallback.name, kwh: fallback.kwh, price: fallback.price, qty }],
      label: `${fallback.name} x ${qty}`,
      primary: { id: fallback.id, name: fallback.name, kwh: fallback.kwh, price: fallback.price, stock: qty, group: "" },
    };
  }

  const target = Math.max(1, roundCapacityKey(targetKwh));
  const maxCapacity = usable.reduce((sum, item) => sum + roundCapacityKey(item.kwh) * item.stock, 0);
  const limit = Math.max(target, maxCapacity);
  const dp = Array.from({ length: limit + 1 }, () => ({
    cost: Number.POSITIVE_INFINITY,
    prev: -1,
    item: -1,
  }));
  dp[0] = { cost: 0, prev: -1, item: -1 };

  for (let i = 0; i < usable.length; i += 1) {
    const battery = usable[i];
    const cap = roundCapacityKey(battery.kwh);
    for (let count = 0; count < battery.stock; count += 1) {
      for (let total = limit - cap; total >= 0; total -= 1) {
        if (!Number.isFinite(dp[total].cost)) continue;
        const next = total + cap;
        const nextCost = dp[total].cost + battery.price;
        if (
          nextCost < dp[next].cost ||
          (nextCost === dp[next].cost && total + cap < dp[next].prev + (dp[next].item >= 0 ? cap : 0))
        ) {
          dp[next] = { cost: nextCost, prev: total, item: i };
        }
      }
    }
  }

  let bestIndex = -1;
  for (let total = target; total <= limit; total += 1) {
    if (!Number.isFinite(dp[total].cost)) continue;
    if (bestIndex === -1 || dp[total].cost < dp[bestIndex].cost) bestIndex = total;
  }

  if (bestIndex === -1) {
    const fallback = usable[0];
    const qty = Math.max(1, Math.ceil(targetKwh / fallback.kwh));
    return {
      totalKwh: roundCapacityKey(fallback.kwh * qty) / 100,
      totalPrice: fallback.price * qty,
      items: [{ name: fallback.name, kwh: fallback.kwh, price: fallback.price, qty }],
      label: `${fallback.name} x ${qty}`,
      primary: fallback,
    };
  }

  const counts = new Map<number, number>();
  let cursor = bestIndex;
  while (cursor > 0) {
    const node = dp[cursor];
    if (node.item < 0 || node.prev < 0) break;
    counts.set(node.item, (counts.get(node.item) ?? 0) + 1);
    cursor = node.prev;
  }

  const items = [...counts.entries()]
    .map(([index, qty]) => ({ ...usable[index], qty }))
    .sort((a, b) => a.price / a.kwh - b.price / b.kwh || b.kwh - a.kwh);
  const totalKwh = items.reduce((sum, item) => sum + item.kwh * item.qty, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const label = items.map((item) => `${item.name} x ${item.qty}`).join(" + ");

  return {
    totalKwh: roundCapacityKey(totalKwh) / 100,
    totalPrice,
    items,
    label,
    primary: items[0] ?? null,
  };
}

export function computeAutoCalc(input: AutoCalcInputs) {
  const panel = panelByName(input.panelName);
  const catalogBatteries = getCatalogBatteryTypes({ inStockOnly: true });
  const tariff = Math.max(1, input.tariff || DEFAULT_TARIFF_VND);
  const pshSummer = Math.max(0.1, input.pshSummer || PSH_SUMMER);
  const pshWinter = Math.max(0.1, input.pshWinter || PSH_WINTER);
  const panelKwp = round3(panel.watt / 1000);

  const summerKwh =
    input.summerKwh != null
      ? Math.round(Math.max(0, input.summerKwh))
      : Math.round(Math.max(0, input.summerBill) / tariff);
  const winterKwh =
    input.winterKwh != null
      ? Math.round(Math.max(0, input.winterKwh))
      : Math.round(Math.max(0, input.winterBill) / tariff);
  const summerDaily = Math.round(summerKwh / DAYS_PER_MONTH);
  const winterDaily = Math.round(winterKwh / DAYS_PER_MONTH);

  const summerNeedKwp = round1(summerDaily / pshSummer);
  const winterNeedKwp = round1(winterDaily / pshWinter);

  const summerPanels = Math.ceil(summerNeedKwp / panelKwp);
  const winterPanels = Math.ceil(winterNeedKwp / panelKwp);
  const suggestedPanels = Math.max(Math.ceil(summerPanels), Math.ceil(winterPanels));
  const panelCount = input.panelCount > 0 ? input.panelCount : suggestedPanels;
  const totalKwp = round1(panelCount * panelKwp);
  const inverterKw = autoInverterKw(totalKwp);
  const area1 = panel.areaM2;
  const totalArea = Math.round(panelCount * area1);

  const dayRate = Math.min(100, Math.max(0, input.dayRate));
  const nightRate = 100 - dayRate;
  const summerNight = round1((summerDaily * nightRate) / 100);
  const winterNight = round1((winterDaily * nightRate) / 100);
  const eff = Math.max(1, input.dischargeEff) / 100;
  const summerBatt = round2(summerNight / eff);
  const winterBatt = round2(winterNight / eff);
  const neededBatt = Math.max(summerBatt, winterBatt);
  const combo = buildBatteryCombo(neededBatt, catalogBatteries.length ? catalogBatteries : BATTERY_TYPES.map((battery) => ({
    id: battery.id,
    name: battery.name,
    kwh: battery.kwh,
    price: battery.price,
    stock: 99,
    group: "",
  })));
  const battery = combo.primary ?? batteryByName(input.batteryName);
  const suggestedQty = combo.items.reduce((sum, item) => sum + item.qty, 0) || Math.max(1, Math.ceil(neededBatt / battery.kwh - 1e-9));
  const batteryQty = suggestedQty;
  const totalBatt = combo.totalKwh || round2(battery.kwh * batteryQty);
  const lineTotal = combo.totalPrice || battery.price * batteryQty;

  return {
    panel,
    battery,
    batteryCombo: combo,
    panelKwp,
    summerKwh,
    winterKwh,
    summerDaily,
    winterDaily,
    pshSummer,
    pshWinter,
    summerNeedKwp,
    winterNeedKwp,
    summerPanels,
    winterPanels,
    suggestedPanels,
    panelCount,
    totalKwp,
    inverterKw,
    area1,
    totalArea,
    dayRate,
    nightRate,
    summerNight,
    winterNight,
    dischargeEff: input.dischargeEff,
    summerBatt,
    winterBatt,
    neededBatt,
    suggestedQty,
    batteryQty,
    totalBatt,
    unitPrice: battery.price,
    lineTotal,
  };
}

export function loadAutoCalcInputs(): AutoCalcInputs {
  const seed = defaultAutoCalcInputs();
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(AUTO_CALC_KEY);
    if (!raw) return seed;
    return { ...seed, ...(JSON.parse(raw) as Partial<AutoCalcInputs>) };
  } catch {
    return seed;
  }
}

export function saveAutoCalcInputs(form: AutoCalcInputs) {
  if (typeof window === "undefined") return;
  persistLocalAndCloud(AUTO_CALC_KEY, form);
}
