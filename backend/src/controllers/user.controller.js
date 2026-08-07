import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, buildMeta } from '../utils/paginate.js';
import { canAccessUser } from '../services/scope.service.js';

export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, department, isActive, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (department) filter.department = department;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
    ];
  }

  const { page, limit, skip } = getPagination(req.query);
  const [users, total] = await Promise.all([
    User.find(filter)
      .populate('manager', 'name email employeeId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Users fetched', users, buildMeta(page, limit, total)));
});

export const getMyTeam = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { manager: req.user._id };
  const team = await User.find(filter).populate('manager', 'name email employeeId');
  return res.status(200).json(new ApiResponse(200, 'Team fetched', team));
});

export const getUserById = asyncHandler(async (req, res) => {
  const allowed = await canAccessUser(req.user, req.params.id);
  if (!allowed) {
    throw new ApiError(403, 'You cannot access this user');
  }

  const user = await User.findById(req.params.id).populate('manager', 'name email employeeId');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json(new ApiResponse(200, 'User fetched', user));
});

export const updateUser = asyncHandler(async (req, res) => {
  const { role, department, manager, isActive } = req.body;

  if (manager) {
    const managerDoc = await User.findOne({ _id: manager, role: { $in: ['manager', 'admin'] } });
    if (!managerDoc) {
      throw new ApiError(400, 'Invalid manager assignment', [
        { field: 'manager', message: 'Manager not found or not eligible' },
      ]);
    }
  }

  const update = {
    ...(role !== undefined && { role }),
    ...(department !== undefined && { department }),
    ...(manager !== undefined && { manager }),
    ...(isActive !== undefined && { isActive }),
  };

  const user = await User.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json(new ApiResponse(200, 'User updated', user));
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return res.status(200).json(new ApiResponse(200, 'User deactivated'));
});
