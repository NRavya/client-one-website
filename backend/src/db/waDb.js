const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "waApp.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    attempts INTEGER DEFAULT 0,
    verified INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS abandoned_carts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT NOT NULL,
    customer_name TEXT,
    cart_items TEXT,       -- JSON string
    cart_value REAL,
    checkout_url TEXT,
    status TEXT DEFAULT 'pending',   -- pending | reminded | recovered | expired
    created_at INTEGER DEFAULT (strftime('%s','now')),
    reminded_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    phone TEXT NOT NULL,
    customer_name TEXT,
    status TEXT,
    total_amount REAL,
    tracking_url TEXT,
    created_at INTEGER DEFAULT (strftime('%s','now'))
  );
`);

module.exports = db;