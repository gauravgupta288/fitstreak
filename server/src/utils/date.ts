/**
 * Helper to parse YYYY-MM-DD to a local Date object (ignoring timezone issues)
 */
export const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  // month is 0-indexed in JS Date
  return new Date(year, month - 1, day);
};

/**
 * Returns the difference in days between two YYYY-MM-DD date strings (d2 - d1)
 */
export const getDaysDifference = (d1Str: string, d2Str: string): number => {
  if (!d1Str || !d2Str) return 0;
  
  const d1 = parseLocalDate(d1Str);
  const d2 = parseLocalDate(d2Str);
  
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Check if the workout streak is broken.
 * Streak is broken if the client's current date is more than 1 day after the last workout date.
 */
export const isStreakBroken = (todayStr: string, lastWorkoutStr: string): boolean => {
  if (!lastWorkoutStr) return false;
  const diff = getDaysDifference(lastWorkoutStr, todayStr);
  return diff > 1;
};

/**
 * Returns today's date in YYYY-MM-DD format based on system/timezone context
 */
export const getSystemDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
