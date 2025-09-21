export function ensureDarkTheme() {
  try {
    const root = document.documentElement;
    root.setAttribute('data-theme', 'dark');
    
    root.style.colorScheme = 'dark';
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
    meta.setAttribute('content', '#000000');
  } catch (_) {
    
  }
}