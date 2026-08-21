import { categories, type Category } from "@/data/mock";
import { persistLocalAndCloud } from "@/lib/cloud-state-client";

export const CATEGORIES_STORAGE_KEY = "hv_admin_categories";

export function loadAdminCategories(): Category[] {
  const seed = categories.slice(0, 1).map((item) => ({ ...item }));
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as Category[];
    if (!Array.isArray(parsed)) return seed;
    const mockIds = new Set(categories.map((item) => item.id));
    const savedSeed = parsed.find((item) => item.id === seed[0]?.id);
    const custom = parsed.filter((item) => item?.id && item?.slug && item?.name && !mockIds.has(item.id));
    return [...(savedSeed ? [{ ...seed[0], ...savedSeed }] : seed), ...custom];
  } catch {
    return seed;
  }
}

export function saveAdminCategories(list: Category[]) {
  if (typeof window === "undefined") return;
  persistLocalAndCloud(CATEGORIES_STORAGE_KEY, list);
}
