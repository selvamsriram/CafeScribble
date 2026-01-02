import { cn } from '@/lib/utils';

interface PlantProps {
  className?: string;
}

// Monstera Leaf - Perfect for corner decorations
export function MonsteraLeaf({ className }: PlantProps) {
  return (
    <svg
      viewBox="0 0 120 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-[var(--color-primary)]', className)}
    >
      {/* Main leaf shape */}
      <path
        d="M60 10C30 25 15 55 20 90C25 120 45 135 60 135C75 135 95 120 100 90C105 55 90 25 60 10Z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M60 10C30 25 15 55 20 90C25 120 45 135 60 135C75 135 95 120 100 90C105 55 90 25 60 10Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      {/* Monstera holes */}
      <ellipse cx="40" cy="60" rx="8" ry="12" fill="var(--color-background)" />
      <ellipse cx="75" cy="55" rx="6" ry="10" fill="var(--color-background)" />
      <ellipse cx="45" cy="95" rx="7" ry="10" fill="var(--color-background)" />
      <ellipse cx="72" cy="90" rx="5" ry="8" fill="var(--color-background)" />
      {/* Center vein */}
      <path
        d="M60 20V125"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.5"
      />
      {/* Side veins */}
      <path
        d="M60 40L35 55M60 60L30 80M60 80L38 105M60 50L80 40M60 70L85 60M60 90L78 100"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.3"
      />
      {/* Stem */}
      <path
        d="M60 135C60 135 58 145 60 150"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Potted Plant - For empty states and decorations
export function PottedPlant({ className }: PlantProps) {
  return (
    <svg
      viewBox="0 0 120 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('', className)}
    >
      {/* Pot */}
      <path
        d="M30 110L25 150C25 155 30 160 40 160H80C90 160 95 155 95 150L90 110H30Z"
        fill="var(--color-accent)"
        opacity="0.3"
      />
      <path
        d="M30 110L25 150C25 155 30 160 40 160H80C90 160 95 155 95 150L90 110H30Z"
        stroke="var(--color-accent)"
        strokeWidth="2"
        fill="none"
      />
      {/* Pot rim */}
      <rect
        x="25"
        y="105"
        width="70"
        height="10"
        rx="3"
        fill="var(--color-accent)"
        opacity="0.4"
      />
      <rect
        x="25"
        y="105"
        width="70"
        height="10"
        rx="3"
        stroke="var(--color-accent)"
        strokeWidth="2"
        fill="none"
      />
      {/* Soil */}
      <ellipse
        cx="60"
        cy="108"
        rx="28"
        ry="5"
        fill="var(--color-text)"
        opacity="0.2"
      />
      {/* Main stem */}
      <path
        d="M60 105V60"
        stroke="var(--color-primary)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Leaves */}
      <path
        d="M60 80C60 80 40 65 35 45C30 25 50 15 60 35C70 15 90 25 85 45C80 65 60 80 60 80Z"
        fill="var(--color-primary)"
        opacity="0.2"
      />
      <path
        d="M60 80C60 80 40 65 35 45C30 25 50 15 60 35"
        stroke="var(--color-primary)"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M60 35C70 15 90 25 85 45C80 65 60 80 60 80"
        stroke="var(--color-primary)"
        strokeWidth="2"
        fill="none"
      />
      {/* Side leaves */}
      <path
        d="M55 70C45 75 30 70 28 55C26 40 40 45 55 70Z"
        fill="var(--color-primary)"
        opacity="0.15"
      />
      <path
        d="M55 70C45 75 30 70 28 55C26 40 40 45 55 70Z"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M65 70C75 75 90 70 92 55C94 40 80 45 65 70Z"
        fill="var(--color-primary)"
        opacity="0.15"
      />
      <path
        d="M65 70C75 75 90 70 92 55C94 40 80 45 65 70Z"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Leaf veins */}
      <path
        d="M60 35V75"
        stroke="var(--color-primary)"
        strokeWidth="1"
        opacity="0.4"
      />
    </svg>
  );
}

// Small decorative leaf for scattered backgrounds
export function SmallLeaf({ className }: PlantProps) {
  return (
    <svg
      viewBox="0 0 30 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-[var(--color-primary)]', className)}
    >
      <path
        d="M15 5C8 10 5 20 8 30C10 35 15 38 15 38C15 38 20 35 22 30C25 20 22 10 15 5Z"
        fill="currentColor"
        opacity="0.1"
      />
      <path
        d="M15 5C8 10 5 20 8 30C10 35 15 38 15 38C15 38 20 35 22 30C25 20 22 10 15 5Z"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.3"
      />
      <path
        d="M15 8V35"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.2"
      />
    </svg>
  );
}

// Simple coffee cup (small version for badges)
export function CoffeeCup({ className }: PlantProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('', className)}
    >
      {/* Cup body */}
      <path
        d="M5 8h12v8c0 2-2 4-6 4s-6-2-6-4V8z"
        fill="var(--color-primary)"
        opacity="0.2"
      />
      <path
        d="M5 8h12v8c0 2-2 4-6 4s-6-2-6-4V8z"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Cup rim */}
      <ellipse
        cx="11"
        cy="8"
        rx="6"
        ry="2"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Handle */}
      <path
        d="M17 10c2 0 3 1.5 3 3s-1 3-3 3"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Steam */}
      <path
        d="M9 5c0-1 0.5-2 0-3M11 4c0-1 0.5-2 0-3M13 5c0-1 0.5-2 0-3"
        stroke="var(--color-primary)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
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

