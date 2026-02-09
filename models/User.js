const db = require('../config/db');

class User {
  static create(data, callback) {
    const { username, email, password, firstName, lastName, role } = data;
    db.query(
      `INSERT INTO users (username, email, password, "firstName", "lastName", role) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [username, email, password, firstName, lastName, role || 'user'],
      (err, res) => {
        if (err) return callback(err);
        callback(null, res.rows[0]);
      }
    );
  }

  static findByUsername(username, callback) {
    db.query(
      `SELECT * FROM users WHERE username = $1`,
      [username],
      (err, res) => callback(err, res?.rows[0])
    );
  }

  static findByEmail(email, callback) {
    db.query(
      `SELECT * FROM users WHERE email = $1`,
      [email],
      (err, res) => callback(err, res?.rows[0])
    );
  }

  static getById(id, callback) {
    db.query(
      `SELECT * FROM users WHERE id = $1`,
      [id],
      (err, res) => callback(err, res?.rows[0])
    );
  }

  static getAll(callback) {
    db.query(
      `SELECT id, username, email, "firstName", "lastName", role, "createdAt" FROM users`,
      [],
      (err, res) => callback(err, res?.rows)
    );
  }

  static update(id, data, callback) {
    const { firstName, lastName, email, role } = data;
    db.query(
      `UPDATE users SET "firstName" = $1, "lastName" = $2, email = $3, role = $4, "updatedAt" = CURRENT_TIMESTAMP 
       WHERE id = $5 RETURNING *`,
      [firstName, lastName, email, role, id],
      (err, res) => {
        if (err) return callback(err);
        callback(null, res.rows[0]);
      }
    );
  }

  static delete(id, callback) {
    db.query(
      `DELETE FROM users WHERE id = $1`,
      [id],
      (err, res) => callback(err)
    );
  }
}

module.exports = User;
