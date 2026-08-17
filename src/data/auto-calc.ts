import { autoInverterKw, BATTERY_TYPES, PANEL_TYPES } from "@/data/estimate";
import { persistLocalAndCloud } from "@/lib/cloud-state-client";

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
  return PANEL_TYPES.find((p) => p.name === name) ?? PANEL_TYPES[0];
}

function batteryByName(name: string) {
  return BATTERY_TYPES.find((b) => b.name === name) ?? BATTERY_TYPES[0];
}

export function computeAutoCalc(input: AutoCalcInputs) {
  const panel = panelByName(input.panelName);
  const battery = batteryByName(input.batteryName);
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
  const suggestedQty = Math.max(1, Math.ceil(neededBatt / battery.kwh - 1e-9));
  const batteryQty = input.batteryQty > 0 ? input.batteryQty : suggestedQty;
  const totalBatt = round2(battery.kwh * batteryQty);
  const lineTotal = battery.price * batteryQty;

  return {
    panel,
    battery,
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
