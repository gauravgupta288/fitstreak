import { Document, Types } from 'mongoose';
import { Request } from 'express';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string; // YYYY-MM-DD
  xp: number;
  level: number;
  height?: number;
  weight?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISet {
  reps: number;
  weight: number;
}

export interface IExercise {
  name: string;
  muscleGroup: string;
  sets: ISet[];
  duration?: number;
  notes?: string;
}

export interface IWorkout extends Document {
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  duration: number; // in minutes
  exercises: IExercise[];
  caloriesBurned?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}
