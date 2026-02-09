const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Public routes (no auth required)
router.get('/statistics', reportController.getStatistics);
router.get('/', reportController.getAllReports);
router.get('/user/:username', reportController.getUserReports);
router.post('/', reportController.createReport); // Allow creating reports without auth for now

// Protected routes (require authentication)
router.put('/:id/status', authenticateToken, authorizeRole('admin', 'tech'), reportController.updateStatus);
router.put('/:id/feedback', authenticateToken, authorizeRole('admin', 'tech'), reportController.addFeedback);
router.post('/:id/comment', authenticateToken, reportController.addComment);
router.post('/:id/like', reportController.likeReport); // Allow likes without auth
router.post('/:id/dislike', reportController.dislikeReport); // Allow dislikes without auth
router.post('/:id/removeLikeDislike', authenticateToken, reportController.removeLikeDislike);
router.delete('/:id', authenticateToken, reportController.deleteReport);

module.exports = router;
