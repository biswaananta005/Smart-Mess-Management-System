const MealSelection = require('../models/MealSelection');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

const getWastageStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const allSelections = await MealSelection.find();

    let totalOptedInMeals = 0;
    let totalServedMeals = 0;
    let totalUnservedOptedMeals = 0;

    allSelections.forEach(sel => {
      ['breakfast', 'lunch', 'dinner'].forEach(meal => {
        const status = sel.status[meal];
        if (status === 'served') {
          totalServedMeals += 1;
          totalOptedInMeals += 1;
        } else if (status === 'opted-in' || sel[meal] === true) {
          totalOptedInMeals += 1;
          totalUnservedOptedMeals += 1;
        }
      });
    });

    const efficiencyRate = totalOptedInMeals > 0 
      ? parseFloat(((totalServedMeals / totalOptedInMeals) * 100).toFixed(1)) 
      : 100;

    const estimatedWastageCost = totalUnservedOptedMeals * 45; // Estimated ₹45 cost per unconsumed prepared meal

    const feedbacks = await Feedback.find();
    const totalFeedbacks = feedbacks.length;
    const avgRating = totalFeedbacks > 0
      ? parseFloat((feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks).toFixed(1))
      : 0;

    res.status(200).json({
      success: true,
      message: 'Wastage and efficiency statistics calculated',
      data: {
        totalStudents,
        totalOptedInMeals,
        totalServedMeals,
        totalUnservedOptedMeals,
        efficiencyRate,
        estimatedWastageCost,
        avgRating,
        totalFeedbacks
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

module.exports = { getWastageStats };
