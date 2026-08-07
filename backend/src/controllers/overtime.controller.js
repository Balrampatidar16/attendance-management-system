import Overtime from '../models/Overtime.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import * as overtimeService from '../services/overtime.service.js';
import { getScopedUserIds } from '../services/scope.service.js';
import { getPagination, buildMeta } from '../utils/paginate.js';

export const create = asyncHandler(async (req, res) => {
  const overtime = await overtimeService.requestOvertime(req.user._id, req.body);
  return res.status(201).json(new ApiResponse(201, 'Overtime request submitted', overtime));
});

export const getMy = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { user: req.user._id, ...(status && { status }) };

  const { page, limit, skip } = getPagination(req.query);
  const [records, total] = await Promise.all([
    Overtime.find(filter)
      .populate('attendance', 'date totalWorkingHours')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Overtime.countDocuments(filter),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, 'My overtime requests', records, buildMeta(page, limit, total)));
});

export const getPending = asyncHandler(async (req, res) => {
  const scopedIds = await getScopedUserIds(req.user);
  const filter = { status: 'pending', ...(scopedIds && { user: { $in: scopedIds } }) };

  const { page, limit, skip } = getPagination(req.query);
  const [records, total] = await Promise.all([
    Overtime.find(filter)
      .populate('user', 'name email employeeId department')
      .populate('attendance', 'date totalWorkingHours')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Overtime.countDocuments(filter),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Pending overtime requests', records, buildMeta(page, limit, total)));
});

export const getAll = asyncHandler(async (req, res) => {
  const { status, userId } = req.query;
  const filter = { ...(status && { status }), ...(userId && { user: userId }) };

  const { page, limit, skip } = getPagination(req.query);
  const [records, total] = await Promise.all([
    Overtime.find(filter)
      .populate('user', 'name email employeeId department')
      .populate('attendance', 'date totalWorkingHours')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Overtime.countDocuments(filter),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, 'All overtime requests', records, buildMeta(page, limit, total)));
});

export const review = asyncHandler(async (req, res) => {
  const overtime = await overtimeService.reviewOvertime(req.user, req.params.id, req.body);
  return res.status(200).json(new ApiResponse(200, 'Overtime request reviewed', overtime));
});
