import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Mail, Trophy, Sparkles, Award, Scale, Ruler, Edit3, Save } from 'lucide-react';
import { apiRequest } from '../utils/api';

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  requirement: number; // days streak required
  icon: string;
  color: string;
}

const BADGES: BadgeItem[] = [
  { id: '3d', name: 'Flame Starter', description: 'Log workouts 3 days in a row.', requirement: 3, icon: '🔥', color: 'text-gym-orange bg-gym-orange/10 border-gym-orange/30' },
  { id: '7d', name: 'Consistency Guru', description: 'Log workouts 7 days in a row.', requirement: 7, icon: '⚡', color: 'text-gym-accent bg-gym-accent/10 border-gym-accent/30' },
  { id: '14d', name: 'Iron Will', description: 'Log workouts 14 days in a row.', requirement: 14, icon: '🛡️', color: 'text-gym-blue bg-gym-blue/10 border-gym-blue/30' },
  { id: '30d', name: 'Unstoppable', description: 'Log workouts 30 days in a row.', requirement: 30, icon: '🌟', color: 'text-gym-purple bg-gym-purple/10 border-gym-purple/30' },
  { id: '60d', name: 'Gym Deity', description: 'Log workouts 60 days in a row.', requirement: 60, icon: '👑', color: 'text-gym-accent bg-gym-accent/15 border-gym-accent/45 animate-pulse' },
  { id: '100d', name: 'FitStreak Legend', description: 'Log workouts 100 days in a row.', requirement: 100, icon: '🏆', color: 'text-gym-orange bg-gym-orange/15 border-gym-orange/45 glow-accent' },
];

