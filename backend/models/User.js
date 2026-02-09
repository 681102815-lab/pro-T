const db = require('../config/database');

class User {
  static create(data, callback) {
    const { username, email, password, firstName, lastName, role } = data;
    db.run(
      `INSERT INTO users (username, email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, password, firstName, lastName, role || 'user'],
      function(err) {
        if (err) return callback(err);
        User.getById(this.lastID, callback);
      }
    );
  }

  static findByUsername(username, callback) {
    db.get(
      `SELECT * FROM users WHERE username = ?`,
      [username],
      callback
    );
  }

  static findByEmail(email, callback) {
    db.get(
      `SELECT * FROM users WHERE email = ?`,
      [email],
      callback
    );
  }

  static getById(id, callback) {
    db.get(
      `SELECT * FROM users WHERE id = ?`,
      [id],
      callback
    );
  }

  static getAll(callback) {
    db.all(
      `SELECT id, username, email, firstName, lastName, role, createdAt FROM users`,
      callback
    );
  }

  static update(id, data, callback) {
    const { firstName, lastName, email, role } = data;
    db.run(
      `UPDATE users SET firstName = ?, lastName = ?, email = ?, role = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [firstName, lastName, email, role, id],
      function(err) {
        if (err) return callback(err);
        User.getById(id, callback);
      }
    );
  }

  static delete(id, callback) {
    db.run(
      `DELETE FROM users WHERE id = ?`,
      [id],
      callback
    );
  }
}

module.exports = User;
