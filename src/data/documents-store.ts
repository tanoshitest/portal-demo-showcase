import { documents, type PortalDoc } from "@/data/mock";
import { persistLocalAndCloud } from "@/lib/cloud-state-client";

export const DOCUMENTS_STORAGE_KEY = "hv_admin_documents";

export const DOC_TYPES: PortalDoc["type"][] = [
  "Catalogue",
  "Datasheet",
  "Hướng dẫn",
  "Phần mềm",
  "Chứng chỉ",
];

/** ~1.5MB — data URL in localStorage; larger files keep metadata + a tiny placeholder. */
export const MAX_FILE_BYTES = Math.floor(1.5 * 1024 * 1024);

function cloneDoc(doc: PortalDoc): PortalDoc {
  return { ...doc, roles: [...doc.roles] };
}

export function cloneDocuments(list: PortalDoc[]): PortalDoc[] {
  return list.map(cloneDoc);
}

function isDoc(value: unknown): value is PortalDoc {
  if (!value || typeof value !== "object") return false;
  const d = value as Partial<PortalDoc>;
  return typeof d.id === "string" && typeof d.name === "string" && typeof d.brandSlug === "string";
}

function emptyDoc(id: string): PortalDoc {
  return {
    id,
    brandSlug: "",
    name: "",
    type: "Catalogue",
    version: "v1.0",
    size: "",
    updatedAt: "",
    roles: ["admin", "sale"],
  };
}

function hydrate(stored: PortalDoc, mock?: PortalDoc): PortalDoc {
  const base = mock ? cloneDoc(mock) : emptyDoc(stored.id);
  return {
    ...base,
    ...stored,
    roles:
      Array.isArray(stored.roles) && stored.roles.length
        ? stored.roles
        : (mock?.roles ?? ["admin", "sale"]),
  };
}

function readStored(): PortalDoc[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const list = parsed.filter(isDoc);
    return list.length ? list : null;
  } catch {
    return null;
  }
}

function saveAdminDocuments(list: PortalDoc[]): void {
  if (typeof window === "undefined") return;
  try {
    persistLocalAndCloud(DOCUMENTS_STORAGE_KEY, list);
  } catch {
    const slim = list.map((d) => {
      if (d.fileUrl && d.fileUrl.length > 40_000) {
        return { ...d, fileUrl: undefined };
      }
      return d;
    });
    try {
      persistLocalAndCloud(DOCUMENTS_STORAGE_KEY, slim);
    } catch {
      /* quota vẫn đầy — bỏ qua persist, không crash */
    }
  }
}

/** Seed từ mock, ghi đè / bổ sung bằng bản đã lưu (localStorage). */
export function loadAdminDocuments(): PortalDoc[] {
  const seed = cloneDocuments(documents);
  const stored = readStored();
  if (!stored) return seed;

  const storedById = new Map(stored.map((d) => [d.id, d]));
  const seedIds = new Set(seed.map((d) => d.id));

  const merged = seed.map((d) => {
    const override = storedById.get(d.id);
    return override ? hydrate(override, d) : d;
  });

  const extras = stored.filter((d) => !seedIds.has(d.id)).map((d) => hydrate(d));
  return [...merged, ...extras];
}

export function addAdminDocument(doc: PortalDoc): PortalDoc[] {
  const updated = [...loadAdminDocuments(), doc];
  saveAdminDocuments(updated);
  return updated;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    return `${kb >= 10 ? kb.toFixed(0) : kb.toFixed(1)} KB`;
  }
  const mb = bytes / (1024 * 1024);
  return `${mb >= 10 ? mb.toFixed(0) : mb.toFixed(1)} MB`;
}

export function formatDocDate(date = new Date()): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
}

export function sanitizeFileName(name: string): string {
  const cleaned = name
    .replace(/[<>:"/\\|?*]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || "tai-lieu";
}

function mockPreviewText(doc: PortalDoc): string {
  return [
    "Hoàng Vĩnh VKT – Tài liệu hãng",
    "",
    `Tên: ${doc.name}`,
    `Loại: ${doc.type}`,
    `Phiên bản: ${doc.version}`,
    `Dung lượng: ${doc.size}`,
    `Cập nhật: ${doc.updatedAt}`,
    "",
    "Đây là bản demo. Tệp gốc chưa được tải lên hệ thống.",
  ].join("\n");
}

export function viewDocument(doc: PortalDoc): void {
  if (typeof window === "undefined") return;
  if (doc.fileUrl) {
    window.open(doc.fileUrl, "_blank", "noopener,noreferrer");
    return;
  }
  const blob = new Blob([mockPreviewText(doc)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function downloadDocument(doc: PortalDoc): void {
  if (typeof window === "undefined") return;
  const a = document.createElement("a");
  a.rel = "noopener";
  if (doc.fileUrl) {
    a.href = doc.fileUrl;
    a.download = doc.fileName || sanitizeFileName(doc.name);
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }
  const blob = new Blob([mockPreviewText(doc)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = `${sanitizeFileName(doc.name)}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Không đọc được tệp"));
    reader.readAsDataURL(file);
  });
}

/** Lưu data URL nếu tệp nhỏ; tệp lớn thì metadata + placeholder text để không làm đầy localStorage. */
export async function fileToStoredUrl(
  file: File,
): Promise<{ fileUrl?: string; placeholder: boolean }> {
  if (file.size <= MAX_FILE_BYTES) {
    const fileUrl = await readAsDataUrl(file);
    return { fileUrl, placeholder: false };
  }
  const text = [
    "Hoàng Vĩnh VKT – Tài liệu hãng",
    "",
    `Tệp gốc: ${file.name}`,
    `Kích thước: ${formatFileSize(file.size)}`,
    "",
    "Tệp quá lớn để lưu vào trình duyệt (giới hạn ~1.5MB).",
    "Metadata đã được lưu. Đây là bản thay thế thu nhỏ.",
  ].join("\n");
  return {
    fileUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`,
    placeholder: true,
  };
}
