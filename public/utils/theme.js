import { DEFAULT_THEME, THEME_COLOR_META } from "../settings/themeSettings.js";

export function ensureDarkTheme() {
  try {
    const root = document.documentElement;
    root.setAttribute('data-theme', DEFAULT_THEME);
    
    root.style.colorScheme = DEFAULT_THEME;
    if (document.body) {
      document.body.style.background = 'var(--background)';
      document.body.style.color = 'var(--text-primary)';
    }

    
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', THEME_COLOR_META);
  } catch (_) {
    
  }
}