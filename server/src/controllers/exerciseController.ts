import { Request, Response } from 'express';
import ExerciseLibrary from '../models/ExerciseLibrary';

/**
 * @desc    Get all predefined exercises
 * @route   GET /api/exercises
 * @access  Private
 */
export const getExercises = async (req: Request, res: Response): Promise<void> => {
  try {
    const exercises = await ExerciseLibrary.find().sort({ muscleGroup: 1, name: 1 });
    res.json(exercises);
  } catch (error) {
    console.error('Get exercise library error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
