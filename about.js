/* Redirect to Scutoid Technologies Private Limited (IT Services and Accounting Services) */
const SERVICES_URL = 'https://scutoid.ai';
const svcDlg = document.getElementById('svcDlg'), svcNote = document.getElementById('svcNote');
document.getElementById('svcOpen').addEventListener('click', () => { svcNote.hidden = true; svcDlg.showModal(); });
document.getElementById('svcCancel').addEventListener('click', () => svcDlg.close());
document.getElementById('svcGo').addEventListener('click', () => {
  if (!SERVICES_URL) { svcNote.hidden = false; return; }
  window.open(SERVICES_URL, '_blank', 'noopener,noreferrer');
  svcDlg.close();
});
svcDlg.addEventListener('click', e => { if (e.target === svcDlg) svcDlg.close(); });

/* About tabs */
document.querySelectorAll('[data-about-btn]').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('[data-about-btn]').forEach(x => x.setAttribute('aria-selected', x === b));
  document.querySelectorAll('.about-pane').forEach(p => { p.hidden = p.id !== 'about-' + b.dataset.aboutBtn; });
}));


/* Floating sub-bar: highlight the section being read */
const abTabs = [...document.querySelectorAll('#abTabs button')];
abTabs.forEach(b => b.addEventListener('click', () => document.getElementById(b.dataset.t).scrollIntoView({ behavior: 'smooth' })));
function abSpy() {
  let cur = null;
  abTabs.forEach(b => { const el = document.getElementById(b.dataset.t); if (el && el.getBoundingClientRect().top <= 170) cur = b.dataset.t; });
  abTabs.forEach(b => { if (b.dataset.t === cur) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
}
let abTick = false;
window.addEventListener('scroll', () => { if (abTick) return; abTick = true; requestAnimationFrame(() => { abSpy(); abTick = false; }); }, { passive: true });
abSpy();

/* Open roles. Add real roles here; each one renders as a card. */
const ROLES = [
  // { title: 'Role title', team: 'Team', location: 'Location', type: 'Full time', link: 'mailto:hello@scutoid.ai?subject=Role%20title' }
];
const rolesEl = document.getElementById('roles');
rolesEl.innerHTML = ROLES.length
  ? ROLES.map(r => `<a class="card role" href="${r.link}"><div><h3>${r.title}</h3><p>${[r.team, r.location, r.type].filter(Boolean).join(' · ')}</p></div><span class="inline">Apply</span></a>`).join('')
  : `<div class="card pad roles-empty"><svg class="i"><use href="#i-sparkles"/></svg><div><h3>No open roles are listed right now</h3><p>New roles will appear here. In the meantime, you can send us an open application below.</p></div></div>`;
