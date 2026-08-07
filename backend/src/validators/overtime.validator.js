import { z } from 'zod';
import mongoose from 'mongoose';

const objectId = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid id',
});

export const requestOvertimeSchema = z
  .object({
    attendanceId: objectId,
    requestedHours: z.coerce.number().min(0.5, 'Requested hours must be at least 0.5'),
    reason: z.string().trim().min(10, 'Reason must be at least 10 characters').max(500),
  })
  .strict();

export const reviewOvertimeSchema = z
  .object({
    status: z.enum(['approved', 'rejected']),
    reviewComment: z.string().trim().max(500).optional(),
  })
  .strict();
