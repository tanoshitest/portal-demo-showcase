import { materialCategories, materials, type Material } from "@/data/materials";
import { persistLocalAndCloud } from "@/lib/cloud-state-client";

export const MATERIALS_STORAGE_KEY = "hv_admin_materials_v2";

function cloneMaterial(item: Material): Material {
  return { ...item };
}

export function cloneMaterials(list: Material[]): Material[] {
  return list.map(cloneMaterial);
}

function isMaterial(value: unknown): value is Material {
  if (!value || typeof value !== "object") return false;
  const m = value as Partial<Material>;
  return typeof m.id === "string" && typeof m.name === "string";
}

function parseMoney(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
}

function parseStock(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
}

function emptyMaterial(id: string): Material {
  return {
    id,
    categoryId: materialCategories[0]?.id ?? "tam-pin",
    name: "",
    size: "",
    description: "",
    unit: "cái",
    warranty: "",
    costPrice: 0,
    retailPrice: 0,
    stock: 0,
    note: "",
    image: "",
  };
}

function hydrate(stored: Material, seed?: Material): Material {
  const categoryId =
    stored.categoryId && materialCategories.some((c) => c.id === stored.categoryId)
      ? stored.categoryId
      : (seed?.categoryId ?? materialCategories[0]?.id ?? "tam-pin");
  return {
    ...(seed ? cloneMaterial(seed) : emptyMaterial(stored.id)),
    ...stored,
    categoryId,
    costPrice: parseMoney(stored.costPrice ?? seed?.costPrice),
    retailPrice: parseMoney(stored.retailPrice ?? seed?.retailPrice),
    stock: parseStock(stored.stock ?? seed?.stock),
    note: stored.note ?? seed?.note ?? "",
    image: stored.image || seed?.image || "",
  };
}

function readStored(): Material[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MATERIALS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const list = parsed.filter(isMaterial);
    return list.length ? list : null;
  } catch {
    return null;
  }
}

export function loadAdminMaterials(): Material[] {
  const allMock = cloneMaterials(materials);
  const seed = allMock.slice(0, 1);
  const stored = readStored();
  if (!stored) return seed;

  const storedById = new Map(stored.map((m) => [m.id, m]));
  const seedIds = new Set(allMock.map((m) => m.id));
  const merged = seed.map((m) => {
    const override = storedById.get(m.id);
    return override ? hydrate(override, m) : m;
  });
  const extras = stored.filter((m) => !seedIds.has(m.id)).map((m) => hydrate(m));
  return [...merged, ...extras];
}

export function saveAdminMaterials(list: Material[]): void {
  if (typeof window === "undefined") return;
  persistLocalAndCloud(MATERIALS_STORAGE_KEY, list);
}

export function upsertAdminMaterial(list: Material[], next: Material): Material[] {
  const index = list.findIndex((m) => m.id === next.id);
  const updated = index >= 0 ? list.map((m, i) => (i === index ? next : m)) : [...list, next];
  saveAdminMaterials(updated);
  return updated;
}
