/**
 * TruIndee Design System & Style Guide
 * Based on Figma design and existing brand elements
 */

// === BRAND COLORS ===
export const colors = {
  // Primary Brand Colors
  primary: {
    500: '#35A764', // Main brand green
    400: '#42B96F',
    600: '#2A8A54',
    700: '#1F6B40',
    800: '#164A2C',
    900: '#0D2F1C'
  },
  
  // Background Colors
  background: {
    primary: '#141418',    // Main dark background
    secondary: '#1A1A1F',  // Slightly lighter dark
    tertiary: '#2A2A30',   // Card backgrounds
    overlay: 'rgba(254, 254, 254, 0.1)' // White overlay with transparency
  },
  
  // Text Colors
  text: {
    primary: '#FEFEFE',    // Main white text
    secondary: '#F0F0F1',  // Subtle grey for secondary text
    muted: '#B7B7B6',      // Muted grey for less important text
    accent: '#35A764'      // Green accent text
  },
  
  // Accent Colors
  accent: {
    star: '#EB9A17',       // Star/rating color (orange)
    success: '#35A764',    // Success states
    warning: '#F59E0B',    // Warning states
    error: '#EF4444',      // Error states
    info: '#3B82F6'        // Info states
  },
  
  // Interactive States
  interactive: {
    hover: '#2a8a54',      // Hover state for primary elements
    focus: '#42B96F',      // Focus state
    pressed: '#1F6B40',    // Pressed/active state
    disabled: '#6B7280'    // Disabled state
  }
};

// === TYPOGRAPHY ===
export const typography = {
  fontFamily: {
    primary: "'Poppins', 'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'Monaco', 'Consolas', monospace"
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75'
  }
};

// === SPACING ===
export const spacing = {
  px: '1px',
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem',    // 256px
};

// === BORDER RADIUS ===
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'
};

// === SHADOWS ===
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none'
};

// === COMPONENT STYLES ===
export const components = {
  // Button Styles
  button: {
    primary: {
      background: colors.primary[500],
      color: colors.text.primary,
      hover: colors.interactive.hover,
      padding: `${spacing[3]} ${spacing[6]}`,
      borderRadius: borderRadius['3xl'],
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.lg
    },
    
    secondary: {
      background: 'transparent',
      color: colors.primary[500],
      border: `1px solid ${colors.primary[500]}`,
      hover: {
        background: colors.primary[500],
        color: colors.text.primary
      },
      padding: `${spacing[3]} ${spacing[6]}`,
      borderRadius: borderRadius['3xl'],
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.lg
    },
    
    ghost: {
      background: 'transparent',
      color: colors.text.secondary,
      hover: colors.text.primary,
      padding: `${spacing[2]} ${spacing[4]}`,
      borderRadius: borderRadius.md,
      fontWeight: typography.fontWeight.medium
    }
  },
  
  // Card Styles
  card: {
    background: colors.background.overlay,
    backdropFilter: 'blur(2px)',
    border: `1px solid ${colors.primary[500]}`,
    borderRadius: borderRadius['3xl'],
    padding: spacing[8]
  },
  
  // Navigation Styles
  navigation: {
    link: {
      color: colors.text.secondary,
      hover: colors.primary[500],
      active: {
        color: colors.primary[500],
        borderBottom: `1px solid ${colors.primary[500]}`
      },
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.medium
    }
  },
  
  // Form Styles
  form: {
    input: {
      background: colors.background.tertiary,
      border: `1px solid ${colors.text.muted}`,
      borderRadius: borderRadius.lg,
      padding: `${spacing[3]} ${spacing[4]}`,
      color: colors.text.primary,
      focus: {
        borderColor: colors.primary[500],
        outline: `2px solid ${colors.primary[500]}40`
      }
    }
  }
};

// === LAYOUT BREAKPOINTS ===
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// === BRAND ASSETS ===
export const brandAssets = {
  logo: {
    horizontal: '/TruIndee-Horz-Logo.png',
    icon: '/truindee-logo.svg',
    favicon: '/favicon.ico'
  },
  
  placeholderImages: {
    album: 'https://images.pexels.com/photos/1763067/pexels-photo-1763067.jpeg?auto=compress&cs=tinysrgb&w=400',
    artist: 'https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg?auto=compress&cs=tinysrgb&w=400',
    hero: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1600'
  }
};

// === ANIMATION ===
export const animation = {
  transition: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out'
  },
  
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)'
  }
};

// === UTILITY CLASSES (for Tailwind) ===
export const utilityClasses = {
  // Background
  bgPrimary: 'bg-[#141418]',
  bgSecondary: 'bg-[#1A1A1F]',
  bgTertiary: 'bg-[#2A2A30]',
  bgOverlay: 'bg-white/10',
  
  // Text
  textPrimary: 'text-[#FEFEFE]',
  textSecondary: 'text-[#F0F0F1]',
  textMuted: 'text-[#B7B7B6]',
  textAccent: 'text-[#35A764]',
  
  // Brand colors
  brandPrimary: 'text-[#35A764]',
  brandBg: 'bg-[#35A764]',
  brandBorder: 'border-[#35A764]',
  brandHover: 'hover:bg-[#2a8a54]',
  
  // Common combinations
  cardStyle: 'bg-white/10 backdrop-blur-sm border border-[#35A764] rounded-3xl',
  buttonPrimary: 'bg-[#35A764] text-white font-bold rounded-3xl hover:bg-[#2a8a54] transition-colors',
  buttonSecondary: 'border border-[#35A764] text-[#35A764] font-bold rounded-3xl hover:bg-[#35A764] hover:text-white transition-colors'
};

// Export default style guide
export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  components,
  breakpoints,
  brandAssets,
  animation,
  utilityClasses
};
