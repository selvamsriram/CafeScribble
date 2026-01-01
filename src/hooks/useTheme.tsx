import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type ThemeMode = 'day' | 'night';
export type ThemePalette = 'sage' | 'kissaten' | 'hygge' | 'parisian' | 'kyoto';

interface ThemeContextType {
  mode: ThemeMode;
  palette: ThemePalette;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
  setPalette: (palette: ThemePalette) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY_MODE = 'scribble-theme-mode';
const STORAGE_KEY_PALETTE = 'scribble-theme-palette';

export const THEME_INFO: Record<ThemePalette, { name: string; description: string; fonts: { heading: string; body: string } }> = {
  sage: {
    name: 'Sage Garden',
    description: 'Warm cream with sage green accents',
    fonts: { heading: 'Fraunces', body: 'DM Sans' },
  },
  kissaten: {
    name: 'Japanese Kissaten',
    description: 'Retro coffee house, warm sienna tones',
    fonts: { heading: 'Cormorant Garamond', body: 'Source Sans 3' },
  },
  hygge: {
    name: 'Copenhagen Hygge',
    description: 'Scandinavian minimalism, burnt orange',
    fonts: { heading: 'Bitter', body: 'Inter' },
  },
  parisian: {
    name: 'Parisian Salon',
    description: 'French elegance, terracotta & forest',
    fonts: { heading: 'Playfair Display', body: 'Lora' },
  },
  kyoto: {
    name: 'Kyoto Garden',
    description: 'Zen matcha greens, serene & calm',
    fonts: { heading: 'Libre Baskerville', body: 'Nunito' },
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_MODE);
    if (stored === 'day' || stored === 'night') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
  });

  const [palette, setPaletteState] = useState<ThemePalette>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_PALETTE);
    if (stored && stored in THEME_INFO) return stored as ThemePalette;
    return 'sage';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
    document.documentElement.setAttribute('data-palette', palette);
    localStorage.setItem(STORAGE_KEY_MODE, mode);
    localStorage.setItem(STORAGE_KEY_PALETTE, palette);
  }, [mode, palette]);

  const toggleMode = () => setModeState((prev) => (prev === 'day' ? 'night' : 'day'));
  const setMode = (newMode: ThemeMode) => setModeState(newMode);
  const setPalette = (newPalette: ThemePalette) => setPaletteState(newPalette);

  return (
    <ThemeContext.Provider value={{ mode, palette, toggleMode, setMode, setPalette }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
