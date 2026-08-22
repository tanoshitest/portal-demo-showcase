import { persistLocalAndCloud } from "@/lib/cloud-state-client";

export const CUSTOMERS_STORAGE_KEY = "hv_estimate_customers_v1";
export const CUSTOMERS_CHANGED_EVENT = "hv-estimate-customers";

export type EstimateCustomer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  note: string;
  createdAt: string;
};

export const seedCustomers: EstimateCustomer[] = [
  {
    id: "kh-seed-phuoc",
    name: "Phạm Văn Phước",
    phone: "0903 418 276",
    address: "Ấp 4, xã Mỹ Hạnh Nam, Đức Hòa, Long An",
    email: "phuoc.pham@gmail.com",
    note: "Hệ hybrid nhà xưởng",
    createdAt: "2026-08-12T02:40:00.000Z",
  },
  {
    id: "kh-seed-mai",
    name: "Nguyễn Thị Mai",
    phone: "0918 662 041",
    address: "12 Đường số 7, P. Tân Phú, Q. 7, TP.HCM",
    email: "mai.nguyen@nhamaylocan.vn",
    note: "Áp mái nhà máy lạnh",
    createdAt: "2026-08-08T09:15:00.000Z",
  },
];

function isCustomer(value: unknown): value is EstimateCustomer {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<EstimateCustomer>;
  return typeof item.id === "string" && typeof item.name === "string";
}

function notifyCustomersChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CUSTOMERS_CHANGED_EVENT));
}

function readStored(): EstimateCustomer[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const list = parsed.filter(isCustomer).map((item) => ({
      id: item.id,
      name: item.name,
      phone: item.phone ?? "",
      address: item.address ?? "",
      email: item.email ?? "",
      note: item.note ?? "",
      createdAt: item.createdAt ?? new Date().toISOString(),
    }));
    return list.length ? list : null;
  } catch {
    return null;
  }
}

export function loadEstimateCustomers(): EstimateCustomer[] {
  const seed = seedCustomers.map((item) => ({ ...item }));
  const stored = readStored();
  if (!stored) return seed;
  const byId = new Map(stored.map((item) => [item.id, item]));
  const seedIds = new Set(seed.map((item) => item.id));
  const merged = seed.map((item) => byId.get(item.id) ?? item);
  const extras = stored.filter((item) => !seedIds.has(item.id));
  return [...extras, ...merged].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function saveEstimateCustomers(list: EstimateCustomer[]) {
  if (typeof window === "undefined") return;
  persistLocalAndCloud(CUSTOMERS_STORAGE_KEY, list);
  notifyCustomersChanged();
}

export function createCustomerId() {
  return `kh-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function upsertEstimateCustomer(
  list: EstimateCustomer[],
  next: EstimateCustomer,
): EstimateCustomer[] {
  const index = list.findIndex((item) => item.id === next.id);
  const updated = index >= 0 ? list.map((item, i) => (i === index ? next : item)) : [next, ...list];
  saveEstimateCustomers(updated);
  return updated;
}

export function deleteEstimateCustomer(list: EstimateCustomer[], id: string): EstimateCustomer[] {
  const updated = list.filter((item) => item.id !== id);
  saveEstimateCustomers(updated);
  return updated;
}
