const mongoose = require('mongoose');

const communityMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['member', 'organizer', 'speaker', 'admin'],
    default: 'member',
  },
  xpContribution: {
    type: Number,
    default: 20,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  fileUrl: {
    type: String,
    required: true,
    trim: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: true });

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    default: 'General',
    trim: true,
  },
  type: {
    type: String,
    enum: ['event', 'interest', 'career', 'entertainment', 'hackathon'],
    default: 'interest',
  },
  bannerImage: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: {
    type: [communityMemberSchema],
    default: [],
  },
  resources: {
    type: [resourceSchema],
    default: [],
  },
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  }],
  rules: {
    type: [String],
    default: [
      'Share useful knowledge and opportunities.',
      'Respect members and keep discussions constructive.',
      'No spam or irrelevant promotion.',
    ],
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Community', communitySchema);