// Coffee bean decorative element
export function CoffeeBean({ className }: PlantProps) {
  return (
    <svg
      viewBox="0 0 40 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-[var(--color-accent)]', className)}
    >
      <ellipse
        cx="20"
        cy="25"
        rx="14"
        ry="20"
        fill="currentColor"
        opacity="0.15"
      />
      <ellipse
        cx="20"
        cy="25"
        rx="14"
        ry="20"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />
      {/* Center crease */}
      <path
        d="M20 8C16 15 16 35 20 42"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.3"
      />
    </svg>
  );
}

// Animated trailing vine for corner decorations
export function TrailingVine({ className }: PlantProps) {
  return (
    <svg
      viewBox="0 0 100 250"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-[var(--color-primary)]', className)}
    >
      {/* Main vine stem with gentle curve */}
      <path
        d="M70 0 C75 30 55 60 65 90 C75 120 50 150 60 180 C70 210 55 240 60 250"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
        className="animate-[draw_3s_ease-in-out_infinite]"
      />
      {/* Leaves with slight overlap for organic feel */}
      <g className="animate-[sway_6s_ease-in-out_infinite]">
        <path
          d="M65 25 C80 20 90 35 82 48 C74 61 58 52 65 25Z"
          fill="currentColor"
          opacity="0.25"
        />
        <path
          d="M65 25 C80 20 90 35 82 48"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />
      </g>
      <g className="animate-[sway_7s_ease-in-out_infinite]" style={{ animationDelay: '-2s' }}>
        <path
          d="M60 70 C42 65 35 82 45 92 C55 102 72 88 60 70Z"
          fill="currentColor"
          opacity="0.2"
        />
        <path
          d="M60 70 C42 65 35 82 45 92"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
        />
      </g>
      <g className="animate-[sway_8s_ease-in-out_infinite]" style={{ animationDelay: '-1s' }}>
        <path
          d="M68 115 C85 112 92 128 82 140 C72 152 55 138 68 115Z"
          fill="currentColor"
          opacity="0.22"
        />
        <path
          d="M68 115 C85 112 92 128 82 140"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          opacity="0.55"
        />
      </g>
      <g className="animate-[sway_6s_ease-in-out_infinite]" style={{ animationDelay: '-3s' }}>
        <path
          d="M55 165 C38 162 32 180 42 190 C52 200 68 185 55 165Z"
          fill="currentColor"
          opacity="0.18"
        />
        <path
          d="M55 165 C38 162 32 180 42 190"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          opacity="0.45"
        />
      </g>
      <g className="animate-[sway_7s_ease-in-out_infinite]" style={{ animationDelay: '-4s' }}>
        <path
          d="M62 210 C78 208 85 222 76 232 C67 242 52 230 62 210Z"
          fill="currentColor"
          opacity="0.15"
        />
        <path
          d="M62 210 C78 208 85 222 76 232"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
        />
      </g>
    </svg>
  );
}

// Floating leaf for ambient decoration
export function FloatingLeaf({ className }: PlantProps) {
  return (
    <svg
      viewBox="0 0 40 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-[var(--color-primary)]', className)}
    >
      <path
        d="M20 5 C10 12 6 25 10 38 C12 44 20 48 20 48 C20 48 28 44 30 38 C34 25 30 12 20 5Z"
        fill="currentColor"
        opacity="0.12"
      />
      <path
        d="M20 5 C10 12 6 25 10 38 C12 44 20 48 20 48 C20 48 28 44 30 38 C34 25 30 12 20 5Z"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.25"
      />
      {/* Central vein */}
      <path
        d="M20 10 V42"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.15"
      />
      {/* Side veins */}
      <path
        d="M20 18 L12 24 M20 26 L14 34 M20 22 L28 28 M20 30 L26 38"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.1"
      />
    </svg>
  );
}

