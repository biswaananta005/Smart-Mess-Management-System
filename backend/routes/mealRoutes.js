const express = require('express');
const router = express.Router();
const { getMySelections, toggleMeal, submitMealPreferences, getDigitalPass } = require('../controllers/mealController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.use(protect);

router.get('/my-selections', authorize('student'), getMySelections);
router.post('/toggle', authorize('student'), toggleMeal);
router.post('/submit-selections', authorize('student'), submitMealPreferences);
router.get('/pass', authorize('student'), getDigitalPass);

module.exports = router;
