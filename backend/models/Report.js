const db = require('../config/database');

class Report {
  static getAll(callback) {
    db.all(`
      SELECT r.*, 
             COALESCE(GROUP_CONCAT(c.id || '|' || c.author || '|' || c.text || '|' || c.createdAt, '::'), '') as comments_data
      FROM reports r
      LEFT JOIN comments c ON r.id = c.reportId
      GROUP BY r.id
      ORDER BY r.createdAt DESC
    `, callback);
  }

  static getByUsername(username, callback) {
    db.all(`
      SELECT r.*, 
             COALESCE(GROUP_CONCAT(c.id || '|' || c.author || '|' || c.text || '|' || c.createdAt, '::'), '') as comments_data
      FROM reports r
      LEFT JOIN comments c ON r.id = c.reportId
      WHERE r.owner = ?
      GROUP BY r.id
      ORDER BY r.createdAt DESC
    `, [username], callback);
  }

  static getById(id, callback) {
    db.get(`
      SELECT r.*, 
             COALESCE(GROUP_CONCAT(c.id || '|' || c.author || '|' || c.text || '|' || c.createdAt, '::'), '') as comments_data
      FROM reports r
      LEFT JOIN comments c ON r.id = c.reportId
      WHERE r.id = ?
      GROUP BY r.id
    `, [id], callback);
  }

  static create(data, callback) {
    const { reportId, category, detail, owner } = data;
    db.run(
      `INSERT INTO reports (reportId, category, detail, owner, status) VALUES (?, ?, ?, ?, 'รอรับเรื่อง')`,
      [reportId, category, detail, owner],
      function(err) {
        if (err) return callback(err);
        Report.getById(this.lastID, callback);
      }
    );
  }

  static updateStatus(id, status, callback) {
    db.run(
      `UPDATE reports SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, id],
      function(err) {
        if (err) return callback(err);
        Report.getById(id, callback);
      }
    );
  }

  static addFeedback(id, feedback, callback) {
    db.run(
      `UPDATE reports SET feedback = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [feedback, id],
      function(err) {
        if (err) return callback(err);
        Report.getById(id, callback);
      }
    );
  }

  static addComment(id, author, text, callback) {
    db.run(
      `INSERT INTO comments (reportId, author, text) VALUES (?, ?, ?)`,
      [id, author, text],
      function(err) {
        if (err) return callback(err);
        Report.getById(id, callback);
      }
    );
  }

  static likeReport(reportId, username, callback) {
    db.run(
      `INSERT INTO likes (reportId, username) VALUES (?, ?)`,
      [reportId, username],
      (err) => {
        if (err) return callback(err);
        db.run(
          `UPDATE reports SET likesCount = likesCount + 1 WHERE id = ?`,
          [reportId],
          () => Report.getById(reportId, callback)
        );
      }
    );
  }

  static dislikeReport(reportId, username, callback) {
    db.run(
      `INSERT INTO dislikes (reportId, username) VALUES (?, ?)`,
      [reportId, username],
      (err) => {
        if (err) return callback(err);
        db.run(
          `UPDATE reports SET dislikesCount = dislikesCount + 1 WHERE id = ?`,
          [reportId],
          () => Report.getById(reportId, callback)
        );
      }
    );
  }

  static removeLike(reportId, username, callback) {
    db.run(
      `DELETE FROM likes WHERE reportId = ? AND username = ?`,
      [reportId, username],
      (err) => {
        if (err) return callback(err);
        db.run(
          `UPDATE reports SET likesCount = likesCount - 1 WHERE id = ?`,
          [reportId],
          () => Report.getById(reportId, callback)
        );
      }
    );
  }

  static removeDislike(reportId, username, callback) {
    db.run(
      `DELETE FROM dislikes WHERE reportId = ? AND username = ?`,
      [reportId, username],
      (err) => {
        if (err) return callback(err);
        db.run(
          `UPDATE reports SET dislikesCount = dislikesCount - 1 WHERE id = ?`,
          [reportId],
          () => Report.getById(reportId, callback)
        );
      }
    );
  }

  static delete(id, callback) {
    db.run(
      `DELETE FROM reports WHERE id = ?`,
      [id],
      callback
    );
  }

  static getStatistics(callback) {
    db.all(`
      SELECT 
        COUNT(*) as totalReports,
        SUM(CASE WHEN status = 'เสร็จสิ้น' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'กำลังดำเนินการ' THEN 1 ELSE 0 END) as inProgress,
        SUM(CASE WHEN status = 'รอรับเรื่อง' THEN 1 ELSE 0 END) as waiting
      FROM reports
    `, callback);
  }
}

module.exports = Report;
