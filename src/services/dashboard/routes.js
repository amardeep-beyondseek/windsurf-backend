const express = require('express');
const router = express.Router();
const dashboardController = require('./controller');
const { validateToken, hasRoles } = require('../../middleware/auth');

// Apply authentication middleware to all dashboard routes
router.use(validateToken);

// Get dashboard statistics
router.get('/stats', dashboardController.getStats);

// Get recent activity
router.get('/activity', dashboardController.getRecentActivity);

// Get all dashboard data
router.get('/', dashboardController.getDashboardData);

module.exports = router;
