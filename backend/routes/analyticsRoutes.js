const express = require('express');
const router = express.Router();
const { getWastageStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.use(protect);

router.get('/wastage', authorize('authority', 'admin'), getWastageStats);

module.exports = router;
