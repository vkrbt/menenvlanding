/* ============================================================
   COUNTDOWN — до ближайшей встречи
   Встречи каждые 2 недели начиная с 2026-04-01
============================================================ */
(function () {
  const el = document.getElementById('cd-days');
  if (!el) return;

  const FIRST_MEETING = new Date('2026-04-01T00:00:00');
  const TWO_WEEKS_MS  = 14 * 24 * 60 * 60 * 1000;

  function getNextMeeting() {
    const now = Date.now();
    if (now < FIRST_MEETING.getTime()) return FIRST_MEETING;

    // Сколько двухнедельных периодов прошло с первой встречи
    const elapsed  = now - FIRST_MEETING.getTime();
    const periods  = Math.floor(elapsed / TWO_WEEKS_MS);
    // Следующая встреча — начало следующего периода
    return new Date(FIRST_MEETING.getTime() + (periods + 1) * TWO_WEEKS_MS);
  }

  const pad = n => String(n).padStart(2, '0');

  function tick() {
    const target = getNextMeeting();
    const diff   = target - Date.now();

    if (diff <= 0) return; // пересчитается на следующем тике

    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    const secs  = Math.floor((diff % 60000)    / 1000);

    document.getElementById('cd-days').textContent  = pad(days);
    document.getElementById('cd-hours').textContent = pad(hours);
    document.getElementById('cd-mins').textContent  = pad(mins);
    document.getElementById('cd-secs').textContent  = pad(secs);
  }

  tick();
  setInterval(tick, 1000);
})();

/* ============================================================
   FAQ ACCORDION
============================================================ */
document.querySelectorAll('.faq__btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
    const answer = btn.closest('.faq__item').querySelector('.faq__a');

    // Collapse all
    document.querySelectorAll('.faq__btn').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.closest('.faq__item').querySelector('.faq__a').classList.remove('is-open');
    });

    // Open clicked (unless it was already open)
    if (!isExpanded) {
      btn.setAttribute('aria-expanded', 'true');
      answer.classList.add('is-open');
    }
  });
});

/* ============================================================
   SCROLL-IN ANIMATIONS
============================================================ */
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(
  '.card, .feature-item, .host-card, .step, .faq__item, .pricing__card'
).forEach((el, i) => {
  el.classList.add('animate-in');
  el.style.transitionDelay = `${(i % 4) * 60}ms`;
  observer.observe(el);
});
