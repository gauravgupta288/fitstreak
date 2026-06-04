import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Calendar as CalendarIcon, Trophy, TrendingUp, ChevronLeft, ChevronRight, BarChart2, Flame } from 'lucide-react';

interface PRDetail {
  maxWeight: number;
  maxReps: number;
  muscleGroup: string;
}

interface ExerciseHistoryPoint {
  date: string;
  weight: number;
  reps: number;
}

interface StatsData {
  totalWorkouts: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  calendarDays: string[]; // YYYY-MM-DD
  prs: { [key: string]: PRDetail };
  exerciseHistory: { [key: string]: ExerciseHistoryPoint[] };
  totalCaloriesBurned?: number;
  caloriesThisWeek?: number;
  caloriesThisMonth?: number;
  caloriesHistory?: Array<{ date: string; calories: number }>;
}

const Progress: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  
  // Calendar states
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/workouts/stats');
      setStats(data);
      
      // Select first exercise by default if available
      const exercises = Object.keys(data.exerciseHistory);
      if (exercises.length > 0) {
        setSelectedExercise(exercises[0]);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get calendar days array
  const getDaysInMonth = () => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    // Adjust index to start with Monday (Monday = 0, Sunday = 6)
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Empty padding slots for days of previous month
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    
    return days;
  };

  const isWorkoutDay = (dayNum: number) => {
    if (!stats) return false;
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(dayNum).padStart(2, '0');
    const checkDateStr = `${year}-${formattedMonth}-${formattedDay}`;
    return stats.calendarDays.includes(checkDateStr);
  };

  const chartData = stats && selectedExercise && stats.exerciseHistory[selectedExercise]
    ? stats.exerciseHistory[selectedExercise].map(pt => ({
        date: new Date(pt.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: pt.weight,
        reps: pt.reps
      }))
    : [];

  const calorieChartData = stats && stats.caloriesHistory
    ? stats.caloriesHistory.map(pt => ({
        date: new Date(pt.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        calories: pt.calories
      }))
    : [];

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-gym-text-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gym-accent border-t-transparent"></div>
          <span className="text-sm text-gym-text-secondary">Loading statistics...</span>
        </div>
      </div>
    );
  }

  const calendarDaysList = getDaysInMonth();
  const exerciseNames = stats ? Object.keys(stats.exerciseHistory) : [];

  return (
    <div className="px-4 py-6 pb-24 max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gym-text-primary">Analytics & Progress</h1>
        <p className="text-sm text-gym-text-secondary mt-0.5">
          Visualize your workout consistency and strength gains.
        </p>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-3 gap-3 bg-gym-card border border-gym-border/40 p-4 rounded-2xl shadow-lg">
        <div className="text-center">
          <span className="text-[10px] text-gym-text-secondary font-bold uppercase tracking-wider block">Total Logs</span>
          <span className="text-2xl font-extrabold text-gym-accent mt-1 block">{stats?.totalWorkouts || 0}</span>
        </div>
        <div className="text-center border-x border-gym-border/30 px-1">
          <span className="text-[10px] text-gym-text-secondary font-bold uppercase tracking-wider block">This Month</span>
          <span className="text-2xl font-extrabold text-gym-blue mt-1 block">{stats?.workoutsThisMonth || 0}</span>
        </div>
        <div className="text-center">
          <span className="text-[10px] text-gym-text-secondary font-bold uppercase tracking-wider block">This Week</span>
          <span className="text-2xl font-extrabold text-gym-purple mt-1 block">{stats?.workoutsThisWeek || 0}</span>
        </div>
      </div>
 
      {/* Calorie Stats Summary Panel */}
      {stats && stats.totalCaloriesBurned !== undefined && stats.totalCaloriesBurned > 0 && (
        <div className="grid grid-cols-3 gap-3 bg-gym-card border border-gym-border/40 p-4 rounded-2xl shadow-lg">
          <div className="text-center">
            <span className="text-[10px] text-gym-text-secondary font-bold uppercase tracking-wider block">Total Burn</span>
            <span className="text-xl font-extrabold text-gym-orange mt-1 block">
              {stats.totalCaloriesBurned} <span className="text-[9px] font-normal text-gym-text-secondary">kcal</span>
            </span>
          </div>
          <div className="text-center border-x border-gym-border/30 px-1">
            <span className="text-[10px] text-gym-text-secondary font-bold uppercase tracking-wider block">This Month</span>
            <span className="text-xl font-extrabold text-gym-orange mt-1 block">
              {stats.caloriesThisMonth || 0} <span className="text-[9px] font-normal text-gym-text-secondary">kcal</span>
            </span>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-gym-text-secondary font-bold uppercase tracking-wider block">This Week</span>
            <span className="text-xl font-extrabold text-gym-orange mt-1 block">
              {stats.caloriesThisWeek || 0} <span className="text-[9px] font-normal text-gym-text-secondary">kcal</span>
            </span>
          </div>
        </div>
      )}

      {/* Calendar Card */}
      <div className="bg-gym-card border border-gym-border/40 p-4 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="h-4.5 w-4.5 text-gym-accent" />
            <span className="text-xs font-bold uppercase tracking-wider text-gym-text-secondary">Consistency Calendar</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrevMonth}
              className="text-gym-text-secondary hover:text-gym-text-primary p-1 bg-gym-dark rounded-lg border border-gym-border/30 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-extrabold text-gym-text-primary min-w-[75px] text-center">
              {monthNames[month]} {year}
            </span>
            <button 
              onClick={handleNextMonth}
              className="text-gym-text-secondary hover:text-gym-text-primary p-1 bg-gym-dark rounded-lg border border-gym-border/30 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gym-text-secondary uppercase mb-2">
          <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {calendarDaysList.map((dayNum, index) => {
            if (dayNum === null) {
              return <div key={index} className="h-8"></div>;
            }

            const active = isWorkoutDay(dayNum);

            return (
              <div
                key={index}
                className={`h-8 rounded-lg flex items-center justify-center font-semibold transition ${
                  active
                    ? 'bg-gym-accent/20 border-2 border-gym-accent text-gym-accent shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'bg-gym-dark/50 text-gym-text-secondary border border-gym-border/10'
                }`}
              >
                {dayNum}
              </div>
            );
          })}
        </div>
      </div>

      {/* Calorie Burn Trend Card */}
      {stats && stats.caloriesHistory && stats.caloriesHistory.length > 0 && (
        <div className="bg-gym-card border border-gym-border/40 p-4 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Flame className="h-4.5 w-4.5 text-gym-orange fill-gym-orange/10" />
              <span className="text-xs font-bold uppercase tracking-wider text-gym-text-secondary">Calorie Burn Consistency</span>
            </div>
            <span className="text-xs text-gym-orange font-bold uppercase tracking-wider">Active Trend</span>
          </div>

          {calorieChartData.length < 2 ? (
            <div className="h-40 flex flex-col items-center justify-center text-gym-text-secondary border border-dashed border-gym-border rounded-xl px-4 text-center">
              <Flame className="h-8 w-8 opacity-45 text-gym-orange mb-2 animate-pulse" />
              <span className="text-xs">Log at least 2 workouts to show calorie burn trend.</span>
            </div>
          ) : (
            <div className="h-40 w-full mt-2 pr-2 text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={calorieChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#131c2e', borderColor: '#1e293b', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="calories" 
                    stroke="#f97316" 
                    strokeWidth={2.5}
                    dot={{ r: 4, stroke: '#f97316', strokeWidth: 1, fill: '#131c2e' }}
                    name="Calories (kcal)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Charts Card */}
      <div className="bg-gym-card border border-gym-border/40 p-4 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4.5 w-4.5 text-gym-blue" />
            <span className="text-xs font-bold uppercase tracking-wider text-gym-text-secondary">Exercise Volume Progress</span>
          </div>
          
          {exerciseNames.length > 0 && (
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="bg-gym-dark border border-gym-border/50 text-gym-text-primary px-2.5 py-1 rounded-xl text-xs focus:outline-none focus:border-gym-blue"
            >
              {exerciseNames.map((name, idx) => (
                <option key={idx} value={name}>{name}</option>
              ))}
            </select>
          )}
        </div>

        {exerciseNames.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-gym-text-secondary border border-dashed border-gym-border rounded-xl">
            <BarChart2 className="h-8 w-8 opacity-45 mb-2" />
            <span className="text-xs">Log workouts to generate progress charts.</span>
          </div>
        ) : chartData.length < 2 ? (
          <div className="h-48 flex flex-col items-center justify-center text-gym-text-secondary border border-dashed border-gym-border rounded-xl px-4 text-center">
            <TrendingUp className="h-8 w-8 opacity-45 mb-2" />
            <span className="text-xs">Need at least 2 workouts for "{selectedExercise}" to show progress chart.</span>
          </div>
        ) : (
          <div className="h-48 w-full mt-2 pr-2 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#131c2e', borderColor: '#1e293b', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5}
                  dot={{ r: 4, stroke: '#3b82f6', strokeWidth: 1, fill: '#131c2e' }}
                  name="Weight (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Personal Records Cards */}
      <div className="bg-gym-card border border-gym-border/40 p-4 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center gap-1.5">
          <Trophy className="h-4.5 w-4.5 text-gym-orange" />
          <span className="text-xs font-bold uppercase tracking-wider text-gym-text-secondary">Personal Records (PRs)</span>
        </div>

        {stats && Object.keys(stats.prs).length === 0 ? (
          <div className="text-center text-xs text-gym-text-secondary py-3">
            No exercises recorded yet. PRs will list here automatically.
          </div>
        ) : (
          <div className="space-y-3">
            {stats && Object.entries(stats.prs).map(([name, record], index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-gym-dark/40 border border-gym-border/20 rounded-xl"
              >
                <div>
                  <h4 className="font-extrabold text-sm text-gym-text-primary capitalize">{name}</h4>
                  <span className="text-[10px] text-gym-text-secondary font-medium">{record.muscleGroup}</span>
                </div>
                
                <div className="text-right space-y-0.5">
                  <div className="text-xs font-black text-gym-accent">
                    {record.maxWeight} kg
                  </div>
                  <div className="text-[10px] text-gym-text-secondary font-bold">
                    {record.maxReps} reps max
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;
