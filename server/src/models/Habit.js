import mongoose from 'mongoose';

const HabitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  statCategory: { type: String, enum: ['STR', 'INT', 'SPI'], required: true },
  difficulty: { type: Number, min: 1, max: 3, default: 1 },
  isCompletedToday: { type: Boolean, default: false },
  streak: { type: Number, default: 0 }
});

export default HabitSchema;
