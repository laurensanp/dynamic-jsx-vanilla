export function ensureDarkTheme() {
  try {
    const root = document.documentElement;
    root.setAttribute('data-theme', 'dark');
    // Hint browsers for proper form controls rendering
    root.style.colorScheme = 'dark';
    if (document.body) {
      document.body.style.background = 'var(--background)';
      document.body.style.color = 'var(--text-primary)';
    }

    // Ensure meta theme-color for mobile browsers
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', '#000000');
  } catch (_) {
    // no-op
  }
}