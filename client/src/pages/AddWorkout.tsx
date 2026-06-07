import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiRequest, getLocalDateString } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Save, ArrowLeft, AlertCircle, Sparkles, Minus } from 'lucide-react';

interface PredefinedExercise {
  _id: string;
  name: string;
  muscleGroup: string;
}

interface FormSet {
  reps: number;
  weight: number;
}

interface FormExercise {
  name: string;
  muscleGroup: string;
  sets: FormSet[];
  duration?: number;
  notes?: string;
  isCustom?: boolean;
  customName?: string;
}

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body'];

// Generate standard options for reps dropdown (e.g. 1 to 50 reps)
const REP_OPTIONS = Array.from({ length: 50 }, (_, i) => i + 1);

const AddWorkout: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [date, setDate] = useState(getLocalDateString());
  const [duration, setDuration] = useState<number>(45);
  const [caloriesBurned, setCaloriesBurned] = useState<number>(300);
  const [exercises, setExercises] = useState<FormExercise[]>([
    { name: '', muscleGroup: 'Chest', sets: [{ reps: 10, weight: 0 }], notes: '', isCustom: false, customName: '' }
  ]);
  
  const [exerciseLibrary, setExerciseLibrary] = useState<PredefinedExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditMode);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const library = await fetchExerciseLibrary();
      if (isEditMode) {
        await fetchWorkoutToEdit(library);
      }
    };
    initialize();
  }, [id]);

  // Dynamically calculate calories burned in real-time
  useEffect(() => {
    const calculateCalories = () => {
      if (!exercises || exercises.length === 0 || duration <= 0) {
        setCaloriesBurned(0);
        return;
      }

      const userWeight = user?.weight || 70;
      let totalCalories = 0;
      let strengthExercises: FormExercise[] = [];
      let cardioDuration = 0;

      // 1. Calculate Cardio exercises first
      exercises.forEach((ex) => {
        const muscleGroup = (ex.muscleGroup || '').toLowerCase();
        if (muscleGroup === 'cardio') {
          const exDuration = ex.duration && ex.duration > 0 ? ex.duration : (duration / exercises.length);
          cardioDuration += exDuration;
          
          const baseMET = 7.5; // Running/Cycling/Swimming MET
          const calories = baseMET * userWeight * (exDuration / 60);
          totalCalories += calories;
        } else {
          strengthExercises.push(ex);
        }
      });

      // 2. Calculate Strength exercises if any
      if (strengthExercises.length > 0) {
        const strengthDuration = Math.max(0, duration - cardioDuration);
        const activeStrengthDuration = strengthDuration > 0 ? strengthDuration : duration;
        
        let totalBaseMET = 0;
        let totalSets = 0;

        strengthExercises.forEach((ex) => {
          const muscleGroup = (ex.muscleGroup || '').toLowerCase();
          const setsCount = ex.sets ? ex.sets.length : 0;
          totalSets += setsCount;

          let baseMET = 4.0;
          if (muscleGroup === 'legs' || muscleGroup === 'back' || muscleGroup === 'full body') {
            baseMET = 5.0;
          }

          // Weight lifted modifier
          if (ex.sets && ex.sets.length > 0) {
            const avgWeight = ex.sets.reduce((sum, s) => sum + (Number(s.weight) || 0), 0) / ex.sets.length;
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

      setCaloriesBurned(Math.max(1, Math.round(totalCalories)));
    };

    calculateCalories();
  }, [exercises, duration, user]);

  const fetchExerciseLibrary = async () => {
    try {
      const data = await apiRequest('/api/exercises');
      setExerciseLibrary(data);
      
      // Auto-select the first exercise for any blank exercise slots on initial load
      if (data.length > 0) {
        setExercises(prev => 
          prev.map(ex => {
            if (ex.name === '') {
              return {
                ...ex,
                name: data[0].name,
                muscleGroup: data[0].muscleGroup
              };
            }
            return ex;
          })
        );
      }
      return data;
    } catch (err) {
      console.error('Failed to fetch exercise library:', err);
      return [];
    }
  };

  const fetchWorkoutToEdit = async (currentLibrary: PredefinedExercise[] = exerciseLibrary) => {
    try {
      setFetchingData(true);
      const workout = await apiRequest(`/api/workouts/${id}`);
      setDate(workout.date);
      setDuration(workout.duration);
      setCaloriesBurned(workout.caloriesBurned || 0);
      
      // Map server exercises to form state
      const mappedExercises = workout.exercises.map((ex: any) => {
        // Check if exercise name exists in the library
        const libToSearch = currentLibrary.length > 0 ? currentLibrary : exerciseLibrary;
        const inLibrary = libToSearch.some(lib => lib.name.toLowerCase() === ex.name.toLowerCase());
        return {
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          sets: ex.sets.map((s: any) => ({ reps: s.reps, weight: s.weight })),
          notes: ex.notes || '',
          isCustom: !inLibrary && ex.name !== '',
          customName: !inLibrary ? ex.name : ''
        };
      });
      setExercises(mappedExercises);
    } catch (err: any) {
      console.error('Failed to load workout details:', err);
      setError('Could not load workout details.');
    } finally {
      setFetchingData(false);
    }
  };

  const handleAddExerciseField = () => {
    setExercises([
      ...exercises,
      { name: '', muscleGroup: 'Chest', sets: [{ reps: 10, weight: 0 }], notes: '', isCustom: false, customName: '' }
    ]);
  };

  const handleRemoveExerciseField = (index: number) => {
    if (exercises.length === 1) {
      setError('A workout must have at least one exercise.');
      return;
    }
    const updated = [...exercises];
    updated.splice(index, 1);
    setExercises(updated);
  };

  const handleExerciseChange = (index: number, field: keyof FormExercise, value: any) => {
    setError('');
    const updated = [...exercises];
    
    if (field === 'name') {
      if (value === 'custom_exercise') {
        updated[index].isCustom = true;
        updated[index].name = '';
      } else {
        updated[index].isCustom = false;
        updated[index].name = value;
        const matched = exerciseLibrary.find(e => e.name === value);
        if (matched) {
          updated[index].muscleGroup = matched.muscleGroup;
        }
      }
    } else if (field === 'muscleGroup') {
      updated[index].muscleGroup = value;
      const isCardio = value.toLowerCase() === 'cardio';
      if (isCardio) {
        updated[index].sets = [];
        updated[index].duration = 15;
      } else {
        updated[index].sets = [{ reps: 10, weight: 0 }];
        updated[index].duration = 0;
      }
      
      // Auto-populate the name with the first matching exercise of the new muscle group
      const matched = exerciseLibrary.find(e => e.muscleGroup.toLowerCase() === value.toLowerCase());
      if (matched) {
        updated[index].name = matched.name;
        updated[index].isCustom = false;
      } else {
        updated[index].isCustom = true;
        updated[index].name = '';
        updated[index].customName = '';
      }
    } else if (field === 'customName') {
      updated[index].customName = value;
      updated[index].name = value;
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value
      };
    }
    
    setExercises(updated);
  };

  // Set-level helpers
  const handleAddSet = (exIndex: number) => {
    const updated = [...exercises];
    const currentSets = updated[exIndex].sets;
    // Copy last set values for nice UX if possible
    const lastSet = currentSets[currentSets.length - 1] || { reps: 10, weight: 0 };
    updated[exIndex].sets = [
      ...currentSets,
      { reps: lastSet.reps, weight: lastSet.weight }
    ];
    setExercises(updated);
  };

  const handleRemoveSet = (exIndex: number, setIndex: number) => {
    const updated = [...exercises];
    if (updated[exIndex].sets.length === 1) {
      setError('An exercise must have at least one set.');
      return;
    }
    const currentSets = [...updated[exIndex].sets];
    currentSets.splice(setIndex, 1);
    updated[exIndex].sets = currentSets;
    setExercises(updated);
  };

  const handleSetChange = (exIndex: number, setIndex: number, field: keyof FormSet, value: number) => {
    const updated = [...exercises];
    const currentSets = [...updated[exIndex].sets];
    currentSets[setIndex] = {
      ...currentSets[setIndex],
      [field]: value
    };
    updated[exIndex].sets = currentSets;
    setExercises(updated);
  };

  const adjustWeight = (exIndex: number, setIndex: number, amount: number) => {
    const updated = [...exercises];
    const currentSets = [...updated[exIndex].sets];
    const currentWeight = currentSets[setIndex].weight;
    const newWeight = Math.max(0, currentWeight + amount);
    currentSets[setIndex] = {
      ...currentSets[setIndex],
      weight: newWeight
    };
    updated[exIndex].sets = currentSets;
    setExercises(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Basic Validation
    if (!date) {
      setError('Please select a date.');
      return;
    }
    if (duration <= 0) {
      setError('Duration must be greater than 0.');
      return;
    }
    
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      const nameToSubmit = ex.isCustom ? ex.customName?.trim() : ex.name.trim();
      if (!nameToSubmit) {
        setError(`Exercise #${i + 1} needs a name.`);
        return;
      }
      
      const isCardio = ex.muscleGroup.toLowerCase() === 'cardio';
      if (!isCardio) {
        for (let j = 0; j < ex.sets.length; j++) {
          const s = ex.sets[j];
          if (s.reps <= 0 || s.weight < 0) {
            setError(`Exercise #${i + 1}, Set #${j + 1} values cannot be negative or zero (reps).`);
            return;
          }
        }
      } else {
        if (!ex.duration || ex.duration <= 0) {
          setError(`Exercise #${i + 1} must have a valid duration.`);
          return;
        }
      }
    }

    setLoading(true);
    // Prepare payload
    const payloadExercises = exercises.map(ex => {
      const isCardio = ex.muscleGroup.toLowerCase() === 'cardio';
      return {
        name: ex.isCustom ? ex.customName?.trim() : ex.name.trim(),
        muscleGroup: ex.muscleGroup,
        sets: isCardio ? [] : ex.sets.map(s => ({ reps: s.reps, weight: s.weight })),
        duration: isCardio ? (ex.duration || 15) : 0,
        notes: ex.notes || ''
      };
    });

    try {
      if (isEditMode) {
        await apiRequest(`/api/workouts/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ date, duration, exercises: payloadExercises, caloriesBurned }),
        });
      } else {
        await apiRequest('/api/workouts', {
          method: 'POST',
          body: JSON.stringify({ date, duration, exercises: payloadExercises, caloriesBurned }),
        });
      }
      
      await refreshUser(); // Update user level/streak instantly
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/history');
      }, 1000);
    } catch (err: any) {
      console.error('Submit workout error:', err);
      setError(err.message || 'Failed to save workout.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-gym-text-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gym-accent border-t-transparent"></div>
          <span className="text-sm text-gym-text-secondary">Loading workout details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-24 max-w-md mx-auto space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => navigate(-1)}
          className="text-gym-text-secondary hover:text-gym-text-primary transition p-1 bg-gym-card rounded-lg border border-gym-border/30"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-extrabold text-gym-text-primary">
          {isEditMode ? 'Edit Workout' : 'Log Workout'}
        </h1>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-xl text-rose-500 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-gym-accent/15 border border-gym-accent/30 p-3.5 rounded-xl text-gym-accent text-sm">
          <Sparkles className="h-5 w-5 shrink-0" />
          <span>Workout saved successfully! Updating streaks...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Workout Meta Card */}
        <div className="bg-gym-card border border-gym-border/40 p-4 rounded-2xl shadow-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gym-text-secondary tracking-wider mb-1.5 flex items-center gap-1">
                <span>Workout Date</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full px-3 py-2 bg-gym-dark border border-gym-border/50 rounded-xl text-gym-text-primary focus:outline-none focus:border-gym-accent text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gym-text-secondary tracking-wider mb-1.5 flex items-center gap-1">
                <span>Duration (mins)</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="block w-full px-3 py-2 bg-gym-dark border border-gym-border/50 rounded-xl text-gym-text-primary focus:outline-none focus:border-gym-accent text-sm"
              />
            </div>
          </div>
          <div className="border-t border-gym-border/20 pt-3.5">
            <label className="block text-xs font-semibold text-gym-text-secondary tracking-wider mb-1.5 flex items-center gap-1.5">
              <span className="text-gym-orange">🔥</span>
              <span>Calories Burned (kcal)</span>
            </label>
            <input
              type="number"
              readOnly
              value={caloriesBurned}
              className="block w-full px-3 py-2 bg-gym-dark/40 border border-gym-border/40 rounded-xl text-gym-orange focus:outline-none text-sm font-extrabold cursor-not-allowed opacity-90"
              placeholder="0"
            />
            <p className="text-[10px] text-gym-text-secondary mt-1 flex items-center gap-1">
              <span>⚡ Calculated dynamically based on exercises, sets, weights & duration.</span>
            </p>
          </div>
        </div>

        {/* Exercises Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gym-text-secondary">Exercises</span>
            <button
              type="button"
              onClick={handleAddExerciseField}
              className="text-xs font-bold text-gym-accent flex items-center gap-1 bg-gym-accent/10 border border-gym-accent/30 px-2.5 py-1 rounded-full hover:bg-gym-accent/20 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Exercise</span>
            </button>
          </div>

          {exercises.map((exercise, index) => (
            <div 
              key={index}
              className="bg-gym-card border border-gym-border/40 p-4 rounded-2xl shadow-lg relative space-y-3.5 animate-fadeIn"
            >
              {/* Card Header */}
              <div className="flex justify-between items-center pb-2 border-b border-gym-border/20">
                <span className="text-xs font-bold text-gym-accent bg-gym-accent/10 px-2 py-0.5 rounded-md">
                  Exercise #{index + 1}
                </span>
                {exercises.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveExerciseField(index)}
                    className="text-rose-500 hover:text-rose-400 p-1 hover:bg-rose-500/10 rounded-lg transition"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                )}
              </div>

              {/* Muscle Group Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-gym-text-secondary uppercase mb-1">
                  Muscle Group
                </label>
                <select
                  value={exercise.muscleGroup}
                  onChange={(e) => handleExerciseChange(index, 'muscleGroup', e.target.value)}
                  className="block w-full px-3 py-2 bg-gym-dark border border-gym-border/50 rounded-xl text-gym-text-primary focus:outline-none focus:border-gym-accent text-sm"
                >
                  {MUSCLE_GROUPS.map((group, key) => (
                    <option key={key} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              {/* Exercise Selection Dropdown (Filtered by selected muscle group) */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-gym-text-secondary uppercase">
                  Select Exercise
                </label>
                <select
                  value={exercise.isCustom ? 'custom_exercise' : exercise.name}
                  onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                  className="block w-full px-3 py-2 bg-gym-dark border border-gym-border/50 rounded-xl text-gym-text-primary focus:outline-none focus:border-gym-accent text-sm"
                >
                  <option value="" disabled>-- Select Exercise --</option>
                  {exerciseLibrary
                    .filter(lib => lib.muscleGroup.toLowerCase() === exercise.muscleGroup.toLowerCase())
                    .map((lib) => (
                      <option key={lib._id} value={lib.name}>{lib.name}</option>
                    ))
                  }
                  <option value="custom_exercise">✍️ Add Custom Exercise...</option>
                </select>
              </div>

              {/* Custom Exercise Name Input (Only if Custom is selected) */}
              {exercise.isCustom && (
                <div className="space-y-1 animate-fadeIn">
                  <label className="block text-[11px] font-semibold text-gym-text-secondary uppercase">
                    Custom Exercise Name
                  </label>
                  <input
                    type="text"
                    required
                    value={exercise.customName || ''}
                    onChange={(e) => handleExerciseChange(index, 'customName', e.target.value)}
                    className="block w-full px-3 py-2 bg-gym-dark border border-gym-border/50 rounded-xl text-gym-text-primary focus:outline-none focus:border-gym-accent text-sm"
                    placeholder="e.g. Incline DB Flyes"
                  />
                </div>
              )}

              {exercise.muscleGroup.toLowerCase() === 'cardio' ? (
                // Cardio Duration Input
                <div className="space-y-1.5 border-t border-gym-border/20 pt-3.5 animate-fadeIn">
                  <label className="block text-[11px] font-semibold text-gym-text-secondary uppercase">
                    Cardio Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={exercise.duration || 15}
                    onChange={(e) => handleExerciseChange(index, 'duration', Number(e.target.value))}
                    className="block w-full px-3 py-2 bg-gym-dark border border-gym-border/50 rounded-xl text-gym-text-primary focus:outline-none focus:border-gym-accent text-sm font-bold"
                    placeholder="e.g. 30"
                  />
                </div>
              ) : (
                // Sets Log Table/List
                <div className="space-y-2 border-t border-gym-border/20 pt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-bold text-gym-text-secondary uppercase tracking-wider">Sets & Reps</span>
                    <button
                      type="button"
                      onClick={() => handleAddSet(index)}
                      className="text-[10px] text-gym-accent bg-gym-accent/10 px-2 py-0.5 rounded border border-gym-accent/30 font-bold hover:bg-gym-accent/20 transition"
                    >
                      + Add Set
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {exercise.sets.map((set, setIdx) => (
                      <div key={setIdx} className="grid grid-cols-12 gap-2 items-center bg-gym-dark/30 p-2 rounded-xl border border-gym-border/10">
                        {/* Set label */}
                        <div className="col-span-2 text-xs font-bold text-gym-text-secondary text-center">
                          S{setIdx + 1}
                        </div>

                        {/* Reps Dropdown */}
                        <div className="col-span-4 flex flex-col gap-0.5">
                          <select
                            value={set.reps}
                            onChange={(e) => handleSetChange(index, setIdx, 'reps', Number(e.target.value))}
                            className="w-full bg-gym-dark border border-gym-border/50 text-gym-text-primary rounded-lg p-1.5 text-xs focus:outline-none focus:border-gym-accent"
                          >
                            {REP_OPTIONS.map((val) => (
                              <option key={val} value={val}>{val} reps</option>
                            ))}
                          </select>
                        </div>

                        {/* Weight Selector */}
                        <div className="col-span-5 flex items-center justify-between bg-gym-dark border border-gym-border/50 rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => adjustWeight(index, setIdx, -2.5)}
                            className="px-1.5 py-1 text-gym-text-secondary hover:text-rose-500 hover:bg-gym-card transition"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            required
                            value={set.weight}
                            onChange={(e) => handleSetChange(index, setIdx, 'weight', Number(e.target.value))}
                            className="w-full bg-transparent text-center text-xs text-gym-text-primary focus:outline-none font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => adjustWeight(index, setIdx, 2.5)}
                            className="px-1.5 py-1 text-gym-text-secondary hover:text-gym-accent hover:bg-gym-card transition"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Remove Set Button */}
                        <div className="col-span-1 text-right">
                          {exercise.sets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSet(index, setIdx)}
                              className="text-rose-500 hover:text-rose-400 p-1 hover:bg-rose-500/10 rounded transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes Input */}
              <div>
                <label className="block text-[11px] font-semibold text-gym-text-secondary uppercase mb-1">
                  Notes / Focus
                </label>
                <input
                  type="text"
                  value={exercise.notes || ''}
                  onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                  className="block w-full px-3 py-2 bg-gym-dark border border-gym-border/50 rounded-xl text-gym-text-primary focus:outline-none focus:border-gym-accent text-sm"
                  placeholder="e.g. Keep chest high, slow eccentric"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-extrabold rounded-xl text-gym-dark bg-gym-accent hover:bg-gym-accent/95 shadow-lg items-center gap-2 cursor-pointer transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gym-dark border-t-transparent"></div>
          ) : (
            <>
              <Save className="h-4.5 w-4.5" />
              <span>{isEditMode ? 'Update Workout' : 'Log Workout Completed'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddWorkout;
