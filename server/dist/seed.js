"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const dns_1 = __importDefault(require("dns"));
const ExerciseLibrary_1 = __importDefault(require("./models/ExerciseLibrary"));
const defaultExercises_1 = require("./utils/defaultExercises");
dotenv_1.default.config();
// Resolve MongoDB Atlas DNS issues by forcing Google Public DNS
try {
    dns_1.default.setServers(['8.8.8.8', '8.8.4.4']);
}
catch (e) {
    console.warn('Could not set custom DNS servers:', e);
}
const seedDB = async () => {
    try {
        const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fitstreak';
        await mongoose_1.default.connect(connString);
        console.log('Connected to database for seeding...');
        // Clear existing exercise library
        await ExerciseLibrary_1.default.deleteMany({});
        console.log('Cleared existing exercise library');
        // Insert seeds
        await ExerciseLibrary_1.default.insertMany(defaultExercises_1.defaultExercises);
        console.log(`Successfully seeded ${defaultExercises_1.defaultExercises.length} exercises!`);
        await mongoose_1.default.disconnect();
        console.log('Database disconnected.');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};
seedDB();
