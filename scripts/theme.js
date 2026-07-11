(function () {
  var STORAGE_KEY = 'sreda-theme';
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;

  var labels = {
    system: 'Тема: как в системе',
    light: 'Тема: светлая',
    dark: 'Тема: тёмная',
  };

  var order = ['system', 'light', 'dark'];

  function getTheme() {
    var current = document.documentElement.getAttribute('data-theme');
    return order.indexOf(current) >= 0 ? current : 'system';
  }

  function resolvedTheme() {
    var theme = getTheme();
    if (theme !== 'system') return theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function updateButton() {
    var theme = getTheme();
    btn.setAttribute('data-theme-mode', theme);
    btn.setAttribute('aria-label', labels[theme]);
    btn.setAttribute('title', labels[theme]);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'system') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, theme);
    }
    updateButton();
  }

  btn.addEventListener('click', function () {
    var idx = order.indexOf(getTheme());
    applyTheme(order[(idx + 1) % order.length]);
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    if (getTheme() === 'system') updateButton();
  });

  updateButton();
  document.documentElement.setAttribute('data-theme-resolved', resolvedTheme());
})();
