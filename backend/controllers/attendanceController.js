const MealSelection = require('../models/MealSelection');
const User = require('../models/User');

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

const getLiveHeadcount = async (req, res) => {
  try {
    const targetDate = req.query.date || getTodayDateString();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const selections = await MealSelection.find({ date: targetDate });

    const headcount = {
      date: targetDate,
      totalStudents,
      breakfast: { optedIn: 0, served: 0, optedOut: 0 },
      lunch: { optedIn: 0, served: 0, optedOut: 0 },
      dinner: { optedIn: 0, served: 0, optedOut: 0 }
    };

    selections.forEach(sel => {
      ['breakfast', 'lunch', 'dinner'].forEach(meal => {
        const st = sel.status[meal];
        if (st === 'served') {
          headcount[meal].served += 1;
        } else if (st === 'opted-in' || sel[meal] === true) {
          headcount[meal].optedIn += 1;
        } else {
          headcount[meal].optedOut += 1;
        }
      });
    });

    res.status(200).json({
      success: true,
      message: 'Live headcount aggregated successfully',
      data: headcount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

const serveMeal = async (req, res) => {
  try {
    const { passToken, rollNumber, mealType, date } = req.body;
    const targetDate = date || getTodayDateString();
    const targetMeal = mealType || 'lunch';

    let selection;

    if (passToken) {
      selection = await MealSelection.findOne({ passToken, date: targetDate }).populate('student', 'name rollNumber roomNumber department');
    } else if (rollNumber) {
      const student = await User.findOne({ rollNumber: rollNumber.toUpperCase(), role: 'student' });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: `Student with Roll Number '${rollNumber}' not found`,
          data: null
        });
      }
      selection = await MealSelection.findOne({ student: student._id, date: targetDate }).populate('student', 'name rollNumber roomNumber department');
      
      if (!selection) {
        selection = new MealSelection({
          student: student._id,
          date: targetDate,
          passToken: `PASS-${student.rollNumber}-${targetDate}-AUTO`
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Provide either passToken or rollNumber',
        data: null
      });
    }

    if (!selection) {
      return res.status(404).json({
        success: false,
        message: 'No active meal pass found for the specified details',
        data: null
      });
    }

    if (selection.status[targetMeal] === 'served') {
      return res.status(400).json({
        success: false,
        message: `Meal '${targetMeal}' has ALREADY been served to ${selection.student ? selection.student.name : 'student'}`,
        data: {
          alreadyServed: true,
          student: selection.student,
          mealType: targetMeal
        }
      });
    }

    if (selection.status[targetMeal] === 'opted-out') {
      return res.status(400).json({
        success: false,
        message: `Student ${selection.student ? selection.student.name : ''} opted OUT of ${targetMeal} on ${targetDate}`,
        data: null
      });
    }

    selection.status[targetMeal] = 'served';
    selection[targetMeal] = true;
    await selection.save();

    res.status(200).json({
      success: true,
      message: `Meal '${targetMeal}' successfully SERVED to ${selection.student ? selection.student.name : 'Student'}`,
      data: {
        student: selection.student,
        mealType: targetMeal,
        servedAt: new Date().toLocaleTimeString(),
        date: targetDate
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

const getRecentServedLogs = async (req, res) => {
  try {
    const targetDate = req.query.date || getTodayDateString();
    const selections = await MealSelection.find({ date: targetDate })
      .populate('student', 'name rollNumber roomNumber department')
      .sort({ updatedAt: -1 });

    const logs = [];
    selections.forEach(sel => {
      ['breakfast', 'lunch', 'dinner'].forEach(meal => {
        if (sel.status[meal] === 'served') {
          logs.push({
            id: `${sel._id}-${meal}`,
            studentName: sel.student ? sel.student.name : 'Student',
            rollNumber: sel.student ? sel.student.rollNumber : 'N/A',
            roomNumber: sel.student ? sel.student.roomNumber : 'N/A',
            mealType: meal,
            servedTime: sel.updatedAt
          });
        }
      });
    });

    res.status(200).json({
      success: true,
      message: 'Recent served meal logs fetched',
      data: logs.slice(0, 20)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

module.exports = { getLiveHeadcount, serveMeal, getRecentServedLogs };
