import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';
import { env } from '../config/env.js';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

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
  if (!user || !user.isActive || !user.password) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const { accessToken, refreshToken } = await generateAuthTokens(user);
  return { user, accessToken, refreshToken };
};

// Verifies the Google ID token against Google's public keys (signature, audience, expiry —
// google-auth-library handles all of it), then finds-or-creates/links the local User account.
// Never trusts client-supplied profile fields directly — only the verified token payload.
export const loginWithGoogle = async (idToken) => {
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID });
  } catch {
    throw new ApiError(401, 'Invalid or expired Google credential');
  }

  const payload = ticket.getPayload();
  if (!payload?.email || !payload.email_verified) {
    throw new ApiError(401, 'Google account email is not verified');
  }

  const { sub: googleId, email, name, picture } = payload;

  let user = await User.findOne({ $or: [{ googleId }, { email }] }).select('+password +googleId');

  if (user) {
    if (!user.isActive) {
      throw new ApiError(401, 'This account has been deactivated');
    }
    // Link Google to an existing local account the first time it's seen; never touch an
    // already-set avatar so a user's custom profile photo isn't silently overwritten.
    let changed = false;
    if (!user.googleId) {
      user.googleId = googleId;
      changed = true;
    }
    if (!user.avatar && picture) {
      user.avatar = picture;
      changed = true;
    }
    if (changed) {
      await user.save({ validateBeforeSave: false });
    }
  } else {
    user = await User.create({
      name: name || email.split('@')[0],
      email,
      googleId,
      authProvider: 'google',
      avatar: picture || '',
      role: 'employee',
    });
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
  if (!user.password) {
    throw new ApiError(400, 'This account signs in with Google and has no password to change');
  }
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
