import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "links.db");

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const fs = require("fs");
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS links (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      code        TEXT    NOT NULL UNIQUE,
      original    TEXT    NOT NULL,
      hits        INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_links_code ON links(code);
  `);
}

export interface Link {
  id: number;
  code: string;
  original: string;
  hits: number;
  created_at: string;
}

export function codeExists(code: string): boolean {
  const row = getDb()
    .prepare("SELECT 1 FROM links WHERE code = ?")
    .get(code);
  return row !== undefined;
}

export function findByCode(code: string): Link | undefined {
  return getDb()
    .prepare("SELECT * FROM links WHERE code = ?")
    .get(code) as Link | undefined;
}

export function incrementHits(code: string): void {
  getDb()
    .prepare("UPDATE links SET hits = hits + 1 WHERE code = ?")
    .run(code);
}

export function createLink(code: string, original: string): Link {
  const db = getDb();
  db.prepare("INSERT INTO links (code, original) VALUES (?, ?)").run(
    code,
    original
  );
  return db
    .prepare("SELECT * FROM links WHERE code = ?")
    .get(code) as Link;
}

export function getAllLinks(): Link[] {
  return getDb()
    .prepare("SELECT * FROM links ORDER BY created_at DESC")
    .all() as Link[];
}

export function deleteLink(code: string): void {
  getDb().prepare("DELETE FROM links WHERE code = ?").run(code);
}
