const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedInitialData = require('./utils/seedData');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();

// Database Connection
connectDB().then(() => {
  seedInitialData();
});

// Middleware
app.use(cors());
app.use(express.json());

// Base Route
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Mess Management System API v1 is active',
    data: {
      timestamp: new Date().toISOString(),
      developer: 'Biswa Ananta'
    }
  });
});

// Resource Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/menu', require('./routes/menuRoutes'));
app.use('/api/v1/meals', require('./routes/mealRoutes'));
app.use('/api/v1/attendance', require('./routes/attendanceRoutes'));
app.use('/api/v1/feedback', require('./routes/feedbackRoutes'));
app.use('/api/v1/bills', require('./routes/billRoutes'));
app.use('/api/v1/analytics', require('./routes/analyticsRoutes'));

// Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Promise Rejection: ${err.message}`);
});
