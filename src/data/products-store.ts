import { products, type Product } from "@/data/mock";
import { persistLocalAndCloud } from "@/lib/cloud-state-client";

export const PRODUCTS_STORAGE_KEY = "hv_admin_products";

function cloneProduct(product: Product): Product {
  return {
    ...product,
    highlights: [...product.highlights],
    specs: product.specs.map((s) => ({ ...s })),
    variants: product.variants.map((v) => ({ ...v })),
    reviews: product.reviews.map((r) => ({ ...r })),
  };
}

export function cloneProducts(list: Product[]): Product[] {
  return list.map(cloneProduct);
}

function isRemoteImage(src: string | undefined): boolean {
  if (!src) return false;
  return (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  );
}

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<Product>;
  return typeof p.id === "string" && typeof p.name === "string" && typeof p.sku === "string";
}

function parseStock(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.round(value));
  if (value === "out_of_stock") return 0;
  if (value === "low_stock") return 3;
  if (value === "in_stock") return 20;
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
}

function hydrate(stored: Product, mock?: Product): Product {
  const image = isRemoteImage(stored.image) ? stored.image : (mock?.image ?? stored.image ?? "");
  return {
    ...(mock ? cloneProduct(mock) : emptyProduct(stored.id)),
    ...stored,
    image,
    stock: parseStock(stored.stock ?? mock?.stock),
    highlights: Array.isArray(stored.highlights) ? stored.highlights : (mock?.highlights ?? []),
    specs: Array.isArray(stored.specs) ? stored.specs : (mock?.specs ?? []),
    variants: Array.isArray(stored.variants) ? stored.variants : (mock?.variants ?? []),
    reviews: mock?.reviews ?? stored.reviews ?? [],
  };
}

function emptyProduct(id: string): Product {
  return {
    id,
    slug: "",
    name: "",
    sku: "",
    brandSlug: "",
    categorySlug: "",
    price: 0,
    rating: 0,
    reviewCount: 0,
    stock: 0,
    warranty: "",
    image: "",
    highlights: [],
    description: "",
    specs: [],
    variants: [],
    reviews: [],
  };
}

function readStored(): Product[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const list = parsed.filter(isProduct);
    return list.length ? list : null;
  } catch {
    return null;
  }
}

/** Seed từ mock, ghi đè bằng bản đã lưu (localStorage). */
export function loadAdminProducts(): Product[] {
  const seed = cloneProducts(products);
  const stored = readStored();
  if (!stored) return seed;

  const storedById = new Map(stored.map((p) => [p.id, p]));
  const seedIds = new Set(seed.map((p) => p.id));

  const merged = seed.map((p) => {
    const override = storedById.get(p.id);
    return override ? hydrate(override, p) : p;
  });

  const extras = stored.filter((p) => !seedIds.has(p.id)).map((p) => hydrate(p));
  return [...merged, ...extras];
}

export function saveAdminProducts(list: Product[]): void {
  if (typeof window === "undefined") return;
  persistLocalAndCloud(PRODUCTS_STORAGE_KEY, list);
}

export function upsertAdminProduct(list: Product[], next: Product): Product[] {
  const index = list.findIndex((p) => p.id === next.id);
  const updated = index >= 0 ? list.map((p, i) => (i === index ? next : p)) : [...list, next];
  saveAdminProducts(updated);
  return updated;
}
