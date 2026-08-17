import { persistLocalAndCloud } from "@/lib/cloud-state-client";

export const CONTACTS_STORAGE_KEY = "hv_site_contacts_v1";

export const CONTACT_STATUSES = ["Mới", "Đã liên hệ", "Đã xử lý"] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export type SiteContact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  need: string;
  content: string;
  source: string;
  status: ContactStatus;
  createdAt: string;
};

export const seedContacts: SiteContact[] = [
  {
    id: "ct-seed-1",
    name: "Lê Thị Hoa",
    phone: "0938123456",
    email: "hoa.le@gmail.com",
    need: "Hệ thống điện nhà xưởng",
    content: "Xưởng 2.000m² tại Bình Dương, cần khảo sát tủ MSB và chiếu sáng.",
    source: "Trang chủ",
    status: "Mới",
    createdAt: "2026-08-14T03:12:00.000Z",
  },
  {
    id: "ct-seed-2",
    name: "Phạm Quốc Bảo",
    phone: "0909555123",
    email: "bao.pham@nhamay.vn",
    need: "Tự động hóa dây chuyền sản xuất",
    content: "Muốn nâng cấp PLC cho dây chuyền đóng gói, khoảng 3 trạm.",
    source: "Trang liên hệ",
    status: "Đã liên hệ",
    createdAt: "2026-08-11T10:40:00.000Z",
  },
  {
    id: "ct-seed-3",
    name: "Võ Minh Tuấn",
    phone: "0888123789",
    email: "",
    need: "Mua thiết bị",
    content: "Cần báo giá 10 tấm pin và 1 inverter hybrid.",
    source: "Trang chủ",
    status: "Đã xử lý",
    createdAt: "2026-08-08T07:25:00.000Z",
  },
];

function isContact(value: unknown): value is SiteContact {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<SiteContact>;
  return typeof c.id === "string" && typeof c.name === "string" && typeof c.phone === "string";
}

function readStored(): SiteContact[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONTACTS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const list = parsed.filter(isContact);
    return list.length ? list : null;
  } catch {
    return null;
  }
}

export function loadSiteContacts(): SiteContact[] {
  const seed = seedContacts.map((c) => ({ ...c }));
  const stored = readStored();
  if (!stored) return seed;
  const byId = new Map(stored.map((c) => [c.id, c]));
  const seedIds = new Set(seed.map((c) => c.id));
  const merged = seed.map((c) => byId.get(c.id) ?? c);
  const extras = stored.filter((c) => !seedIds.has(c.id));
  return [...extras, ...merged].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function saveSiteContacts(list: SiteContact[]) {
  if (typeof window === "undefined") return;
  persistLocalAndCloud(CONTACTS_STORAGE_KEY, list);
}

export function addSiteContact(contact: Omit<SiteContact, "id" | "createdAt" | "status">): SiteContact[] {
  const item: SiteContact = {
    ...contact,
    id: `ct-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    status: "Mới",
    createdAt: new Date().toISOString(),
  };
  const next = [item, ...loadSiteContacts()];
  saveSiteContacts(next);
  void fetch("/api/public/contacts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(item),
  }).catch(() => undefined);
  return next;
}

export function updateSiteContact(list: SiteContact[], next: SiteContact): SiteContact[] {
  const updated = list.map((c) => (c.id === next.id ? next : c));
  saveSiteContacts(updated);
  return updated;
}
