import mongoose from 'mongoose';

const { Schema } = mongoose;

const overtimeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    attendance: { type: Schema.Types.ObjectId, ref: 'Attendance', required: true },
    date: { type: Date, required: true },
    requestedHours: { type: Number, required: true, min: 0.5 },
    reason: { type: String, required: true, minlength: 10 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    reviewComment: { type: String, default: '' },
  },
  { timestamps: true }
);

const Overtime = mongoose.model('Overtime', overtimeSchema);

export default Overtime;
