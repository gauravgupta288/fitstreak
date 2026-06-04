"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workoutController_1 = require("../controllers/workoutController");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
// Protect all routes under this router
router.use(auth_1.default);
router.post('/', workoutController_1.createWorkout);
router.get('/', workoutController_1.getWorkouts);
router.get('/stats', workoutController_1.getWorkoutStats);
router.get('/:id', workoutController_1.getWorkoutById);
router.put('/:id', workoutController_1.updateWorkout);
router.delete('/:id', workoutController_1.deleteWorkout);
exports.default = router;
