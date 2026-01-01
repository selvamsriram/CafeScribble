import { useState } from 'react';
import { useTheme, THEME_INFO, type ThemePalette } from '@/hooks/useTheme';
import { Sun, Moon, Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  showPaletteSelector?: boolean;
}

export function ThemeToggle({ className, showPaletteSelector = true }: ThemeToggleProps) {
  const { mode, palette, toggleMode, setPalette } = useTheme();
  const [showPalettes, setShowPalettes] = useState(false);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Palette Selector */}
      {showPaletteSelector && (
        <div className="relative">
          <button
            onClick={() => setShowPalettes(!showPalettes)}
            className={cn(
              'p-2 rounded-xl transition-all duration-200',
              'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]',
              'border border-[var(--color-border)]',
              'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
              'shadow-sm hover:shadow-md',
              showPalettes && 'ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-background)]'
            )}
            aria-label="Choose theme palette"
          >
            <Palette className="w-4 h-4" />
          </button>

          {showPalettes && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowPalettes(false)}
              />
              
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 z-50 w-64 p-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] shadow-xl shadow-[var(--color-shadow-lg)]">
                <div className="text-xs font-medium text-[var(--color-text-muted)] px-2 py-1.5 mb-1">
                  Choose Theme
                </div>
                {(Object.keys(THEME_INFO) as ThemePalette[]).map((key) => {
                  const info = THEME_INFO[key];
                  const isActive = palette === key;
                  
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setPalette(key);
                        setShowPalettes(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all',
                        isActive 
                          ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' 
                          : 'hover:bg-[var(--color-surface)] text-[var(--color-text)]'
                      )}
                    >
                      <ThemePreviewDot palette={key} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{info.name}</div>
                        <div className="text-xs text-[var(--color-text-muted)] truncate">{info.description}</div>
                      </div>
                      {isActive && <Check className="w-4 h-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Day/Night Toggle */}
      <button
        onClick={toggleMode}
        className={cn(
          'relative w-14 h-8 rounded-full transition-all duration-300',
          'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]',
          'border border-[var(--color-border)]',
          'shadow-sm hover:shadow-md',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2',
          'focus:ring-offset-[var(--color-background)]'
        )}
        aria-label={`Switch to ${mode === 'day' ? 'night' : 'day'} mode`}
      >
        {/* Track icons */}
        <span className="absolute inset-0 flex items-center justify-between px-1.5">
          <Sun 
            className={cn(
              'w-4 h-4 transition-all duration-300',
              mode === 'day' ? 'text-amber-500' : 'text-[var(--color-text-muted)]'
            )} 
          />
          <Moon 
            className={cn(
              'w-4 h-4 transition-all duration-300',
              mode === 'night' ? 'text-blue-300' : 'text-[var(--color-text-muted)]'
            )} 
          />
        </span>
        
        {/* Sliding thumb */}
        <span
          className={cn(
            'absolute top-1 w-6 h-6 rounded-full transition-all duration-300',
            'bg-[var(--color-background)] shadow-md',
            'flex items-center justify-center',
            mode === 'day' ? 'left-1' : 'left-7'
          )}
        >
          {mode === 'day' ? (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-blue-300" />
          )}
        </span>
      </button>
    </div>
  );
}

// Small preview dot showing theme colors
function ThemePreviewDot({ palette }: { palette: ThemePalette }) {
  const colors: Record<ThemePalette, { bg: string; primary: string; accent: string }> = {
    sage: { bg: '#FDF8F3', primary: '#7C9A82', accent: '#D4A5A5' },
    kissaten: { bg: '#F7F3EE', primary: '#8B5A3C', accent: '#6B7B6B' },
    hygge: { bg: '#FAFAF8', primary: '#78716C', accent: '#B45309' },
    parisian: { bg: '#FAF7F2', primary: '#7B4B3A', accent: '#3D5A45' },
    kyoto: { bg: '#F8FAF5', primary: '#5C7C5C', accent: '#C8A882' },
  };

  const c = colors[palette];

  return (
    <div 
      className="w-8 h-8 rounded-lg border border-[var(--color-border)] overflow-hidden shrink-0 shadow-sm"
      style={{ backgroundColor: c.bg }}
    >
      <div className="h-1/2 flex">
        <div className="flex-1" style={{ backgroundColor: c.primary }} />
        <div className="flex-1" style={{ backgroundColor: c.accent }} />
      </div>
    </div>
  );
}
