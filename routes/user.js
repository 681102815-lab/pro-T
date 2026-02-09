const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Protected routes (require authentication)
router.get('/', authenticateToken, authorizeRole('admin'), userController.getAllUsers);
router.get('/:id', authenticateToken, userController.getUserById);
router.put('/:id', authenticateToken, userController.updateUser);
router.delete('/:id', authenticateToken, authorizeRole('admin'), userController.deleteUser);

module.exports = router;
