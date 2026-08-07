import Attendance from '../models/Attendance.model.js';
import ApiError from '../utils/ApiError.js';
import { uploadSelfie } from './upload.service.js';
import { normalizeDate } from '../utils/dateHelper.js';
import { haversineDistanceMeters } from '../utils/geoHelper.js';
import { env } from '../config/env.js';

const assertWithinGeofence = (latitude, longitude) => {
  if (!env.GEOFENCE_ENABLED) return;

  const distance = haversineDistanceMeters(latitude, longitude, env.OFFICE_LATITUDE, env.OFFICE_LONGITUDE);
  if (distance > env.GEOFENCE_RADIUS_METERS) {
    throw new ApiError(
      403,
      `You must be within ${env.GEOFENCE_RADIUS_METERS}m of the office to punch in/out (you're ~${Math.round(distance)}m away)`
    );
  }
};

export const punchIn = async (userId, { selfie, latitude, longitude, address }) => {
  const today = normalizeDate(new Date());

  const existing = await Attendance.findOne({ user: userId, date: today });
  if (existing?.punchIn?.time) {
    throw new ApiError(409, 'You have already punched in today');
  }

  assertWithinGeofence(latitude, longitude);

  const uploaded = await uploadSelfie(selfie, 'attendance/punch-in');

  const punchInData = {
    time: new Date(),
    selfieUrl: uploaded.url,
    selfiePublicId: uploaded.publicId,
    location: { latitude, longitude, address: address ?? null },
  };

  if (existing) {
    existing.punchIn = punchInData;
    return existing.save();
  }

  return Attendance.create({ user: userId, date: today, punchIn: punchInData });
};

export const punchOut = async (userId, { selfie, latitude, longitude, address }) => {
  const today = normalizeDate(new Date());

  const existing = await Attendance.findOne({ user: userId, date: today });
  if (!existing?.punchIn?.time) {
    throw new ApiError(400, 'You must punch in before punching out');
  }
  if (existing.punchOut?.time) {
    throw new ApiError(409, 'You have already punched out today');
  }

  assertWithinGeofence(latitude, longitude);

  const uploaded = await uploadSelfie(selfie, 'attendance/punch-out');

  existing.punchOut = {
    time: new Date(),
    selfieUrl: uploaded.url,
    selfiePublicId: uploaded.publicId,
    location: { latitude, longitude, address: address ?? null },
  };

  return existing.save();
};

export const getTodayAttendance = async (userId) => {
  const today = normalizeDate(new Date());
  return Attendance.findOne({ user: userId, date: today });
};
