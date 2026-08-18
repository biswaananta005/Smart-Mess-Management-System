const express = require('express');
const router = express.Router();
const { getLiveHeadcount, serveMeal, getRecentServedLogs } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.use(protect);

router.get('/headcount', authorize('admin', 'authority'), getLiveHeadcount);
router.post('/serve', authorize('admin'), serveMeal);
router.get('/recent-logs', authorize('admin', 'authority'), getRecentServedLogs);

module.exports = router;
