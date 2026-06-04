"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemDateString = exports.isStreakBroken = exports.getDaysDifference = exports.parseLocalDate = void 0;
/**
 * Helper to parse YYYY-MM-DD to a local Date object (ignoring timezone issues)
 */
const parseLocalDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    // month is 0-indexed in JS Date
    return new Date(year, month - 1, day);
};
exports.parseLocalDate = parseLocalDate;
/**
 * Returns the difference in days between two YYYY-MM-DD date strings (d2 - d1)
 */
const getDaysDifference = (d1Str, d2Str) => {
    if (!d1Str || !d2Str)
        return 0;
    const d1 = (0, exports.parseLocalDate)(d1Str);
    const d2 = (0, exports.parseLocalDate)(d2Str);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};
exports.getDaysDifference = getDaysDifference;
/**
 * Check if the workout streak is broken.
 * Streak is broken if the client's current date is more than 1 day after the last workout date.
 */
const isStreakBroken = (todayStr, lastWorkoutStr) => {
    if (!lastWorkoutStr)
        return false;
    const diff = (0, exports.getDaysDifference)(lastWorkoutStr, todayStr);
    return diff > 1;
};
exports.isStreakBroken = isStreakBroken;
/**
 * Returns today's date in YYYY-MM-DD format based on system/timezone context
 */
const getSystemDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
exports.getSystemDateString = getSystemDateString;
