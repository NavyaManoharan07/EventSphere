const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

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

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    HEAD
    // Check if user exists

    const dbConnected = mongoose.connection.readyState === 1;

    if (!dbConnected) {
      // Use in-memory fallback
      if (localUsers[email]) {
        return res.status(400).json({ message: 'Email already registered (offline)' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const id = `local-${Date.now()}`;
      const userData = { 
        name, 
        email, 
        passwordHash, 
        _id: id, 
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
      localUsers[email] = userData;
      return res.status(201).json({ 
        ...userPayload(userData), 
        token: generateToken(id) 
      });
    }

    // Check if user exists in DB
     main
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user
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

    HEAD
    // Check for user email

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

      return res.status(200).json({ _id: local._id, name: local.name, email: local.email, onboardingCompleted: Boolean(local.onboardingCompleted), token: generateToken(local._id) });
    }

    // Check for user email in DB
     main
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

       HEAD
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });

    return res.status(200).json({ ...userPayload(user), token: generateToken(user._id) });
    main
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
      // Use in-memory fallback
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
      // Use in-memory fallback
      user = req.user;
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update local user data
      Object.assign(user, updates);
    }

    return res.status(200).json(userPayload(user));
  } catch (error) {
    console.error('Update profile error:', error);
    next(error);
  }
};
