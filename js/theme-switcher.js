/* ================================================
   theme-switcher.js — Dedicated Theme Module
   ================================================ */

const ThemeSwitcher = (() => {
    const STORAGE_KEY = 'portfolio-theme';
    const root        = document.documentElement;

    /* Apply theme and update button icon */
    function apply(theme) {
        root.setAttribute('data-theme', theme);
        const icon = document.getElementById('theme-icon');
        if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem(STORAGE_KEY, theme);
    }

    /* Toggle between dark and light */
    function toggle() {
        const current = root.getAttribute('data-theme') || 'light';
        apply(current === 'dark' ? 'light' : 'dark');
    }

    /* Init — restore saved preference or use system preference */
    function init() {
        const saved  = localStorage.getItem(STORAGE_KEY);
        const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        apply(saved || system);

        const btn = document.getElementById('theme-toggle');
        if (btn) btn.addEventListener('click', toggle);

        /* Auto-switch when system preference changes */
        window.matchMedia('(prefers-color-scheme: dark)')
              .addEventListener('change', e => {
                  if (!localStorage.getItem(STORAGE_KEY)) apply(e.matches ? 'dark' : 'light');
              });
    }

    return { init, apply, toggle };
})();

export default ThemeSwitcher;
