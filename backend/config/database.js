const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dbPath = path.join(__dirname, '../database.db');
const CORRECT_URL = 'postgresql://postgres:kadoojang01@db.ruphumhbauinhjujanbb.supabase.co:5432/postgres';
const DATABASE_URL = (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('ykzltizvvpaapfvnjhde'))
  ? process.env.DATABASE_URL
  : CORRECT_URL;

if (process.env.VERCEL || process.env.DATABASE_URL || CORRECT_URL) {
  console.log('✓ PostgreSQL Mode (Supabase) via Compatibility Layer');
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  db = {
    run: function (sql, params, callback) {
      if (typeof params === 'function') { callback = params; params = []; }
      let pgSql = sql.replace(/\?/g, (match, offset, string) => {
        const count = (string.substring(0, offset).match(/\?/g) || []).length + 1;
        return `$${count}`;
      });

      // Auto-quote camelCase columns for PostgreSQL compatibility
      pgSql = pgSql.replace(/firstName/g, '"firstName"')
        .replace(/lastName/g, '"lastName"')
        .replace(/createdAt/g, '"createdAt"')
        .replace(/updatedAt/g, '"updatedAt"')
        .replace(/reportId/g, '"reportId"')
        .replace(/likesCount/g, '"likesCount"')
        .replace(/dislikesCount/g, '"dislikesCount"')
        .replace(/completedAt/g, '"completedAt"');

      if (pgSql.includes('INSERT')) {
        pgSql = pgSql.replace(/INSERT OR IGNORE/gi, 'INSERT');
        if (!pgSql.includes('RETURNING')) pgSql += ' RETURNING id';
        if (!pgSql.includes('ON CONFLICT')) pgSql = pgSql.replace(' RETURNING id', ' ON CONFLICT DO NOTHING RETURNING id');
      }

      pool.query(pgSql, params, (err, res) => {
        if (err) return callback ? callback(err) : null;
        const result = { lastID: res.rows[0]?.id, changes: res.rowCount };
        if (callback) callback.call(result, null);
      });
    },
    get: function (sql, params, callback) {
      if (typeof params === 'function') { callback = params; params = []; }
      let pgSql = sql.replace(/\?/g, (match, offset, string) => {
        const count = (string.substring(0, offset).match(/\?/g) || []).length + 1;
        return `$${count}`;
      });

      pgSql = pgSql.replace(/firstName/g, '"firstName"')
        .replace(/lastName/g, '"lastName"')
        .replace(/createdAt/g, '"createdAt"')
        .replace(/updatedAt/g, '"updatedAt"')
        .replace(/reportId/g, '"reportId"')
        .replace(/likesCount/g, '"likesCount"')
        .replace(/dislikesCount/g, '"dislikesCount"');

      pool.query(pgSql, params, (err, res) => {
        if (err) return callback(err);
        callback(null, res.rows[0]);
      });
    },
    all: function (sql, params, callback) {
      if (typeof params === 'function') { callback = params; params = []; }
      let pgSql = sql.replace(/\?/g, (match, offset, string) => {
        const count = (string.substring(0, offset).match(/\?/g) || []).length + 1;
        return `$${count}`;
      });

      pgSql = pgSql.replace(/firstName/g, '"firstName"')
        .replace(/lastName/g, '"lastName"')
        .replace(/createdAt/g, '"createdAt"')
        .replace(/updatedAt/g, '"updatedAt"')
        .replace(/reportId/g, '"reportId"');

      pool.query(pgSql, params, (err, res) => {
        if (err) return callback(err);
        callback(null, res.rows);
      });
    },
    serialize: function (fn) { fn(); },
    close: function () { return pool.end(); }
  };
} else {
  console.log('✓ SQLite Mode (Local)');
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('✗ Database connection failed:', err);
    else initializeTables();
  });
}

function initializeTables() {
  if (process.env.VERCEL) return; // Tables should be pre-created in Supabase
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      firstName TEXT,
      lastName TEXT,
      role TEXT DEFAULT 'user',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    // ... (rest of tables)
  });
}

const seedUsers = () => {
  // Only auto-seed locally or if explicitly requested
  if (process.env.VERCEL) return;
  const users = [
    { username: 'admin', email: 'admin@example.com', password: bcrypt.hashSync('1234', 10), firstName: 'คุณแดง', lastName: '', role: 'admin' },
    { username: 'tech', email: 'tech@example.com', password: bcrypt.hashSync('1234', 10), firstName: 'Tech', lastName: '', role: 'tech' },
    { username: 'resident', email: 'resident@example.com', password: bcrypt.hashSync('1234', 10), firstName: 'Resident', lastName: '', role: 'resident' }
  ];
  users.forEach(u => {
    db.run(
      `INSERT OR IGNORE INTO users (username, email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?, ?)`,
      [u.username, u.email, u.password, u.firstName, u.lastName, u.role]
    );
  });
};

setTimeout(seedUsers, 200);

module.exports = db;
