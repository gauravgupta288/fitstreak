import { IExercise } from '../types';

/**
 * Calculates calories burned dynamically based on the exercises, sets, weights, and total duration.
 * Larger muscle groups and higher weight lift loads yield higher calorie estimates.
 * If userWeight is provided, it adjusts bodyweight calorie estimates as well.
 */
export const calculateCaloriesBurned = (
  exercises: IExercise[],
  duration: number,
  userWeight: number = 70
): number => {
  if (!exercises || exercises.length === 0 || duration <= 0) return 0;

  let totalBaseMET = 0;
  let totalSets = 0;

  exercises.forEach((ex) => {
    const muscleGroup = (ex.muscleGroup || '').toLowerCase();
    const setsCount = ex.sets ? ex.sets.length : 0;
    totalSets += setsCount;

    let baseMET = 4.0; // standard default (Chest, Shoulders, etc.)
    if (muscleGroup === 'cardio') {
      baseMET = 7.5;
    } else if (muscleGroup === 'legs' || muscleGroup === 'back' || muscleGroup === 'full body') {
      baseMET = 5.0;
    } else if (muscleGroup === 'arms' || muscleGroup === 'core') {
      baseMET = 3.5;
    }

    // Weight lifted modifier: slightly increase MET if average weight is high
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

  // Average MET weighted by sets count
  const avgMET = totalSets > 0 ? totalBaseMET / totalSets : 4.0;

  // Adjust MET based on Training Density (Sets per Minute)
  // Higher density = shorter rest periods = higher MET
  const setsPerMinute = totalSets / duration;
  
  // Standard density is around 0.5 sets/min (1 set every 2 minutes)
  let densityModifier = setsPerMinute / 0.5;
  densityModifier = Math.max(0.4, Math.min(1.5, densityModifier));

  const sessionMET = avgMET * densityModifier;

  // Apply standard MET formula: Calories = MET * Weight * (Duration / 60)
  const calories = sessionMET * userWeight * (duration / 60);

  return Math.round(calories);
};
