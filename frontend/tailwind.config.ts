import type { Config } from 'tailwindcss';

// Every value points at a CSS variable in src/styles/tokens.css. `colors`, `borderRadius` and
// `boxShadow` replace Tailwind's defaults (not extend them) so off-design palettes, rounded
// corners and blur shadows are simply not available.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      paper: 'var(--paper)',
      grid: 'var(--grid)',
      sheet: 'var(--sheet)',
      'sheet-2': 'var(--sheet-2)',
      ink: 'var(--ink)',
      'ink-2': 'var(--ink-2)',
      'ink-grid': 'var(--ink-grid)',
      muted: 'var(--muted)',
      'muted-on-ink': 'var(--muted-on-ink)',
      'muted-on-ink-2': 'var(--muted-on-ink-2)',
      rule: 'var(--rule)',
      'rule-dashed': 'var(--rule-dashed)',
      marker: 'var(--marker)',
      support: 'var(--support)',
      'support-tint': 'var(--support-tint)',
      contra: 'var(--contra)',
      partial: 'var(--partial)',
      'partial-hatch': 'var(--partial-hatch)',
      'partial-edge': 'var(--partial-edge)',
      insufficient: 'var(--insufficient)',
      'on-ink': 'var(--on-ink)',
      'rule-on-ink': 'var(--rule-on-ink)',
      'on-status': 'var(--on-status)',
      'chip-neutral': 'var(--chip-neutral)',
      'pdf-line': 'var(--pdf-line)',
    },
    fontFamily: {
      display: ['var(--font-display)'],
      sans: ['var(--font-sans)'],
      mono: ['var(--font-mono)'],
      quote: ['var(--font-quote)'],
    },
    borderRadius: {
      none: '0',
      sm: '0',
      DEFAULT: '0',
      md: '0',
      lg: '0',
      xl: '0',
      '2xl': '0',
      '3xl': '0',
      full: '0',
    },
    boxShadow: {
      none: 'none',
      hard: '4px 4px 0 var(--ink)',
      page: '8px 8px 0 var(--marker)',
    },
    extend: {
      borderWidth: {
        '1.5': '1.5px',
      },
      // Sizes measured from the design artboards.
      fontSize: {
        label: ['12px', { letterSpacing: '0.6px' }],
        claim: ['36px', { lineHeight: '1.15', letterSpacing: '-0.8px' }],
        h1: ['48px', { lineHeight: '1', letterSpacing: '-1.5px' }],
        verdict: ['64px', { lineHeight: '0.95', letterSpacing: '-2px' }],
      },
      maxWidth: {
        // The design's <main> is content-box (1320px + 32px padding each side); Tailwind is
        // border-box, so the max width includes the padding.
        layout: 'calc(var(--layout-max) + 2 * var(--layout-pad))',
      },
    },
  },
  plugins: [],
} satisfies Config;
