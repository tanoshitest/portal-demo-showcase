import { computeAutoCalc } from "@/data/auto-calc";
import { inverterById, inverterLabel, type EstimateInputs } from "@/data/estimate";
import { amountExclVat, kwhFromBill } from "@/data/evn-bill";

export type EstimateQuoteRow = {
  no: string;
  name: string;
  unit: string;
  qty: number;
  unitPrice: number;
  total: number;
  priceRowSpan?: number;
  hidePrices?: boolean;
};

const PANEL_PRICES: Record<string, number> = {
  "TRINA 630": 3_150_000,
  "LONGI 650": 3_450_000,
  "AIKO 650": 3_800_000,
  "VSUN 580": 2_650_000,
  "JINKO 625": 3_250_000,
  "TCL 620": 2_950_000,
};

const CABINET_PRICES: Record<string, number> = {
  "Tủ điện AC 1 pha": 6_500_000,
  "Tủ điện AC 3 pha": 9_500_000,
  "Tủ điện DC": 8_000_000,
  "Tủ điện hybrid AC/DC": 12_500_000,
};

export function buildEstimateQuote(form: EstimateInputs) {
  const summerKwh = kwhFromBill(amountExclVat(form.summerBillAuto)).totalKwh;
  const winterKwh = kwhFromBill(amountExclVat(form.winterBillAuto)).totalKwh;
  const calc = computeAutoCalc({
    summerBill: amountExclVat(form.summerBillAuto),
    winterBill: amountExclVat(form.winterBillAuto),
    tariff: 2954,
    pshSummer: 4.6,
    pshWinter: 2.3,
    panelName: form.panelTypeAuto,
    dayRate: form.dayRate,
    dischargeEff: 80,
    batteryName: form.batteryTypeAuto,
    panelCount: 0,
    batteryQty: 0,
    summerKwh,
    winterKwh,
  });

  const panelUnitPrice = PANEL_PRICES[calc.panel.name] ?? 3_200_000;
  const selectedInverter = inverterById(form.inverterTypeAuto);
  const fallbackInverterPrice = Math.round(
    (form.phase === "Điện 3 pha" ? 18_000_000 : 12_000_000) +
      calc.inverterKw * (form.phase === "Điện 3 pha" ? 1_150_000 : 900_000),
  );
  const inverterUnitPrice =
    selectedInverter?.customerPrice ?? selectedInverter?.referencePrice ?? fallbackInverterPrice;
  const cabinetUnitPrice = CABINET_PRICES[form.cabinetType] ?? 8_000_000;

  const accessoryPerPanel =
    form.roof === "Mái ngói" ? 650_000 : form.roof === "Khung giàn" ? 750_000 : 450_000;
  const accessoryTotal = 2_500_000 + calc.panelCount * accessoryPerPanel;
  const acWireUnitPrice = form.acWire.includes("3*10")
    ? 85_000
    : form.acWire.includes("3 Pha")
      ? 62_000
      : 52_000;
  const wireTotal =
    Math.max(0, form.acWireM) * acWireUnitPrice +
    Math.max(0, form.dcWireM) * 28_000 +
    Math.max(0, form.pipeM) * 12_000;
  const accessoryAndWireTotal = accessoryTotal + wireTotal;

  const laborTotal =
    calc.panelCount * (form.phase === "Điện 3 pha" ? 420_000 : 360_000) +
    (form.crane ? form.cranePrice * Math.max(0, form.craneShifts) : 0) +
    (form.remote ? form.remotePrice * Math.max(0, form.remoteDays) : 0);

  const rows: EstimateQuoteRow[] = [
    {
      no: "1",
      name: `Pin ${calc.panel.name} x ${calc.panelCount}`,
      unit: "tấm",
      qty: calc.panelCount,
      unitPrice: panelUnitPrice,
      total: panelUnitPrice * calc.panelCount,
    },
    {
      no: "2",
      name: selectedInverter
        ? `Biến tần ${inverterLabel(selectedInverter.id)}`
        : `Biến tần ${Math.round(calc.inverterKw)} kW`,
      unit: "bộ",
      qty: 1,
      unitPrice: inverterUnitPrice,
      total: inverterUnitPrice,
    },
    {
      no: "3",
      name: form.cabinetType,
      unit: "bộ",
      qty: 1,
      unitPrice: cabinetUnitPrice,
      total: cabinetUnitPrice,
    },
    {
      no: "4",
      name: `Pin lưu trữ ${calc.battery.name} x ${calc.batteryQty}`,
      unit: "bộ",
      qty: calc.batteryQty,
      unitPrice: calc.battery.price,
      total: calc.battery.price * calc.batteryQty,
    },
    {
      no: "5",
      name: "Gói phụ kiện lắp đặt",
      unit: "gói",
      qty: 1,
      unitPrice: accessoryAndWireTotal,
      total: accessoryAndWireTotal,
      priceRowSpan: 2,
    },
    {
      no: "6",
      name: "Dây dẫn AC/DC",
      unit: "mét",
      qty: Math.max(0, form.acWireM) + Math.max(0, form.dcWireM),
      unitPrice: 0,
      total: 0,
      hidePrices: true,
    },
    {
      no: "7",
      name: "Nhân công thi công",
      unit: "gói",
      qty: 1,
      unitPrice: laborTotal,
      total: laborTotal,
    },
  ];

  return {
    calc,
    rows,
    total: rows.reduce((sum, row) => sum + row.total, 0),
  };
}
