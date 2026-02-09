const User = require('../models/User');

// Get all users
exports.getAllUsers = (req, res) => {
  User.getAll((err, users) => {
    if (err) {
      return res.status(500).json({ error: true, message: err.message });
    }
    res.json({
      error: false,
      count: users.length,
      data: users
    });
  });
};

// Get user by id
exports.getUserById = (req, res) => {
  const { id } = req.params;
  User.getById(id, (err, user) => {
    if (err) {
      return res.status(500).json({ error: true, message: err.message });
    }
    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    res.json({
      error: false,
      data: user
    });
  });
};

// Update user
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { email, firstName, lastName, role } = req.body;

  User.update(id, { email, firstName, lastName, role }, (err, user) => {
    if (err) {
      return res.status(500).json({ error: true, message: err.message });
    }
    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    res.json({
      error: false,
      message: 'User updated successfully',
      data: user
    });
  });
};

// Delete user
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  User.delete(id, (err) => {
    if (err) {
      return res.status(500).json({ error: true, message: err.message });
    }
    res.json({
      error: false,
      message: 'User deleted successfully'
    });
  });
};
