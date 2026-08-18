const MealSelection = require('../models/MealSelection');
const crypto = require('crypto');

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

const getMySelections = async (req, res) => {
  try {
    const targetDate = req.query.date || getTodayDateString();
    let selection = await MealSelection.findOne({
      student: req.user._id,
      date: targetDate
    });

    if (!selection) {
      const passToken = `PASS-${req.user.rollNumber || 'STU'}-${targetDate}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      selection = await MealSelection.create({
        student: req.user._id,
        date: targetDate,
        breakfast: true,
        lunch: true,
        dinner: true,
        passToken,
        status: {
          breakfast: 'opted-in',
          lunch: 'opted-in',
          dinner: 'opted-in'
        }
      });
    }

    res.status(200).json({
      success: true,
      message: `Meal selections fetched for date ${targetDate}`,
      data: selection
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

const toggleMeal = async (req, res) => {
  try {
    const { mealType, date, status } = req.body; // status: boolean or string ('opted-in'/'opted-out')
    const targetDate = date || getTodayDateString();

    if (!['breakfast', 'lunch', 'dinner'].includes(mealType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meal type provided',
        data: null
      });
    }

    let selection = await MealSelection.findOne({
      student: req.user._id,
      date: targetDate
    });

    if (!selection) {
      const passToken = `PASS-${req.user.rollNumber || 'STU'}-${targetDate}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      selection = new MealSelection({
        student: req.user._id,
        date: targetDate,
        passToken
      });
    }

    const currentStatus = selection.status[mealType];
    if (currentStatus === 'served') {
      return res.status(400).json({
        success: false,
        message: `Cannot modify ${mealType} as it has already been served`,
        data: null
      });
    }

    let isOptedIn = typeof status === 'boolean' ? status : status === 'opted-in';
    selection[mealType] = isOptedIn;
    selection.status[mealType] = isOptedIn ? 'opted-in' : 'opted-out';

    await selection.save();

    res.status(200).json({
      success: true,
      message: `Successfully ${isOptedIn ? 'opted-in for' : 'opted-out of'} ${mealType}`,
      data: selection
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

const submitMealPreferences = async (req, res) => {
  try {
    const { date, breakfast, lunch, dinner } = req.body;
    const targetDate = date || getTodayDateString();

    let selection = await MealSelection.findOne({
      student: req.user._id,
      date: targetDate
    });

    if (!selection) {
      const passToken = `PASS-${req.user.rollNumber || 'STU'}-${targetDate}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      selection = new MealSelection({
        student: req.user._id,
        date: targetDate,
        passToken
      });
    }

    const updates = { breakfast, lunch, dinner };
    ['breakfast', 'lunch', 'dinner'].forEach(meal => {
      if (typeof updates[meal] === 'boolean' && selection.status[meal] !== 'served') {
        selection[meal] = updates[meal];
        selection.status[meal] = updates[meal] ? 'opted-in' : 'opted-out';
      }
    });

    selection.isSubmitted = true;
    selection.submittedAt = new Date();

    await selection.save();

    res.status(200).json({
      success: true,
      message: 'Meal preferences confirmed & submitted to Mess Authority successfully!',
      data: selection
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

const getDigitalPass = async (req, res) => {
  try {
    const targetDate = req.query.date || getTodayDateString();
    let selection = await MealSelection.findOne({
      student: req.user._id,
      date: targetDate
    });

    if (!selection) {
      const passToken = `PASS-${req.user.rollNumber || 'STU'}-${targetDate}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      selection = await MealSelection.create({
        student: req.user._id,
        date: targetDate,
        passToken
      });
    }

    const passPayload = JSON.stringify({
      passToken: selection.passToken,
      rollNumber: req.user.rollNumber,
      studentName: req.user.name,
      date: selection.date,
      selections: {
        breakfast: selection.status.breakfast,
        lunch: selection.status.lunch,
        dinner: selection.status.dinner
      }
    });

    res.status(200).json({
      success: true,
      message: 'Digital meal pass fetched successfully',
      data: {
        passToken: selection.passToken,
        date: selection.date,
        studentName: req.user.name,
        rollNumber: req.user.rollNumber,
        status: selection.status,
        qrPayload: passPayload
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

module.exports = { getMySelections, toggleMeal, submitMealPreferences, getDigitalPass };
