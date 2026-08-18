const express = require('express');
const router = express.Router();
const { getWeeklyMenu, getTodayMenu, updateMenuDay } = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.get('/', getWeeklyMenu);
router.get('/today', getTodayMenu);
router.put('/:day', protect, authorize('admin'), updateMenuDay);

module.exports = router;
