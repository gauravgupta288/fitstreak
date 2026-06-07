import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExerciseLibrary from '../models/ExerciseLibrary';
import { defaultExercises } from '../utils/defaultExercises';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fitstreak';
    
    // Set strictQuery to prepare for Mongoose updates
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(connString);
    console.log(`MongoDB Connected: ${connString}`);

    // Auto-seed Exercise Library if empty
    const count = await ExerciseLibrary.countDocuments();
    if (count === 0) {
      console.log('Exercise Library is empty. Auto-seeding default exercises...');
      await ExerciseLibrary.insertMany(defaultExercises);
      console.log(`Successfully auto-seeded ${defaultExercises.length} default exercises!`);
    } else {
      console.log(`Exercise Library contains ${count} exercises.`);
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;
