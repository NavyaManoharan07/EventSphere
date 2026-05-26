const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const crypto = require('crypto');
const PasswordReset = require('../models/PasswordReset');
const { localUsers, storeLocalUser } = require('../middleware/authMiddleware');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const userPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  profilePhoto: user.profilePhoto || '',
  city: user.city || '',
  bio: user.bio || '',
  interests: user.interests || [],
  goals: user.goals || [],
  eventPreference: user.eventPreference || '',
  networkingEnabled: user.networkingEnabled ?? true,
  profileVisible: user.profileVisible ?? true,
  shareEventAttendance: user.shareEventAttendance ?? true,
  onboardingCompleted: Boolean(user.onboardingCompleted),
});

const cleanStringArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, 20);
};

const findLocalUserById = (id) => Object.values(localUsers).find((user) => user._id === id);

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const dbConnected = mongoose.connection.readyState === 1;

    if (!dbConnected) {
      if (localUsers[email]) {
        return res.status(400).json({ message: 'Email already registered (offline)' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const id = `local-${Date.now()}`;

      const userData = {
        _id: id,
        name,
        email,
        passwordHash,
        onboardingCompleted: false,
        city: '',
        bio: '',
        interests: [],
        goals: [],
        eventPreference: '',
        networkingEnabled: true,
        profileVisible: true,
        shareEventAttendance: true,
        profilePhoto: '',
      };

      storeLocalUser(userData);

      return res.status(201).json({
        ...userPayload(userData),
        token: generateToken(id),
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      return res.status(201).json({
        ...userPayload(user),
        token: generateToken(user._id),
      });
    }

    return res.status(400).json({ message: 'Invalid user data' });
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const dbConnected = mongoose.connection.readyState === 1;

    if (!dbConnected) {
      const local = localUsers[email];
      if (!local) {
        return res.status(401).json({ message: 'Invalid email or password (offline)' });
      }

      const match = await bcrypt.compare(password, local.passwordHash);
      if (!match) {
        return res.status(401).json({ message: 'Invalid email or password (offline)' });
      }

      return res.status(200).json({
        ...userPayload(local),
        token: generateToken(local._id),
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.status(200).json({
      ...userPayload(user),
      token: generateToken(user._id),
    });
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
    const dbConnected = mongoose.connection.readyState === 1;
    let user;

    if (dbConnected) {
      user = await User.findById(req.user._id || req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    } else {
      user = req.user;
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    }

    res.status(200).json(userPayload(user));
  } catch (error) {
    console.error('Get user error:', error);
    next(error);
  }
};

// @desc    Get public profile by user id
// @route   GET /api/auth/user/:userId
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    const dbConnected = mongoose.connection.readyState === 1;
    let user;

    if (dbConnected) {
      user = await User.findById(req.params.userId).select('-password').lean();
    } else {
      user = findLocalUserById(req.params.userId);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      id: user._id,
      name: user.name,
      profilePhoto: user.profilePhoto || '',
      city: user.city || '',
      bio: user.bio || '',
      interests: user.interests || [],
      goals: user.goals || [],
      eventPreference: user.eventPreference || '',
      networkingEnabled: user.networkingEnabled ?? true,
      profileVisible: user.profileVisible ?? true,
      shareEventAttendance: user.shareEventAttendance ?? true,
      onboardingCompleted: Boolean(user.onboardingCompleted),
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    next(error);
  }
};

// @desc    Update user profile and AI preferences
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const dbConnected = mongoose.connection.readyState === 1;
    const allowedPreference = ['Career', 'Entertainment', 'Both', ''];
    const updates = {
      name: req.body.name?.trim(),
      city: req.body.city?.trim(),
      bio: req.body.bio?.trim(),
      profilePhoto: req.body.profilePhoto?.trim(),
      interests: cleanStringArray(req.body.interests),
      goals: cleanStringArray(req.body.goals),
      eventPreference: allowedPreference.includes(req.body.eventPreference) ? req.body.eventPreference : undefined,
      networkingEnabled: typeof req.body.networkingEnabled === 'boolean' ? req.body.networkingEnabled : undefined,
      profileVisible: typeof req.body.profileVisible === 'boolean' ? req.body.profileVisible : undefined,
      shareEventAttendance: typeof req.body.shareEventAttendance === 'boolean' ? req.body.shareEventAttendance : undefined,
      onboardingCompleted: typeof req.body.onboardingCompleted === 'boolean' ? req.body.onboardingCompleted : undefined,
    };

    Object.keys(updates).forEach((key) => {
      if (updates[key] === undefined) delete updates[key];
    });

    let user;

    if (dbConnected) {
      user = await User.findByIdAndUpdate(req.user._id || req.user.id, updates, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    } else {
      user = req.user;
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      Object.assign(user, updates);
      storeLocalUser(user);
    }

    return res.status(200).json(userPayload(user));
  } catch (error) {
    console.error('Update profile error:', error);
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: 'If the email exists, reset instructions have been generated.' });
    }

    const token = crypto.randomBytes(24).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await PasswordReset.create({
      user: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/forgot-password?token=${token}`;

    return res.status(200).json({
      message: 'Password reset instructions generated.',
      resetUrl,
      devToken: process.env.NODE_ENV === 'production' ? undefined : token,
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const token = String(req.body.token || '').trim();
    const password = String(req.body.password || '');

    if (!token || password.length < 6) {
      return res.status(400).json({ message: 'Valid token and password of at least 6 characters are required' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const reset = await PasswordReset.findOne({
      tokenHash,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!reset) {
      return res.status(400).json({ message: 'Reset token is invalid or expired' });
    }

    const user = await User.findById(reset.user).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = password;
    await user.save();
    reset.used = true;
    await reset.save();

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

exports.startOAuth = async (req, res) => {
  const provider = req.params.provider;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (provider === 'google') {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REDIRECT_URI) {
      return res.status(200).json({
        configured: false,
        message: 'Google OAuth is ready, but GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI are not configured.',
      });
    }

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      prompt: 'select_account',
    });

    return res.status(200).json({
      configured: true,
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    });
  }

  if (provider === 'linkedin') {
    if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_REDIRECT_URI) {
      return res.status(200).json({
        configured: false,
        message: 'LinkedIn OAuth is ready, but LINKEDIN_CLIENT_ID and LINKEDIN_REDIRECT_URI are not configured.',
      });
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.LINKEDIN_CLIENT_ID,
      redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
      scope: 'openid profile email',
    });

    return res.status(200).json({
      configured: true,
      url: `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`,
    });
  }

  return res.status(400).json({ message: 'Unsupported OAuth provider', frontendUrl });
};
