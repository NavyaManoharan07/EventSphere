const Message = require('../models/Message');
const User = require('../models/User');
const Connection = require('../models/Connection');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Please provide receiver and content' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages with a specific user
// @route   GET /api/messages/:userId
// @access  Private
exports.getMessagesWithUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { sender: userId, receiver: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all conversations
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find unique users that the current user has chatted with
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: currentUserId }, { receiver: currentUserId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', currentUserId] },
              '$receiver',
              '$sender',
            ],
          },
          lastMessage: { $first: '$content' },
          lastMessageTime: { $first: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', currentUserId] },
                    { $eq: ['$read', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $unwind: '$userInfo',
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          lastMessageTime: 1,
          unreadCount: 1,
          name: '$userInfo.name',
          profilePhoto: '$userInfo.profilePhoto',
        },
      },
    ]);

    const connectedPeople = await Connection.find({
      status: 'accepted',
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    })
      .populate('sender', 'name profilePhoto')
      .populate('receiver', 'name profilePhoto')
      .lean();

    const conversationMap = new Map(conversations.map((conversation) => [
      conversation._id.toString(),
      conversation,
    ]));

    connectedPeople.forEach((connection) => {
      const person = connection.sender?._id?.toString() === currentUserId.toString()
        ? connection.receiver
        : connection.sender;

      if (!person?._id) return;
      const personId = person._id.toString();

      if (!conversationMap.has(personId)) {
        conversationMap.set(personId, {
          _id: person._id,
          lastMessage: 'Connected on EventSphere',
          lastMessageTime: connection.updatedAt || connection.createdAt,
          unreadCount: 0,
          name: person.name,
          profilePhoto: person.profilePhoto,
        });
      }
    });

    const payload = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
