const express = require('express');
const router = express.Router();
const { submitFeedback, getFeedbackSummary } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.use(protect);

router.post('/', authorize('student'), submitFeedback);
router.get('/summary', authorize('admin', 'authority'), getFeedbackSummary);

module.exports = router;
  