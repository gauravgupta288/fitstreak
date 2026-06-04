"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExercises = void 0;
const ExerciseLibrary_1 = __importDefault(require("../models/ExerciseLibrary"));
/**
 * @desc    Get all predefined exercises
 * @route   GET /api/exercises
 * @access  Private
 */
const getExercises = async (req, res) => {
    try {
        const exercises = await ExerciseLibrary_1.default.find().sort({ muscleGroup: 1, name: 1 });
        res.json(exercises);
    }
    catch (error) {
        console.error('Get exercise library error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getExercises = getExercises;
