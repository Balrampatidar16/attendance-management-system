import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { getNextSequence } from './Counter.model.js';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ['employee', 'manager', 'admin'],
      default: 'employee',
    },
    employeeId: { type: String, unique: true },
    department: { type: String, trim: true, default: '' },
    // Not enforced as required for employees at the schema level — POST /auth/register is a
    // public, unauthenticated endpoint with no manager field, so a new employee is expected to
    // exist manager-less until an admin assigns one via PATCH /users/:id. See README > Assumptions.
    manager: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

userSchema.pre('save', async function preSave(next) {
  if (this.isNew && !this.employeeId) {
    const seq = await getNextSequence('employeeId');
    this.employeeId = `EMP-${String(seq).padStart(4, '0')}`;
  }

  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = function generateAccessToken() {
  return jwt.sign(
    { _id: this._id, email: this.email, role: this.role },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function generateRefreshToken() {
  return jwt.sign({ _id: this._id }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRY,
  });
};

const User = mongoose.model('User', userSchema);

export default User;
