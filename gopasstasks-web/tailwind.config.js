/**
 * Configuración de TailwindCSS derivada de los tokens del Figma GopassTasks.
 * Todos los valores de color, tipografía y sombra coinciden con el Figma.
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Paleta principal ─────────────────────────────────────────
        primary: {
          DEFAULT: '#6366F1', // Indigo-600 — color de acción principal
          dark:    '#4F46E5', // Indigo-700 — hover y estados activos
          light:   '#EEF2FF', // Indigo-50  — fondos sutiles y badges
        },

        // ── Fondos de la app ─────────────────────────────────────────
        // Genera: bg-background-app, bg-background-card, etc.
        'background-app':     '#F1F5F9', // Slate-100 — fondo general
        'background-sidebar': '#FFFFFF', // Blanco    — fondo del sidebar
        'background-card':    '#FFFFFF', // Blanco    — fondo de tarjetas
        'background-muted':   '#F8FAFC', // Slate-50  — secciones secundarias

        // ── Texto ─────────────────────────────────────────────────────
        // Genera: text-text-primary, text-text-secondary, etc.
        'text-primary':   '#0F172A', // Slate-900
        'text-secondary': '#475569', // Slate-600
        'text-muted':     '#64748B', // Slate-500
        'text-subtle':    '#94A3B8', // Slate-400

        // ── Bordes ───────────────────────────────────────────────────
        // Genera: border-border, border-border-subtle, etc.
        border:           '#E2E8F0', // Slate-200 — borde estándar
        'border-subtle':  '#F1F5F9', // Slate-100 — borde muy sutil
        'border-focus':   '#6366F1', // Indigo-600 — borde en foco

        // ── Estados de tarea ─────────────────────────────────────────
        'status-pendiente':      '#FEF3C7', // amber-100  — fondo badge PENDIENTE
        'status-completada':     '#D1FAE5', // emerald-100 — fondo badge COMPLETADA

        // ── Texto de estados de tarea ────────────────────────────────
        'status-text-pendiente':  '#B45309', // amber-700
        'status-text-completada': '#047857', // emerald-700

        // ── Puntos/dots de estado ────────────────────────────────────
        'status-dot-pendiente':   '#F59E0B', // amber-500
        'status-dot-completada':  '#10B981', // emerald-500

        // ── Logo / Branding ──────────────────────────────────────────
        'brand-icon':   '#22C55E', // green-500 — fondo del ícono del logo
        'brand-accent': '#6366F1', // indigo-600 — "Tasks" en el logotipo
      },

      fontFamily: {
        sans: ["'Inter'", 'system-ui', 'sans-serif'],
        mono: ["'JetBrains Mono'", "'Fira Code'", 'monospace'],
      },

      fontSize: {
        'xs-2': ['10px', { lineHeight: '1.25' }],
      },

      borderRadius: {
        sm:  '4px',
        md:  '8px',
        lg:  '12px',   // íconos, elementos medianos
        xl:  '16px',   // tarjetas
        '2xl': '16px', // alias para cards
      },

      boxShadow: {
        card:       '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'card-hover':'0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        sidebar:    '1px 0 0 0 #E2E8F0',
      },

      width: {
        sidebar: '256px',
      },

      letterSpacing: {
        widest: '0.05em',
      },
    },
  },
  plugins: [],
}


