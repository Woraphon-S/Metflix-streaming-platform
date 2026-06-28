import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/features/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  // Profile avatar gradients are composed from data (lib/avatars.ts); safelist
  // them so the JIT always emits the classes regardless of content scanning.
  safelist: [
    'from-emerald', 'to-primary',
    'from-orange-500', 'to-red-500',
    'from-violet-500', 'to-fuchsia-600',
    'from-sky-500', 'to-indigo-600',
    'from-rose-500', 'to-orange-400',
    'from-slate-500', 'to-slate-700',
  ],
  theme: {
    extend: {
      colors: {
        background: '#050814',
        surface: '#0B1020',
        'surface-soft': '#111827',
        primary: {
          DEFAULT: '#0EA5E9',
          50: '#E0F2FE',
          100: '#BAE6FD',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        deep: '#1D4ED8',
        emerald: {
          DEFAULT: '#00FF9C',
          soft: '#34D399',
        },
        muted: '#94A3B8',
        text: {
          DEFAULT: '#F8FAFC',
          muted: '#94A3B8',
          subtle: '#64748B',
        },
        danger: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
      },
      fontFamily: {
        sans: [
          'Inter',
          'Anuphan',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        display: ['Sora', 'Anuphan', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(14, 165, 233, 0.45)',
        glowEmerald: '0 0 40px rgba(0, 255, 156, 0.35)',
        card: '0 20px 50px -20px rgba(2, 132, 199, 0.45)',
      },
      backgroundImage: {
        'hero-vignette':
          'linear-gradient(180deg, rgba(5,8,20,0) 0%, rgba(5,8,20,0.6) 60%, rgba(5,8,20,1) 100%)',
        'horizontal-fade':
          'linear-gradient(90deg, rgba(5,8,20,1) 0%, rgba(5,8,20,0) 20%, rgba(5,8,20,0) 80%, rgba(5,8,20,1) 100%)',
        'grid-glow':
          'radial-gradient(circle at top, rgba(14,165,233,0.18), transparent 55%), radial-gradient(circle at bottom right, rgba(0,255,156,0.12), transparent 60%)',
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        floatUp: 'floatUp 0.6s ease-out both',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        floatUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
