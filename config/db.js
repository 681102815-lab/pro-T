const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let db;

const HARDCODED_URL = 'postgresql://postgres:kadoojang01@db.ykzltizvvpaapfvnjhde.supabase.co:5432/postgres';

if (process.env.DATABASE_URL || HARDCODED_URL) {
    const connectionString = process.env.DATABASE_URL || HARDCODED_URL;
    const pool = new Pool({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    db = {
        query: (text, params, callback) => {
            // PG compatibility
            return pool.query(text, params, callback);
        },
        pool
    };
    console.log('✓ PostgreSQL Mode');
} else if (process.env.VERCEL) {
    // Prevent crash on Vercel when DATABASE_URL is not yet set
    console.warn('⚠️ Warning: DATABASE_URL is not set on Vercel. System will not be able to connect to database.');
    db = {
        query: (text, params, callback) => {
            const error = new Error('Database not configured. Please set DATABASE_URL in Vercel settings.');
            console.error(error.message);
            if (callback) callback(error, { rows: [] });
            return Promise.reject(error);
        }
    };
} else {
    // SQLite Fallback for Local
    try {
        const sqlite3 = require('sqlite3').verbose();
        const dbPath = path.join(__dirname, '../backend/database.db');
        const sqliteDb = new sqlite3.Database(dbPath, (err) => {
            if (!err) {
                console.log('✓ SQLite Mode (Local) -> ' + dbPath);
                seedLocalUsers(sqliteDb);
            }
        });

        db = {
            query: (text, params, callback) => {
                // Emulate PG query for SQLite
                let sql = text.replace(/\$\d+/g, '?');
                // Remove RETURNING clause for SQLite
                sql = sql.replace(/RETURNING \*/gi, '');

                sqliteDb.all(sql, params, (err, rows) => {
                    if (callback) callback(err, { rows: rows || [] });
                });
            },
            sqliteDb
        };
    } catch (e) {
        console.warn('⚠️ SQLite fallback failed (sqlite3 not installed).');
        db = { query: (t, p, c) => { if (c) c(new Error('No DB available'), { rows: [] }); } };
    }
}

function seedLocalUsers(db) {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE, email TEXT UNIQUE, password TEXT,
            firstName TEXT, lastName TEXT, role TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        const p = bcrypt.hashSync('1234', 10);
        ['admin', 'tech', 'resident'].forEach(u => {
            db.run(`INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`, [u, u + '@test.com', p, u]);
        });
    });
}

module.exports = db;
