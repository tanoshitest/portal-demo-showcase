import { inverterCatalogItems } from "./inverter-catalog";
import {
  cabinetCapacityKwOf,
  cabinetPhaseOf,
  equipmentCatalogGroups,
  mergeSeedCabinets,
  type EquipmentCatalogGroup,
  type EquipmentCatalogItem,
} from "@/data/equipment-catalog";

export const EQUIPMENT_CATALOG_STORAGE_KEY = "portal-equipment-catalog-v5";

export type EstimatePanelType = {
  id: string;
  name: string;
  watt: number;
  areaM2: number;
  image?: string;
};

export const DEFAULT_PANEL_TYPES: EstimatePanelType[] = [
  { id: "trina-630", name: "TRINA 630", watt: 630, areaM2: 2.84 },
  { id: "longi-650", name: "LONGI 650", watt: 650, areaM2: 2.84 },
  { id: "aiko-650", name: "AIKO 650", watt: 650, areaM2: 2.84 },
  { id: "vsun-580", name: "VSUN 580", watt: 580, areaM2: 2.7 },
  { id: "jinko-625", name: "JINKO 625", watt: 625, areaM2: 2.75 },
  { id: "tcl-620", name: "TCL 620", watt: 620, areaM2: 2.8 },
];

const defaultAvailableNames = new Set(DEFAULT_PANEL_TYPES.map((panel) => panel.name));

function defaultPanelItems(): EquipmentCatalogItem[] {
  return DEFAULT_PANEL_TYPES.map((panel) => ({
    id: panel.id,
    code: panel.name,
    name: `Tấm pin năng lượng mặt trời ${panel.watt}W`,
    specification: "",
    unit: "Tấm",
    referencePrice: null,
    note: "",
    capacityKwp: panel.watt / 1000,
    areaM2: panel.areaM2,
    stockQuantity: 1,
  }));
}

function panelItemsFromStorage(): EquipmentCatalogItem[] {
  const fallback = defaultPanelItems();
  if (typeof window === "undefined") return fallback;

  try {
    const saved = localStorage.getItem(EQUIPMENT_CATALOG_STORAGE_KEY);
    if (!saved) return fallback;
    const groups = JSON.parse(saved) as EquipmentCatalogGroup[];
    return groups.find((group) => group.id === "pin")?.items ?? fallback;
  } catch {
    return fallback;
  }
}

function panelId(item: EquipmentCatalogItem, name: string) {
  return (
    item.id ??
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  );
}

function toPanelType(item: EquipmentCatalogItem): EstimatePanelType | null {
  const name = item.code.trim() || item.name.trim();
  const legacy = DEFAULT_PANEL_TYPES.find((panel) => panel.name === name);
  const watt = item.capacityKwp && item.capacityKwp > 0 ? item.capacityKwp * 1000 : legacy?.watt;
  if (!name || !watt) return null;

  return {
    id: panelId(item, name),
    name,
    watt: Math.round(watt),
    areaM2: item.areaM2 && item.areaM2 > 0 ? item.areaM2 : (legacy?.areaM2 ?? 2.8),
    image: item.image ?? "",
  };
}

export function panelStockQuantity(item: EquipmentCatalogItem) {
  if (item.stockQuantity != null) return Math.max(0, Math.trunc(item.stockQuantity));
  return defaultAvailableNames.has(item.code.trim() || item.name.trim()) ? 1 : 0;
}

export function getCatalogPanelTypes({ inStockOnly = false } = {}): EstimatePanelType[] {
  return panelItemsFromStorage()
    .filter((item) => !inStockOnly || panelStockQuantity(item) > 0)
    .map(toPanelType)
    .filter((panel): panel is EstimatePanelType => panel != null);
}

export function getAvailablePanelTypes() {
  return getCatalogPanelTypes({ inStockOnly: true });
}

function inverterItemsFromStorage(): EquipmentCatalogItem[] {
  if (typeof window === "undefined") return inverterCatalogItems;

  try {
    const saved = localStorage.getItem(EQUIPMENT_CATALOG_STORAGE_KEY);
    if (!saved) return inverterCatalogItems;
    const groups = JSON.parse(saved) as EquipmentCatalogGroup[];
    return groups.find((group) => group.id === "bien-tan")?.items ?? inverterCatalogItems;
  } catch {
    return inverterCatalogItems;
  }
}

