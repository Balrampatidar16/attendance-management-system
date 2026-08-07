import Attendance from '../models/Attendance.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import * as attendanceService from '../services/attendance.service.js';
import { getScopedUserIds, canAccessUser } from '../services/scope.service.js';
import { createNotification } from '../services/notification.service.js';
import { getPagination, buildMeta } from '../utils/paginate.js';
import { parseDateOnly, endOfDayUTC } from '../utils/dateHelper.js';

const buildDateRangeFilter = (query) => {
  const filter = {};
  const start = parseDateOnly(query.startDate);
  const end = endOfDayUTC(query.endDate);
  if (start || end) {
    filter.date = {};
    if (start) filter.date.$gte = start;
    if (end) filter.date.$lte = end;
  }
  return filter;
};

export const punchIn = asyncHandler(async (req, res) => {
  const record = await attendanceService.punchIn(req.user._id, req.body);
  return res.status(201).json(new ApiResponse(201, 'Punched in successfully', record));
});

export const punchOut = asyncHandler(async (req, res) => {
  const record = await attendanceService.punchOut(req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, 'Punched out successfully', record));
});

export const getToday = asyncHandler(async (req, res) => {
  const record = await attendanceService.getTodayAttendance(req.user._id);
  return res.status(200).json(new ApiResponse(200, "Today's attendance", record));
});

export const getMy = asyncHandler(async (req, res) => {
  const { workStatus } = req.query;
  const filter = {
    user: req.user._id,
    ...buildDateRangeFilter(req.query),
    ...(workStatus && { workStatus }),
  };

  const { page, limit, skip } = getPagination(req.query);
  const [records, total] = await Promise.all([
    Attendance.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
    Attendance.countDocuments(filter),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Attendance history', records, buildMeta(page, limit, total)));
});

export const getTeam = asyncHandler(async (req, res) => {
  const scopedIds = await getScopedUserIds(req.user);
  const { workStatus, verificationStatus } = req.query;
  const filter = {
    ...(scopedIds && { user: { $in: scopedIds } }),
    ...buildDateRangeFilter(req.query),
    ...(workStatus && { workStatus }),
    ...(verificationStatus && { verificationStatus }),
  };

  const { page, limit, skip } = getPagination(req.query);
  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .populate('user', 'name email employeeId department')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Attendance.countDocuments(filter),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Team attendance', records, buildMeta(page, limit, total)));
});

export const getAll = asyncHandler(async (req, res) => {
  const { workStatus, verificationStatus, userId } = req.query;
  const filter = {
    ...(userId && { user: userId }),
    ...buildDateRangeFilter(req.query),
    ...(workStatus && { workStatus }),
    ...(verificationStatus && { verificationStatus }),
  };

  const { page, limit, skip } = getPagination(req.query);
  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .populate('user', 'name email employeeId department')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Attendance.countDocuments(filter),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, 'All attendance', records, buildMeta(page, limit, total)));
});

export const getById = asyncHandler(async (req, res) => {
  const record = await Attendance.findById(req.params.id).populate(
    'user',
    'name email employeeId department manager'
  );
  if (!record) {
    throw new ApiError(404, 'Attendance record not found');
  }

  const targetUserId = record.user._id || record.user;
  const allowed = await canAccessUser(req.user, targetUserId);
  if (!allowed) {
    throw new ApiError(403, 'You cannot access this attendance record');
  }

  return res.status(200).json(new ApiResponse(200, 'Attendance record', record));
});

export const verify = asyncHandler(async (req, res) => {
  const record = await Attendance.findById(req.params.id);
  if (!record) {
    throw new ApiError(404, 'Attendance record not found');
  }

  const allowed = await canAccessUser(req.user, record.user);
  if (!allowed) {
    throw new ApiError(403, 'You cannot verify this attendance record');
  }

  record.verificationStatus = req.body.verificationStatus;
  if (req.body.remarks !== undefined) {
    record.remarks = req.body.remarks;
  }
  record.verifiedBy = req.user._id;
  record.verifiedAt = new Date();
  await record.save();

  await createNotification({
    user: record.user,
    type: 'attendance_verified',
    title: `Attendance marked ${record.verificationStatus}`,
    message: `Your attendance for ${record.date.toISOString().slice(0, 10)} was marked ${record.verificationStatus}.`,
    link: '/employee/attendance',
  });

  return res.status(200).json(new ApiResponse(200, 'Attendance verification updated', record));
});

export const statsSummary = asyncHandler(async (req, res) => {
  const scopedIds = await getScopedUserIds(req.user);
  const baseFilter = scopedIds ? { user: { $in: scopedIds } } : {};

  const [result] = await Attendance.aggregate([
    { $match: baseFilter },
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$workStatus', 'completed'] }, 1, 0] } },
        incomplete: { $sum: { $cond: [{ $eq: ['$workStatus', 'incomplete'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$workStatus', 'in-progress'] }, 1, 0] } },
        pendingVerification: { $sum: { $cond: [{ $eq: ['$verificationStatus', 'pending'] }, 1, 0] } },
        valid: { $sum: { $cond: [{ $eq: ['$verificationStatus', 'valid'] }, 1, 0] } },
        invalid: { $sum: { $cond: [{ $eq: ['$verificationStatus', 'invalid'] }, 1, 0] } },
        avgWorkingHours: { $avg: '$totalWorkingHours' },
      },
    },
  ]);

  const summary = result
    ? {
        totalRecords: result.totalRecords,
        completed: result.completed,
        incomplete: result.incomplete,
        inProgress: result.inProgress,
        pendingVerification: result.pendingVerification,
        valid: result.valid,
        invalid: result.invalid,
        avgWorkingHours: Math.round((result.avgWorkingHours || 0) * 100) / 100,
      }
    : {
        totalRecords: 0,
        completed: 0,
        incomplete: 0,
        inProgress: 0,
        pendingVerification: 0,
        valid: 0,
        invalid: 0,
        avgWorkingHours: 0,
      };

  return res.status(200).json(new ApiResponse(200, 'Attendance summary', summary));
});
