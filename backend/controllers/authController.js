const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const config = require('../config/env');

// Register
exports.register = (req, res) => {
  const { username, password, email, firstName, lastName, role } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: true, message: 'Missing required fields' });
  }

  User.findByUsername(username, (err, existingUser) => {
    if (err) {
      return res.status(500).json({ error: true, message: err.message });
    }

    if (existingUser) {
      return res.status(400).json({ error: true, message: 'Username already exists' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ error: true, message: err.message });
      }

      User.create(
        { username, email, password: hashedPassword, firstName, lastName, role: role || 'user' },
        (err, user) => {
          if (err) {
            return res.status(500).json({ error: true, message: err.message });
          }

          const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRE }
          );

          res.status(201).json({
            error: false,
            message: 'User registered successfully',
            token,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role
            }
          });
        }
      );
    });
  });
};

// Login
exports.login = (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`Login attempt for username: ${username}`);

    if (!username || !password) {
      return res.status(400).json({ error: true, message: 'Username and password required' });
    }

    User.findByUsername(username, (err, user) => {
      if (err) {
        console.error('Database Error in login:', err);
        return res.status(500).json({ error: true, message: 'Database error occurred', details: err.message });
      }

      if (!user) {
        console.log('User not found');
        return res.status(401).json({ error: true, message: 'Invalid credentials' });
      }

      console.log('User found, comparing password...');
      bcrypt.compare(password, user.password, (err, validPassword) => {
        if (err) {
          console.error('Bcrypt Error in login:', err);
          return res.status(500).json({ error: true, message: 'Password comparison error', details: err.message });
        }

        if (!validPassword) {
          console.log('Password mismatch');
          return res.status(401).json({ error: true, message: 'Invalid credentials' });
        }

        console.log('Password valid, signing token...');
        try {
          const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRE }
          );

          console.log('Login successful');
          res.json({
            error: false,
            message: 'Login successful',
            token,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role
            }
          });
        } catch (jwtErr) {
          console.error('JWT Error in login:', jwtErr);
          res.status(500).json({ error: true, message: 'Token creation failed', details: jwtErr.message });
        }
      });
    });
  } catch (globalErr) {
    console.error('Global Error in login controller:', globalErr);
    res.status(500).json({ error: true, message: 'An unexpected error occurred', details: globalErr.message });
  }
};
