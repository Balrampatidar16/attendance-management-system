import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, buildMeta } from '../utils/paginate.js';
import * as notificationService from '../services/notification.service.js';

export const getMyNotifications = asyncHandler(async (req, res) => {
  const { page, limit } = getPagination(req.query);
  const { items, total, unreadCount } = await notificationService.listNotifications(req.user._id, {
    page,
    limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, 'Notifications fetched', { items, unreadCount }, buildMeta(page, limit, total)));
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.user._id, req.params.id);
  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }
  return res.status(200).json(new ApiResponse(200, 'Notification marked as read', notification));
});

export const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  return res.status(200).json(new ApiResponse(200, 'All notifications marked as read'));
});
