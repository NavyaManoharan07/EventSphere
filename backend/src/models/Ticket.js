const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event reference is required'],
  },
  attendee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Attendee reference is required'],
  },
  ticketCode: {
    type: String,
    required: true,
    unique: true,
  },
  qrPayload: {
    type: String,
    required: true,
  },
  ticketType: {
    type: String,
    default: 'General',
    trim: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['booked', 'checked-in'],
    default: 'booked',
  },
  bookedAt: {
    type: Date,
    default: Date.now,
  },
  checkedInAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Ticket', ticketSchema);
