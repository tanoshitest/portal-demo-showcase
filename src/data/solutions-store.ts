import { solutions, type Solution } from "@/data/mock";

export const SOLUTIONS_STORAGE_KEY = "hv_admin_solutions";

function cloneSolution(solution: Solution): Solution {
  return {
    ...solution,
    benefits: solution.benefits.map((b) => ({ ...b })),
    audience: [...solution.audience],
    systems: [...solution.systems],
    packages: solution.packages.map((pk) => ({ ...pk, items: [...pk.items] })),
    productSlugs: [...solution.productSlugs],
    process: solution.process.map((p) => ({ ...p })),
    faq: solution.faq.map((f) => ({ ...f })),
  };
}

export function cloneSolutions(list: Solution[]): Solution[] {
  return list.map(cloneSolution);
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

function isSolution(value: unknown): value is Solution {
  if (!value || typeof value !== "object") return false;
  const s = value as Partial<Solution>;
  return typeof s.id === "string" && typeof s.name === "string";
}

function resolveImage(stored: string | undefined, fallback?: string): string {
  if (isRemoteImage(stored)) return stored as string;
  return fallback ?? stored ?? "";
}

function emptySolution(id: string): Solution {
  return {
    id,
    slug: "",
    name: "",
    group: "",
    short: "",
    image: "",
    benefits: [],
    audience: [],
    systems: [],
    packages: [],
    productSlugs: [],
    process: [],
    faq: [],
  };
}

function hydrate(stored: Solution, mock?: Solution): Solution {
  return {
    ...(mock ? cloneSolution(mock) : emptySolution(stored.id)),
    ...stored,
    image: resolveImage(stored.image, mock?.image),
    benefits: Array.isArray(stored.benefits) ? stored.benefits : (mock?.benefits ?? []),
    audience: Array.isArray(stored.audience) ? stored.audience : (mock?.audience ?? []),
    systems: Array.isArray(stored.systems) ? stored.systems : (mock?.systems ?? []),
    packages: Array.isArray(stored.packages) ? stored.packages : (mock?.packages ?? []),
    productSlugs: Array.isArray(stored.productSlugs)
      ? stored.productSlugs
      : (mock?.productSlugs ?? []),
    process: Array.isArray(stored.process) ? stored.process : (mock?.process ?? []),
    faq: Array.isArray(stored.faq) ? stored.faq : (mock?.faq ?? []),
  };
}

function readStored(): Solution[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SOLUTIONS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const list = parsed.filter(isSolution);
    return list.length ? list : null;
  } catch {
    return null;
  }
}

export function loadAdminSolutions(): Solution[] {
  const seed = cloneSolutions(solutions);
  const stored = readStored();
  if (!stored) return seed;

  const storedById = new Map(stored.map((s) => [s.id, s]));
  const seedIds = new Set(seed.map((s) => s.id));
  const merged = seed.map((s) => {
    const override = storedById.get(s.id);
    return override ? hydrate(override, s) : s;
  });
  const extras = stored.filter((s) => !seedIds.has(s.id)).map((s) => hydrate(s));
  return [...merged, ...extras];
}

export function saveAdminSolutions(list: Solution[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SOLUTIONS_STORAGE_KEY, JSON.stringify(list));
}

export function upsertAdminSolution(list: Solution[], next: Solution): Solution[] {
  const index = list.findIndex((s) => s.id === next.id);
  const updated = index >= 0 ? list.map((s, i) => (i === index ? next : s)) : [...list, next];
  saveAdminSolutions(updated);
  return updated;
}
