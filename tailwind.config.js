export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        overlay: 'var(--color-overlay)',
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        border: 'var(--color-border)',
        'border-subtle': 'var(--color-border-subtle)',
        text: 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        success: 'var(--color-success)',
      },
      spacing: {
        'token-xs': 'var(--spacing-xs)',
        'token-sm': 'var(--spacing-sm)',
        'token-md': 'var(--spacing-md)',
        'token-lg': 'var(--spacing-lg)',
        'token-xl': 'var(--spacing-xl)',
      },
      borderRadius: {
        'token-sm': 'var(--radius-sm)',
        'token-md': 'var(--radius-md)',
        'token-lg': 'var(--radius-lg)',
      },
      boxShadow: {
        'elevation-1': 'var(--elevation-1)',
        'elevation-2': 'var(--elevation-2)',
        'elevation-3': 'var(--elevation-3)',
      },
    },
  },
  plugins: [],
};