export function getCatalogInverterTypes({ inStockOnly = true } = {}) {
  return inverterItemsFromStorage()
    .filter((item) => !inStockOnly || panelStockQuantity(item) > 0)
    .filter((item) => item.capacityKw != null)
    .map((item) => ({
      ...item,
      stockQuantity: item.stockQuantity ?? 1,
    }))
    .map((item) => ({
      ...item,
      id: item.id ?? item.code,
    }))
    .filter((item) => item.id);
}

export function findPanelTypeByName(name: string) {
  const catalogPanels = getCatalogPanelTypes();
  return (
    catalogPanels.find((panel) => panel.name === name) ??
    getAvailablePanelTypes()[0] ??
    DEFAULT_PANEL_TYPES.find((panel) => panel.name === name) ??
    DEFAULT_PANEL_TYPES[0]
  );
}

export type CatalogBatteryType = {
  id: string;
  name: string;
  kwh: number;
  price: number;
  stock: number;
  group: string;
  image?: string;
};

function batteryId(item: EquipmentCatalogItem, fallback: string) {
  return (
    item.id ??
    fallback
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  );
}

export function getCatalogBatteryTypes({ inStockOnly = true } = {}): CatalogBatteryType[] {
  const fallback: CatalogBatteryType[] = [];
  if (typeof window === "undefined") return fallback;

  try {
    const saved = localStorage.getItem(EQUIPMENT_CATALOG_STORAGE_KEY);
    if (!saved) return fallback;
    const groups = JSON.parse(saved) as EquipmentCatalogGroup[];
    const items = groups.find((group) => group.id === "pin-luu-tru")?.items ?? [];

    return items
      .map((item) => {
        const name = item.code.trim() || item.name.trim();
        const kwh = item.capacityKwh ?? 0;
        const price = Math.max(0, item.referencePrice ?? item.customerPrice ?? 0);
        const stock = panelStockQuantity(item);
        return {
          id: batteryId(item, name),
          name,
          kwh,
          price,
          stock,
          group: item.batteryGroup ?? "",
          image: item.image ?? "",
        };
      })
      .filter((item) => item.name && item.kwh > 0 && item.price > 0)
      .filter((item) => !inStockOnly || item.stock > 0);
  } catch {
    return fallback;
  }
}

export type CatalogCabinetType = {
  id: string;
  name: string;
  phase: "1 pha" | "3 pha";
  capacityKw?: number;
  price: number;
  image?: string;
  unit: string;
};

function cabinetItemsFromStorage(): EquipmentCatalogItem[] {
  const seed = equipmentCatalogGroups.find((group) => group.id === "tu-dien")?.items ?? [];
  if (typeof window === "undefined") return seed;
  try {
    const saved = localStorage.getItem(EQUIPMENT_CATALOG_STORAGE_KEY);
    if (!saved) return seed;
    const groups = mergeSeedCabinets(JSON.parse(saved) as EquipmentCatalogGroup[]);
    return groups.find((group) => group.id === "tu-dien")?.items ?? seed;
  } catch {
    return seed;
  }
}

function cabinetId(item: EquipmentCatalogItem) {
  return item.id ?? item.code;
}

export function getCatalogCabinetTypes(): CatalogCabinetType[] {
  return cabinetItemsFromStorage()
    .map((item) => {
      const phase = cabinetPhaseOf(item);
      if (phase !== "1 pha" && phase !== "3 pha") return null;
      return {
        id: cabinetId(item),
        name: item.name.trim() || item.code.trim(),
        phase,
        capacityKw: cabinetCapacityKwOf(item),
        price: Math.max(0, item.referencePrice ?? item.customerPrice ?? 0),
        image: item.image ?? "",
        unit: item.unit || "Tủ",
      };
    })
    .filter((item): item is CatalogCabinetType => Boolean(item?.id && item.name));
}
