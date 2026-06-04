import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';
import { getRandomQuote, Quote } from '../utils/quotes';
import { Flame, Trophy, Calendar, CheckCircle2, ChevronRight, Target, Quote as QuoteIcon } from 'lucide-react';

interface WeeklyStatusItem {
  day: string;
  date: string;
  completed: boolean;
}

interface DashboardStats {
  totalWorkouts: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  completedToday: boolean;
  weeklyStatus: WeeklyStatusItem[];
  totalCaloriesBurned?: number;
  caloriesThisWeek?: number;
  caloriesThisMonth?: number;
}

const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    setQuote(getRandomQuote());
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await refreshUser(); // refresh user streak & level
      const data = await apiRequest('/api/workouts/stats');
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError('Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  // Determine current streak achievements
  const getStreakAchievement = (streak: number) => {
    if (streak >= 100) return { title: 'Ascended Titan', msg: '100 days logged! You are in the top 0.1% of athletes.', badge: '🏆' };
    if (streak >= 60) return { title: 'Legendary Consistency', msg: '60 days! Your habits are built of solid iron.', badge: '👑' };
    if (streak >= 30) return { title: 'Streak Master', msg: '30 days! A full month of dedication. Exceptional!', badge: '🌟' };
    if (streak >= 14) return { title: 'Fortnight Champion', msg: '14 days! Halfway to a month of non-stop momentum.', badge: '🛡️' };
    if (streak >= 7) return { title: 'Week Warrior', msg: '7 days! A full week of pushing your limits.', badge: '⚡' };
    if (streak >= 3) return { title: 'Streak Starter', msg: '3-day heat! You are building momentum. Keep it up!', badge: '🔥' };
    return null;
  };

  const achievement = user ? getStreakAchievement(user.currentStreak) : null;

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-gym-text-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gym-accent border-t-transparent"></div>
          <span className="text-sm text-gym-text-secondary">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 pb-24 max-w-md mx-auto">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-xl text-rose-500 text-sm">
          {error}
        </div>
      )}
      {/* Header Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gym-text-primary">
            Hey, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gym-text-secondary mt-0.5">
            Level {user?.level} Gym Tracker
          </p>
        </div>
        
        {/* XP Progress Indicator */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs font-semibold text-gym-text-secondary">
            {user ? `${user.xp % 500} / 500 XP` : ''}
          </span>
          <div className="w-24 bg-gym-border h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gym-accent h-full rounded-full transition-all duration-500"
              style={{ width: `${user ? ((user.xp % 500) / 500) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Today's Status Banner */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
        stats?.completedToday 
          ? 'bg-gym-accent/10 border-gym-accent/30' 
          : 'bg-gym-orange/10 border-gym-orange/30'
      }`}>
        <div className="flex items-center gap-3">
          {stats?.completedToday ? (
            <div className="bg-gym-accent/20 p-2.5 rounded-xl text-gym-accent">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          ) : (
            <div className="bg-gym-orange/20 p-2.5 rounded-xl text-gym-orange animate-pulse">
              <Target className="h-6 w-6" />
            </div>
          )}
          <div>
            <h3 className="font-bold text-sm">
              {stats?.completedToday ? "Today's Workout Complete" : "Log Today's Workout"}
            </h3>
            <p className="text-xs text-gym-text-secondary mt-0.5">
              {stats?.completedToday 
                ? "Awesome work keeping your streak burning!" 
                : "Log a workout now to keep your streak going."}
            </p>
          </div>
        </div>

        {!stats?.completedToday && (
          <button 
            onClick={() => navigate('/add')}
            className="bg-gym-orange text-gym-dark font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1 shadow-md hover:bg-gym-orange/90 transition"
          >
            <span>Start</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Calories Burned Quick Stats Card */}
      {stats && stats.totalCaloriesBurned !== undefined && stats.totalCaloriesBurned > 0 && (
        <div className="bg-gym-card border border-gym-border/40 p-4 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 bg-gym-orange/10 p-6 rounded-full group-hover:scale-110 transition duration-300">
            <Flame className="h-14 w-14 text-gym-orange/20 fill-gym-orange/5" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-4.5 w-4.5 text-gym-orange fill-gym-orange/15 animate-bounce" />
            <span className="text-xs font-bold uppercase tracking-wider text-gym-text-secondary">Active Calorie Burn</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gym-dark/45 border border-gym-border/10 p-2.5 rounded-xl">
              <span className="text-[10px] text-gym-text-secondary font-bold uppercase tracking-wider block">This Week</span>
              <span className="text-base font-black text-gym-orange mt-1 block">
                {stats.caloriesThisWeek || 0} <span className="text-[9px] font-normal text-gym-text-secondary">kcal</span>
              </span>
            </div>
            <div className="bg-gym-dark/45 border border-gym-border/10 p-2.5 rounded-xl">
              <span className="text-[10px] text-gym-text-secondary font-bold uppercase tracking-wider block">This Month</span>
              <span className="text-base font-black text-gym-orange mt-1 block">
                {stats.caloriesThisMonth || 0} <span className="text-[9px] font-normal text-gym-text-secondary">kcal</span>
              </span>
            </div>
            <div className="bg-gym-dark/45 border border-gym-border/10 p-2.5 rounded-xl">
              <span className="text-[10px] text-gym-text-secondary font-bold uppercase tracking-wider block">Total Burn</span>
              <span className="text-base font-black text-gym-orange mt-1 block">
                {stats.totalCaloriesBurned || 0} <span className="text-[9px] font-normal text-gym-text-secondary">kcal</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Streak Dashboard Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Current Streak */}
        <div className="bg-gym-card border border-gym-border/40 p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-lg group">
          <div className="absolute -top-3 -right-3 bg-gym-orange/10 p-5 rounded-full group-hover:scale-110 transition duration-300">
            <Flame className="h-10 w-10 text-gym-orange/25" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gym-text-secondary uppercase tracking-wider">Current Streak</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-4xl font-extrabold text-gym-orange">{user?.currentStreak}</span>
              <span className="text-sm font-bold text-gym-text-secondary">days</span>
            </div>
          </div>
          <p className="text-[11px] text-gym-text-secondary mt-4">
            Last logged: {user?.lastWorkoutDate ? user.lastWorkoutDate : 'Never'}
          </p>
        </div>

        {/* Longest Streak */}
        <div className="bg-gym-card border border-gym-border/40 p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-lg group">
          <div className="absolute -top-3 -right-3 bg-gym-blue/10 p-5 rounded-full group-hover:scale-110 transition duration-300">
            <Trophy className="h-10 w-10 text-gym-blue/25" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gym-text-secondary uppercase tracking-wider">Longest Streak</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-4xl font-extrabold text-gym-blue">{user?.longestStreak}</span>
              <span className="text-sm font-bold text-gym-text-secondary">days</span>
            </div>
          </div>
          <p className="text-[11px] text-gym-text-secondary mt-4">
            Total workouts: <span className="font-bold text-gym-text-primary">{stats?.totalWorkouts || 0}</span>
          </p>
        </div>
      </div>

      {/* Week View Grid */}
      <div className="bg-gym-card border border-gym-border/40 p-4 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gym-accent" />
            <span className="text-xs font-bold uppercase tracking-wider text-gym-text-secondary">Weekly Progress</span>
          </div>
          <span className="text-xs text-gym-accent font-semibold">
            {stats?.workoutsThisWeek || 0} active {stats?.workoutsThisWeek === 1 ? 'day' : 'days'}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {stats?.weeklyStatus.map((dayStatus, idx) => {
            const isToday = dayStatus.date === getLocalDateString();
            return (
              <div 
                key={idx} 
                className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                  dayStatus.completed 
                    ? 'bg-gym-accent/15 border-gym-accent/30 text-gym-accent' 
                    : isToday
                      ? 'bg-gym-border/40 border-gym-text-secondary/30 text-gym-text-primary font-bold'
                      : 'bg-gym-dark/40 border-gym-border/20 text-gym-text-secondary'
                }`}
              >
                <span className="text-[10px] font-semibold tracking-wider uppercase mb-1">{dayStatus.day}</span>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  dayStatus.completed 
                    ? 'bg-gym-accent text-gym-dark' 
                    : 'bg-gym-border text-gym-text-secondary'
                }`}>
                  {dayStatus.completed ? '✓' : dayStatus.date.split('-')[2]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Milestone Achievement alert */}
      {achievement && (
        <div className="bg-gradient-to-r from-gym-purple/20 to-gym-blue/20 border border-gym-purple/30 p-4 rounded-2xl shadow-lg flex items-start gap-3.5">
          <div className="text-3xl shrink-0 p-1.5 bg-gym-purple/10 rounded-xl border border-gym-purple/25">
            {achievement.badge}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-gym-purple text-sm">{achievement.title}</h4>
              <span className="bg-gym-purple/20 text-gym-purple text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full">
                Unlocked
              </span>
            </div>
            <p className="text-xs text-gym-text-secondary mt-1 leading-relaxed">
              {achievement.msg}
            </p>
          </div>
        </div>
      )}

      {/* Motivational Quote */}
      {quote && (
        <div className="bg-gym-card border border-gym-border/40 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <QuoteIcon className="absolute -bottom-2 -right-2 h-16 w-16 text-gym-border/20 rotate-180" />
          <span className="text-[10px] font-bold text-gym-accent uppercase tracking-wider block mb-2">Daily Motivation</span>
          <p className="text-sm font-medium italic text-gym-text-primary leading-relaxed">
            "{quote.text}"
          </p>
          <span className="text-xs text-gym-text-secondary block mt-2 text-right">
            — {quote.author}
          </span>
        </div>
      )}
    </div>
  );
};

// Helper for local date string
const getLocalDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default Dashboard;
