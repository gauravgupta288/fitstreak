import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, PlusCircle, BarChart2, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center py-1 transition-all duration-300 ${
      isActive
        ? 'text-gym-accent scale-105 font-semibold'
        : 'text-gym-text-secondary hover:text-gym-text-primary'
    }`;

  return (
    <div className="glass fixed bottom-0 left-0 right-0 z-40 border-t border-gym-border/50 px-4 py-2 flex items-center justify-around pb-safe">
      <NavLink to="/" className={linkClasses}>
        <LayoutDashboard className="h-6 w-6 mb-1" />
        <span className="text-[11px]">Dashboard</span>
      </NavLink>

      <NavLink to="/history" className={linkClasses}>
        <History className="h-6 w-6 mb-1" />
        <span className="text-[11px]">History</span>
      </NavLink>

      <NavLink 
        to="/add" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center -mt-6 transition-all duration-300 ${
            isActive ? 'scale-110' : 'hover:scale-105'
          }`
        }
      >
        <div className="bg-gym-accent glow-accent text-gym-dark p-3.5 rounded-full shadow-lg border-2 border-gym-dark flex items-center justify-center">
          <PlusCircle className="h-6 w-6 stroke-[2.5]" />
        </div>
        <span className="text-[11px] text-gym-accent font-semibold mt-1">Log Workout</span>
      </NavLink>

      <NavLink to="/progress" className={linkClasses}>
        <BarChart2 className="h-6 w-6 mb-1" />
        <span className="text-[11px]">Progress</span>
      </NavLink>

      <NavLink to="/profile" className={linkClasses}>
        <User className="h-6 w-6 mb-1" />
        <span className="text-[11px]">Profile</span>
      </NavLink>
    </div>
  );
};

export default BottomNav;
