const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    maxlength: 1200,
  },
  eventTitle: {
    type: String,
    default: '',
    trim: true,
  },
  visibility: {
    type: String,
    enum: ['connections', 'public'],
    default: 'connections',
  },
  likes: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

postSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
