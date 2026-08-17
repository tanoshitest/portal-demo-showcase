PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'sale')),
  role_label TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  brand_slugs TEXT NOT NULL DEFAULT '"all"',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cloud_state (
  state_key TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by TEXT REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS public_submissions (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('contact', 'order')),
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_submissions_kind_created ON public_submissions(kind, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at DESC);

INSERT OR IGNORE INTO users (
  id, email, password_hash, name, role, role_label, company, phone, brand_slugs
) VALUES
  (
    'user-admin-default',
    'admin@hoangvinhvkt.vn',
    'pbkdf2$310000$ROt6Ti9bMLJJskV9689peg==$PR/JU/7HTkHsQFsJmCohSs0+DVNfJfplt/Da+KqluPg=',
    'Lê Hoàng Vĩnh',
    'admin',
    'Admin',
    'Hoàng Vĩnh VKT',
    '',
    '"all"'
  ),
  (
    'user-sale-default',
    'sale@hoangvinhvkt.vn',
    'pbkdf2$310000$8KO6k32hkrrWa/UPrIH4Cg==$6Vxspl0DA515FZQpsEeEiIC8/meqmgtaiaW4o/3f6E8=',
    'Sale',
    'sale',
    'Sale',
    'Hoàng Vĩnh VKT',
    '',
    '"all"'
  );
