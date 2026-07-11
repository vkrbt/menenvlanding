(function () {
  var STORAGE_KEY = 'sreda-theme';
  var stored = localStorage.getItem(STORAGE_KEY);
  var theme = stored === 'light' || stored === 'dark' ? stored : 'system';
  document.documentElement.setAttribute('data-theme', theme);
})();
