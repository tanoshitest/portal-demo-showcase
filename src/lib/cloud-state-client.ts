import { CLOUD_STATE_KEYS, type CloudStateKey } from "@/lib/cloud-keys";

type CloudStateItem = {
  payload: unknown;
  version: number;
  updatedAt: string;
};

type CloudStateResponse = {
  ok: true;
  states: Partial<Record<CloudStateKey, CloudStateItem>>;
};

const MAX_DOCUMENT_DATA_URL_LENGTH = 32_000;
const SYNC_RELOAD_KEY = "hv_cloud_sync_reloaded";
const PENDING_WRITES_KEY = "hv_cloud_pending_writes_v1";

type PendingWrites = Partial<Record<CloudStateKey, string>>;

function readPendingWrites(): PendingWrites {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(PENDING_WRITES_KEY) ?? "{}") as unknown;
    return parsed && typeof parsed === "object" ? (parsed as PendingWrites) : {};
  } catch {
    return {};
  }
}

function writePendingWrites(pending: PendingWrites) {
  if (Object.keys(pending).length === 0) localStorage.removeItem(PENDING_WRITES_KEY);
  else localStorage.setItem(PENDING_WRITES_KEY, JSON.stringify(pending));
}

function markPendingWrite(key: CloudStateKey) {
  const revision = `${Date.now()}-${crypto.randomUUID()}`;
  writePendingWrites({ ...readPendingWrites(), [key]: revision });
  return revision;
}

function clearPendingWrite(key: CloudStateKey, revision: string) {
  const pending = readPendingWrites();
  if (pending[key] !== revision) return;
  delete pending[key];
  writePendingWrites(pending);
}

function sanitizeForCloud(key: CloudStateKey, value: unknown) {
  if (key !== "hv_admin_documents" || !Array.isArray(value)) return value;

  return value.map((item) => {
    if (!item || typeof item !== "object") return item;
    const document = { ...(item as Record<string, unknown>) };
    if (
      typeof document.fileUrl === "string" &&
      document.fileUrl.startsWith("data:") &&
      document.fileUrl.length > MAX_DOCUMENT_DATA_URL_LENGTH
    ) {
      delete document.fileUrl;
      document.cloudFilePending = true;
    }
    return document;
  });
}

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as T | null;
  if (!response.ok || !payload) {
    throw new Error(`Cloud API error ${response.status}`);
  }
  return payload;
}

export async function saveCloudState(
  key: CloudStateKey,
  value: unknown,
  pendingRevision?: string,
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const response = await fetch(`/api/cloud-state/${encodeURIComponent(key)}`, {
      method: "PUT",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ payload: sanitizeForCloud(key, value) }),
    });
    if (response.ok && pendingRevision) clearPendingWrite(key, pendingRevision);
    return response.ok;
  } catch {
    return false;
  }
}

export function persistLocalAndCloud(key: CloudStateKey, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  const revision = markPendingWrite(key);
  void saveCloudState(key, value, revision);
}

async function flushPendingWrites() {
  const pending = readPendingWrites();
  for (const [key, revision] of Object.entries(pending) as [CloudStateKey, string][]) {
    const localRaw = localStorage.getItem(key);
    if (!localRaw) {
      clearPendingWrite(key, revision);
      continue;
    }
    try {
      await saveCloudState(key, JSON.parse(localRaw) as unknown, revision);
    } catch {
      // Keep this revision queued and retry after focus, login, or the next interval.
    }
  }
}

export async function syncCloudStateWithLocal(): Promise<"changed" | "unchanged" | "offline"> {
  if (typeof window === "undefined") return "offline";
  try {
    await flushPendingWrites();
    const response = await fetch("/api/cloud-state", { credentials: "include" });
    if (response.status === 401) return "offline";
    const { states } = await parseJson<CloudStateResponse>(response);
    let changed = false;

    for (const key of CLOUD_STATE_KEYS) {
      const remote = states[key];
      const localRaw = localStorage.getItem(key);
      if (readPendingWrites()[key]) continue;

      if (remote) {
        const nextRaw = JSON.stringify(remote.payload);
        if (localRaw !== nextRaw) {
          localStorage.setItem(key, nextRaw);
          changed = true;
        }
      } else if (localRaw) {
        try {
          const revision = markPendingWrite(key);
          await saveCloudState(key, JSON.parse(localRaw) as unknown, revision);
        } catch {
          // Keep the browser copy when one legacy entry cannot be migrated.
        }
      }
    }

    return changed ? "changed" : "unchanged";
  } catch {
    return "offline";
  }
}

export function reloadOnceAfterCloudSync() {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(SYNC_RELOAD_KEY) === "1") return;
  sessionStorage.setItem(SYNC_RELOAD_KEY, "1");
  window.location.reload();
}

export function clearCloudSyncReloadFlag() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SYNC_RELOAD_KEY);
}
