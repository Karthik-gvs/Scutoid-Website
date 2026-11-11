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
