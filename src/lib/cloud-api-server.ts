import type { D1Database } from "@cloudflare/workers-types";
import { ADMIN_ONLY_STATE_KEYS, isCloudStateKey } from "@/lib/cloud-keys";

export type CloudflareEnv = {
  DB?: D1Database;
};

type AuthUserRow = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: "admin" | "sale";
  role_label: string;
  company: string;
  phone: string;
  brand_slugs: string;
};

type SessionUser = Omit<AuthUserRow, "password_hash">;

const SESSION_COOKIE = "hv_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;
const MAX_STATE_BYTES = 1_800_000;

function json(payload: unknown, status = 200, headers?: HeadersInit) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}

function bytesToBase64(bytes: Uint8Array) {
  let value = "";
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value);
}

function bytesToBase64Url(bytes: Uint8Array) {
  return bytesToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return result === 0;
}

async function verifyPassword(password: string, encoded: string) {
  const [algorithm, iterationsText, saltText, expectedText] = encoded.split("$");
  if (algorithm !== "pbkdf2" || !iterationsText || !saltText || !expectedText) return false;
  const iterations = Number(iterationsText);
  if (!Number.isSafeInteger(iterations) || iterations < 100_000) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const expected = base64ToBytes(expectedText);
  const result = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: base64ToBytes(saltText), iterations },
    key,
    expected.length * 8,
  );
  return constantTimeEqual(new Uint8Array(result), expected);
}

async function hashPassword(password: string) {
  const iterations = 100_000;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const result = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256,
  );
  return `pbkdf2$${iterations}$${bytesToBase64(salt)}$${bytesToBase64(new Uint8Array(result))}`;
}

function parseCookies(request: Request) {
  const result = new Map<string, string>();
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const separator = part.indexOf("=");
    if (separator < 1) continue;
    result.set(
      part.slice(0, separator).trim(),
      decodeURIComponent(part.slice(separator + 1).trim()),
    );
  }
  return result;
}

function sessionCookie(request: Request, token: string, maxAge = SESSION_SECONDS) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function publicUser(user: SessionUser) {
  let brandSlugs: string[] | "all" = "all";
  try {
    const parsed = JSON.parse(user.brand_slugs) as unknown;
    if (
      parsed === "all" ||
      (Array.isArray(parsed) && parsed.every((item) => typeof item === "string"))
    ) {
      brandSlugs = parsed;
    }
  } catch {
    // Use the safest default when legacy JSON is malformed.
  }
  return {
    email: user.email,
    password: "",
    name: user.name,
    role: user.role,
    roleLabel: user.role_label,
    company: user.company,
    phone: user.phone,
    brandSlugs,
  };
}

async function readJsonBody(request: Request) {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > MAX_STATE_BYTES) throw new Error("PAYLOAD_TOO_LARGE");
  return request.json() as Promise<unknown>;
}

