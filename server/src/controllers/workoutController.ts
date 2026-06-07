import { Response } from 'express';
import Workout from '../models/Workout';
import User from '../models/User';
import { AuthRequest, IExercise } from '../types';
import { getDaysDifference, getSystemDateString, parseLocalDate } from '../utils/date';
import { calculateCaloriesBurned } from '../utils/calories';

/**
 * @desc    Create a new workout
 * @route   POST /api/workouts
 * @access  Private
 */
export const createWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, duration, exercises } = req.body;

    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    if (!date || !duration || !exercises || !Array.isArray(exercises) || exercises.length === 0) {
      res.status(400).json({ message: 'Please provide workout date, duration, and at least one exercise' });
      return;
    }

    // Fetch user for weight details and XP updates
    const user = await User.findById(req.user.id);
    const userWeight = user?.weight || 70;

    // Auto-calculate calories burned based on exercises and duration
    const computedCalories = calculateCaloriesBurned(exercises, Number(duration), userWeight);

    // Create the workout
    const workout = await Workout.create({
      userId: req.user.id,
      date,
      duration: Number(duration),
      exercises,
      caloriesBurned: computedCalories,
    });

    // Recalculate User streak dynamically on day basis
    const clientDateStr = (req.headers['x-client-date'] as string) || date;
    await recalculateUserStreak(req.user.id, clientDateStr);

    // Update User XP and Level
    if (user) {
      const updatedUser = await User.findById(req.user.id);
      if (updatedUser) {
        const currentXP = Number(updatedUser.xp) || 0;
        const currentStreak = Number(updatedUser.currentStreak) || 0;
        const baseXP = 100;
        const streakBonus = currentStreak * 10; // 10 XP bonus per streak day
        updatedUser.xp = currentXP + baseXP + streakBonus;

        // Level formula: Level = floor(XP / 500) + 1
        const currentLevel = Number(updatedUser.level) || 1;
        const newLevel = Math.floor(updatedUser.xp / 500) + 1;
        if (newLevel > currentLevel) {
          updatedUser.level = newLevel;
        }

        await updatedUser.save();
      }
    }

    res.status(201).json(workout);
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get all workouts for user
 * @route   GET /api/workouts
 * @access  Private
 */
export const getWorkouts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const workouts = await Workout.find({ userId: req.user.id }).sort({ date: -1, createdAt: -1 });
    res.json(workouts);
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get single workout
 * @route   GET /api/workouts/:id
 * @access  Private
 */
