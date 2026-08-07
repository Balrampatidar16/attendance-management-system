import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { env } from '../config/env.js';
import { parseDurationToMs } from '../utils/parseDuration.js';
import * as authService from '../services/auth.service.js';

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: parseDurationToMs(env.REFRESH_TOKEN_EXPIRY),
  path: '/api/v1/auth',
};

const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  return res.status(201).json(new ApiResponse(201, 'Registration successful', sanitizeUser(user)));
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.body);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
  return res
    .status(200)
    .json(new ApiResponse(200, 'Login successful', { user: sanitizeUser(user), accessToken }));
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user._id);
  const clearOptions = { ...refreshCookieOptions };
  delete clearOptions.maxAge;
  res.clearCookie('refreshToken', clearOptions);
  return res.status(200).json(new ApiResponse(200, 'Logged out successfully'));
});

export const refreshTokenHandler = asyncHandler(async (req, res) => {
  const incoming = req.cookies?.refreshToken;
  const { user, accessToken, refreshToken } = await authService.refreshAccessToken(incoming);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
  return res
    .status(200)
    .json(new ApiResponse(200, 'Token refreshed', { user: sanitizeUser(user), accessToken }));
});

export const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, 'Current user', sanitizeUser(req.user)));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateUserProfile(req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, 'Profile updated', sanitizeUser(user)));
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changeUserPassword(req.user._id, req.body.oldPassword, req.body.newPassword);
  return res.status(200).json(new ApiResponse(200, 'Password changed successfully'));
});
