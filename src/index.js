const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const dashboardRoutes = require('./services/dashboard/routes');
const calculatorRoutes = require('./services/calculator/routes');

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow requests from any origin during development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cache-Control'],
  credentials: true,
  exposedHeaders: ['Authorization']
}));

// Add OPTIONS handling for preflight requests
app.options('*', cors());
app.use(express.json());
app.use(morgan('dev'));

// Log all incoming requests and their headers for debugging
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url);
  console.log('Headers:', req.headers);
  next();
});

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/calculator', calculatorRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Windsurf Backend API',
    services: [
      {
        name: 'Dashboard Service',
        endpoint: '/api/dashboard'
      },
      {
        name: 'Calculator Service',
        endpoint: '/api/calculator'
      }
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start server
const PORT = 3001; // Explicitly set to 3001 to avoid conflicts
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Dashboard service available at http://localhost:${PORT}/api/dashboard`);
  console.log(`Calculator service available at http://localhost:${PORT}/api/calculator`);
});

module.exports = app;
