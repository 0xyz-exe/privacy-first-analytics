import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

// Determine DB path for local development / test
const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dataDir, "analytics.db");

// Global singleton for Next.js hot reload
const globalForDb = globalThis as unknown as {
  sqliteDb?: DatabaseSync;
};

export function getDb(): DatabaseSync {
  if (!globalForDb.sqliteDb) {
    const db = new DatabaseSync(dbPath);
    // Enable WAL mode for high concurrent throughput & write performance
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA synchronous = NORMAL;");
    db.exec("PRAGMA foreign_keys = ON;");
    initSchema(db);
    globalForDb.sqliteDb = db;
  }
  return globalForDb.sqliteDb;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS organization_members (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer',
      created_at TEXT NOT NULL,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS websites (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      name TEXT NOT NULL,
      domain TEXT NOT NULL,
      public_id TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS website_settings (
      website_id TEXT PRIMARY KEY,
      respect_dnt INTEGER NOT NULL DEFAULT 1,
      allow_custom_events INTEGER NOT NULL DEFAULT 1,
      track_outbound INTEGER NOT NULL DEFAULT 1,
      track_downloads INTEGER NOT NULL DEFAULT 1,
      retention_days INTEGER NOT NULL DEFAULT 90,
      allowed_domains TEXT DEFAULT '',
      FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      website_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      visitor_hash TEXT NOT NULL,
      event_name TEXT NOT NULL DEFAULT 'pageview',
      path TEXT NOT NULL,
      title TEXT DEFAULT '',
      referrer_source TEXT NOT NULL DEFAULT 'Direct',
      referrer_domain TEXT DEFAULT '',
      browser TEXT NOT NULL DEFAULT 'Other',
      os TEXT NOT NULL DEFAULT 'Other',
      device TEXT NOT NULL DEFAULT 'Desktop',
      country TEXT NOT NULL DEFAULT 'Unknown',
      event_data TEXT DEFAULT '{}',
      created_at TEXT NOT NULL,
      FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_events_website_time ON events(website_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
    CREATE INDEX IF NOT EXISTS idx_events_visitor ON events(visitor_hash, created_at);
    CREATE INDEX IF NOT EXISTS idx_events_path ON events(website_id, path);
    CREATE INDEX IF NOT EXISTS idx_events_name ON events(website_id, event_name);

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      website_id TEXT NOT NULL,
      name TEXT NOT NULL,
      event_type TEXT NOT NULL, -- 'event' or 'path'
      target_value TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      details TEXT,
      created_at TEXT NOT NULL
    );
  `);
}
