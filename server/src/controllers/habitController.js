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

  // Prevent duplicate completion
  if (habit.isCompletedToday) {
    return res.status(400).json({ message: 'Habit already completed today' });
  }

  habit.isCompletedToday = true;
  habit.streak += 1;
  user.pet.totalXp += 10 * habit.difficulty;
  user.pet.stats[habit.statCategory.toLowerCase()] += 5 * habit.difficulty;

  await user.save();
  return res.json({ habits: user.habits, pet: user.pet });
}

export async function resetHabit(req, res) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const habit = user.habits.id(req.params.id);
  if (!habit) return res.status(404).json({ message: 'Habit not found' });

  // Only allow reset if completed today
  if (!habit.isCompletedToday) {
    return res.status(400).json({ message: 'Habit not completed yet' });
  }

  // Revert rewards
  user.pet.totalXp -= 10 * habit.difficulty;
  user.pet.stats[habit.statCategory.toLowerCase()] -= 5 * habit.difficulty;
  
  // Ensure stats don't go negative
  user.pet.totalXp = Math.max(0, user.pet.totalXp);
  user.pet.stats.str = Math.max(0, user.pet.stats.str);
  user.pet.stats.int = Math.max(0, user.pet.stats.int);
  user.pet.stats.spi = Math.max(0, user.pet.stats.spi);

  habit.isCompletedToday = false;
  habit.streak = Math.max(0, habit.streak - 1);

  await user.save();
  return res.json({ habits: user.habits, pet: user.pet });
}

export async function deleteHabit(req, res) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const habit = user.habits.id(req.params.id);
  if (!habit) return res.status(404).json({ message: 'Habit not found' });

  habit.deleteOne();
  await user.save();
  return res.json({ habits: user.habits });
}
