import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fitstreak';
    
    // Set strictQuery to prepare for Mongoose updates
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(connString);
    console.log(`MongoDB Connected: ${connString}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;
