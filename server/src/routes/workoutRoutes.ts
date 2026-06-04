import { Router } from 'express';
import {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  getWorkoutStats,
} from '../controllers/workoutController';
import protect from '../middleware/auth';

const router = Router();

// Protect all routes under this router
router.use(protect);

router.post('/', createWorkout);
router.get('/', getWorkouts);
router.get('/stats', getWorkoutStats);
router.get('/:id', getWorkoutById);
router.put('/:id', updateWorkout);
router.delete('/:id', deleteWorkout);

export default router;
