const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
  },
  bannerImage: {
    type: String,
    default: '',
    trim: true,
  },
  category: {
    type: String,
    default: 'General',
    trim: true,
  },
  eventType: {
    type: String,
    default: 'In-Person',
    trim: true,
  },
  venue: {
    type: String,
    required: [true, 'Event venue is required'],
    trim: true,
  },
  startDate: {
    type: Date,
    required: [true, 'Event start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'Event end date is required'],
  },
  capacity: {
    type: Number,
    required: [true, 'Event capacity is required'],
    min: [1, 'Event capacity must be at least 1'],
  },
  price: {
    type: Number,
    required: [true, 'Event ticket price is required'],
    min: [0, 'Event price cannot be negative'],
  },
  tags: {
    type: [String],
    default: [],
  },
  ticketTiers: {
    type: [{
      name: { type: String, required: true, trim: true },
      price: { type: Number, required: true, min: 0 },
      capacity: { type: Number, required: true, min: 1 },
      salesStart: { type: Date },
      salesEnd: { type: Date },
      description: { type: String, default: '' },
    }],
    default: [],
  },
  discountCodes: {
    type: [{
      code: { type: String, required: true, trim: true },
      percentOff: { type: Number, required: true, min: 1, max: 100 },
      expiresAt: { type: Date },
      maxUses: { type: Number, default: 0 },
      usedCount: { type: Number, default: 0 },
    }],
    default: [],
  },
  agenda: {
    type: [{
      time: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String, default: '' },
      type: { type: String, default: 'session' },
    }],
    default: [],
  },
  speakers: {
    type: [{
      name: { type: String, required: true },
      role: { type: String, default: '' },
      bio: { type: String, default: '' },
      photo: { type: String, default: '' },
    }],
    default: [],
  },
  faqs: {
    type: [{
      question: { type: String, required: true },
      answer: { type: String, required: true },
    }],
    default: [],
  },
  mapUrl: {
    type: String,
    default: '',
  },
  reviews: {
    type: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      rating: { type: Number, min: 1, max: 5, required: true },
      comment: { type: String, default: '', trim: true },
      createdAt: { type: Date, default: Date.now },
    }],
    default: [],
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  networkingEnabled: {
    type: Boolean,
    default: false,
  },
  communityEnabled: {
    type: Boolean,
    default: false,
  },
  aiRecommendationsEnabled: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model('Event', eventSchema);
