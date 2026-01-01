import mongoose from 'mongoose';
import PetSchema from './Pet.js';
import HabitSchema from './Habit.js';

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    coins: { type: Number, default: 0 },
    lastLogin: { type: Date, default: Date.now },
    pet: { type: PetSchema, required: true },
    habits: [HabitSchema]
  },
  { timestamps: true }
);

export const User = mongoose.model('User', UserSchema);
