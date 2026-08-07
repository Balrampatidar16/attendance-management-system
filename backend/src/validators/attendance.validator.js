import { z } from 'zod';

const base64ImagePattern = /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/;

export const punchSchema = z
  .object({
    selfie: z.string().regex(base64ImagePattern, 'Selfie must be a base64 image data URL (camera capture only)'),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    address: z.string().trim().max(300).optional(),
  })
  .strict();

export const verifyAttendanceSchema = z
  .object({
    verificationStatus: z.enum(['valid', 'invalid']),
    remarks: z.string().trim().max(500).optional(),
  })
  .strict();
