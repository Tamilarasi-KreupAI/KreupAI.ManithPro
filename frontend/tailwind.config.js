/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ============================================
      // SEMANTIC COLOR SYSTEM
      // ============================================
      colors: {
        // Brand Colors (Primary)
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Keep primary as alias for brand (backward compatibility)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Success Colors (Green)
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Warning Colors (Amber/Yellow)
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Error/Danger Colors (Red)
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // Info Colors (Cyan/Light Blue)
        info: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        // Neutral Colors (Gray scale)
        neutral: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        // Surface Colors (use CSS variables for theme switching)
        surface: {
          primary: 'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
          tertiary: 'var(--surface-tertiary)',
          elevated: 'var(--surface-elevated)',
          overlay: 'var(--surface-overlay)',
        },
        // Text Colors (use CSS variables)
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          inverse: 'var(--text-inverse)',
          disabled: 'var(--text-disabled)',
        },
        // Border Colors (use CSS variables)
        border: {
          primary: 'var(--border-primary)',
          secondary: 'var(--border-secondary)',
          focus: 'var(--border-focus)',
        },
      },

      // ============================================
      // TYPOGRAPHY SCALE
      // ============================================
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'source-code-pro',
          'Menlo',
          'Monaco',
          'Consolas',
          'Courier New',
          'monospace',
        ],
      },
      fontSize: {
        // Display sizes (for hero sections, large headings)
        'display-2xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'display-sm': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        // Heading sizes (for section headings)
        'heading-xl': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-lg': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-md': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-sm': ['1rem', { lineHeight: '1.5', fontWeight: '600' }],
        'heading-xs': ['0.875rem', { lineHeight: '1.5', fontWeight: '600' }],
        // Body sizes (for paragraphs, content)
        'body-xl': ['1.25rem', { lineHeight: '1.6' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body-md': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'body-xs': ['0.75rem', { lineHeight: '1.5' }],
        // Label sizes (for form labels, buttons)
        'label-lg': ['1rem', { lineHeight: '1.5', fontWeight: '500' }],
        'label-md': ['0.875rem', { lineHeight: '1.5', fontWeight: '500' }],
        'label-sm': ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
        // Caption sizes (for helper text, metadata)
        'caption': ['0.75rem', { lineHeight: '1.4' }],
        'caption-sm': ['0.6875rem', { lineHeight: '1.4' }],
      },

      // ============================================
      // SPACING SCALE (Extended)
      // ============================================
      spacing: {
        '0.5': '0.125rem',   // 2px
        '1.5': '0.375rem',   // 6px
        '2.5': '0.625rem',   // 10px
        '3.5': '0.875rem',   // 14px
        '4.5': '1.125rem',   // 18px
        '5.5': '1.375rem',   // 22px
        '6.5': '1.625rem',   // 26px
        '7.5': '1.875rem',   // 30px
        '13': '3.25rem',     // 52px
        '15': '3.75rem',     // 60px
        '17': '4.25rem',     // 68px
        '18': '4.5rem',      // 72px
        '19': '4.75rem',     // 76px
        '21': '5.25rem',     // 84px
        '22': '5.5rem',      // 88px
        '26': '6.5rem',      // 104px
        '30': '7.5rem',      // 120px
        '34': '8.5rem',      // 136px
        '38': '9.5rem',      // 152px
        '42': '10.5rem',     // 168px
        '50': '12.5rem',     // 200px
        '58': '14.5rem',     // 232px
        '66': '16.5rem',     // 264px
        '74': '18.5rem',     // 296px
        '82': '20.5rem',     // 328px
        '90': '22.5rem',     // 360px
        '100': '25rem',      // 400px
      },

      // ============================================
      // BORDER RADIUS
      // ============================================
      borderRadius: {
        'none': '0',
        'xs': '0.125rem',    // 2px
        'sm': '0.25rem',     // 4px
        'DEFAULT': '0.375rem', // 6px
        'md': '0.5rem',      // 8px
        'lg': '0.75rem',     // 12px
        'xl': '1rem',        // 16px
        '2xl': '1.25rem',    // 20px
        '3xl': '1.5rem',     // 24px
        '4xl': '2rem',       // 32px
        '5xl': '2.5rem',     // 40px
        'full': '9999px',
      },

      // ============================================
      // BOX SHADOW SYSTEM
      // ============================================
      boxShadow: {
        // Elevation shadows (subtle, for light mode)
        'elevation-1': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        'elevation-2': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'elevation-3': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'elevation-4': '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        'elevation-5': '0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
        'elevation-6': '0 25px 50px -12px rgb(0 0 0 / 0.15)',
        // Soft shadows (for cards, modals)
        'soft-xs': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        'soft-sm': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'soft-md': '0 4px 6px -1px rgb(0 0 0 / 0.04), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'soft-lg': '0 10px 15px -3px rgb(0 0 0 / 0.04), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
        'soft-xl': '0 20px 25px -5px rgb(0 0 0 / 0.04), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
        'soft-2xl': '0 25px 50px -12px rgb(0 0 0 / 0.12)',
        // Inner shadows
        'inner-soft': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.03)',
        'inner-md': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)',
        // Glow effects (for focus, highlights)
        'glow-brand': '0 0 20px -5px rgb(59 130 246 / 0.4)',
        'glow-brand-lg': '0 0 30px -5px rgb(59 130 246 / 0.5)',
        'glow-success': '0 0 20px -5px rgb(34 197 94 / 0.4)',
        'glow-warning': '0 0 20px -5px rgb(245 158 11 / 0.4)',
        'glow-error': '0 0 20px -5px rgb(239 68 68 / 0.4)',
        'glow-info': '0 0 20px -5px rgb(6 182 212 / 0.4)',
        // Ring shadows (for focus states)
        'ring-brand': '0 0 0 3px rgb(59 130 246 / 0.2)',
        'ring-success': '0 0 0 3px rgb(34 197 94 / 0.2)',
        'ring-warning': '0 0 0 3px rgb(245 158 11 / 0.2)',
        'ring-error': '0 0 0 3px rgb(239 68 68 / 0.2)',
        // Button shadows
        'button': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'button-hover': '0 2px 4px 0 rgb(0 0 0 / 0.1)',
        'button-active': 'inset 0 1px 2px 0 rgb(0 0 0 / 0.1)',
        // Card shadows
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        // Dropdown/Popover shadows
        'dropdown': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)',
        'modal': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      },

      // ============================================
      // ANIMATION KEYFRAMES
      // ============================================
      keyframes: {
        // Existing
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // Fade animations
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Slide animations
        'slide-in-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-in-down': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out-up': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        'slide-out-down': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'slide-out-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        // Scale animations
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'scale-out': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        'scale-in-center': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        // Bounce animations
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        // Pulse animations
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '1' },
          '100%': { transform: 'scale(1.3)', opacity: '0' },
        },
        // Shake animation (for errors)
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        // Spin animations
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        // Skeleton loading
        'skeleton-wave': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // Accordion
        'accordion-down': {
          '0%': { height: '0', opacity: '0' },
          '100%': { height: 'var(--radix-accordion-content-height)', opacity: '1' },
        },
        'accordion-up': {
          '0%': { height: 'var(--radix-accordion-content-height)', opacity: '1' },
          '100%': { height: '0', opacity: '0' },
        },
        // Toast animations
        'toast-slide-in-right': {
          '0%': { transform: 'translateX(calc(100% + 24px))' },
          '100%': { transform: 'translateX(0)' },
        },
        'toast-slide-out-right': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(calc(100% + 24px))' },
        },
        // Progress bar
        'progress-indeterminate': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },
        // Highlight
        'highlight': {
          '0%': { backgroundColor: 'rgb(254 243 199)' },
          '100%': { backgroundColor: 'transparent' },
        },
      },

      // ============================================
      // ANIMATION DEFINITIONS
      // ============================================
      animation: {
        // Existing
        'shimmer': 'shimmer 2s linear infinite',
        // Fade
        'fade-in': 'fade-in 0.2s ease-out forwards',
        'fade-out': 'fade-out 0.2s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
        'fade-in-down': 'fade-in-down 0.3s ease-out forwards',
        // Slide
        'slide-in-up': 'slide-in-up 0.3s ease-out forwards',
        'slide-in-down': 'slide-in-down 0.3s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.3s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.3s ease-out forwards',
        'slide-out-up': 'slide-out-up 0.3s ease-out forwards',
        'slide-out-down': 'slide-out-down 0.3s ease-out forwards',
        'slide-out-left': 'slide-out-left 0.3s ease-out forwards',
        'slide-out-right': 'slide-out-right 0.3s ease-out forwards',
        // Scale
        'scale-in': 'scale-in 0.2s ease-out forwards',
        'scale-out': 'scale-out 0.2s ease-out forwards',
        'scale-in-center': 'scale-in-center 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        // Bounce
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'bounce-in': 'bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        // Pulse
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // Shake
        'shake': 'shake 0.5s ease-in-out',
        // Spin
        'spin-slow': 'spin-slow 3s linear infinite',
        // Skeleton
        'skeleton': 'skeleton-wave 1.5s ease-in-out infinite',
        // Accordion
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        // Toast
        'toast-in': 'toast-slide-in-right 0.3s ease-out forwards',
        'toast-out': 'toast-slide-out-right 0.3s ease-out forwards',
        // Progress
        'progress': 'progress-indeterminate 1.5s ease-in-out infinite',
        // Highlight
        'highlight': 'highlight 2s ease-out',
      },

      // ============================================
      // TRANSITION TIMING
      // ============================================
      transitionDuration: {
        '0': '0ms',
        '50': '50ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
        '350': '350ms',
        '400': '400ms',
        '450': '450ms',
        '500': '500ms',
        '600': '600ms',
        '700': '700ms',
        '800': '800ms',
        '900': '900ms',
        '1000': '1000ms',
      },
      transitionTimingFunction: {
        'ease-in-out-back': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'ease-out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-in-back': 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
        'ease-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },

      // ============================================
      // Z-INDEX SCALE
      // ============================================
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'dropdown': '1000',
        'sticky': '1100',
        'fixed': '1100',
        'modal-backdrop': '1200',
        'modal': '1300',
        'popover': '1400',
        'tooltip': '1500',
        'toast': '1600',
        'max': '9999',
      },

      // ============================================
      // BACKDROP BLUR
      // ============================================
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },

      // ============================================
      // ASPECT RATIO
      // ============================================
      aspectRatio: {
        'auto': 'auto',
        'square': '1 / 1',
        'video': '16 / 9',
        'photo': '4 / 3',
        'portrait': '3 / 4',
        'wide': '21 / 9',
      },

      // ============================================
      // CONTAINER
      // ============================================
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
          xl: '2.5rem',
          '2xl': '3rem',
        },
      },

      // ============================================
      // SCREEN BREAKPOINTS (Extended)
      // ============================================
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
        // Max-width breakpoints
        'max-xs': { 'max': '474px' },
        'max-sm': { 'max': '639px' },
        'max-md': { 'max': '767px' },
        'max-lg': { 'max': '1023px' },
        'max-xl': { 'max': '1279px' },
        'max-2xl': { 'max': '1535px' },
      },
    },
  },
  plugins: [],
}
