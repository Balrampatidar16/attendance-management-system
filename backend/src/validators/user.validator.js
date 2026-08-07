import { z } from 'zod';
import mongoose from 'mongoose';

const objectId = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid id',
});

export const updateUserSchema = z
  .object({
    role: z.enum(['employee', 'manager', 'admin']).optional(),
    department: z.string().trim().max(100).optional(),
    manager: objectId.nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();
