import { User } from '../models/User.js';
import { calculateEvolution } from './petController.js';

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
  // Recalculate evolution based on new XP/stats
  calculateEvolution(user.pet);
  
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

  // Recalculate evolution in case XP drops below thresholds
  calculateEvolution(user.pet);

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
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  // Calculate the start date: either days ago or from account creation, whichever is later
  const daysAgo = new Date(now);
  daysAgo.setDate(daysAgo.getDate() - days);
  
  const accountCreation = new Date(user.createdAt);
  accountCreation.setHours(0, 0, 0, 0);
  
  const startDate = accountCreation > daysAgo ? accountCreation : daysAgo;

  // Helper: format a local date key as YYYY-MM-DD (no UTC shift)
  const getLocalDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Aggregate completions by day
  const dailyData = new Map();

  // Initialize all days from account creation to today with zero values
  const current = new Date(startDate);
  while (current <= now) {
    const dateKey = getLocalDateKey(current);
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
    current.setDate(current.getDate() + 1);
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

export async function getHabitRecommendations(req, res) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Get current stats
  const stats = {
    STR: user.pet.stats.str,
    INT: user.pet.stats.int,
    SPI: user.pet.stats.spi
  };

  // Determine weakest and second weakest stats
  const statEntries = Object.entries(stats).sort((a, b) => a[1] - b[1]);
  const weakestStat = statEntries[0][0];
  const secondWeakest = statEntries[1][0];

  // Get existing habit categories to avoid duplicates
  const existingCategories = new Set(user.habits.map(h => h.statCategory));

  // Recommendation suggestions by stat
  const suggestions = {
    STR: [
      { name: 'Morning Run', difficulty: 2, reason: 'Build cardiovascular endurance' },
      { name: 'Weight Training', difficulty: 3, reason: 'Increase muscle strength' },
      { name: 'Yoga Stretching', difficulty: 1, reason: 'Improve flexibility' },
      { name: 'Push-ups', difficulty: 2, reason: 'Daily strength exercise' },
      { name: 'Sports Activity', difficulty: 3, reason: 'Active engagement and conditioning' }
    ],
    INT: [
      { name: 'Read Books', difficulty: 2, reason: 'Expand knowledge and vocabulary' },
      { name: 'Learn Programming', difficulty: 3, reason: 'Build technical skills' },
      { name: 'Puzzle Solving', difficulty: 1, reason: 'Improve logical thinking' },
      { name: 'Online Course', difficulty: 2, reason: 'Structured learning' },
      { name: 'Write Journal', difficulty: 1, reason: 'Reflect and develop writing skills' }
    ],
    SPI: [
      { name: 'Meditation', difficulty: 1, reason: 'Center your mind and reduce stress' },
      { name: 'Journaling', difficulty: 1, reason: 'Self-reflection and emotional processing' },
      { name: 'Gratitude Practice', difficulty: 1, reason: 'Cultivate positive mindset' },
      { name: 'Breathing Exercises', difficulty: 1, reason: 'Calm and center yourself' },
      { name: 'Creative Art', difficulty: 2, reason: 'Express creativity and emotions' }
    ]
  };

  // Generate recommendations
  const recommendations = [];

  // Add 2 recommendations for weakest stat
  if (!existingCategories.has(weakestStat)) {
    const weakestSuggestions = suggestions[weakestStat];
    recommendations.push({
      ...weakestSuggestions[0],
      statCategory: weakestStat,
      priority: 'high',
      message: `Your ${weakestStat === 'STR' ? 'Strength' : weakestStat === 'INT' ? 'Intellect' : 'Spirit'} is low. ${weakestSuggestions[0].reason}!`
    });
    if (weakestSuggestions.length > 1) {
      recommendations.push({
        ...weakestSuggestions[1],
        statCategory: weakestStat,
        priority: 'high',
        message: `Try this to boost ${weakestStat === 'STR' ? 'Strength' : weakestStat === 'INT' ? 'Intellect' : 'Spirit'}: ${weakestSuggestions[1].reason}!`
      });
    }
  }

  // Add 1 recommendation for second weakest
  if (!existingCategories.has(secondWeakest) && recommendations.length < 3) {
    const secondSuggestions = suggestions[secondWeakest];
    recommendations.push({
      ...secondSuggestions[Math.floor(Math.random() * secondSuggestions.length)],
      statCategory: secondWeakest,
      priority: 'medium',
      message: `Strengthen your ${secondWeakest === 'STR' ? 'Strength' : secondWeakest === 'INT' ? 'Intellect' : 'Spirit'} with a new habit!`
    });
  }

  return res.json({
    recommendations,
    currentStats: stats,
    weakestStat
  });
}
