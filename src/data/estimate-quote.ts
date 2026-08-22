import { computeAutoCalc } from "@/data/auto-calc";
import { cabinetById, cabinetLabel, inverterById, inverterLabel, type EstimateInputs } from "@/data/estimate";
import { loadEstimateConfig } from "@/data/estimate-config";
import { buildLaborSheet } from "@/data/estimate-labor";
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
  unitPriceLines?: string[];
  image?: string;
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

export function buildEstimateQuote(form: EstimateInputs, mode: "auto" | "manual" = "auto") {
  const summerBill = mode === "auto" ? form.summerBillAuto : form.summerBillManual;
  const winterBill = mode === "auto" ? form.winterBillAuto : form.winterBillManual;
  const summerKwh = kwhFromBill(amountExclVat(summerBill)).totalKwh;
  const winterKwh = kwhFromBill(amountExclVat(winterBill)).totalKwh;
  const config = loadEstimateConfig();
  const calc = computeAutoCalc({
    summerBill: amountExclVat(summerBill),
    winterBill: amountExclVat(winterBill),
    tariff: 2954,
    pshSummer: config.pshSummer,
    pshWinter: config.pshWinter,
    panelName: mode === "auto" ? form.panelTypeAuto : form.panelTypeManual,
    dayRate: form.dayRate,
    dischargeEff: config.dischargeEff,
    batteryName: mode === "auto" ? form.batteryTypeAuto : form.batteryTypeManual,
    panelCount: mode === "auto" ? 0 : form.panelCountManual,
    batteryQty: mode === "auto" ? 0 : form.batteryQtyManual,
    summerKwh,
    winterKwh,
  });

  const panelUnitPrice = PANEL_PRICES[calc.panel.name] ?? 3_200_000;
  const selectedInverter = inverterById(
    mode === "auto" ? form.inverterTypeAuto : form.inverterTypeManual,
  );
  const fallbackInverterPrice = Math.round(
    (form.phase === "Điện 3 pha" ? 18_000_000 : 12_000_000) +
      calc.inverterKw * (form.phase === "Điện 3 pha" ? 1_150_000 : 900_000),
  );
  const inverterUnitPrice =
    selectedInverter?.customerPrice ?? selectedInverter?.referencePrice ?? fallbackInverterPrice;
  const selectedCabinet = cabinetById(form.cabinetType);
  const cabinetUnitPrice =
    selectedCabinet?.price || CABINET_PRICES[form.cabinetType] || 8_000_000;

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

  const labor = buildLaborSheet(form, calc.panelCount);
  const laborTotal = labor.total;

  const batteryLines = (calc.batteryCombo.items.length ? calc.batteryCombo.items : [calc.battery]).map(
    (item, index) => {
      return `${index + 1}. ${item.name}`;
    },
  );
  const batteryPriceLines = (calc.batteryCombo.items.length ? calc.batteryCombo.items : [calc.battery]).map(
    (item, index) => {
      const unitPrice = (item as { price?: number }).price ?? calc.unitPrice;
      return `${index + 1}. ${new Intl.NumberFormat("vi-VN").format(Math.round(unitPrice))}`;
    },
  );

  const rows: EstimateQuoteRow[] = [
    {
      no: "1",
      name: `Pin ${calc.panel.name} x ${calc.panelCount}`,
      unit: "tấm",
      qty: calc.panelCount,
      unitPrice: panelUnitPrice,
      total: panelUnitPrice * calc.panelCount,
      image: calc.panel.image,
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
      image: selectedInverter?.image,
    },
    {
      no: "3",
      name: selectedCabinet ? cabinetLabel(selectedCabinet.id) : form.cabinetType,
      unit: selectedCabinet?.unit || "bộ",
      qty: 1,
      unitPrice: cabinetUnitPrice,
      total: cabinetUnitPrice,
      image: selectedCabinet?.image,
    },
    {
      no: "4",
      name: `Pin lưu trữ\n${batteryLines.join("\n")}`,
      unit: "bộ",
      qty: calc.batteryQty,
      unitPrice: calc.lineTotal,
      total: calc.lineTotal,
      unitPriceLines: batteryPriceLines,
      image: calc.battery.image,
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
