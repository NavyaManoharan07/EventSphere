const mongoose = require('mongoose');

const teamInvitationSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  },
  message: {
    type: String,
    default: '',
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

teamInvitationSchema.index({ sender: 1, receiver: 1, community: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('TeamInvitation', teamInvitationSchema);
