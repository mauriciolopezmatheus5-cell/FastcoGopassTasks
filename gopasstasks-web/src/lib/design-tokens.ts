/**
 * Tokens de diseño extraídos del Figma GopassTasks.
 * Fuente única de verdad para colores, tipografía y espaciado.
 * Cada valor coincide exactamente con la implementación del Figma Make.
 *
 * URL Figma: https://coat-party-55196278.figma.site/
 */

export const DESIGN_TOKENS = {
  colors: {
    /** Color de acción principal — Indigo-600 */
    primary: '#6366F1',
    /** Hover y estados activos — Indigo-700 */
    primaryDark: '#4F46E5',
    /** Fondos sutiles y badges — Indigo-50 */
    primaryLight: '#EEF2FF',

    background: {
      /** Fondo general de la aplicación — Slate-100 */
      app: '#F1F5F9',
      /** Fondo del sidebar — Blanco puro */
      sidebar: '#FFFFFF',
      /** Fondo de tarjetas y modales — Blanco puro */
      card: '#FFFFFF',
      /** Fondo de secciones secundarias — Slate-50 */
      muted: '#F8FAFC',
    },

    text: {
      /** Texto principal — Slate-900 */
      primary: '#0F172A',
      /** Texto secundario — Slate-600 */
      secondary: '#475569',
      /** Texto tenue / placeholders / metadatos — Slate-500 */
      muted: '#64748B',
      /** Texto muy tenue — Slate-400 */
      subtle: '#94A3B8',
    },

    border: {
      /** Borde estándar — Slate-200 */
      default: '#E2E8F0',
      /** Borde muy sutil — Slate-100 */
      subtle: '#F1F5F9',
      /** Borde al enfocar inputs — Indigo-600 */
      focus: '#6366F1',
    },

    /** Colores por estado de tarea, extraídos del tablero Kanban del Figma */
    status: {
      backlog: {
        bg: '#F1F5F9',     // slate-100
        text: '#475569',   // slate-600
        dot: '#94A3B8',    // slate-400
      },
      enProgreso: {
        bg: '#DBEAFE',     // blue-100
        text: '#1D4ED8',   // blue-700
        dot: '#3B82F6',    // blue-500
      },
      pruebasQa: {
        bg: '#FEF3C7',     // amber-100
        text: '#B45309',   // amber-700
        dot: '#F59E0B',    // amber-500
      },
      listo: {
        bg: '#D1FAE5',     // emerald-100
        text: '#047857',   // emerald-700
        dot: '#10B981',    // emerald-500
      },
      aprobado: {
        bg: '#EDE9FE',     // violet-100
        text: '#6D28D9',   // violet-700
        dot: '#8B5CF6',    // violet-500
      },
    },

    /** Colores por nivel de prioridad, extraídos de los badges del Figma */
    priority: {
      baja: {
        bg: '#F1F5F9',     // slate-100
        text: '#64748B',   // slate-500
        border: '#E2E8F0', // slate-200
      },
      media: {
        bg: '#EFF6FF',     // blue-50
        text: '#2563EB',   // blue-600
        border: '#BFDBFE', // blue-200
      },
      alta: {
        bg: '#FEF2F2',     // red-50
        text: '#DC2626',   // red-600
        border: '#FECACA', // red-200
      },
      urgente: {
        bg: '#FEE2E2',     // red-100
        text: '#B91C1C',   // red-700
        border: '#FCA5A5', // red-300
      },
    },

    /** Colores del logo — ícono verde con letra G y checkmark */
    brand: {
      /** Verde del ícono del logo — Green-500 */
      icon: '#22C55E',
      /** Fondo del ícono — Green-500 */
      iconBg: '#22C55E',
      /** "Tasks" en el nombre del logo — Indigo-600 */
      accent: '#6366F1',
    },
  },

  typography: {
    fontFamily: {
      /** Fuente principal del proyecto */
      sans: ["'Inter'", 'system-ui', 'sans-serif'],
      /** Fuente monoespaciada para IDs y código */
      mono: ["'JetBrains Mono'", "'Fira Code'", 'monospace'],
    },
    fontSize: {
      /** Micro texto — etiquetas diminutas */
      xs2: '10px',
      /** Extra pequeño — etiquetas, metadatos */
      xs: '12px',
      /** Pequeño — texto de cuerpo */
      sm: '14px',
      /** Base — texto de interfaz */
      base: '16px',
      /** Grande — títulos de sección */
      lg: '18px',
      /** Extra grande — títulos de página */
      xl: '20px',
      /** Doble extra grande — headings */
      '2xl': '24px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.625',
    },
    letterSpacing: {
      /** Subtítulo "WORKSPACE" en el logo */
      widest: '0.05em',
    },
  },

  spacing: {
    /** Padding interno del sidebar */
    sidebarPadding: '16px',
    /** Ancho del sidebar — w-64 */
    sidebarWidth: '256px',
    /** Radio de bordes de cards — rounded-2xl */
    cardRadius: '16px',
    /** Radio de bordes de botones e inputs — rounded-lg */
    inputRadius: '8px',
    /** Radio de bordes de íconos — rounded-xl */
    iconRadius: '12px',
    /** Radio de badges — rounded-full */
    badgeRadius: '9999px',
  },

  borderRadius: {
    /** Extra pequeño — 4px */
    sm: '4px',
    /** Medio — 8px — botones, inputs */
    md: '8px',
    /** Grande — 12px — íconos, elementos medianos */
    lg: '12px',
    /** Extra grande — 16px — tarjetas */
    xl: '16px',
    /** Completo — badges, avatares circulares */
    full: '9999px',
  },

  boxShadow: {
    /** Sombra estándar de tarjetas */
    card: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    /** Sombra al hacer hover en tarjetas */
    cardHover: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    /** Sombra del sidebar (borde derecho sutil) */
    sidebar: '1px 0 0 0 #E2E8F0',
  },
} as const;
