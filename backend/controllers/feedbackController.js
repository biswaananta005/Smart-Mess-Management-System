const Feedback = require('../models/Feedback');

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

const submitFeedback = async (req, res) => {
  try {
    const { rating, mealType, comment, date } = req.body;
    const targetDate = date || getTodayDateString();

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars',
        data: null
      });
    }

    if (!['breakfast', 'lunch', 'dinner'].includes(mealType)) {
      return res.status(400).json({
        success: false,
        message: 'Valid meal type is required (breakfast, lunch, dinner)',
        data: null
      });
    }

    const feedback = await Feedback.findOneAndUpdate(
      { student: req.user._id, date: targetDate, mealType },
      { rating, comment, student: req.user._id, date: targetDate, mealType },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

const getFeedbackSummary = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('student', 'name rollNumber');

    const totalCount = feedbacks.length;
    if (totalCount === 0) {
      return res.status(200).json({
        success: true,
        message: 'No feedback data available yet',
        data: {
          averageRating: 0,
          totalFeedbacks: 0,
          breakfastAvg: 0,
          lunchAvg: 0,
          dinnerAvg: 0,
          recentComments: []
        }
      });
    }

    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    const avg = parseFloat((sum / totalCount).toFixed(1));

    const mealStats = {
      breakfast: { sum: 0, count: 0 },
      lunch: { sum: 0, count: 0 },
      dinner: { sum: 0, count: 0 }
    };

    feedbacks.forEach(f => {
      if (mealStats[f.mealType]) {
        mealStats[f.mealType].sum += f.rating;
        mealStats[f.mealType].count += 1;
      }
    });

    res.status(200).json({
      success: true,
      message: 'Feedback summary aggregated',
      data: {
        averageRating: avg,
        totalFeedbacks: totalCount,
        breakfastAvg: mealStats.breakfast.count ? parseFloat((mealStats.breakfast.sum / mealStats.breakfast.count).toFixed(1)) : 0,
        lunchAvg: mealStats.lunch.count ? parseFloat((mealStats.lunch.sum / mealStats.lunch.count).toFixed(1)) : 0,
        dinnerAvg: mealStats.dinner.count ? parseFloat((mealStats.dinner.sum / mealStats.dinner.count).toFixed(1)) : 0,
        recentComments: feedbacks.slice(-10).reverse().map(f => ({
          id: f._id,
          studentName: f.student ? f.student.name : 'Anonymous',
          mealType: f.mealType,
          rating: f.rating,
          comment: f.comment,
          date: f.date
        }))
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

module.exports = { submitFeedback, getFeedbackSummary };
