const Menu = require('../models/Menu');

const getWeeklyMenu = async (req, res) => {
  try {
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const menus = await Menu.find().populate('updatedBy', 'name email');
    
    // Sort menus by standard day of week order
    const sortedMenus = daysOrder.map(day => {
      const found = menus.find(m => m.dayOfWeek === day);
      if (found) return found;
      return {
        dayOfWeek: day,
        meals: {
          breakfast: { title: 'Standard Breakfast', items: ['Puri Sabzi', 'Tea', 'Banana'], timeSlot: '7:30 AM - 9:30 AM', price: 40 },
          lunch: { title: 'Standard Lunch', items: ['Rice', 'Dal Tadka', 'Seasonal Veg', 'Curd'], timeSlot: '12:30 PM - 2:30 PM', price: 60 },
          dinner: { title: 'Standard Dinner', items: ['Roti', 'Paneer Butter Masala', 'Rice', 'Salad'], timeSlot: '7:30 PM - 9:30 PM', price: 60 }
        }
      };
    });

    res.status(200).json({
      success: true,
      message: 'Weekly menu fetched successfully',
      data: sortedMenus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

const getTodayMenu = async (req, res) => {
  try {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];

    let menu = await Menu.findOne({ dayOfWeek: todayName });
    if (!menu) {
      menu = {
        dayOfWeek: todayName,
        meals: {
          breakfast: { title: 'Morning Power Breakfast', items: ['Idli Sambar', 'Filter Coffee', 'Boiled Egg'], timeSlot: '7:30 AM - 9:30 AM', price: 40 },
          lunch: { title: 'Full Indian Thali', items: ['Jeera Rice', 'Dal Fry', 'Aloo Gobi', 'Papad'], timeSlot: '12:30 PM - 2:30 PM', price: 60 },
          dinner: { title: 'Deluxe Dinner', items: ['Butter Naan', 'Kadai Paneer', 'Veg Pulao', 'Gulab Jamun'], timeSlot: '7:30 PM - 9:30 PM', price: 60 }
        }
      };
    }

    res.status(200).json({
      success: true,
      message: `Menu for ${todayName} fetched successfully`,
      data: menu
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

const updateMenuDay = async (req, res) => {
  try {
    const { day } = req.params;
    const { meals } = req.body;

    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const formattedDay = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();

    if (!validDays.includes(formattedDay)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid day of week specified',
        data: null
      });
    }

    let menu = await Menu.findOne({ dayOfWeek: formattedDay });
    if (menu) {
      menu.meals = meals || menu.meals;
      menu.updatedBy = req.user._id;
      await menu.save();
    } else {
      menu = await Menu.create({
        dayOfWeek: formattedDay,
        meals,
        updatedBy: req.user._id
      });
    }

    res.status(200).json({
      success: true,
      message: `Menu for ${formattedDay} updated successfully`,
      data: menu
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

module.exports = { getWeeklyMenu, getTodayMenu, updateMenuDay };
