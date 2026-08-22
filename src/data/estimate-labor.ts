import { equipmentCatalogGroups } from "@/data/equipment-catalog";
import type { EstimateInputs } from "@/data/estimate";
import { EQUIPMENT_CATALOG_STORAGE_KEY } from "@/data/panel-catalog";

export const LABOR_INSTALL_RATE = 500_000;
export const LABOR_TRANSPORT_RATE = 500_000;
export const LABOR_CRANE_RATE = 1_500_000;

function laborCatalogPrice(code: string, fallback: number) {
  const seed = equipmentCatalogGroups.find((group) => group.id === "nhan-cong")?.items ?? [];
  let items = seed;
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(EQUIPMENT_CATALOG_STORAGE_KEY);
      if (saved) {
        const groups = JSON.parse(saved) as typeof equipmentCatalogGroups;
        items = groups.find((group) => group.id === "nhan-cong")?.items ?? seed;
      }
    } catch {
      items = seed;
    }
  }
  const item = items.find((row) => row.code === code);
  return item?.referencePrice ?? item?.customerPrice ?? fallback;
}

export type LaborSheet = {
  panelCong: number;
  roofCong: number;
  cabinetCong: number;
  materialCong: number;
  surveyCong: number;
  installCong: number;
  installRate: number;
  installTotal: number;
  transportQty: number;
  transportUnit: string;
  transportRate: number;
  transportTotal: number;
  craneQty: number;
  craneUnit: string;
  craneRate: number;
  craneTotal: number;
  total: number;
};

export function buildLaborSheet(form: EstimateInputs, panelCount: number): LaborSheet {
  const panels = Math.max(0, Math.round(panelCount));
  const panelCong = panels > 0 ? panels / 4 : 0;
  const roofCong = form.roof === "Mái ngói" ? 1 : 0;
  const cabinetCong = form.cabinetType ? 2 : 0;
  const materialCong = panels > 0 ? 1 : 0;
  const surveyCong = 1;
  const installCong = panelCong + roofCong + cabinetCong + materialCong + surveyCong;
  const installRate = LABOR_INSTALL_RATE;
  const installTotal = installCong * installRate;

  const transportQty = form.remote ? Math.max(1, form.remoteDays) : 1;
  const transportRate = form.remotePrice || LABOR_TRANSPORT_RATE;
  const transportTotal = transportQty * transportRate;

  const craneQty = form.crane ? Math.max(0, form.craneShifts) : 0;
  const craneRate = laborCatalogPrice("LAB-CRANE", LABOR_CRANE_RATE);
  const craneTotal = craneQty * craneRate;

  return {
    panelCong,
    roofCong,
    cabinetCong,
    materialCong,
    surveyCong,
    installCong,
    installRate,
    installTotal,
    transportQty,
    transportUnit: "Gói",
    transportRate,
    transportTotal,
    craneQty,
    craneUnit: "Ca",
    craneRate,
    craneTotal,
    total: installTotal + transportTotal + craneTotal,
  };
}
