const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Database status middleware - check if DB is connected before running auth routes
app.use('/api/auth', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      message: 'Database connection is not available. Please check your MongoDB connection settings.' 
    });
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'API is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({ 
      message: Object.values(error.errors).map(e => e.message).join(', ') 
    });
  }
  
  if (error.code === 11000) {
    return res.status(400).json({ 
      message: 'Duplicate field value entered' 
    });
  }
  
  res.status(error.statusCode || 500).json({ 
    message: error.message || 'Internal Server Error' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