export const getWorkoutById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const workout = await Workout.findOne({ _id: req.params.id, userId: req.user.id });
    if (!workout) {
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    res.json(workout);
  } catch (error) {
    console.error('Get workout by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update a workout
 * @route   PUT /api/workouts/:id
 * @access  Private
 */
export const updateWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, duration, exercises } = req.body;

    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const workout = await Workout.findOne({ _id: req.params.id, userId: req.user.id });
    if (!workout) {
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    // Update fields
    if (date) workout.date = date;
    if (duration !== undefined) workout.duration = Number(duration);
    if (exercises) workout.exercises = exercises;

    // Recalculate calories burned automatically if exercises or duration changed
    if (exercises || duration !== undefined) {
      const user = await User.findById(req.user.id);
      const userWeight = user?.weight || 70;
      const targetExercises = exercises || workout.exercises;
      const targetDuration = duration !== undefined ? Number(duration) : workout.duration;
      workout.caloriesBurned = calculateCaloriesBurned(targetExercises, targetDuration, userWeight);
    }

    const updatedWorkout = await workout.save();

    // Recalculate User streak after date update/edit
    const clientDateStr = (req.headers['x-client-date'] as string) || workout.date;
    await recalculateUserStreak(req.user.id, clientDateStr);

    res.json(updatedWorkout);
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Delete a workout
 * @route   DELETE /api/workouts/:id
 * @access  Private
 */
export const deleteWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const workout = await Workout.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!workout) {
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    // Recalculate User streak after deletion
    const clientDateStr = (req.headers['x-client-date'] as string) || getSystemDateString();
    await recalculateUserStreak(req.user.id, clientDateStr);

    res.json({ message: 'Workout removed successfully' });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get workout stats & analytics
 * @route   GET /api/workouts/stats
 * @access  Private
 */
export const getWorkoutStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const userId = req.user.id;
    const workouts = await Workout.find({ userId });

    const totalWorkouts = workouts.length;

    // Calculate workouts this week and this month
    const clientDateStr = (req.headers['x-client-date'] as string) || getSystemDateString();
    const today = parseLocalDate(clientDateStr);
    
    // Get start of this week (Sunday or Monday) - let's say Monday
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Get start of this month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const activeDatesThisWeek = new Set<string>();
    const activeDatesThisMonth = new Set<string>();
    let totalCaloriesBurned = 0;
    let caloriesThisWeek = 0;
    let caloriesThisMonth = 0;
    const calendarDays: { [key: string]: boolean } = {}; // YYYY-MM-DD: true
    const caloriesHistory: Array<{ date: string; calories: number }> = [];

    workouts.forEach((w) => {
      calendarDays[w.date] = true;
      const workoutDate = parseLocalDate(w.date);
      const cals = w.caloriesBurned || 0;
      totalCaloriesBurned += cals;

      if (workoutDate >= startOfWeek) {
        activeDatesThisWeek.add(w.date);
        caloriesThisWeek += cals;
      }
      if (workoutDate >= startOfMonth) {
        activeDatesThisMonth.add(w.date);
        caloriesThisMonth += cals;
      }

      caloriesHistory.push({
        date: w.date,
        calories: cals,
      });
    });

    const workoutsThisWeek = activeDatesThisWeek.size;
    const workoutsThisMonth = activeDatesThisMonth.size;

    // Calculate Personal Records (PRs) per exercise
    // Format: { [exerciseName]: { maxWeight: number, maxReps: number, muscleGroup: string } }
    const prs: { [key: string]: { maxWeight: number; maxReps: number; muscleGroup: string } } = {};
    
    // Let's also collect progress data over time for each exercise
    // Format: { [exerciseName]: Array<{ date: string, weight: number, reps: number }> }
    const exerciseHistory: { [key: string]: Array<{ date: string; weight: number; reps: number }> } = {};

    workouts.forEach((w) => {
      w.exercises.forEach((ex) => {
        const nameLower = ex.name.trim();
        
        // Find max weight and max reps for this exercise session
        const setsList = ex.sets || [];
        if (setsList.length === 0) return;

        const maxWeight = setsList.reduce((max, s) => Math.max(max, s.weight), 0);
        const maxReps = setsList.reduce((max, s) => Math.max(max, s.reps), 0);
        
        const maxWeightSets = setsList.filter(s => s.weight === maxWeight);
        const repsAtMaxWeight = maxWeightSets.reduce((max, s) => Math.max(max, s.reps), 0);
        
        // Track stats
        if (!prs[nameLower]) {
          prs[nameLower] = {
            maxWeight,
            maxReps,
            muscleGroup: ex.muscleGroup,
          };
        } else {
          prs[nameLower].maxWeight = Math.max(prs[nameLower].maxWeight, maxWeight);
          prs[nameLower].maxReps = Math.max(prs[nameLower].maxReps, maxReps);
        }

        // Track progress over time
        if (!exerciseHistory[nameLower]) {
          exerciseHistory[nameLower] = [];
        }
        exerciseHistory[nameLower].push({
          date: w.date,
          weight: maxWeight,
          reps: repsAtMaxWeight,
        });
      });
    });

    // Sort history by date ascending for charts
    Object.keys(exerciseHistory).forEach((key) => {
      exerciseHistory[key].sort((a, b) => a.date.localeCompare(b.date));
    });

    // Generate weekly activity status for dashboard
    // Monday (1) to Sunday (7) or Sunday (0) to Saturday (6). Let's do Monday-Sunday.
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyStatus = daysOfWeek.map((dayName, idx) => {
      // Find the date for this day of the current week
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + idx);
      const dateStr = currentDay.toISOString().split('T')[0];
      return {
        day: dayName,
        date: dateStr,
        completed: !!calendarDays[dateStr],
      };
    });

    // Determine today's status
    const completedToday = !!calendarDays[clientDateStr];

    res.json({
      totalWorkouts,
      workoutsThisWeek,
      workoutsThisMonth,
      totalCaloriesBurned,
      caloriesThisWeek,
      caloriesThisMonth,
      caloriesHistory: caloriesHistory.sort((a, b) => a.date.localeCompare(b.date)),
      calendarDays: Object.keys(calendarDays),
      prs,
      exerciseHistory,
      weeklyStatus,
      completedToday,
    });
  } catch (error) {
    console.error('Get workout stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Recalculates the current and longest workout streak of the user based on logged workout dates.
 */
export const recalculateUserStreak = async (userId: string, clientDateStr?: string): Promise<void> => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Find all workouts for the user, sorted by date ascending
    const workouts = await Workout.find({ userId }).sort({ date: 1 });
    if (workouts.length === 0) {
      user.currentStreak = 0;
      user.longestStreak = 0;
      user.lastWorkoutDate = '';
      await user.save();
      return;
    }

    // Get unique workout dates, sorted ascending
    const uniqueDates = Array.from(new Set(workouts.map((w) => w.date))).sort();

    // Calculate longest streak and current streak
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDateStr = '';

    for (let i = 0; i < uniqueDates.length; i++) {
      const dateStr = uniqueDates[i];
      if (i === 0) {
        tempStreak = 1;
      } else {
        const diff = getDaysDifference(prevDateStr, dateStr);
        if (diff === 1) {
          tempStreak += 1;
        } else if (diff > 1) {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      prevDateStr = dateStr;
    }

    // Calculate current streak relative to clientDateStr (or system date if not provided)
    const today = clientDateStr || getSystemDateString();
    const lastWorkoutDateStr = uniqueDates[uniqueDates.length - 1];
    const diffToday = getDaysDifference(lastWorkoutDateStr, today);

    let currentStreak = 0;
    if (diffToday === 0 || diffToday === 1) {
      // Current streak is the consecutive days ending at lastWorkoutDateStr
      let currentStreakTemp = 1;
      let checkPrevDate = lastWorkoutDateStr;
      for (let i = uniqueDates.length - 2; i >= 0; i--) {
        const diff = getDaysDifference(uniqueDates[i], checkPrevDate);
        if (diff === 1) {
          currentStreakTemp++;
          checkPrevDate = uniqueDates[i];
        } else if (diff === 0) {
          // ignore same-day logs
        } else {
          break;
        }
      }
      currentStreak = currentStreakTemp;
    } else {
      // Streak is broken
      currentStreak = 0;
    }

    user.currentStreak = currentStreak;
    user.longestStreak = Math.max(longestStreak, user.longestStreak || 0);
    user.lastWorkoutDate = lastWorkoutDateStr;
    await user.save();
  } catch (error) {
    console.error('Recalculate user streak error:', error);
  }
};
