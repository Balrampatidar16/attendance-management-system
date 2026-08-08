import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),

  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

  ACCESS_TOKEN_SECRET: z.string().min(20, 'ACCESS_TOKEN_SECRET must be at least 20 characters'),
  ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().min(20, 'REFRESH_TOKEN_SECRET must be at least 20 characters'),
  REFRESH_TOKEN_EXPIRY: z.string().default('7d'),

  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),

  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  STANDARD_SHIFT_HOURS: z.coerce.number().positive().default(8),

  GEOFENCE_ENABLED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  OFFICE_LATITUDE: z.coerce.number().default(22.7196),
  OFFICE_LONGITUDE: z.coerce.number().default(75.8577),
  GEOFENCE_RADIUS_METERS: z.coerce.number().positive().default(200),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid or missing environment variables:');
  console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export const env = parsed.data;
