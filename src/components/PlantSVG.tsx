import { cn } from '@/lib/utils';

interface PlantProps {
  className?: string;
}

// Beautiful latte art with heart pattern
export function LatteArt({ className }: PlantProps) {
  return (
    <svg
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('', className)}
    >
      {/* Saucer */}
      <ellipse
        cx="100"
        cy="200"
        rx="85"
        ry="16"
        fill="var(--color-surface)"
        stroke="var(--color-border)"
        strokeWidth="2"
      />
      <ellipse
        cx="100"
        cy="196"
        rx="70"
        ry="12"
        fill="var(--color-background)"
        opacity="0.5"
      />
      
      {/* Cup body - wide cappuccino style */}
      <path
        d="M25 80L35 175C37 185 55 195 100 195C145 195 163 185 165 175L175 80H25Z"
        fill="var(--color-surface)"
        stroke="var(--color-border)"
        strokeWidth="2.5"
      />
      
      {/* Cup rim */}
      <ellipse
        cx="100"
        cy="80"
        rx="75"
        ry="20"
        fill="var(--color-surface)"
        stroke="var(--color-border)"
        strokeWidth="2.5"
      />
      
      {/* Coffee/crema base */}
      <ellipse
        cx="100"
        cy="82"
        rx="65"
        ry="16"
        fill="var(--color-accent)"
        opacity="0.4"
      />
      
      {/* Latte art - heart pattern */}
      <g>
        {/* White foam base */}
        <ellipse
          cx="100"
          cy="82"
          rx="50"
          ry="12"
          fill="var(--color-background)"
          opacity="0.9"
        />
        {/* Heart shape */}
        <path
          d="M100 95 C92 88 80 80 80 72 C80 66 86 62 92 62 C96 62 100 66 100 70 C100 66 104 62 108 62 C114 62 120 66 120 72 C120 80 108 88 100 95Z"
          fill="var(--color-accent)"
          opacity="0.5"
        />
        <path
          d="M100 95 C92 88 80 80 80 72 C80 66 86 62 92 62 C96 62 100 66 100 70 C100 66 104 62 108 62 C114 62 120 66 120 72 C120 80 108 88 100 95Z"
          stroke="var(--color-accent)"
          strokeWidth="1"
          fill="none"
          opacity="0.7"
        />
        {/* Rosetta detail flowing from heart */}
        <path
          d="M100 75 L100 60"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />
        <path
          d="M95 68 Q100 65 105 68"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.3"
        />
        <path
          d="M93 63 Q100 59 107 63"
          stroke="var(--color-accent)"
          strokeWidth="1"
          fill="none"
          opacity="0.25"
        />
      </g>
      
      {/* Handle - elegant curved */}
      <path
        d="M175 95 C195 95 205 115 205 140 C205 165 195 185 175 185"
        stroke="var(--color-border)"
        strokeWidth="3"
        fill="none"
      />
      
      {/* Animated Steam wisps */}
      <g className="animate-steam">
        <path
          d="M75 55 C75 45 80 35 75 20"
          stroke="var(--color-text-muted)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.25"
        />
      </g>
      <g className="animate-steam-delayed">
        <path
          d="M100 50 C100 40 105 30 100 15"
          stroke="var(--color-text-muted)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.25"
        />
      </g>
      <g className="animate-steam-delayed-2">
        <path
          d="M125 55 C125 45 130 35 125 20"
          stroke="var(--color-text-muted)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.25"
        />
      </g>
    </svg>
  );
}

