import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type ThemeMode = 'day' | 'night';
export type ThemePalette =
  | 'cupertino'
  | 'graphite'
  | 'frost'
  | 'sage'
  | 'kissaten'
  | 'hygge'
  | 'parisian'
  | 'kyoto'
  | 'cafe';

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
  cupertino: {
    name: 'Cupertino',
    description: 'Apple-like clarity with system typography & iOS blue',
    fonts: {
      heading:
        'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      body: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
    },
  },
  graphite: {
    name: 'Graphite',
    description: 'Neutral graphite surfaces, hairline borders, restrained contrast',
    fonts: {
      heading:
        'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      body: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
    },
  },
  frost: {
    name: 'Frost',
    description: 'Cool glassy surfaces with subtle blue-gray depth',
    fonts: {
      heading:
        'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      body: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
    },
  },
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
  cafe: {
    name: 'Modern Café',
    description: 'Rich espresso & warm caramel tones',
    fonts: { heading: 'Merriweather', body: 'Poppins' },
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
    // Default to an Apple-like palette for new users.
    return 'cupertino';
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
