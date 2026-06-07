import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Calendar, Clock, Edit2, Trash2, ChevronDown, ChevronUp, AlertTriangle, Flame } from 'lucide-react';

interface SetDetail {
  reps: number;
  weight: number;
}

interface Exercise {
  name: string;
  muscleGroup: string;
  sets: SetDetail[];
  duration?: number;
  notes?: string;
}

interface Workout {
  _id: string;
  date: string;
  duration: number;
  exercises: Exercise[];
  caloriesBurned?: number;
}

const History: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Grouping helper
  const groupExercises = (exercises: Exercise[]): { [key: string]: Exercise[] } => {
    return exercises.reduce((acc: { [key: string]: Exercise[] }, curr) => {
      const key = curr.muscleGroup || 'Full Body';
      if (!acc[key]) acc[key] = [];
      acc[key].push(curr);
      return acc;
    }, {});
  };
  
  // Deletion modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/workouts');
      setWorkouts(data);
      if (data.length > 0) {
        setExpandedId(data[0]._id); // Expand the latest workout by default
      }
    } catch (err) {
      console.error('Failed to fetch workouts:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await apiRequest(`/api/workouts/${deletingId}`, {
        method: 'DELETE',
      });
      setWorkouts(workouts.filter((w) => w._id !== deletingId));
      setDeletingId(null);
      await refreshUser(); // update user streak if changed
    } catch (err) {
      console.error('Failed to delete workout:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigate(`/edit/${id}`);
  };

  // Helper to format date cleanly
  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-gym-text-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gym-accent border-t-transparent"></div>
          <span className="text-sm text-gym-text-secondary">Loading workout history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-24 max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gym-text-primary">Workout History</h1>
        <p className="text-sm text-gym-text-secondary mt-0.5">
          Review and manage your past training sessions.
        </p>
      </div>

      {workouts.length === 0 ? (
        <div className="bg-gym-card border border-gym-border/40 p-8 rounded-2xl text-center shadow-lg space-y-4">
          <div className="bg-gym-border/30 h-16 w-16 rounded-full flex items-center justify-center mx-auto text-gym-text-secondary">
            <Dumbbell className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg">No Workouts Recorded</h3>
            <p className="text-sm text-gym-text-secondary mt-1">
              You haven't logged any workouts yet. Let's get to work!
            </p>
          </div>
          <button
            onClick={() => navigate('/add')}
            className="w-full py-3 px-4 text-sm font-bold bg-gym-accent text-gym-dark rounded-xl shadow hover:bg-gym-accent/90 transition cursor-pointer"
          >
            Log First Workout
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {workouts.map((workout) => {
            const isExpanded = expandedId === workout._id;
            return (
              <div 
                key={workout._id}
                className={`bg-gym-card border rounded-2xl shadow-lg transition duration-200 overflow-hidden cursor-pointer ${
                  isExpanded ? 'border-gym-accent/40' : 'border-gym-border/40 hover:border-gym-border'
                }`}
                onClick={() => toggleExpand(workout._id)}
              >
                {/* Workout Card Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gym-text-secondary">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(workout.date)}</span>
                    </div>
                    <h3 className="font-extrabold text-gym-text-primary text-base">
                      {workout.exercises.map((e) => e.name).slice(0, 2).join(', ')}
                      {workout.exercises.length > 2 && '...'}
                    </h3>
                    
                    {/* Muscle Groups Badges */}
                    <div className="flex flex-wrap gap-1 mt-1 mb-1">
                      {Array.from(new Set(workout.exercises.map(e => e.muscleGroup || 'Full Body'))).map((mg, mIdx) => (
                        <span key={mIdx} className="text-[9px] bg-gym-border/40 text-gym-text-secondary px-2 py-0.5 rounded-full font-bold border border-gym-border/20">
                          {mg}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3.5 text-xs text-gym-text-secondary">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{workout.duration} mins</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Dumbbell className="h-3.5 w-3.5 text-gym-accent" />
                        <span>{workout.exercises.length} {workout.exercises.length === 1 ? 'exercise' : 'exercises'}</span>
                      </div>
                      {workout.caloriesBurned !== undefined && workout.caloriesBurned > 0 && (
                        <div className="flex items-center gap-0.5 text-gym-orange">
                          <Flame className="h-3.5 w-3.5 fill-gym-orange/20" />
                          <span className="font-bold">{workout.caloriesBurned} kcal</span>
                        </div>
                      )}
                    </div>
                  </div>
 
                   <div className="flex items-center gap-2">
                     {/* Action buttons */}
                     <button
                       onClick={(e) => handleEditClick(e, workout._id)}
                       className="p-1.5 bg-gym-dark/50 border border-gym-border/30 rounded-lg text-gym-text-secondary hover:text-gym-accent hover:border-gym-accent/30 transition"
                     >
                       <Edit2 className="h-4 w-4" />
                     </button>
                     <button
                       onClick={(e) => handleDeleteClick(e, workout._id)}
                       className="p-1.5 bg-gym-dark/50 border border-gym-border/30 rounded-lg text-gym-text-secondary hover:text-rose-500 hover:border-rose-500/30 transition"
                     >
                       <Trash2 className="h-4 w-4" />
                     </button>
                     <div className="text-gym-text-secondary ml-1">
                       {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                     </div>
                   </div>
                 </div>
 
                 {/* Workout Card Expanded Body */}
                 {isExpanded && (
                   <div className="px-4 pb-4 border-t border-gym-border/20 bg-gym-dark/20 space-y-4 pt-4">
                     {Object.entries(groupExercises(workout.exercises)).map(([muscleGroup, groupExs]) => (
                       <div key={muscleGroup} className="space-y-2">
                         {/* Muscle Group Subheader */}
                         <div className="flex items-center gap-2 pt-1 pb-1">
                           <span className="h-1.5 w-1.5 rounded-full bg-gym-accent animate-pulse" />
                           <h4 className="text-[11px] font-black uppercase tracking-wider text-gym-text-secondary">
                             {muscleGroup} ({groupExs.length} {groupExs.length === 1 ? 'exercise' : 'exercises'})
                           </h4>
                         </div>
 
                         {/* List of exercises in this muscle group */}
                         <div className="space-y-3">
                           {groupExs.map((exercise, idx) => (
                             <div 
                               key={idx}
                               className="bg-gym-card/65 border border-gym-border/20 p-3.5 rounded-xl space-y-1.5"
                             >
                               <div className="flex items-center justify-between">
                                 <h5 className="font-bold text-sm text-gym-text-primary">
                                   {exercise.name}
                                 </h5>
                               </div>
                               
                                {exercise.muscleGroup?.toLowerCase() === 'cardio' ? (
                                  <div className="text-xs bg-gym-accent/10 p-1.5 px-3 rounded-lg border border-gym-accent/20 flex justify-between items-center mt-2">
                                    <span className="text-gym-text-secondary font-semibold">⏱️ Duration</span>
                                    <span className="text-gym-accent font-extrabold">{exercise.duration || 15} minutes</span>
                                  </div>
                                ) : (
                                  <div className="space-y-1.5 mt-2">
                                    {exercise.sets && exercise.sets.map((set, sIdx) => (
                                      <div key={sIdx} className="flex justify-between items-center text-xs bg-gym-dark/35 p-1.5 px-3 rounded-lg border border-gym-border/10">
                                        <span className="text-gym-text-secondary font-semibold">Set {sIdx + 1}</span>
                                        <span className="text-gym-text-primary font-bold">{set.reps} reps</span>
                                        <span className="text-gym-accent font-extrabold">{set.weight} kg</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
 
                               {exercise.notes && (
                                 <div className="text-[11px] text-gym-text-secondary italic border-t border-gym-border/10 pt-1.5 mt-1">
                                   Notes: {exercise.notes}
                                 </div>
                               )}
                             </div>
                           ))}
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gym-dark/75 backdrop-blur-sm">
          <div className="bg-gym-card border border-gym-border/60 p-6 rounded-2xl w-full max-w-xs shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="font-extrabold text-base">Delete Workout?</h3>
            </div>
            <p className="text-xs text-gym-text-secondary leading-relaxed">
              Are you sure you want to permanently delete this workout session? Your active streaks and level stats might be impacted.
            </p>
            <div className="flex items-center gap-3.5 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 px-3 bg-gym-border text-gym-text-primary text-xs font-bold rounded-lg border border-gym-border hover:bg-gym-border/80 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2 px-3 bg-rose-500 text-gym-dark text-xs font-bold rounded-lg hover:bg-rose-600 transition flex items-center justify-center"
              >
                {isDeleting ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-gym-dark border-t-transparent"></div> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