// Cafe scene illustration with latte, notepad, and pen
export function CafeScene({ className }: PlantProps) {
  return (
    <svg
      viewBox="0 0 320 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('', className)}
    >
      {/* === NOTEPAD === */}
      <g transform="translate(10, 40) rotate(-5)">
        {/* Notepad shadow */}
        <rect
          x="8"
          y="8"
          width="140"
          height="180"
          rx="4"
          fill="var(--color-text)"
          opacity="0.08"
        />
        {/* Notepad pages */}
        <rect
          x="0"
          y="0"
          width="140"
          height="180"
          rx="4"
          fill="var(--color-surface)"
          stroke="var(--color-border)"
          strokeWidth="2"
        />
        {/* Notepad binding */}
        <rect
          x="0"
          y="0"
          width="140"
          height="16"
          rx="4"
          fill="var(--color-primary)"
          opacity="0.2"
        />
        <rect
          x="0"
          y="0"
          width="140"
          height="16"
          rx="4"
          stroke="var(--color-primary)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
        />
        {/* Spiral binding holes */}
        {[20, 40, 60, 80, 100, 120].map((x, i) => (
          <circle
            key={i}
            cx={x}
            cy="8"
            r="3"
            fill="var(--color-background)"
            stroke="var(--color-border)"
            strokeWidth="1"
          />
        ))}
        {/* Written lines */}
        <g opacity="0.3">
          <line x1="15" y1="35" x2="100" y2="35" stroke="var(--color-primary)" strokeWidth="2" />
          <line x1="15" y1="52" x2="120" y2="52" stroke="var(--color-text-muted)" strokeWidth="1.5" />
          <line x1="15" y1="68" x2="95" y2="68" stroke="var(--color-text-muted)" strokeWidth="1.5" />
          <line x1="15" y1="84" x2="115" y2="84" stroke="var(--color-text-muted)" strokeWidth="1.5" />
          <line x1="15" y1="100" x2="80" y2="100" stroke="var(--color-text-muted)" strokeWidth="1.5" />
          <line x1="15" y1="120" x2="70" y2="120" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.7" />
          <line x1="15" y1="136" x2="110" y2="136" stroke="var(--color-text-muted)" strokeWidth="1.5" />
          <line x1="15" y1="152" x2="90" y2="152" stroke="var(--color-text-muted)" strokeWidth="1.5" />
        </g>
      </g>

      {/* === LATTE CUP === */}
      <g transform="translate(150, 20)">
        {/* Saucer */}
        <ellipse
          cx="80"
          cy="165"
          rx="70"
          ry="14"
          fill="var(--color-surface)"
          stroke="var(--color-border)"
          strokeWidth="2"
        />
        
        {/* Cup body - wide cappuccino style */}
        <path
          d="M20 60L30 145C32 155 48 162 80 162C112 162 128 155 130 145L140 60H20Z"
          fill="var(--color-surface)"
          stroke="var(--color-border)"
          strokeWidth="2"
        />
        
        {/* Cup rim */}
        <ellipse
          cx="80"
          cy="60"
          rx="60"
          ry="16"
          fill="var(--color-surface)"
          stroke="var(--color-border)"
          strokeWidth="2"
        />
        
        {/* Coffee/crema base */}
        <ellipse
          cx="80"
          cy="62"
          rx="50"
          ry="12"
          fill="var(--color-accent)"
          opacity="0.4"
        />
        
        {/* Latte art - heart */}
        <ellipse
          cx="80"
          cy="62"
          rx="38"
          ry="9"
          fill="var(--color-background)"
          opacity="0.9"
        />
        <path
          d="M80 75 C73 69 63 62 63 55 C63 50 68 47 73 47 C76 47 79 50 80 53 C81 50 84 47 87 47 C92 47 97 50 97 55 C97 62 87 69 80 75Z"
          fill="var(--color-accent)"
          opacity="0.5"
        />
        <path
          d="M80 57 L80 47"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.3"
        />
        
        {/* Handle */}
        <path
          d="M140 72 C158 72 165 90 165 108 C165 126 158 143 140 143"
          stroke="var(--color-border)"
          strokeWidth="2.5"
          fill="none"
        />
        
        {/* Steam */}
        <g className="animate-steam">
          <path
            d="M60 42 C60 32 65 22 60 8"
            stroke="var(--color-text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.2"
          />
        </g>
        <g className="animate-steam-delayed">
          <path
            d="M80 38 C80 28 85 18 80 4"
            stroke="var(--color-text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.2"
          />
        </g>
        <g className="animate-steam-delayed-2">
          <path
            d="M100 42 C100 32 105 22 100 8"
            stroke="var(--color-text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.2"
          />
        </g>
      </g>
    </svg>
  );
}
