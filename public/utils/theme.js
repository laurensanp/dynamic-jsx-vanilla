import * as ThemeSettings from "../settings/themeSettings.js";

export function ensureDarkTheme() {
  try {
    const root = document.documentElement;
    root.setAttribute('data-theme', ThemeSettings.DEFAULT_THEME);
    
    root.style.colorScheme = ThemeSettings.DEFAULT_THEME;
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
    meta.setAttribute('content', ThemeSettings.THEME_COLOR_META);
  } catch (_) {
    
  }
}