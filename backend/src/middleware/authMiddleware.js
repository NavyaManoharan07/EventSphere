const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

// In-memory fallback store for development when DB is unreachable
const localUsers = {}; // { id: { name, email, _id, ...otherFields } }

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const dbConnected = mongoose.connection.readyState === 1;

      // Try to get user from DB first, then fall back to in-memory
      let user;
      if (dbConnected) {
        user = await User.findById(decoded.id).select('-password');
      } else {
        // Use in-memory fallback
        user = localUsers[decoded.id];
      }

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(401).json({ message: 'Not authorized' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Store user for offline mode (called from authController after registration/login)
const storeLocalUser = (user) => {
  localUsers[user._id] = user;
};

module.exports = { protect, storeLocalUser, localUsers };
