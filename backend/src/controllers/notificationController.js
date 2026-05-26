const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json(notifications.map((item) => ({
      id: item._id,
      type: item.type,
      title: item.title,
      message: item.message,
      link: item.link,
      unread: !item.read,
      createdAt: item.createdAt,
    })));
  } catch (error) {
    next(error);
  }
};

exports.markNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { $set: { read: true } });
    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
