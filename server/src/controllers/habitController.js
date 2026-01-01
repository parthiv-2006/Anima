import { User } from '../models/User.js';

export async function listHabits(req, res) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json(user.habits);
}

export async function addHabit(req, res) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.habits.push(req.body);
  await user.save();
  return res.status(201).json(user.habits);
}

export async function completeHabit(req, res) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const habit = user.habits.id(req.params.id);
  if (!habit) return res.status(404).json({ message: 'Habit not found' });

  habit.isCompletedToday = true;
  habit.streak += 1;
  user.pet.totalXp += 10 * habit.difficulty;
  user.pet.stats[habit.statCategory.toLowerCase()] += 5 * habit.difficulty;

  await user.save();
  return res.json({ habits: user.habits, pet: user.pet });
}
