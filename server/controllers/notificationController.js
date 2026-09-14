import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import sendResponse from '../utils/sendResponse.js';
import { Notification } from '../models/index.js';

/**
 * GET /api/v1/notifications
 * Returns the current user's notifications, newest first.
 * Supports: isRead filter, pagination.
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const { isRead, page = 1, limit = 20 } = req.query;
  const filter = { recipient: req.user._id };
  if (isRead !== undefined) filter.isRead = isRead === 'true';

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

  const notifications = await Notification.find(filter)
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  sendResponse(res, 200, notifications, 'Notifications retrieved', {
    total, unreadCount, page: Number(page), totalPages: Math.ceil(total / Number(limit)),
  });
});

/**
 * PATCH /api/v1/notifications/:id/read
 * Marks a single notification as read.
 */
export const markRead = asyncHandler(async (req, res, next) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!notif) return next(new AppError('Notification not found.', 404));
  sendResponse(res, 200, notif, 'Notification marked as read');
});

/**
 * PATCH /api/v1/notifications/read-all
 * Marks ALL notifications for the current user as read.
 */
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );
  sendResponse(res, 200, null, 'All notifications marked as read');
});

/**
 * DELETE /api/v1/notifications/:id
 * Deletes a specific notification (user's own only).
 */
export const deleteNotification = asyncHandler(async (req, res, next) => {
  const notif = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id,
  });
  if (!notif) return next(new AppError('Notification not found.', 404));
  sendResponse(res, 200, null, 'Notification deleted');
});
