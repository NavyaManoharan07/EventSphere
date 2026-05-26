const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  profilePhoto: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: '',
    trim: true,
  },
  bio: {
    type: String,
    default: '',
    trim: true,
  },
  interests: {
    type: [String],
    default: [],
  },
  goals: {
    type: [String],
    default: [],
  },
  eventPreference: {
    type: String,
    enum: ['Career', 'Entertainment', 'Both', ''],
    default: '',
  },
  networkingEnabled: {
    type: Boolean,
    default: true,
  },
  profileVisible: {
    type: Boolean,
    default: true,
  },
  shareEventAttendance: {
    type: Boolean,
    default: true,
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  behavior: {
    viewedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    savedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    searchHistory: {
      type: [String],
      default: [],
    },
    joinedCommunities: {
      type: [String],
      default: [],
    },
    reviewsGiven: {
      type: Number,
      default: 0,
    },
    connectionsMade: {
      type: Number,
      default: 0,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function () {
  // Only hash if password is new or modified
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

module.exports = mongoose.model('User', userSchema);
