import { IExercise } from '../types';

/**
 * Calculates calories burned dynamically based on the exercises, sets, weights, and total duration.
 * Larger muscle groups and higher weight lift loads yield higher calorie estimates.
 * If userWeight is provided, it adjusts bodyweight calorie estimates as well.
 * Cardio exercises use their individual duration if defined.
 */
export const calculateCaloriesBurned = (
  exercises: IExercise[],
  duration: number,
  userWeight: number = 70
): number => {
  if (!exercises || exercises.length === 0 || duration <= 0) return 0;

  let totalCalories = 0;
  let strengthExercises: IExercise[] = [];
  let cardioDuration = 0;

  // 1. Calculate Cardio exercises first
  exercises.forEach((ex) => {
    const muscleGroup = (ex.muscleGroup || '').toLowerCase();
    if (muscleGroup === 'cardio') {
      // Cardio exercises use their individual duration if defined, otherwise we distribute the total duration
      const exDuration = ex.duration && ex.duration > 0 ? ex.duration : (duration / exercises.length);
      cardioDuration += exDuration;
      
      const baseMET = 7.5; // Running/Cycling/Swimming average MET
      const calories = baseMET * userWeight * (exDuration / 60);
      totalCalories += calories;
    } else {
      strengthExercises.push(ex);
    }
  });

  // 2. Calculate Strength exercises if any
  if (strengthExercises.length > 0) {
    const strengthDuration = Math.max(0, duration - cardioDuration);
    // If no strength duration remains because cardio took it all, default to at least a portion of the session
    const activeStrengthDuration = strengthDuration > 0 ? strengthDuration : duration;
    
    let totalBaseMET = 0;
    let totalSets = 0;

    strengthExercises.forEach((ex) => {
      const muscleGroup = (ex.muscleGroup || '').toLowerCase();
      const setsCount = ex.sets ? ex.sets.length : 0;
      totalSets += setsCount;

      let baseMET = 4.0; // Chest, Shoulders, Arms, Core
      if (muscleGroup === 'legs' || muscleGroup === 'back' || muscleGroup === 'full body') {
        baseMET = 5.0;
      }

      // Weight lifted modifier
      if (ex.sets && ex.sets.length > 0) {
        const avgWeight = ex.sets.reduce((sum: number, s: any) => sum + (s.weight || 0), 0) / ex.sets.length;
        if (avgWeight > 80) {
          baseMET += 1.0;
        } else if (avgWeight > 40) {
          baseMET += 0.5;
        }
      }

      totalBaseMET += baseMET * setsCount;
    });

    const avgMET = totalSets > 0 ? totalBaseMET / totalSets : 4.0;
    const setsPerMinute = totalSets / activeStrengthDuration;
    let densityModifier = setsPerMinute / 0.5;
    densityModifier = Math.max(0.4, Math.min(1.5, densityModifier));

    const sessionMET = avgMET * densityModifier;
    const strengthCalories = sessionMET * userWeight * (activeStrengthDuration / 60);
    totalCalories += strengthCalories;
  }

  return Math.max(1, Math.round(totalCalories));
};
