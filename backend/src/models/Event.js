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
