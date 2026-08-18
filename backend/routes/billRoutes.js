const express = require('express');
const router = express.Router();
const { getMonthlySummary, getMyBill } = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.use(protect);

router.get('/summary', authorize('authority', 'admin'), getMonthlySummary);
router.get('/my-bill', authorize('student'), getMyBill);

module.exports = router;
