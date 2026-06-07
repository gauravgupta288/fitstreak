import React from 'react';
import { Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="glass sticky top-0 left-0 right-0 z-40 px-4 py-3 border-b border-gym-border/40 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="FitStreak Logo" className="h-7 w-7 object-contain rounded-md" />
        <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-gym-accent to-gym-blue bg-clip-text text-transparent">
          FitStreak
        </span>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          {/* Level Badge */}
          <div className="bg-gym-blue/10 border border-gym-blue/30 px-2 py-0.5 rounded-full text-xs font-semibold text-gym-blue flex items-center gap-1">
            <span>Lvl</span>
            <span>{user.level}</span>
          </div>

          {/* Streak Flame */}
          <div className="flex items-center gap-1.5 bg-gym-orange/10 border border-gym-orange/20 px-2.5 py-0.5 rounded-full">
            <Flame className={`h-4.5 w-4.5 text-gym-orange ${user.currentStreak > 0 ? 'fill-gym-orange animate-bounce' : ''}`} />
            <span className="text-xs font-bold text-gym-orange">{user.currentStreak}d</span>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
