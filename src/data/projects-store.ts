import { projects, type Project } from "@/data/mock";
import { persistLocalAndCloud } from "@/lib/cloud-state-client";

export const PROJECTS_STORAGE_KEY = "hv_admin_projects";

function cloneProject(project: Project): Project {
  return {
    ...project,
    gallery: [...project.gallery],
    result: [...project.result],
    productSlugs: [...project.productSlugs],
  };
}

export function cloneProjects(list: Project[]): Project[] {
  return list.map(cloneProject);
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

function isProject(value: unknown): value is Project {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<Project>;
  return typeof p.id === "string" && typeof p.name === "string";
}

function resolveImage(stored: string | undefined, fallback?: string): string {
  if (isRemoteImage(stored)) return stored as string;
  return fallback ?? stored ?? "";
}

function emptyProject(id: string): Project {
  return {
    id,
    slug: "",
    name: "",
    type: "",
    location: "",
    year: "",
    scale: "",
    image: "",
    gallery: [],
    solutionSlug: "",
    problem: "",
    solutionDesc: "",
    result: [],
    productSlugs: [],
  };
}

function hydrate(stored: Project, mock?: Project): Project {
  const image = resolveImage(stored.image, mock?.image);
  const storedGallery = Array.isArray(stored.gallery) ? stored.gallery : [];
  const gallery = storedGallery.length
    ? storedGallery.map((src, i) => resolveImage(src, mock?.gallery?.[i] ?? mock?.image))
    : mock
      ? [...mock.gallery]
      : [];

  return {
    ...(mock ? cloneProject(mock) : emptyProject(stored.id)),
    ...stored,
    image,
    gallery,
    result: Array.isArray(stored.result) ? stored.result : (mock?.result ?? []),
    productSlugs: Array.isArray(stored.productSlugs)
      ? stored.productSlugs
      : (mock?.productSlugs ?? []),
  };
}

function readStored(): Project[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const list = parsed.filter(isProject);
    return list.length ? list : null;
  } catch {
    return null;
  }
}

/** Seed từ mock, ghi đè bằng bản đã lưu (localStorage). */
export function loadAdminProjects(): Project[] {
  const allMock = cloneProjects(projects);
  const seed = allMock.slice(0, 1);
  const stored = readStored();
  if (!stored) return seed;

  const storedById = new Map(stored.map((p) => [p.id, p]));
  const seedIds = new Set(allMock.map((p) => p.id));

  const merged = seed.map((p) => {
    const override = storedById.get(p.id);
    return override ? hydrate(override, p) : p;
  });

  const extras = stored.filter((p) => !seedIds.has(p.id)).map((p) => hydrate(p));
  return [...merged, ...extras];
}

export function getAdminProject(slug: string): Project | undefined {
  return loadAdminProjects().find((p) => p.slug === slug);
}

export function saveAdminProjects(list: Project[]): void {
  if (typeof window === "undefined") return;
  persistLocalAndCloud(PROJECTS_STORAGE_KEY, list);
}

export function upsertAdminProject(list: Project[], next: Project): Project[] {
  const index = list.findIndex((p) => p.id === next.id);
  const updated = index >= 0 ? list.map((p, i) => (i === index ? next : p)) : [...list, next];
  saveAdminProjects(updated);
  return updated;
}
