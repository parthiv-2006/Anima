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

  const xpAwarded = 10 * habit.difficulty;
  
  habit.isCompletedToday = true;
  habit.streak += 1;
  user.pet.totalXp += xpAwarded;
  user.pet.stats[habit.statCategory.toLowerCase()] += 5 * habit.difficulty;
  
  // Award coins based on difficulty and streak bonus
  const baseCoins = 5 * habit.difficulty;
  const streakBonus = Math.min(habit.streak, 7); // Max 7 coin bonus from streak
  user.coins += baseCoins + streakBonus;

  // Log completion for heatmap
  habit.completionLog.push({
    date: new Date(),
    xpAwarded,
    statCategory: habit.statCategory,
    difficulty: habit.difficulty
  });

  await user.save();
  return res.json({ habits: user.habits, pet: user.pet, coins: user.coins });
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
  
  // Revert coins (same calculation as in complete)
  const baseCoins = 5 * habit.difficulty;
  const streakBonus = Math.min(habit.streak, 7);
  user.coins -= (baseCoins + streakBonus);
  
  // Ensure stats and coins don't go negative
  user.pet.totalXp = Math.max(0, user.pet.totalXp);
  user.pet.stats.str = Math.max(0, user.pet.stats.str);
  user.pet.stats.int = Math.max(0, user.pet.stats.int);
  user.pet.stats.spi = Math.max(0, user.pet.stats.spi);
  user.coins = Math.max(0, user.coins);

  habit.isCompletedToday = false;
  habit.streak = Math.max(0, habit.streak - 1);

  await user.save();
  return res.json({ habits: user.habits, pet: user.pet, coins: user.coins });
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

export async function getHabitHistory(req, res) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const days = parseInt(req.query.days) || 365;
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1); // January 1st of current year

  // Helper: format a local date key as YYYY-MM-DD (no UTC shift)
  const getLocalDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Aggregate completions by day
  const dailyData = new Map();

  // Initialize all days of the year with zero values
  for (let i = 0; i < days; i++) {
    const date = new Date(startOfYear);
    date.setDate(date.getDate() + i);
    const dateKey = getLocalDateKey(date);
    dailyData.set(dateKey, {
      date: dateKey,
      totalXp: 0,
      strXp: 0,
      intXp: 0,
      spiXp: 0,
      habitsCompleted: 0,
      strCount: 0,
      intCount: 0,
      spiCount: 0
    });
  }

  // Aggregate completion data from all habits
  user.habits.forEach(habit => {
    habit.completionLog.forEach(completion => {
      const completionDate = new Date(completion.date);
      const dateKey = getLocalDateKey(completionDate);
      
      if (dailyData.has(dateKey)) {
        const dayData = dailyData.get(dateKey);
        dayData.totalXp += completion.xpAwarded;
        dayData.habitsCompleted += 1;
        
        // Add XP to appropriate stat category
        if (completion.statCategory === 'STR') {
          dayData.strXp += completion.xpAwarded;
          dayData.strCount += 1;
        } else if (completion.statCategory === 'INT') {
          dayData.intXp += completion.xpAwarded;
          dayData.intCount += 1;
        } else if (completion.statCategory === 'SPI') {
          dayData.spiXp += completion.xpAwarded;
          dayData.spiCount += 1;
        }
      }
    });
  });

  // Convert map to array and sort by date
  const history = Array.from(dailyData.values()).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  return res.json(history);
}
