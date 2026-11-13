/* ---------- Site chrome ---------- */
const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));

// Mega menus open and close on click only. They stay open when the cursor moves away.
const megas = [...document.querySelectorAll('.has-mega')];
const closeMegas = except => megas.forEach(m => {
  if (m === except) return;
  m.classList.remove('open');
  m.querySelector('.menu-btn').setAttribute('aria-expanded', 'false');
});
megas.forEach(item => {
  const btn = item.querySelector('.menu-btn');
  btn.addEventListener('click', () => {
    closeMegas(item);
    const open = item.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  item.querySelectorAll('.mega a').forEach(a => a.addEventListener('click', () => {
    closeMegas(); menu.classList.remove('open');
  }));
});
document.addEventListener('click', e => { if (!e.target.closest('.has-mega')) closeMegas(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMegas(); });

// Liquid-glass highlight follows the cursor
document.addEventListener('pointermove', e => {
  const g = e.target.closest && e.target.closest('.glass,.subnav-in,.nav');
  if (!g) return;
  const r = g.getBoundingClientRect();
  g.style.setProperty('--mx', (e.clientX - r.left) + 'px');
  g.style.setProperty('--my', (e.clientY - r.top) + 'px');
}, { passive: true });


/* Scroll-in motion for headings and cards (all pages; off for reduced motion) */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const sel = '.section .head, .section .card.pad, .section .steps li, .section .int-points > div, .story-vows > div, .hire li';
  const els = [...document.querySelectorAll(sel)].filter(el => !el.closest('.frame, .walk, .wf'));
  const reveal = el => { el.classList.add('in'); setTimeout(() => { el.style.transitionDelay = ''; }, 1400); };
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } }), { threshold: 0.12 });
  els.forEach(el => {
    const sibs = [...el.parentElement.children].filter(c => els.includes(c));
    el.style.transitionDelay = Math.min(sibs.indexOf(el), 5) * 80 + 'ms';
    el.classList.add('sr');
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) requestAnimationFrame(() => reveal(el)); else io.observe(el);
  });
})();
