"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const ExerciseLibrary_1 = __importDefault(require("../models/ExerciseLibrary"));
const defaultExercises_1 = require("../utils/defaultExercises");
dotenv_1.default.config();
const connectDB = async () => {
    try {
        const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fitstreak';
        // Set strictQuery to prepare for Mongoose updates
        mongoose_1.default.set('strictQuery', false);
        await mongoose_1.default.connect(connString);
        console.log(`MongoDB Connected: ${connString}`);
        // Auto-seed Exercise Library if empty
        const count = await ExerciseLibrary_1.default.countDocuments();
        if (count === 0) {
            console.log('Exercise Library is empty. Auto-seeding default exercises...');
            await ExerciseLibrary_1.default.insertMany(defaultExercises_1.defaultExercises);
            console.log(`Successfully auto-seeded ${defaultExercises_1.defaultExercises.length} default exercises!`);
        }
        else {
            console.log(`Exercise Library contains ${count} exercises.`);
        }
    }
    catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};
exports.default = connectDB;