async function getSessionUser(request: Request, db: D1Database): Promise<SessionUser | null> {
  const token = parseCookies(request).get(SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const user = await db
    .prepare(
      `SELECT u.id, u.email, u.name, u.role, u.role_label, u.company, u.phone, u.brand_slugs
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = 1`,
    )
    .bind(tokenHash)
    .first<SessionUser>();
  if (user) {
    await db
      .prepare("UPDATE sessions SET last_seen_at = CURRENT_TIMESTAMP WHERE token_hash = ?")
      .bind(tokenHash)
      .run();
  }
  return user ?? null;
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

async function handleLogin(request: Request, db: D1Database) {
  const body = (await readJsonBody(request)) as { email?: unknown; password?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) return json({ ok: false, message: "Thiếu email hoặc mật khẩu." }, 400);

  let user: AuthUserRow | null;
  try {
    user = await db
      .prepare(
        `SELECT id, email, password_hash, name, role, role_label, company, phone, brand_slugs
         FROM users WHERE email = ? COLLATE NOCASE AND is_active = 1`,
      )
      .bind(email)
      .first<AuthUserRow>();
  } catch {
    return json({ ok: false, message: "Không thể đọc tài khoản.", code: "AUTH_USER_READ" }, 500);
  }

  let passwordMatches = false;
  try {
    passwordMatches = user ? await verifyPassword(password, user.password_hash) : false;
  } catch {
    return json(
      { ok: false, message: "Không thể xác thực mật khẩu.", code: "AUTH_PASSWORD_VERIFY" },
      500,
    );
  }
  if (!user || !passwordMatches) {
    return json({ ok: false, message: "Email hoặc mật khẩu không đúng." }, 401);
  }

  const token = bytesToBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000).toISOString();
  try {
    await db.batch([
      db
        .prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
        .bind(tokenHash, user.id, expiresAt),
      db
        .prepare(
          "INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES (?, 'login', 'session', ?)",
        )
        .bind(user.id, tokenHash.slice(0, 12)),
      db.prepare("DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP"),
    ]);
  } catch {
    return json(
      { ok: false, message: "Không thể tạo phiên đăng nhập.", code: "AUTH_SESSION_WRITE" },
      500,
    );
  }

  const { password_hash: _passwordHash, ...sessionUser } = user;
  return json({ ok: true, user: publicUser(sessionUser) }, 200, {
    "set-cookie": sessionCookie(request, token),
  });
}

async function handleLogout(request: Request, db: D1Database) {
  const token = parseCookies(request).get(SESSION_COOKIE);
  if (token) {
    const tokenHash = await sha256Hex(token);
    await db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
  }
  return json({ ok: true }, 200, { "set-cookie": sessionCookie(request, "", 0) });
}

async function handleGetStates(request: Request, db: D1Database, user: SessionUser) {
  const result = await db
    .prepare("SELECT state_key, payload, version, updated_at FROM cloud_state ORDER BY state_key")
    .all<{ state_key: string; payload: string; version: number; updated_at: string }>();
  const states: Record<string, unknown> = {};
  for (const row of result.results) {
    if (!isCloudStateKey(row.state_key)) continue;
    try {
      states[row.state_key] = {
        payload: JSON.parse(row.payload) as unknown,
        version: row.version,
        updatedAt: row.updated_at,
      };
    } catch {
      // Ignore one corrupt state without blocking all remaining application data.
    }
  }

  const submissions = await db
    .prepare(
      "SELECT kind, payload, created_at FROM public_submissions ORDER BY created_at DESC LIMIT 2000",
    )
    .all<{ kind: "contact" | "order"; payload: string; created_at: string }>();
  for (const [kind, stateKey] of [
    ["contact", "hv_site_contacts_v1"],
    ["order", "hv_site_orders_v1"],
  ] as const) {
    const state = states[stateKey] as
      { payload: unknown; version: number; updatedAt: string } | undefined;
    const base = Array.isArray(state?.payload) ? state.payload : [];
    const byId = new Map<string, unknown>();
    for (const item of base) {
      if (item && typeof item === "object" && "id" in item && typeof item.id === "string") {
        byId.set(item.id, item);
      }
    }
    let latestSubmissionAt = state?.updatedAt ?? "";
    for (const submission of submissions.results) {
      if (submission.kind !== kind) continue;
      try {
        const item = JSON.parse(submission.payload) as unknown;
        if (item && typeof item === "object" && "id" in item && typeof item.id === "string") {
          if (!byId.has(item.id)) byId.set(item.id, item);
          if (submission.created_at > latestSubmissionAt)
            latestSubmissionAt = submission.created_at;
        }
      } catch {
        // Ignore one malformed public submission and keep the remaining records usable.
      }
    }
    if (byId.size > 0) {
      states[stateKey] = {
        payload: Array.from(byId.values()),
        version: state?.version ?? 0,
        updatedAt: latestSubmissionAt,
      };
    }
  }
  return json({ ok: true, states, role: user.role });
}

async function handlePutState(request: Request, db: D1Database, user: SessionUser, key: string) {
  if (!isCloudStateKey(key)) return json({ ok: false, message: "State key không hợp lệ." }, 404);
  if (user.role !== "admin" && ADMIN_ONLY_STATE_KEYS.has(key)) {
    return json({ ok: false, message: "Tài khoản không có quyền cập nhật dữ liệu này." }, 403);
  }

  const body = (await readJsonBody(request)) as { payload?: unknown };
  if (!("payload" in body)) return json({ ok: false, message: "Thiếu dữ liệu payload." }, 400);
  const payload = JSON.stringify(body.payload);
  if (new TextEncoder().encode(payload).byteLength > MAX_STATE_BYTES) {
    return json({ ok: false, message: "Dữ liệu vượt giới hạn D1; file lớn cần lưu qua R2." }, 413);
  }

  await db.batch([
    db
      .prepare(
        `INSERT INTO cloud_state (state_key, payload, version, updated_at, updated_by)
         VALUES (?, ?, 1, CURRENT_TIMESTAMP, ?)
         ON CONFLICT(state_key) DO UPDATE SET
           payload = excluded.payload,
           version = cloud_state.version + 1,
           updated_at = CURRENT_TIMESTAMP,
           updated_by = excluded.updated_by`,
      )
      .bind(key, payload, user.id),
    db
      .prepare(
        "INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES (?, 'update', 'cloud_state', ?)",
      )
      .bind(user.id, key),
  ]);
  return json({ ok: true });
}

async function handlePublicSubmission(request: Request, db: D1Database, kind: "contact" | "order") {
  const body = await readJsonBody(request);
  const payload = JSON.stringify(body);
  if (new TextEncoder().encode(payload).byteLength > 100_000) {
    return json({ ok: false, message: "Dữ liệu gửi lên quá lớn." }, 413);
  }
  const id = crypto.randomUUID();
  await db
    .prepare("INSERT INTO public_submissions (id, kind, payload) VALUES (?, ?, ?)")
    .bind(id, kind, payload)
    .run();
  return json({ ok: true, id }, 201);
}

async function listUsers(db: D1Database) {
  const result = await db
    .prepare(
      `SELECT id, email, name, role, role_label, company, phone, brand_slugs
       FROM users WHERE is_active = 1 ORDER BY role, name`,
    )
    .all<SessionUser>();
  return result.results.map(publicUser);
}

async function handleUpsertUser(
  request: Request,
  db: D1Database,
  actor: SessionUser,
  currentEmail: string,
) {
  if (actor.role !== "admin") {
    return json({ ok: false, message: "Chỉ Admin được quản lý tài khoản." }, 403);
  }
  const body = (await readJsonBody(request)) as {
    email?: unknown;
    password?: unknown;
    name?: unknown;
    role?: unknown;
    company?: unknown;
    phone?: unknown;
    brandSlugs?: unknown;
  };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const role = body.role === "admin" || body.role === "sale" ? body.role : null;
  const password = typeof body.password === "string" ? body.password : "";
  if (!/^\S+@\S+\.\S+$/.test(email) || name.length < 2 || !role) {
    return json({ ok: false, message: "Thông tin tài khoản không hợp lệ." }, 400);
  }

  const existing = await db
    .prepare("SELECT id, password_hash FROM users WHERE email = ? COLLATE NOCASE")
    .bind(currentEmail)
    .first<{ id: string; password_hash: string }>();
  if (!existing && password.length < 6) {
    return json({ ok: false, message: "Mật khẩu mới cần ít nhất 6 ký tự." }, 400);
  }
  const duplicate = await db
    .prepare("SELECT id FROM users WHERE email = ? COLLATE NOCASE")
    .bind(email)
    .first<{ id: string }>();
  if (duplicate && duplicate.id !== existing?.id) {
    return json({ ok: false, message: "Email đã được sử dụng." }, 409);
  }

  const id = existing?.id ?? crypto.randomUUID();
  const passwordHash = password ? await hashPassword(password) : existing?.password_hash;
  if (!passwordHash) return json({ ok: false, message: "Thiếu mật khẩu tài khoản." }, 400);
  const brandSlugs = JSON.stringify(
    body.brandSlugs === "all" || Array.isArray(body.brandSlugs) ? body.brandSlugs : "all",
  );
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";

  await db.batch([
    db
      .prepare(
        `INSERT INTO users (
           id, email, password_hash, name, role, role_label, company, phone, brand_slugs,
           is_active, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT(id) DO UPDATE SET
           email = excluded.email,
           password_hash = excluded.password_hash,
           name = excluded.name,
           role = excluded.role,
           role_label = excluded.role_label,
           company = excluded.company,
           phone = excluded.phone,
           brand_slugs = excluded.brand_slugs,
           is_active = 1,
           updated_at = CURRENT_TIMESTAMP`,
      )
      .bind(
        id,
        email,
        passwordHash,
        name,
        role,
        role === "admin" ? "Admin" : "Sale",
        company,
        phone,
        brandSlugs,
      ),
    db
      .prepare(
        "INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES (?, ?, 'user', ?)",
      )
      .bind(actor.id, existing ? "update" : "create", id),
  ]);
  return json({ ok: true, users: await listUsers(db) });
}

async function handleDeleteUser(db: D1Database, actor: SessionUser, targetEmail: string) {
  if (actor.role !== "admin") {
    return json({ ok: false, message: "Chỉ Admin được quản lý tài khoản." }, 403);
  }
  const target = await db
    .prepare("SELECT id, role FROM users WHERE email = ? COLLATE NOCASE AND is_active = 1")
    .bind(targetEmail)
    .first<{ id: string; role: "admin" | "sale" }>();
  if (!target) return json({ ok: false, message: "Không tìm thấy tài khoản." }, 404);
  if (target.id === actor.id) {
    return json({ ok: false, message: "Không thể xóa tài khoản đang đăng nhập." }, 400);
  }
  if (target.role === "admin") {
    const count = await db
      .prepare("SELECT COUNT(*) AS total FROM users WHERE role = 'admin' AND is_active = 1")
      .first<{ total: number }>();
    if ((count?.total ?? 0) <= 1) {
      return json({ ok: false, message: "Cần giữ ít nhất một tài khoản Admin." }, 400);
    }
  }
  await db.batch([
    db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(target.id),
    db
      .prepare("UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(target.id),
    db
      .prepare(
        "INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES (?, 'delete', 'user', ?)",
      )
      .bind(actor.id, target.id),
  ]);
  return json({ ok: true, users: await listUsers(db) });
}

export async function handleCloudApi(
  request: Request,
  env: CloudflareEnv | undefined,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/")) return null;
  if (!env?.DB) return json({ ok: false, message: "Cloud database chưa được cấu hình." }, 503);
  if (request.method !== "GET" && !isSameOrigin(request)) {
    return json({ ok: false, message: "Origin không hợp lệ." }, 403);
  }

  try {
    if (url.pathname === "/api/health" && request.method === "GET") {
      await env.DB.prepare("SELECT 1").first();
      return json({ ok: true, database: "connected" });
    }
    if (url.pathname === "/api/auth/login" && request.method === "POST") {
      return await handleLogin(request, env.DB);
    }
    if (url.pathname === "/api/auth/logout" && request.method === "POST") {
      return await handleLogout(request, env.DB);
    }
    if (url.pathname === "/api/public/contacts" && request.method === "POST") {
      return await handlePublicSubmission(request, env.DB, "contact");
    }
    if (url.pathname === "/api/public/orders" && request.method === "POST") {
      return await handlePublicSubmission(request, env.DB, "order");
    }

    const user = await getSessionUser(request, env.DB);
    if (!user) return json({ ok: false, message: "Phiên đăng nhập đã hết hạn." }, 401);

    if (url.pathname === "/api/auth/session" && request.method === "GET") {
      return json({ ok: true, user: publicUser(user) });
    }
    if (url.pathname === "/api/cloud-state" && request.method === "GET") {
      return await handleGetStates(request, env.DB, user);
    }
    if (url.pathname.startsWith("/api/cloud-state/") && request.method === "PUT") {
      const key = decodeURIComponent(url.pathname.slice("/api/cloud-state/".length));
      return await handlePutState(request, env.DB, user, key);
    }
    if (url.pathname === "/api/users" && request.method === "GET") {
      if (user.role !== "admin") {
        return json({ ok: false, message: "Chỉ Admin được xem tài khoản." }, 403);
      }
      return json({ ok: true, users: await listUsers(env.DB) });
    }
    if (url.pathname.startsWith("/api/users/") && request.method === "PUT") {
      const email = decodeURIComponent(url.pathname.slice("/api/users/".length));
      return await handleUpsertUser(request, env.DB, user, email);
    }
    if (url.pathname.startsWith("/api/users/") && request.method === "DELETE") {
      const email = decodeURIComponent(url.pathname.slice("/api/users/".length));
      return await handleDeleteUser(env.DB, user, email);
    }
    return json({ ok: false, message: "API không tồn tại." }, 404);
  } catch (error) {
    if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE") {
      return json({ ok: false, message: "Dữ liệu gửi lên quá lớn." }, 413);
    }
    console.error("Cloud API error", error);
    return json({ ok: false, message: "Không thể xử lý dữ liệu cloud." }, 500);
  }
}
