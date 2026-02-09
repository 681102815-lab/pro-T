const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../database.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('✗ Database connection failed:', err);
  } else {
    console.log('✓ SQLite connected');
    initializeTables();
  }
});

let initializeTables = () => {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        firstName TEXT,
        lastName TEXT,
        role TEXT DEFAULT 'user',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Reports table
    db.run(`
      CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reportId INTEGER UNIQUE NOT NULL,
        category TEXT NOT NULL,
        detail TEXT NOT NULL,
        owner TEXT NOT NULL,
        status TEXT DEFAULT 'รอรับเรื่อง',
        feedback TEXT,
        likesCount INTEGER DEFAULT 0,
        dislikesCount INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        completedAt DATETIME,
        FOREIGN KEY(owner) REFERENCES users(username)
      )
    `);

    // Comments table
    db.run(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reportId INTEGER NOT NULL,
        author TEXT NOT NULL,
        text TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(reportId) REFERENCES reports(id),
        FOREIGN KEY(author) REFERENCES users(username)
      )
    `);

    // Likes table
    db.run(`
      CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reportId INTEGER NOT NULL,
        username TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(reportId, username),
        FOREIGN KEY(reportId) REFERENCES reports(id),
        FOREIGN KEY(username) REFERENCES users(username)
      )
    `);

    // Dislikes table
    db.run(`
      CREATE TABLE IF NOT EXISTS dislikes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reportId INTEGER NOT NULL,
        username TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(reportId, username),
        FOREIGN KEY(reportId) REFERENCES reports(id),
        FOREIGN KEY(username) REFERENCES users(username)
      )
    `);
  });
};

const seedUsers = () => {
  try {
    const users = [
      { username: 'admin', email: 'admin@example.com', password: bcrypt.hashSync('1234', 10), firstName: 'คุณแดง', lastName: '', role: 'admin' },
      { username: 'tech', email: 'tech@example.com', password: bcrypt.hashSync('1234', 10), firstName: 'Tech', lastName: '', role: 'tech' },
      { username: 'resident', email: 'resident@example.com', password: bcrypt.hashSync('1234', 10), firstName: 'Resident', lastName: '', role: 'resident' }
    ];

    users.forEach(u => {
      db.run(
        `INSERT OR IGNORE INTO users (username, email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?, ?)`,
        [u.username, u.email, u.password, u.firstName, u.lastName, u.role],
        (err) => { if (err) console.warn('seed user error', err); }
      );
    });
  } catch (e) { console.error('seedUsers error', e) }
};

// seed default users after tables are ensured
initializeTables = (function (orig) {
  return function () {
    orig();
    // small delay to ensure CREATE TABLE finished
    setTimeout(seedUsers, 50);
  }
})(initializeTables);

// ensure seeds run on startup as well (in case initializeTables was called earlier)
setTimeout(seedUsers, 200);

module.exports = db;
