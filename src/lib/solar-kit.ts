import {
  categoryLabel,
  type PricingRule,
  type QuoteLine,
  type QuoteScenario,
  type SolarProduct,
} from "@/data/solar";
import { calculateFinalPrice } from "@/lib/solar-engine";

/** Lấy con số đầu tiên trong thông số (vd "580 Wp" -> 580) */
export function specNumber(product: SolarProduct, key: string): number {
  const raw = String(product.specs[key] ?? "").replace(/\./g, "").replace(",", ".");
  const match = raw.match(/[\d.]+/);
  return match ? Number(match[0]) : 0;
}

export const panelWatt = (p: SolarProduct) => specNumber(p, "Công suất") || 550;
export const inverterKw = (p: SolarProduct) => specNumber(p, "Công suất") || 5;
export const batteryKwh = (p: SolarProduct) => specNumber(p, "Dung lượng") || 4.8;

function toLine(product: SolarProduct, quantity: number, rules: PricingRule[]): QuoteLine {
  const qty = Math.max(0, Math.round(quantity * 10) / 10);
  return {
    productId: product.id,
    sku: product.sku,
    name: product.name,
    category: product.category,
    unit: product.unit,
    specsSnapshot: { ...product.specs },
    warrantySnapshot: product.warrantyInfo,
    image: product.image,
    costPriceSnapshot: product.costPrice,
    unitPriceSnapshot: calculateFinalPrice(
      product.costPrice,
      Math.max(1, Math.ceil(qty)),
      rules,
      product.category,
    ),
    quantity: qty,
  };
}

export type KitConfig = {
  kwp: number;
  scenario: QuoteScenario;
  panelId: string;
  inverterId: string;
  batteryId: string;
  batteryCount: number;
  /** Ghi đè số lượng theo productId (chế độ Thủ công) */
  overrides?: Record<string, number>;
};

/** Sinh danh sách dòng báo giá (bộ kit) từ cấu hình hệ thống */
export function buildKitLines(config: KitConfig, products: SolarProduct[], rules: PricingRule[]) {
  const byId = (id: string) => products.find((p) => p.id === id);
  const panel = byId(config.panelId) ?? products.find((p) => p.category === "panel");
  const inverter = byId(config.inverterId) ?? products.find((p) => p.category === "inverter");
  const battery = byId(config.batteryId) ?? products.find((p) => p.category === "battery");
  const rack = products.find((p) => p.sku === "ACC-RACK-AL");
  const box = products.find((p) => p.sku === "ACC-DCBOX");
  const cable = products.find((p) => p.sku === "ACC-CABLE-PV");
  const labor = products.find((p) => p.category === "labor");

  const kwp = Math.max(0.5, config.kwp);
  const lines: QuoteLine[] = [];

  if (panel) lines.push(toLine(panel, Math.ceil((kwp * 1000) / panelWatt(panel)), rules));
  if (inverter) lines.push(toLine(inverter, Math.max(1, Math.ceil(kwp / inverterKw(inverter))), rules));
  if (config.scenario === "hybrid" && battery && config.batteryCount > 0)
    lines.push(toLine(battery, config.batteryCount, rules));
  const panelQty = lines.find((l) => l.category === "panel")?.quantity ?? 0;
  if (rack) lines.push(toLine(rack, panelQty, rules));
  if (box) lines.push(toLine(box, 1, rules));
  if (cable) lines.push(toLine(cable, Math.max(1, Math.ceil(panelQty / 10)), rules));
  if (labor) lines.push(toLine(labor, Math.round(kwp * 10) / 10, rules));

  if (config.overrides) {
    return lines.map((l) => {
      const qty = config.overrides?.[l.productId];
      if (qty === undefined) return l;
      const product = byId(l.productId)!;
      return toLine(product, qty, rules);
    });
  }
  return lines;
}

export const groupLabel = categoryLabel;
