const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// In-memory fallback store for development when DB is unreachable
const localUsers = {}; // { email: { name, email, passwordHash, _id } }

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
exports.registerUser = async (req, res, next) => {
  try {
    console.log('DB readyState at registerUser:', mongoose.connection.readyState);
    console.log('DB host:', mongoose.connection.host);
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const dbConnected = mongoose.connection.readyState === 1;

    if (!dbConnected) {
      // Use in-memory fallback
      if (localUsers[email]) {
        return res.status(400).json({ message: 'Email already registered (offline)' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const id = `local-${Date.now()}`;
      localUsers[email] = { name, email, passwordHash, _id: id };
      return res.status(201).json({ _id: id, name, email, token: generateToken(id) });
    }

    // Check if user exists in DB
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({ name, email, password });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    next(error);
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {
  try {
    console.log('DB readyState at loginUser:', mongoose.connection.readyState);
    console.log('DB host:', mongoose.connection.host);
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const dbConnected = mongoose.connection.readyState === 1;

    if (!dbConnected) {
      // Offline/in-memory authentication
      const local = localUsers[email];
      if (!local) {
        return res.status(401).json({ message: 'Invalid email or password (offline)' });
      }

      const match = await bcrypt.compare(password, local.passwordHash);
      if (!match) {
        return res.status(401).json({ message: 'Invalid email or password (offline)' });
      }

      return res.status(200).json({ _id: local._id, name: local.name, email: local.email, token: generateToken(local._id) });
    }

    // Check for user email in DB
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.status(200).json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    next(error);
  }
};
