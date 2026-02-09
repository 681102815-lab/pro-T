const db = require('../config/db');

class Report {
  static getAll(callback) {
    db.query(`
      SELECT r.*, 
             COALESCE(STRING_AGG(c.id || '|' || c.author || '|' || c.text || '|' || c."createdAt", '::'), '') as comments_data
      FROM reports r
      LEFT JOIN comments c ON r.id = c."reportId"
      GROUP BY r.id
      ORDER BY r."createdAt" DESC
    `, [], (err, res) => callback(err, res?.rows));
  }

  static getByUsername(username, callback) {
    db.query(`
      SELECT r.*, 
             COALESCE(STRING_AGG(c.id || '|' || c.author || '|' || c.text || '|' || c."createdAt", '::'), '') as comments_data
      FROM reports r
      LEFT JOIN comments c ON r.id = c."reportId"
      WHERE r.owner = $1
      GROUP BY r.id
      ORDER BY r."createdAt" DESC
    `, [username], (err, res) => callback(err, res?.rows));
  }

  static getById(id, callback) {
    db.query(`
      SELECT r.*, 
             COALESCE(STRING_AGG(c.id || '|' || c.author || '|' || c.text || '|' || c."createdAt", '::'), '') as comments_data
      FROM reports r
      LEFT JOIN comments c ON r.id = c."reportId"
      WHERE r.id = $1
      GROUP BY r.id
    `, [id], (err, res) => callback(err, res?.rows[0]));
  }

  static create(data, callback) {
    const { reportId, category, detail, owner } = data;
    db.query(
      `INSERT INTO reports ("reportId", category, detail, owner, status) 
       VALUES ($1, $2, $3, $4, 'รอรับเรื่อง') RETURNING *`,
      [reportId, category, detail, owner],
      (err, res) => {
        if (err) return callback(err);
        callback(null, res.rows[0]);
      }
    );
  }

  static updateStatus(id, status, callback) {
    db.query(
      `UPDATE reports SET status = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id],
      (err, res) => {
        if (err) return callback(err);
        callback(null, res.rows[0]);
      }
    );
  }

  static addFeedback(id, feedback, callback) {
    db.query(
      `UPDATE reports SET feedback = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [feedback, id],
      (err, res) => {
        if (err) return callback(err);
        callback(null, res.rows[0]);
      }
    );
  }

  static addComment(id, author, text, callback) {
    db.query(
      `INSERT INTO comments ("reportId", author, text) VALUES ($1, $2, $3) RETURNING *`,
      [id, author, text],
      (err, res) => {
        if (err) return callback(err);
        Report.getById(id, callback);
      }
    );
  }

  static likeReport(reportId, username, callback) {
    db.query(
      `INSERT INTO likes ("reportId", username) VALUES ($1, $2)`,
      [reportId, username],
      (err) => {
        if (err) return callback(err);
        db.query(
          `UPDATE reports SET "likesCount" = "likesCount" + 1 WHERE id = $1 RETURNING *`,
          [reportId],
          (e, r) => callback(e, r?.rows[0])
        );
      }
    );
  }

  static dislikeReport(reportId, username, callback) {
    db.query(
      `INSERT INTO dislikes ("reportId", username) VALUES ($1, $2)`,
      [reportId, username],
      (err) => {
        if (err) return callback(err);
        db.query(
          `UPDATE reports SET "dislikesCount" = "dislikesCount" + 1 WHERE id = $1 RETURNING *`,
          [reportId],
          (e, r) => callback(e, r?.rows[0])
        );
      }
    );
  }

  static removeLike(reportId, username, callback) {
    db.query(
      `DELETE FROM likes WHERE "reportId" = $1 AND username = $2`,
      [reportId, username],
      (err) => {
        if (err) return callback(err);
        db.query(
          `UPDATE reports SET "likesCount" = "likesCount" - 1 WHERE id = $1 RETURNING *`,
          [reportId],
          (e, r) => callback(e, r?.rows[0])
        );
      }
    );
  }

  static removeDislike(reportId, username, callback) {
    db.query(
      `DELETE FROM dislikes WHERE "reportId" = $1 AND username = $2`,
      [reportId, username],
      (err) => {
        if (err) return callback(err);
        db.query(
          `UPDATE reports SET "dislikesCount" = "dislikesCount" - 1 WHERE id = $1 RETURNING *`,
          [reportId],
          (e, r) => callback(e, r?.rows[0])
        );
      }
    );
  }

  static delete(id, callback) {
    db.query(
      `DELETE FROM reports WHERE id = $1`,
      [id],
      (err) => callback(err)
    );
  }

  static getStatistics(callback) {
    db.query(`
      SELECT 
        COUNT(*) as "totalReports",
        SUM(CASE WHEN status = 'เสร็จสิ้น' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'กำลังดำเนินการ' THEN 1 ELSE 0 END) as "inProgress",
        SUM(CASE WHEN status = 'รอรับเรื่อง' THEN 1 ELSE 0 END) as waiting
      FROM reports
    `, [], (err, res) => callback(err, res?.rows));
  }
}

module.exports = Report;
