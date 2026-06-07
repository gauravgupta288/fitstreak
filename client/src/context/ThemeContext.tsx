import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ThemeColors {
  dark: string;
  card: string;
  border: string;
  accent: string;
  blue: string;
  purple: string;
  orange: string;
  textPrimary: string;
  textSecondary: string;
}

export interface AppTheme {
  id: string;
  name: string;
  emoji: string;
  description: string;
  preview: string[]; // 4 preview swatch colors
  colors: ThemeColors;
}

export const THEMES: AppTheme[] = [
  {
    id: 'midnight',
    name: 'Midnight Emerald',
    emoji: '🌿',
    description: 'Default dark theme with emerald accents',
    preview: ['#090d16', '#131c2e', '#10b981', '#3b82f6'],
    colors: {
      dark: '#090d16',
      card: '#131c2e',
      border: '#1e293b',
      accent: '#10b981',
      blue: '#3b82f6',
      purple: '#8b5cf6',
      orange: '#f97316',
      textPrimary: '#f8fafc',
      textSecondary: '#94a3b8',
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyber Neon',
    emoji: '⚡',
    description: 'Electric neon pink on deep purple',
    preview: ['#0f0a1a', '#1a1030', '#f472b6', '#a78bfa'],
    colors: {
      dark: '#0f0a1a',
      card: '#1a1030',
      border: '#2d1b5e',
      accent: '#f472b6',
      blue: '#a78bfa',
      purple: '#c084fc',
      orange: '#fb923c',
      textPrimary: '#faf5ff',
      textSecondary: '#a78bfa',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Depth',
    emoji: '🌊',
    description: 'Deep blue with aqua highlights',
    preview: ['#061222', '#0c1f3d', '#06b6d4', '#2563eb'],
    colors: {
      dark: '#061222',
      card: '#0c1f3d',
      border: '#1e3a5f',
      accent: '#06b6d4',
      blue: '#2563eb',
      purple: '#7c3aed',
      orange: '#f59e0b',
      textPrimary: '#f0f9ff',
      textSecondary: '#7dd3fc',
    },
  },
  {
    id: 'volcano',
    name: 'Volcano Fire',
    emoji: '🔥',
    description: 'Fiery reds and oranges on charcoal',
    preview: ['#1a0a0a', '#2d1212', '#ef4444', '#f97316'],
    colors: {
      dark: '#1a0a0a',
      card: '#2d1212',
      border: '#441b1b',
      accent: '#ef4444',
      blue: '#f97316',
      purple: '#e879f9',
      orange: '#fbbf24',
      textPrimary: '#fef2f2',
      textSecondary: '#fca5a5',
    },
  },
  {
    id: 'arctic',
    name: 'Arctic Frost',
    emoji: '❄️',
    description: 'Cool grays with icy blue tones',
    preview: ['#111827', '#1f2937', '#38bdf8', '#818cf8'],
    colors: {
      dark: '#111827',
      card: '#1f2937',
      border: '#374151',
      accent: '#38bdf8',
      blue: '#818cf8',
      purple: '#a78bfa',
      orange: '#fbbf24',
      textPrimary: '#f9fafb',
      textSecondary: '#9ca3af',
    },
  },
];

interface ThemeContextType {
  currentTheme: AppTheme;
  setThemeById: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: THEMES[0],
  setThemeById: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const THEME_STORAGE_KEY = 'fitstreak-theme';

function applyThemeToDOM(theme: AppTheme) {
  const root = document.documentElement;
  root.style.setProperty('--color-gym-dark', theme.colors.dark);
  root.style.setProperty('--color-gym-card', theme.colors.card);
  root.style.setProperty('--color-gym-border', theme.colors.border);
  root.style.setProperty('--color-gym-accent', theme.colors.accent);
  root.style.setProperty('--color-gym-blue', theme.colors.blue);
  root.style.setProperty('--color-gym-purple', theme.colors.purple);
  root.style.setProperty('--color-gym-orange', theme.colors.orange);
  root.style.setProperty('--color-gym-text-primary', theme.colors.textPrimary);
  root.style.setProperty('--color-gym-text-secondary', theme.colors.textSecondary);

  // Also update the body background for immediate effect
  document.body.style.backgroundColor = theme.colors.dark;
}

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    try {
      const savedId = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedId) {
        const found = THEMES.find((t) => t.id === savedId);
        if (found) return found;
      }
    } catch {}
    return THEMES[0];
  });

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    applyThemeToDOM(currentTheme);
  }, [currentTheme]);

  const setThemeById = (id: string) => {
    const found = THEMES.find((t) => t.id === id);
    if (found) {
      setCurrentTheme(found);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, id);
      } catch {}
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setThemeById }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
