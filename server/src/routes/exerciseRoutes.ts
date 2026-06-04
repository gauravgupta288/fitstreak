import { Router } from 'express';
import { getExercises } from '../controllers/exerciseController';
import protect from '../middleware/auth';

const router = Router();

// Protect all routes
router.use(protect);

router.get('/', getExercises);

export default router;
