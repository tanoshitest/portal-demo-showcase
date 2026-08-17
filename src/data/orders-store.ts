import { persistLocalAndCloud } from "@/lib/cloud-state-client";

export const ORDERS_STORAGE_KEY = "hv_site_orders_v1";

export const ORDER_STATUSES = ["Mới", "Đã xác nhận", "Đang giao", "Hoàn tất", "Đã hủy"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const SHIPPING_LABEL: Record<string, string> = {
  standard: "Giao tiêu chuẩn (1–3 ngày)",
  express: "Giao nhanh nội thành TP.HCM",
  pickup: "Nhận tại kho",
};

export const PAYMENT_LABEL: Record<string, string> = {
  cod: "Thanh toán khi nhận hàng (COD)",
  transfer: "Chuyển khoản ngân hàng",
  credit: "Công nợ theo hợp đồng",
};

export type OrderItem = {
  productSlug: string;
  name: string;
  variantName: string;
  sku: string;
  price: number;
  quantity: number;
};

export type SiteOrder = {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  shipping: string;
  payment: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
};

export const seedOrders: SiteOrder[] = [
  {
    id: "ord-seed-1",
    code: "HV88214510",
    name: "Nguyễn Văn Hải",
    phone: "0903418226",
    email: "hai.nguyen@anphat.vn",
    address: "Lô C12, KCN Đức Hòa, Long An",
    note: "Giao trong giờ hành chính, cần hóa đơn VAT.",
    shipping: "standard",
    payment: "transfer",
    items: [
      {
        productSlug: "mccb-3p-250a-schneider",
        name: "MCCB 3P 250A Schneider EasyPact CVS",
        variantName: "250A",
        sku: "SCH-CVS250-3P",
        price: 7_590_000,
        quantity: 2,
      },
      {
        productSlug: "bien-tan-abb-acs580-15kw",
        name: "Biến tần ABB ACS580 15kW 3P 380V",
        variantName: "15kW",
        sku: "ABB-ACS580-15",
        price: 22_900_000,
        quantity: 1,
      },
    ],
    total: 38_080_000,
    status: "Đã xác nhận",
    createdAt: "2026-08-12T09:20:00.000Z",
  },
  {
    id: "ord-seed-2",
    code: "HV77120344",
    name: "Trần Minh Quân",
    phone: "0912774310",
    email: "",
    address: "12 Đường số 8, P. Tân Sơn Nhì, Q. Tân Phú, TP.HCM",
    note: "",
    shipping: "express",
    payment: "cod",
    items: [
      {
        productSlug: "mccb-3p-250a-schneider",
        name: "MCCB 3P 250A Schneider EasyPact CVS",
        variantName: "160A",
        sku: "SCH-CVS160-3P",
        price: 6_290_000,
        quantity: 1,
      },
    ],
    total: 6_290_000,
    status: "Mới",
    createdAt: "2026-08-14T08:05:00.000Z",
  },
];

function isOrder(value: unknown): value is SiteOrder {
  if (!value || typeof value !== "object") return false;
  const o = value as Partial<SiteOrder>;
  return typeof o.id === "string" && typeof o.code === "string" && Array.isArray(o.items);
}

function readStored(): SiteOrder[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const list = parsed.filter(isOrder);
    return list.length ? list : null;
  } catch {
    return null;
  }
}

export function loadSiteOrders(): SiteOrder[] {
  const seed = seedOrders.map((o) => ({ ...o, items: o.items.map((i) => ({ ...i })) }));
  const stored = readStored();
  if (!stored) return seed;
  const byId = new Map(stored.map((o) => [o.id, o]));
  const seedIds = new Set(seed.map((o) => o.id));
  const merged = seed.map((o) => byId.get(o.id) ?? o);
  const extras = stored.filter((o) => !seedIds.has(o.id));
  return [...extras, ...merged].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function saveSiteOrders(list: SiteOrder[]) {
  if (typeof window === "undefined") return;
  persistLocalAndCloud(ORDERS_STORAGE_KEY, list);
}

export function addSiteOrder(order: SiteOrder): SiteOrder[] {
  const next = [order, ...loadSiteOrders().filter((o) => o.id !== order.id)];
  saveSiteOrders(next);
  void fetch("/api/public/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(order),
  }).catch(() => undefined);
  return next;
}

export function updateSiteOrder(list: SiteOrder[], next: SiteOrder): SiteOrder[] {
  const updated = list.map((o) => (o.id === next.id ? next : o));
  saveSiteOrders(updated);
  return updated;
}

export function newOrderCode() {
  return `HV${Date.now().toString().slice(-8)}`;
}

export function newOrderId() {
  return `ord-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
