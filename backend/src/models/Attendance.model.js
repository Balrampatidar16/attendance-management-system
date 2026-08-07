import mongoose from 'mongoose';
import { env } from '../config/env.js';

const { Schema } = mongoose;

const punchSchema = new Schema(
  {
    time: { type: Date, default: null },
    selfieUrl: { type: String, default: null },
    selfiePublicId: { type: String, default: null },
    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      address: { type: String, default: null },
    },
  },
  { _id: false }
);

const attendanceSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    punchIn: { type: punchSchema, default: () => ({}) },
    punchOut: { type: punchSchema, default: () => ({}) },
    totalWorkingHours: { type: Number, default: 0 },
    workStatus: {
      type: String,
      enum: ['completed', 'incomplete', 'in-progress'],
      default: 'in-progress',
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'valid', 'invalid'],
      default: 'pending',
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    verifiedAt: { type: Date, default: null },
    remarks: { type: String, default: '' },
    overtime: { type: Schema.Types.ObjectId, ref: 'Overtime', default: null },
  },
  { timestamps: true }
);

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

attendanceSchema.pre('save', function preSave(next) {
  if (this.punchIn?.time && this.punchOut?.time) {
    const rawHours = (this.punchOut.time.getTime() - this.punchIn.time.getTime()) / 3_600_000;
    this.totalWorkingHours = Math.round(rawHours * 100) / 100;
    this.workStatus = this.totalWorkingHours >= env.STANDARD_SHIFT_HOURS ? 'completed' : 'incomplete';
  } else if (this.punchIn?.time) {
    this.workStatus = 'in-progress';
  }
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
