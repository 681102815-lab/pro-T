const jwt = require('jsonwebtoken');
const config = require('../config/env');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: true, message: 'No token provided' });
  }

  jwt.verify(token, config.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: true, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: true, message: 'Access denied' });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole
};
