import { User } from '../models/User.js';

/**
 * Middleware to check if habits need daily reset
 * Compares lastLogin date with current date (UTC midnight boundary)
 */
export async function dailyReset(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return next();

    const now = new Date();
    const lastLogin = user.lastLogin || new Date(0); // Epoch if never logged in

    // Check if we've crossed a UTC midnight boundary
    const lastLoginDate = new Date(lastLogin).setHours(0, 0, 0, 0);
    const currentDate = new Date(now).setHours(0, 0, 0, 0);

    if (currentDate > lastLoginDate) {
      // Check for freeze streak protection
      const hasFreezeProtection = user.freezeProtectionUntil && 
        new Date(user.freezeProtectionUntil) > new Date();
      
      if (hasFreezeProtection) {
        // Protected from streak breaks, just reset completion status
        user.habits.forEach((habit) => {
          habit.isCompletedToday = false;
        });
        // Clear the protection after use
        user.freezeProtectionUntil = null;
      } else {
        // Normal reset - streaks can break
        user.habits.forEach((habit) => {
          if (habit.isCompletedToday) {
            // Reset completion but keep streak (they completed yesterday)
            habit.isCompletedToday = false;
          } else if (habit.streak > 0) {
            // Habit was NOT completed yesterday, break streak
            habit.streak = 0;
          }
        });
      }

      user.lastLogin = now;
      await user.save();
    }

    next();
  } catch (err) {
    console.error('Daily reset error:', err);
    next(); // Don't block request on reset failure
  }
}
