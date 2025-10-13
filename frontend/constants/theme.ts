// TailFlix Theme Configuration - Playful Luxury Edition
export const COLORS = {
  // Legacy colors (kept for compatibility)
  black: '#000000',
  charcoal: '#2B2B2B',
  white: '#FFFFFF',
  crimson: '#DC143C',
  gold: '#FFD700',
  darkGray: '#1A1A1A',
  gray: '#666666',
  
  // New Playful Luxury Palette
  cream: '#FFF8E7',
  creamLight: '#FFFCF5',
  goldenBeige: '#FFE4B5',
  peach: '#FFDAB9',
  softPeach: '#FFEFD5',
  pawPink: '#FFB6C1',
  pawPinkLight: '#FFD1DC',
  chocolateBrown: '#D2691E',
  warmBrown: '#8B4513',
  lightBrown: 'rgba(139, 69, 19, 0.8)',
  goldShimmer: '#FFA500',
  
  // Gradients (as array for LinearGradient)
  gradientCream: ['#FFF8E7', '#FFE4B5', '#FFD700'],
  gradientPeach: ['#FFF8E7', '#FFE4B5', '#FFDAB9'],
  gradientPawPink: ['#FFB6C1', '#FFD700'],
  gradientCard: ['#FFDAB9', '#FFF8E7'],
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 9999,
};

export const SHADOWS = {
  soft: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  premium: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  glow: {
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 12,
  },
};

export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 400,
  bounce: 600,
};
