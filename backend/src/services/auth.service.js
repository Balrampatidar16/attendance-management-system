import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const registerUser = async ({ name, email, password, department, manager }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists', [
      { field: 'email', message: 'Email already registered' },
    ]);
  }

  if (manager) {
    const managerDoc = await User.findOne({
      _id: manager,
      role: { $in: ['manager', 'admin'] },
      isActive: true,
    });
    if (!managerDoc) {
      throw new ApiError(400, 'Invalid manager assignment', [
        { field: 'manager', message: 'Manager not found or not eligible' },
      ]);
    }
  }

  const user = await User.create({
    name,
    email,
    password,
    department,
    manager: manager || null,
    role: 'employee',
  });

  return user;
};

export const generateAuthTokens = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const { accessToken, refreshToken } = await generateAuthTokens(user);
  return { user, accessToken, refreshToken };
};

export const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
};

export const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token missing');
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded._id).select('+refreshToken');
  if (!user || !user.isActive || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token is invalid or has been revoked');
  }

  const { accessToken, refreshToken } = await generateAuthTokens(user);
  return { user, accessToken, refreshToken };
};

export const changeUserPassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect', [
      { field: 'oldPassword', message: 'Incorrect password' },
    ]);
  }
  user.password = newPassword;
  await user.save();
};

export const updateUserProfile = async (userId, updates) => {
  const allowed = ['name', 'department', 'avatar'];
  const payload = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) payload[key] = updates[key];
  }
  const user = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });
  return user;
};
