import { portalUsers, type PortalUser } from "@/data/mock";

export const USERS_STORAGE_KEY = "hv_portal_users_v1";

export const USER_ROLES = [
  { value: "admin" as const, label: "Admin" },
  { value: "sale" as const, label: "Sale" },
];

function roleLabel(role: PortalUser["role"]) {
  return USER_ROLES.find((r) => r.value === role)?.label ?? role;
}

function isUser(value: unknown): value is PortalUser {
  if (!value || typeof value !== "object") return false;
  const u = value as Partial<PortalUser>;
  return typeof u.email === "string" && typeof u.password === "string" && typeof u.name === "string";
}

function readStored(): PortalUser[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const list = parsed.filter(isUser);
    return list.length ? list : null;
  } catch {
    return null;
  }
}

export function cloneUsers(list: PortalUser[]): PortalUser[] {
  return list.map((u) => ({
    ...u,
    brandSlugs: u.brandSlugs === "all" ? "all" : [...u.brandSlugs],
  }));
}

export function loadPortalUsers(): PortalUser[] {
  const seed = cloneUsers(portalUsers);
  const stored = readStored();
  if (!stored) return seed;

  const storedByEmail = new Map(stored.map((u) => [u.email.toLowerCase(), u]));
  const seedEmails = new Set(seed.map((u) => u.email.toLowerCase()));
  const merged = seed.map((u) => storedByEmail.get(u.email.toLowerCase()) ?? u);
  const extras = stored.filter((u) => !seedEmails.has(u.email.toLowerCase()));
  return [...merged, ...extras];
}

export function savePortalUsers(list: PortalUser[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(list));
}

export function upsertPortalUser(list: PortalUser[], next: PortalUser): PortalUser[] {
  const email = next.email.trim().toLowerCase();
  const normalized: PortalUser = {
    ...next,
    email: next.email.trim(),
    roleLabel: roleLabel(next.role),
    brandSlugs: next.brandSlugs ?? "all",
  };
  const index = list.findIndex((u) => u.email.toLowerCase() === email);
  const updated =
    index >= 0 ? list.map((u, i) => (i === index ? normalized : u)) : [...list, normalized];
  savePortalUsers(updated);
  return updated;
}

export function deletePortalUser(list: PortalUser[], email: string): PortalUser[] | string {
  const target = list.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!target) return "Không tìm thấy tài khoản.";
  const admins = list.filter((u) => u.role === "admin");
  if (target.role === "admin" && admins.length <= 1) {
    return "Cần giữ ít nhất một tài khoản Admin.";
  }
  const updated = list.filter((u) => u.email.toLowerCase() !== email.toLowerCase());
  savePortalUsers(updated);
  return updated;
}

export function findPortalUser(email: string, password?: string) {
  const users = loadPortalUsers();
  const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!found) return null;
  if (password != null && found.password !== password) return null;
  return found;
}
