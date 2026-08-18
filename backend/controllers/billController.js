const MealSelection = require('../models/MealSelection');
const User = require('../models/User');

const getMonthlySummary = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const datePrefix = `${year}-${monthStr}`;

    const students = await User.find({ role: 'student' }).select('-password');
    const selections = await MealSelection.find({
      date: { $regex: `^${datePrefix}` }
    });

    const billingReport = students.map(student => {
      const studentSelections = selections.filter(s => s.student.toString() === student._id.toString());

      let totalOpted = 0;
      let totalConsumed = 0;

      studentSelections.forEach(sel => {
        ['breakfast', 'lunch', 'dinner'].forEach(meal => {
          if (sel.status[meal] === 'served') {
            totalConsumed += 1;
            totalOpted += 1;
          } else if (sel.status[meal] === 'opted-in' || sel[meal] === true) {
            totalOpted += 1;
          }
        });
      });

      const ratePerMeal = student.mealRate || 50;
      const totalAmount = totalConsumed * ratePerMeal; // Solely based on consumed meals

      return {
        studentId: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber || 'N/A',
        roomNumber: student.roomNumber || 'N/A',
        department: student.department || 'N/A',
        month: `${year}-${monthStr}`,
        totalOptedMeals: totalOpted,
        totalConsumedMeals: totalConsumed,
        ratePerMeal,
        totalAmount
      };
    });

    res.status(200).json({
      success: true,
      message: `Monthly billing report generated for ${year}-${monthStr}`,
      data: billingReport
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

const getMyBill = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const datePrefix = `${year}-${monthStr}`;

    const selections = await MealSelection.find({
      student: req.user._id,
      date: { $regex: `^${datePrefix}` }
    });

    let totalOpted = 0;
    let totalConsumed = 0;
    const dailyBreakdown = [];

    selections.forEach(sel => {
      let dayConsumed = 0;
      let dayOpted = 0;

      ['breakfast', 'lunch', 'dinner'].forEach(meal => {
        if (sel.status[meal] === 'served') {
          dayConsumed += 1;
          dayOpted += 1;
        } else if (sel.status[meal] === 'opted-in' || sel[meal] === true) {
          dayOpted += 1;
        }
      });

      totalConsumed += dayConsumed;
      totalOpted += dayOpted;

      dailyBreakdown.push({
        date: sel.date,
        status: sel.status,
        consumedCount: dayConsumed
      });
    });

    const ratePerMeal = req.user.mealRate || 50;
    const totalAmount = totalConsumed * ratePerMeal;

    res.status(200).json({
      success: true,
      message: `Personal bill details for ${year}-${monthStr}`,
      data: {
        studentName: req.user.name,
        rollNumber: req.user.rollNumber,
        month: `${year}-${monthStr}`,
        totalOptedMeals: totalOpted,
        totalConsumedMeals: totalConsumed,
        ratePerMeal,
        totalAmount,
        dailyBreakdown
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

module.exports = { getMonthlySummary, getMyBill };
