import mongoose from 'mongoose';

const { Schema } = mongoose;

// Internal-only model, not part of the public API. Backs atomic sequence generation
// (e.g. employeeId) — a plain countDocuments()-based scheme would race under concurrent
// registrations and risk duplicate IDs colliding with the unique index.
const counterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

export const getNextSequence = async (name) => {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

export default Counter;
