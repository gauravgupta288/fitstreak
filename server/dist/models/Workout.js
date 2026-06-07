"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const setSchema = new mongoose_1.Schema({
    reps: {
        type: Number,
        required: [true, 'Number of reps is required'],
        min: [1, 'Reps must be at least 1'],
    },
    weight: {
        type: Number,
        required: [true, 'Weight is required'],
        min: [0, 'Weight cannot be negative'],
    },
});
const exerciseSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Exercise name is required'],
        trim: true,
    },
    muscleGroup: {
        type: String,
        required: [true, 'Muscle group is required'],
        trim: true,
    },
    sets: {
        type: [setSchema],
        required: [true, 'Sets are required'],
        validate: [
            function (val) {
                const group = (this.muscleGroup || '').trim().toLowerCase();
                return group === 'cardio' || (val && val.length > 0);
            },
            'Exercise must have at least one set',
        ],
    },
    duration: {
        type: Number,
        default: 0,
    },
    notes: {
        type: String,
        default: '',
    },
});
const workoutSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: String, // YYYY-MM-DD format
        required: [true, 'Workout date is required'],
    },
    duration: {
        type: Number, // total workout duration in minutes
        required: [true, 'Workout duration is required'],
        min: [1, 'Duration must be at least 1 minute'],
    },
    caloriesBurned: {
        type: Number,
        default: 0,
        min: [0, 'Calories burned cannot be negative'],
    },
    exercises: {
        type: [exerciseSchema],
        validate: [
            (val) => val.length > 0,
            'Workout must have at least one exercise',
        ],
    },
}, {
    timestamps: true,
});
exports.default = (0, mongoose_1.model)('Workout', workoutSchema);
