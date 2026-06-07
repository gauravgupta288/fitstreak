import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import ExerciseLibrary from './models/ExerciseLibrary';
import { defaultExercises } from './utils/defaultExercises';

dotenv.config();

// Resolve MongoDB Atlas DNS issues by forcing Google Public DNS
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn('Could not set custom DNS servers:', e);
}

const seedDB = async () => {
  try {
    const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fitstreak';
    await mongoose.connect(connString);
    console.log('Connected to database for seeding...');

    // Clear existing exercise library
    await ExerciseLibrary.deleteMany({});
    console.log('Cleared existing exercise library');

    // Insert seeds
    await ExerciseLibrary.insertMany(defaultExercises);
    console.log(`Successfully seeded ${defaultExercises.length} exercises!`);

    await mongoose.disconnect();
    console.log('Database disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
