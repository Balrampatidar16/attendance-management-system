import Overtime from '../models/Overtime.model.js';
import Attendance from '../models/Attendance.model.js';
import ApiError from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { canAccessUser } from './scope.service.js';
import { createNotification } from './notification.service.js';

export const requestOvertime = async (userId, { attendanceId, requestedHours, reason }) => {
  const attendance = await Attendance.findOne({ _id: attendanceId, user: userId });
  if (!attendance) {
    throw new ApiError(404, 'Attendance record not found');
  }

  if (!attendance.punchOut?.time) {
    throw new ApiError(400, 'Overtime can only be requested for a day with a completed punch-out');
  }

  if (attendance.totalWorkingHours <= env.STANDARD_SHIFT_HOURS) {
    throw new ApiError(
      400,
      `Overtime can only be requested when total working hours exceed ${env.STANDARD_SHIFT_HOURS}`
    );
  }

  const existing = await Overtime.findOne({ attendance: attendanceId, status: { $ne: 'rejected' } });
  if (existing) {
    throw new ApiError(409, 'An overtime request already exists for this attendance record');
  }

  const overtime = await Overtime.create({
    user: userId,
    attendance: attendanceId,
    date: attendance.date,
    requestedHours,
    reason,
  });

  attendance.overtime = overtime._id;
  await attendance.save();

  return overtime;
};

export const reviewOvertime = async (reviewer, overtimeId, { status, reviewComment }) => {
  const overtime = await Overtime.findById(overtimeId);
  if (!overtime) {
    throw new ApiError(404, 'Overtime request not found');
  }

  if (overtime.status !== 'pending') {
    throw new ApiError(409, `This request has already been ${overtime.status}`);
  }

  const allowed = await canAccessUser(reviewer, overtime.user);
  if (!allowed) {
    throw new ApiError(403, 'You cannot review this overtime request');
  }

  overtime.status = status;
  overtime.reviewedBy = reviewer._id;
  overtime.reviewedAt = new Date();
  overtime.reviewComment = reviewComment || '';
  await overtime.save();

  await createNotification({
    user: overtime.user,
    type: 'overtime_reviewed',
    title: `Overtime request ${status}`,
    message: `Your overtime request for ${overtime.date.toISOString().slice(0, 10)} was ${status}.`,
    link: '/employee/overtime',
  });

  return overtime;
};
