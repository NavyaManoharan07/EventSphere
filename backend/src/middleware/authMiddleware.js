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
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const dbConnected = mongoose.connection.readyState === 1;
      let user;

      if (dbConnected) {
        user = await User.findById(decoded.id).select('-password');
      } else {
        user = localUsers[decoded.id];
      }

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      return next();
    } catch (error) {
      // If a local token was provided and we have that mapping, accept it
      if (token && localUsers[token]) {
        req.user = localUsers[token];
        return next();
      }

      // Allow frontend to send a base64-encoded local user in `X-Local-User` header
      const encodedLocal = req.headers['x-local-user'] || req.headers['X-Local-User'];
      if (encodedLocal) {
        try {
          const raw = Buffer.from(encodedLocal, 'base64').toString('utf8');
          const parsed = JSON.parse(raw);
          // ensure token is present on parsed user
          if (token && !parsed.token) parsed.token = token;
          // persist to in-memory store for future requests
          if (parsed) storeLocalUser(parsed);
          req.user = parsed;
          return next();
        } catch (e) {
          // fall through to error
        }
      }

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
  if (user.email) {
    localUsers[user.email] = user;
  }
  if (user.token) {
    localUsers[user.token] = user;
  }
};

module.exports = { protect, storeLocalUser, localUsers };
