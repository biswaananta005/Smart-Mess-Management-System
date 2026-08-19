const User = require('../models/User');
const Menu = require('../models/Menu');
const MealSelection = require('../models/MealSelection');
const Feedback = require('../models/Feedback');

const seedInitialData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial demo users...');

      const student = await User.create({
        name: 'Aarav Sharma',
        email: 'student@mess.com',
        password: 'Password123',
        role: 'student',
        rollNumber: 'STU1001',
        roomNumber: 'B-304',
        department: 'Computer Science',
        mealRate: 50
      });

      await User.create({
        name: 'Priya Verma',
        email: 'student2@mess.com',
        password: 'Password123',
        role: 'student',
        rollNumber: 'STU1002',
        roomNumber: 'A-102',
        department: 'Electronics',
        mealRate: 50
      });

      const admin = await User.create({
        name: 'Rajesh Kumar (Mess Manager)',
        email: 'admin@mess.com',
        password: 'Mess@123',
        role: 'admin',
        department: 'Mess Operations'
      });

      await User.create({
        name: 'Dr. S. K. Gupta (Dean Student Affairs)',
        email: 'authority@mess.com',
        password: 'college@123',
        role: 'authority',
        department: 'Administration'
      });

      console.log('Demo users created successfully:');
      console.log(' - Student: student@mess.com / Password123 (Roll: STU1001)');
      console.log(' - Admin: admin@mess.com / Password123');
      console.log(' - Authority: authority@mess.com / Password123');

      // Create initial meal selections for today for student
      const todayStr = new Date().toISOString().split('T')[0];
      await MealSelection.create({
        student: student._id,
        date: todayStr,
        breakfast: true,
        lunch: true,
        dinner: true,
        passToken: `PASS-STU1001-${todayStr}-DEMO`,
        status: {
          breakfast: 'served',
          lunch: 'opted-in',
          dinner: 'opted-in'
        }
      });

      // Create initial sample feedback
      await Feedback.create({
        student: student._id,
        date: todayStr,
        mealType: 'breakfast',
        rating: 5,
        comment: 'Puri Sabzi was fresh and tasty!'
      });
    }

    const menuCount = await Menu.countDocuments();
    if (menuCount === 0) {
      console.log('Seeding initial weekly menu...');
      const defaultWeeklyMenu = [
        {
          dayOfWeek: 'Monday',
          meals: {
            breakfast: { title: 'North Indian Breakfast', items: ['Aloo Paratha', 'Curd', 'Pickle', 'Hot Tea'], timeSlot: '7:30 AM - 9:30 AM', price: 40 },
            lunch: { title: 'Special Lunch Thali', items: ['Basmati Rice', 'Dal Tadka', 'Mix Veg', 'Paneer Curry', 'Roti', 'Salad'], timeSlot: '12:30 PM - 2:30 PM', price: 60 },
            dinner: { title: 'Healthy Light Dinner', items: ['Tandoori Roti', 'Chana Masala', 'Jeera Rice', 'Kheer'], timeSlot: '7:30 PM - 9:30 PM', price: 60 }
          }
        },
        {
          dayOfWeek: 'Tuesday',
          meals: {
            breakfast: { title: 'South Indian Special', items: ['Masala Dosa', 'Coconut Chutney', 'Sambar', 'Coffee'], timeSlot: '7:30 AM - 9:30 AM', price: 40 },
            lunch: { title: 'Comfort Meal', items: ['Plain Rice', 'Rajma Masala', 'Aloo Gobi', 'Chapati', 'Curd'], timeSlot: '12:30 PM - 2:30 PM', price: 60 },
            dinner: { title: 'Classic Dinner', items: ['Roti', 'Sev Tamatar', 'Plain Rice', 'Dal Fry', 'Fruit Custard'], timeSlot: '7:30 PM - 9:30 PM', price: 60 }
          }
        },
        {
          dayOfWeek: 'Wednesday',
          meals: {
            breakfast: { title: 'High Protein Combo', items: ['Poha', 'Sprouts Salad', 'Boiled Eggs / Fruit', 'Tea'], timeSlot: '7:30 AM - 9:30 AM', price: 40 },
            lunch: { title: 'Royal Thali', items: ['Veg Biryani', 'Mirchi Ka Salan', 'Bhoondi Raita', 'Papad'], timeSlot: '12:30 PM - 2:30 PM', price: 65 },
            dinner: { title: 'North Special', items: ['Naan', 'Shahi Paneer', 'Dal Makhani', 'Rice', 'Rasgulla'], timeSlot: '7:30 PM - 9:30 PM', price: 65 }
          }
        },
        {
          dayOfWeek: 'Thursday',
          meals: {
            breakfast: { title: 'South Feast', items: ['Idli', 'Vada', 'Sambar', 'Filter Coffee'], timeSlot: '7:30 AM - 9:30 AM', price: 40 },
            lunch: { title: 'Homestyle Meal', items: ['Rice', 'Kadhi Pakora', 'Aloo Bhindi', 'Roti', 'Salad'], timeSlot: '12:30 PM - 2:30 PM', price: 60 },
            dinner: { title: 'Simple Feast', items: ['Chapati', 'Mix Veg', 'Dal Tadka', 'Rice', 'Moong Dal Halwa'], timeSlot: '7:30 PM - 9:30 PM', price: 60 }
          }
        },
        {
          dayOfWeek: 'Friday',
          meals: {
            breakfast: { title: 'Stuffed Paratha Delight', items: ['Paneer Paratha', 'Green Chutney', 'Tea'], timeSlot: '7:30 AM - 9:30 AM', price: 45 },
            lunch: { title: 'Punjabi Special', items: ['Rice', 'Chole Bhature', 'Boondi Raita', 'Onion Salad'], timeSlot: '12:30 PM - 2:30 PM', price: 65 },
            dinner: { title: 'Weekend Warmup', items: ['Roti', 'Mushroom Matar', 'Dal Fry', 'Veg Pulao', 'Ice Cream'], timeSlot: '7:30 PM - 9:30 PM', price: 65 }
          }
        },
        {
          dayOfWeek: 'Saturday',
          meals: {
            breakfast: { title: 'Crispy Puri Combo', items: ['Puri', 'Aloo Chana Curry', 'Sweet Suji Halwa', 'Tea'], timeSlot: '7:30 AM - 9:30 AM', price: 40 },
            lunch: { title: 'Maharashtrian Thali', items: ['Steamed Rice', 'Varan Bhaat', 'Batata Bhaji', 'Chapati', 'Solkadhi'], timeSlot: '12:30 PM - 2:30 PM', price: 60 },
            dinner: { title: 'Indo-Chinese Special', items: ['Veg Hakka Noodles', 'Fried Rice', 'Veg Manchurian', 'Soup'], timeSlot: '7:30 PM - 9:30 PM', price: 70 }
          }
        },
        {
          dayOfWeek: 'Sunday',
          meals: {
            breakfast: { title: 'Sunday Brunch Special', items: ['Uttapam', 'Sambar', 'Coconut & Tomato Chutney', 'Tea/Coffee'], timeSlot: '8:00 AM - 10:00 AM', price: 45 },
            lunch: { title: 'Grand Sunday Feast', items: ['Jeera Rice', 'Paneer Butter Masala', 'Butter Naan', 'Dal Makhani', 'Gulab Jamun'], timeSlot: '12:30 PM - 2:30 PM', price: 75 },
            dinner: { title: 'Light Sunday Night', items: ['Phulka Roti', 'Lauki Chana Dal', 'Rice', 'Curd'], timeSlot: '7:30 PM - 9:30 PM', price: 55 }
          }
        }
      ];

      await Menu.insertMany(defaultWeeklyMenu);
      console.log('Weekly menu seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding initial data:', error.message);
  }
};

module.exports = seedInitialData;
