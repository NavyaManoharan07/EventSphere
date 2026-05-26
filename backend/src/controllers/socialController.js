const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Connection = require('../models/Connection');

const serializeUser = (user = {}) => ({
  id: user._id,
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

const serializePost = (post = {}) => ({
  id: post._id,
  content: post.content,
  eventTitle: post.eventTitle || '',
  visibility: post.visibility || 'connections',
  likes: post.likes || 0,
  createdAt: post.createdAt,
  author: post.author && typeof post.author === 'object'
    ? {
        id: post.author._id,
        name: post.author.name,
        profilePhoto: post.author.profilePhoto || '',
        city: post.author.city || '',
      }
    : post.author,
});

const getConnectionBetween = async (userA, userB) => {
  if (!mongoose.Types.ObjectId.isValid(userA) || !mongoose.Types.ObjectId.isValid(userB)) return null;

  return Connection.findOne({
    $or: [
      { sender: userA, receiver: userB },
      { sender: userB, receiver: userA },
    ],
  }).lean();
};

exports.connectWithUser = async (req, res, next) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const targetUserId = req.params.userId || req.body.receiverId;

    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: 'Valid user id is required' });
    }

    if (targetUserId.toString() === currentUserId.toString()) {
      return res.status(400).json({ message: 'You cannot connect with yourself' });
    }

    const target = await User.findById(targetUserId).select('name');
    if (!target) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existing = await Connection.findOne({
      $or: [
        { sender: currentUserId, receiver: targetUserId },
        { sender: targetUserId, receiver: currentUserId },
      ],
    });

    if (existing) {
      existing.status = 'accepted';
      existing.following = true;
      if (req.body.matchScore != null) existing.matchScore = Number(req.body.matchScore) || existing.matchScore;
      if (req.body.communityId && mongoose.Types.ObjectId.isValid(req.body.communityId)) {
        existing.community = req.body.communityId;
      }
      await existing.save();
      return res.status(200).json({ connection: existing, connected: true, following: true });
    }

    const connection = await Connection.create({
      sender: currentUserId,
      receiver: targetUserId,
      community: req.body.communityId && mongoose.Types.ObjectId.isValid(req.body.communityId) ? req.body.communityId : undefined,
      matchScore: Number(req.body.matchScore) || 0,
      status: 'accepted',
      following: true,
    });

    return res.status(201).json({ connection, connected: true, following: true });
  } catch (error) {
    next(error);
  }
};

exports.toggleFollowUser = async (req, res, next) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const targetUserId = req.params.userId;

    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: 'Valid user id is required' });
    }

    let connection = await Connection.findOne({
      $or: [
        { sender: currentUserId, receiver: targetUserId },
        { sender: targetUserId, receiver: currentUserId },
      ],
    });

    if (!connection) {
      connection = await Connection.create({
        sender: currentUserId,
        receiver: targetUserId,
        status: 'accepted',
        following: true,
      });
    } else {
      connection.following = !connection.following;
      connection.status = 'accepted';
      await connection.save();
    }

    return res.status(200).json({
      connection,
      connected: connection.status === 'accepted',
      following: connection.following,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSocialProfile = async (req, res, next) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Valid user id is required' });
    }

    const user = await User.findById(userId).select('-password').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const connection = await getConnectionBetween(currentUserId, userId);
    const isOwnProfile = currentUserId.toString() === userId.toString();
    const canSeeConnectionPosts = isOwnProfile || connection?.status === 'accepted';
    const visibility = canSeeConnectionPosts ? ['public', 'connections'] : ['public'];

    const posts = await Post.find({ author: userId, visibility: { $in: visibility } })
      .populate('author', 'name profilePhoto city')
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return res.status(200).json({
      profile: serializeUser(user),
      connection: {
        connected: connection?.status === 'accepted' || false,
        following: connection?.following || false,
        status: connection?.status || 'none',
        matchScore: connection?.matchScore || 0,
      },
      posts: posts.map(serializePost),
    });
  } catch (error) {
    next(error);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const content = String(req.body.content || '').trim();
    if (!content) {
      return res.status(400).json({ message: 'Write something before posting' });
    }

    const post = await Post.create({
      author: req.user.id || req.user._id,
      content,
      eventTitle: String(req.body.eventTitle || '').trim(),
      visibility: req.body.visibility === 'public' ? 'public' : 'connections',
    });

    const populated = await Post.findById(post._id)
      .populate('author', 'name profilePhoto city')
      .lean();

    return res.status(201).json(serializePost(populated));
  } catch (error) {
    next(error);
  }
};

exports.getFeed = async (req, res, next) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const connections = await Connection.find({
      status: 'accepted',
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    }).lean();

    const connectedUserIds = connections.map((connection) => (
      connection.sender.toString() === currentUserId.toString()
        ? connection.receiver
        : connection.sender
    ));

    const posts = await Post.find({
      author: { $in: [currentUserId, ...connectedUserIds] },
      visibility: { $in: ['connections', 'public'] },
    })
      .populate('author', 'name profilePhoto city')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json(posts.map(serializePost));
  } catch (error) {
    next(error);
  }
};
