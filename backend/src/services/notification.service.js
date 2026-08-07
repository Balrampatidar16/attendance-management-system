import Notification from '../models/Notification.model.js';
import { getIO } from '../config/socket.js';

export const createNotification = async ({ user, type, title, message, link }) => {
  const notification = await Notification.create({ user, type, title, message, link: link ?? null });

  const io = getIO();
  if (io) {
    io.to(String(user)).emit('notification:new', notification);
  }

  return notification;
};

export const listNotifications = async (userId, { page, limit }) => {
  const filter = { user: userId };
  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);
  return { items, total, unreadCount };
};

export const markAsRead = async (userId, notificationId) => {
  return Notification.findOneAndUpdate({ _id: notificationId, user: userId }, { isRead: true }, { new: true });
};

export const markAllAsRead = async (userId) => {
  await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
};