const Profile: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [heightVal, setHeightVal] = useState<number | string>('');
  const [weightVal, setWeightVal] = useState<number | string>('');
  const [saving, setSaving] = useState(false);
  const [errorVal, setErrorVal] = useState('');
  const [successVal, setSuccessVal] = useState(false);

  useEffect(() => {
    if (user) {
      setHeightVal(user.height || '');
      setWeightVal(user.weight || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorVal('');
    setSuccessVal(false);
    setSaving(true);
    try {
      await apiRequest('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          height: heightVal === '' ? null : Number(heightVal),
          weight: weightVal === '' ? null : Number(weightVal),
        }),
      });
      await refreshUser();
      setSuccessVal(true);
      setIsEditing(false);
      setTimeout(() => setSuccessVal(false), 2000);
    } catch (err: any) {
      console.error(err);
      setErrorVal(err.message || 'Failed to update body metrics.');
    } finally {
      setSaving(false);
    }
  };

  const getXPProgress = () => {
    if (!user) return { current: 0, nextLevel: 500, percentage: 0 };
    const current = user.xp % 500;
    return {
      current,
      nextLevel: 500,
      percentage: (current / 500) * 100
    };
  };

  const xpProgress = getXPProgress();

  return (
    <div className="px-4 py-6 pb-24 max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gym-text-primary">User Profile</h1>
        <p className="text-sm text-gym-text-secondary mt-0.5">
          Track your leveling rank and fitness accomplishments.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-gym-card border border-gym-border/40 p-5 rounded-2xl shadow-lg relative overflow-hidden flex items-center gap-4">
        <div className="bg-gym-accent text-gym-dark h-14 w-14 rounded-full flex items-center justify-center font-extrabold text-xl shrink-0">
          {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </div>
        
        <div className="space-y-1">
          <h3 className="font-extrabold text-lg text-gym-text-primary leading-tight">
            {user?.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-gym-text-secondary">
            <Mail className="h-3.5 w-3.5" />
            <span>{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Gamification Progress */}
      <div className="bg-gym-card border border-gym-border/40 p-5 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-gym-accent" />
            <span className="text-xs font-bold uppercase tracking-wider text-gym-text-secondary">Fitness Rank</span>
          </div>
          <span className="text-xs font-bold text-gym-accent">Level {user?.level}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-gym-accent/10 border border-gym-accent/30 h-16 w-16 rounded-2xl flex flex-col items-center justify-center shrink-0">
            <span className="text-[10px] text-gym-text-secondary font-bold uppercase">Level</span>
            <span className="text-2xl font-black text-gym-accent">{user?.level}</span>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-xs font-bold text-gym-text-primary">
              <span>XP Progress</span>
              <span>{xpProgress.current} / {xpProgress.nextLevel} XP</span>
            </div>
            <div className="w-full bg-gym-dark h-3 rounded-full overflow-hidden border border-gym-border/20">
              <div 
                className="bg-gradient-to-r from-gym-accent to-gym-blue h-full rounded-full transition-all duration-500"
                style={{ width: `${xpProgress.percentage}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-gym-text-secondary leading-relaxed">
              Earn <span className="font-bold text-gym-text-primary">{xpProgress.nextLevel - xpProgress.current} more XP</span> to reach Level {(user?.level || 1) + 1}! Get 100 XP per workout log + streak bonuses.
            </p>
          </div>
        </div>
      </div>

      {/* Body Metrics Card */}
      <div className="bg-gym-card border border-gym-border/40 p-5 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Scale className="h-4.5 w-4.5 text-gym-blue" />
            <span className="text-xs font-bold uppercase tracking-wider text-gym-text-secondary">Body Metrics</span>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-bold text-gym-blue hover:text-gym-blue/80 transition flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {errorVal && (
          <div className="text-rose-500 text-xs bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
            {errorVal}
          </div>
        )}
        
        {successVal && (
          <div className="text-gym-accent text-xs bg-gym-accent/10 border border-gym-accent/20 p-2.5 rounded-xl">
            Metrics updated successfully!
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gym-text-secondary uppercase tracking-wider">Height (cm)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 175"
                  value={heightVal}
                  onChange={(e) => setHeightVal(e.target.value)}
                  className="block w-full px-3 py-2 bg-gym-dark border border-gym-border/50 rounded-xl text-gym-text-primary focus:outline-none focus:border-gym-blue text-sm font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gym-text-secondary uppercase tracking-wider">Weight (kg)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 70"
                  value={weightVal}
                  onChange={(e) => setWeightVal(e.target.value)}
                  className="block w-full px-3 py-2 bg-gym-dark border border-gym-border/50 rounded-xl text-gym-text-primary focus:outline-none focus:border-gym-blue text-sm font-semibold"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setHeightVal(user?.height || '');
                  setWeightVal(user?.weight || '');
                  setErrorVal('');
                }}
                className="flex-1 py-2 px-3 bg-gym-border text-gym-text-primary text-xs font-bold rounded-xl border border-gym-border/30 hover:bg-gym-border/80 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2 px-3 bg-gym-blue text-gym-text-primary text-xs font-bold rounded-xl hover:bg-gym-blue/90 transition flex items-center justify-center gap-1.5"
              >
                {saving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gym-text-primary border-t-transparent"></div>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gym-dark/45 border border-gym-border/10 p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-gym-blue/10 rounded-lg text-gym-blue">
                <Ruler className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-gym-text-secondary font-bold uppercase tracking-wider block">Height</span>
                <span className="text-sm font-extrabold text-gym-text-primary mt-0.5 block">
                  {user?.height ? `${user.height} cm` : 'Not set'}
                </span>
              </div>
            </div>
            
            <div className="bg-gym-dark/45 border border-gym-border/10 p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-gym-orange/10 rounded-lg text-gym-orange">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-gym-text-secondary font-bold uppercase tracking-wider block">Weight</span>
                <span className="text-sm font-extrabold text-gym-text-primary mt-0.5 block">
                  {user?.weight ? `${user.weight} kg` : 'Not set'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Achievements Badges Card */}
      <div className="bg-gym-card border border-gym-border/40 p-5 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center gap-1.5">
          <Trophy className="h-4.5 w-4.5 text-gym-orange" />
          <span className="text-xs font-bold uppercase tracking-wider text-gym-text-secondary">
            Streak Achievements ({BADGES.filter(b => (user?.longestStreak || 0) >= b.requirement).length} / {BADGES.length})
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {BADGES.map((badge) => {
            const unlocked = (user?.longestStreak || 0) >= badge.requirement;
            return (
              <div 
                key={badge.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                  unlocked 
                    ? `${badge.color} text-gym-text-primary` 
                    : 'bg-gym-dark/20 border-gym-border/10 text-gym-text-secondary/50 grayscale opacity-45'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl mb-2 block">{badge.icon}</span>
                  {unlocked ? (
                    <Award className="h-4.5 w-4.5 text-gym-accent" />
                  ) : (
                    <span className="text-[9px] font-bold text-gym-text-secondary bg-gym-border/40 px-1.5 py-0.5 rounded-md uppercase">
                      {badge.requirement}d
                    </span>
                  )}
                </div>
                
                <div>
                  <h4 className="font-extrabold text-xs text-gym-text-primary truncate">{badge.name}</h4>
                  <p className="text-[10px] text-gym-text-secondary leading-normal mt-1">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout Action */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gym-card border border-rose-500/20 text-rose-500 font-extrabold text-sm rounded-xl hover:bg-rose-500/10 hover:border-rose-500/30 transition shadow-md cursor-pointer"
      >
        <LogOut className="h-4.5 w-4.5" />
        <span>Sign Out Account</span>
      </button>
    </div>
  );
};

export default Profile;