// Scattered leaves and coffee beans background pattern
export function LeafPattern({ className }: PlantProps) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('', className)}
    >
      <g opacity="0.04">
        {/* Scattered small leaves */}
        <path d="M50 50C45 55 42 65 45 75C47 80 50 82 50 82C50 82 53 80 55 75C58 65 55 55 50 50Z" fill="var(--color-primary)" transform="rotate(15 50 65)" />
        <path d="M150 30C145 35 142 45 145 55C147 60 150 62 150 62C150 62 153 60 155 55C158 45 155 35 150 30Z" fill="var(--color-primary)" transform="rotate(-20 150 45)" />
        <path d="M300 80C295 85 292 95 295 105C297 110 300 112 300 112C300 112 303 110 305 105C308 95 305 85 300 80Z" fill="var(--color-primary)" transform="rotate(30 300 95)" />
        <path d="M380 150C375 155 372 165 375 175C377 180 380 182 380 182C380 182 383 180 385 175C388 165 385 155 380 150Z" fill="var(--color-primary)" transform="rotate(-10 380 165)" />
        <path d="M80 200C75 205 72 215 75 225C77 230 80 232 80 232C80 232 83 230 85 225C88 215 85 205 80 200Z" fill="var(--color-primary)" transform="rotate(45 80 215)" />
        <path d="M200 180C195 185 192 195 195 205C197 210 200 212 200 212C200 212 203 210 205 205C208 195 205 185 200 180Z" fill="var(--color-primary)" transform="rotate(-35 200 195)" />
        <path d="M350 250C345 255 342 265 345 275C347 280 350 282 350 282C350 282 353 280 355 275C358 265 355 255 350 250Z" fill="var(--color-primary)" transform="rotate(25 350 265)" />
        <path d="M30 320C25 325 22 335 25 345C27 350 30 352 30 352C30 352 33 350 35 345C38 335 35 325 30 320Z" fill="var(--color-primary)" transform="rotate(-15 30 335)" />
        
        {/* Coffee beans scattered */}
        <ellipse cx="100" cy="120" rx="8" ry="12" fill="var(--color-accent)" transform="rotate(25 100 120)" />
        <ellipse cx="280" cy="180" rx="6" ry="10" fill="var(--color-accent)" transform="rotate(-15 280 180)" />
        <ellipse cx="360" cy="320" rx="7" ry="11" fill="var(--color-accent)" transform="rotate(35 360 320)" />
        <ellipse cx="50" cy="380" rx="6" ry="9" fill="var(--color-accent)" transform="rotate(-20 50 380)" />
        <ellipse cx="220" cy="280" rx="7" ry="10" fill="var(--color-accent)" transform="rotate(10 220 280)" />
        
        {/* More leaves */}
        <path d="M180 350C175 355 172 365 175 375C177 380 180 382 180 382C180 382 183 380 185 375C188 365 185 355 180 350Z" fill="var(--color-primary)" transform="rotate(40 180 365)" />
        <path d="M320 380C315 385 312 395 315 405C317 410 320 412 320 412C320 412 323 410 325 405C328 395 325 385 320 380Z" fill="var(--color-primary)" transform="rotate(-25 320 395)" />
        <path d="M250 300C245 305 242 315 245 325C247 330 250 332 250 332C250 332 253 330 255 325C258 315 255 305 250 300Z" fill="var(--color-primary)" transform="rotate(10 250 315)" />
        <path d="M120 280C115 285 112 295 115 305C117 310 120 312 120 312C120 312 123 310 125 305C128 295 125 285 120 280Z" fill="var(--color-primary)" transform="rotate(-40 120 295)" />
      </g>
    </svg>
  );
}

// Cafe plant - potted plant in a mug-style pot
export function CafePlant({ className }: PlantProps) {
  return (
    <svg
      viewBox="0 0 100 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('', className)}
    >
      {/* Mug-style pot */}
      <path
        d="M25 80L28 120C28 125 35 130 50 130C65 130 72 125 72 120L75 80H25Z"
        fill="var(--color-surface)"
        stroke="var(--color-border)"
        strokeWidth="2"
      />
      {/* Mug handle */}
      <path
        d="M72 90C82 90 88 97 88 107C88 117 82 124 72 124"
        stroke="var(--color-border)"
        strokeWidth="2"
        fill="none"
      />
      {/* Mug rim */}
      <ellipse
        cx="50"
        cy="80"
        rx="25"
        ry="6"
        fill="var(--color-background)"
        stroke="var(--color-border)"
        strokeWidth="2"
      />
      {/* Soil */}
      <ellipse
        cx="50"
        cy="82"
        rx="20"
        ry="4"
        fill="var(--color-text)"
        opacity="0.15"
      />
      {/* Main stem */}
      <path
        d="M50 80V50"
        stroke="var(--color-primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Leaves */}
      <path
        d="M50 65C50 65 35 55 32 40C29 25 42 20 50 35"
        fill="var(--color-primary)"
        opacity="0.2"
      />
      <path
        d="M50 65C50 65 35 55 32 40C29 25 42 20 50 35"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M50 35C58 20 71 25 68 40C65 55 50 65 50 65"
        fill="var(--color-primary)"
        opacity="0.2"
      />
      <path
        d="M50 35C58 20 71 25 68 40C65 55 50 65 50 65"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Small side leaves */}
      <path
        d="M45 55C38 52 28 55 30 65C32 72 45 70 45 55Z"
        fill="var(--color-primary)"
        opacity="0.15"
      />
      <path
        d="M45 55C38 52 28 55 30 65"
        stroke="var(--color-primary)"
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M55 55C62 52 72 55 70 65C68 72 55 70 55 55Z"
        fill="var(--color-primary)"
        opacity="0.15"
      />
      <path
        d="M55 55C62 52 72 55 70 65"
        stroke="var(--color-primary)"
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />
      {/* Leaf vein */}
      <path
        d="M50 35V62"
        stroke="var(--color-primary)"
        strokeWidth="0.75"
        opacity="0.3"
      />
    </svg>
  );
}


