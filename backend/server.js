const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
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

// Base API Route
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

// Resource API Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/menu', require('./routes/menuRoutes'));
app.use('/api/v1/meals', require('./routes/mealRoutes'));
app.use('/api/v1/attendance', require('./routes/attendanceRoutes'));
app.use('/api/v1/feedback', require('./routes/feedbackRoutes'));
app.use('/api/v1/bills', require('./routes/billRoutes'));
app.use('/api/v1/analytics', require('./routes/analyticsRoutes'));

// Determine Frontend Dist Path
const possibleDistPaths = [
  path.join(__dirname, '../frontend/dist'),
  path.join(__dirname, './frontend/dist'),
  path.join(__dirname, './public')
];

let distPath = possibleDistPaths.find(p => fs.existsSync(path.join(p, 'index.html')));

if (distPath) {
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // SPA Fallback Handler for non-API routes when frontend build is hosted separately
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Smart Mess Management System</title>
          <script>
            window.location.href = "/";
          </script>
        </head>
        <body>
          <p>Redirecting to Smart Mess Management System...</p>
        </body>
      </html>
    `);
  });
}

// Error Handlers for unhandled API requests
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Promise Rejection: ${err.message}`);
});
