"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const exerciseLibrarySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    muscleGroup: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true,
});
exports.default = (0, mongoose_1.model)('ExerciseLibrary', exerciseLibrarySchema);
