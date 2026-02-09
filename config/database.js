const pool = require('./db');

// This file is kept for backward compatibility with existing model imports
// but it now points to the PostgreSQL pool.
module.exports = {
  // SQLite-like interfaces for minimal refactoring impact
  run: (sql, params, callback) => {
    // Convert ? to $n placeholders
    let i = 1;
    const pgSql = sql.replace(/\?/g, () => `$${i++}`);
    pool.query(pgSql, params, (err, res) => {
      if (callback) {
        if (err) return callback(err);
        // Emulate sqlite's this.lastID if returning clause is used
        const result = { lastID: res.rows[0]?.id || null, changes: res.rowCount };
        callback.call(result, null);
      }
    });
  },
  get: (sql, params, callback) => {
    let i = 1;
    const pgSql = sql.replace(/\?/g, () => `$${i++}`);
    pool.query(pgSql, params, (err, res) => {
      if (callback) callback(err, res.rows[0]);
    });
  },
  all: (sql, params, callback) => {
    let i = 1;
    const pgSql = sql.replace(/\?/g, () => `$${i++}`);
    // Handle cases where params might be the callback
    const actualParams = Array.isArray(params) ? params : [];
    const actualCallback = typeof params === 'function' ? params : callback;

    pool.query(pgSql, actualParams, (err, res) => {
      if (actualCallback) actualCallback(err, res.rows);
    });
  },
  serialize: (fn) => fn() // PostgreSQL doesn't need serialize like SQLite
};
