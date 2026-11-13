const form = document.getElementById('form');
const msg = document.getElementById('formMsg');
form.addEventListener('submit', e => {
  e.preventDefault();
  let ok = true;
  form.querySelectorAll('input').forEach(i => {
    const bad = !i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value));
    i.classList.toggle('bad', bad);
    if (bad) ok = false;
  });
  msg.classList.toggle('err', !ok);
  msg.textContent = ok ? 'Thanks. We will be in touch soon.' : 'Enter a valid email and your company name.';
  if (ok) form.reset(); // front end only — connect to a backend before launch
});


/* Native AI page: secondary navigation highlights the section being read */
const aiTabs = [...document.querySelectorAll('#aiTabs button')];
aiTabs.forEach(b => b.addEventListener('click', () => document.getElementById(b.dataset.t).scrollIntoView({ behavior: 'smooth' })));
function aiSpy() {
  let cur = null;
  aiTabs.forEach(b => { const el = document.getElementById(b.dataset.t); if (el && el.getBoundingClientRect().top <= 170) cur = b.dataset.t; });
  aiTabs.forEach(b => { if (b.dataset.t === cur) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
}
let aiTick = false;
window.addEventListener('scroll', () => { if (aiTick) return; aiTick = true; requestAnimationFrame(() => { aiSpy(); aiTick = false; }); }, { passive: true });
aiSpy();

/* ---------- Workflow builder (illustrative) ---------- */
const WF_EXAMPLES = [
  "When stock of an item falls below its reorder level, draft a purchase order for the usual supplier and send it to me for approval.",
  "When a batch has less than 15 days of shelf life left, move it to the front of the pick list and tell the stores lead.",
  "If goods at a job worker are due back in 3 days, remind the job worker and add the challan to Monday's review."
];
const WF = {
  reorder: { name: 'Reorder low stock', steps: [
    ['Trigger', 'blue', 'Stock falls below reorder level', 'Watches every item in Inventory. Runs when on-hand stock drops under its reorder level.'],
    ['Check', 'teal', 'Confirm the usual supplier', 'Finds the usual supplier and checks their tax details are verified.'],
    ['Action', 'orange', 'Draft a purchase order', 'Prepares the order in Procurement using the last agreed price and quantity.'],
    ['Approval', 'purple', 'Signed approval from you', 'Sends the draft to you. Nothing is ordered until you give a signed approval.'],
    ['Action', 'orange', 'Send the order to the supplier', 'Sends the approved order and records it against the item.']
  ] },
  shelf: { name: 'Use short shelf life first', steps: [
    ['Trigger', 'blue', 'Shelf life under 15 days', 'Runs daily over all batches that have a shelf life.'],
    ['Check', 'teal', 'Is the batch still usable?', 'Skips batches already on quality hold or with no stock left.'],
    ['Action', 'orange', 'Move the batch to the front of the pick list', 'Re-ranks picking so the earliest-expiring batch is used first.'],
    ['Action', 'orange', 'Notify the stores lead', 'Sends a message with the batch, quantity and expiry date.']
  ] },
  jobwork: { name: 'Chase job work returns', steps: [
    ['Trigger', 'blue', 'Return due in 3 days', 'Watches open job work challans for goods due back.'],
    ['Check', 'teal', 'Is the challan reconciled?', 'Compares quantity sent with quantity received so far.'],
    ['Action', 'orange', 'Remind the job worker', 'Sends a reminder with the challan number and due date.'],
    ['Action', 'orange', 'Add it to the Monday review', 'Puts the challan on the weekly stores review list.'],
    ['Approval', 'purple', 'Signed approval to close', 'When goods return, asks for a signed approval before the challan is closed.']
  ] },
  generic: { name: 'Custom inventory workflow', steps: [
    ['Trigger', 'blue', 'When your condition is met', 'Compliance AI turns your instruction into a trigger on Inventory data.'],
    ['Check', 'teal', 'Check the rules that apply', 'Tests the record against your instruction and the compliance rules.'],
    ['Action', 'orange', 'Prepare the action', 'Drafts the change or message you asked for.'],
    ['Approval', 'purple', 'Signed approval from you', 'Asks for a signed approval before anything changes.']
  ], note: 'This is a general outline. Add details such as the item, the threshold or who to notify to get a sharper workflow.' }
};
const WF_ICON = { Trigger: 'sparkles', Check: 'shield', Action: 'pen', Approval: 'check' };
const wfText = document.getElementById('wfText'), wfOut = document.getElementById('wfOut');

function wfPick(t) {
  t = t.toLowerCase();
  if (/shelf|expir/.test(t)) return WF.shelf;
  if (/job work|challan/.test(t)) return WF.jobwork;
  if (/reorder|re-order|below|low stock|purchase order/.test(t)) return WF.reorder;
  return WF.generic;
}
function wfBuild() {
  const text = wfText.value.trim();
  if (!text) { wfText.focus(); wfText.style.borderColor = 'var(--destructive)'; return; }
  wfText.style.borderColor = '';
  const w = wfPick(text);
  wfOut.innerHTML = `
    <div class="wf-title"><h3>${w.name}</h3><span class="badge purple dot">Draft by Compliance AI</span></div>
    <div class="wf-steps">${w.steps.map(([type, tone, title, desc], i) => `
      <div class="wf-step" style="animation-delay:${i * 120}ms"><span class="n ${tone}"><svg class="i"><use href="#i-${WF_ICON[type]}"/></svg></span>
      <div><b>${title}<span class="badge ${tone}">${type}</span></b><p>${desc}</p></div></div>`).join('')}</div>
    ${w.note ? `<p class="note" style="margin:0 0 12px">${w.note}</p>` : ''}
    <div class="wf-foot"><button class="btn t4" type="button" id="wfEdit">Edit Instruction</button>
      <button class="btn t2" type="button" id="wfTest">Run a Test</button>
      <button class="btn t1" type="button" id="wfOn">Turn On Workflow</button>
      <span class="wf-status" id="wfStatus"></span></div>`;
  const st = document.getElementById('wfStatus');
  const say = t => { st.innerHTML = `<svg class="i"><use href="#i-check"/></svg>${t}`; };
  document.getElementById('wfEdit').onclick = () => wfText.focus();
  document.getElementById('wfTest').onclick = () => say('Test run finished. No records were changed.');
  document.getElementById('wfOn').onclick = () => say('Workflow is on. Every approval step is still yours.');
}
document.getElementById('wfBuild').addEventListener('click', wfBuild);
document.querySelectorAll('#wfChips .chip-btn').forEach(b => b.addEventListener('click', () => { wfText.value = WF_EXAMPLES[+b.dataset.i]; wfBuild(); }));

/* ---------- Video: AI verifies a purchase order, then prompts the user to create the bill (scripted simulation) ---------- */
(function () {
  const stage = document.getElementById('vidStage');
  if (!stage) return;
  /* Illustrated story. SVG groups reveal on a timeline (data-at); positioning lives on an outer <g> because .rv owns CSS transform. */
  const T = (x, y, txt, size = 18, cls = '', anchor = 'start') => '<text x="' + x + '" y="' + y + '" font-size="' + size + '" text-anchor="' + anchor + '" class="' + cls + '">' + txt + '</text>';
  const R = (at, inner, until) => '<g class="rv" data-at="' + at + '"' + (until ? ' data-until="' + until + '"' : '') + '>' + inner + '</g>';
  const backdrop = () => '<rect class="sky" width="800" height="400"/><circle class="sun" cx="640" cy="110" r="84"/>' +
    '<polygon class="hill" points="0,330 120,262 250,312 400,246 560,314 700,258 800,300 800,400 0,400"/><rect class="ground" y="330" width="800" height="70"/>';
  const gem = (x, y, s, at) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' + R(at,
    '<circle class="gem-glow" r="54"/><polygon class="g1" points="0,-40 34,-20 0,0 -34,-20"/><polygon class="g2" points="-34,-20 0,0 0,40 -34,20"/><polygon class="g3" points="34,-20 34,20 0,40 0,0"/>') + '</g>';
  const person = (x, at) => R(at, '<circle class="ink" cx="' + x + '" cy="205" r="22"/><rect class="ink" x="' + (x - 28) + '" y="232" width="56" height="98" rx="24"/>');
  const chk = (x, y, tone, at, warn) => R(at, '<circle class="' + (warn ? 'warn-c' : 'ok-c') + '" cx="' + x + '" cy="' + y + '" r="14"/>' +
    (warn ? '<path class="tick" d="M' + x + ' ' + (y - 6) + 'v7M' + x + ' ' + (y + 6) + 'h.1"/>' : '<path class="tick" d="M' + (x - 6) + ' ' + y + 'l4.5 5 8-9.5"/>'));
  const art = (inner, cap) => '<svg viewBox="0 0 800 400" aria-hidden="true" focusable="false">' + backdrop() + inner + '</svg><p class="art-cap">' + cap + '</p>';

  const CAPS = [
    'A buyer wants to know one thing: can we bill this order? So they simply ask, in plain words.',
    'The AI does not guess. It goes to Inventory and checks the goods arrived and passed inspection.',
    'It lays the order, the receipt and the quality result side by side. One item needs a person.',
    'It shows its checks and asks. The buyer decides, and the decision is recorded for good.'
  ];

  /* 1. The question */
  const s1 = person(150, 0.1) +
    R(0.5, '<rect class="bubble" x="190" y="104" width="256" height="62" rx="16"/><polygon class="bubble" points="206,166 230,166 192,196"/>' + T(210, 143, 'Can I bill PO-7710?', 22)) +
    R(1.2, '<rect class="paper" x="320" y="196" width="170" height="108" rx="10"/><rect class="line" x="336" y="238" width="110" height="7" rx="3"/><rect class="line" x="336" y="254" width="80" height="7" rx="3"/>' + T(336, 222, 'PO-7710', 17) + T(336, 290, '₹4,81,440.00', 17, 't-m')) +
    gem(620, 190, 1.3, 2.3) +
    R(3.4, '<rect class="bubble" x="460" y="34" width="310" height="56" rx="16"/><polygon class="bubble" points="600,90 628,90 618,112"/>' + T(480, 69, 'Checking the goods first.', 20));

  /* 2. The check */
  const crate = (x, at, l1, l2) => '<rect class="crate" x="' + x + '" y="198" width="72" height="64" rx="6"/><path class="shelf" d="M' + x + ' 230h72M' + (x + 36) + ' 198v64"/>' +
    R(at, T(x + 36, 290, l1, 14, '', 'middle') + T(x + 36, 308, l2, 14, 't-m', 'middle')) + chk(x + 36, 170, 0, at);
  const beam = (x, at) => R(at, '<path class="beam" d="M212 168 C 250 80, ' + (x - 10) + ' 90, ' + (x + 36) + ' 176"/>');
  const s2 = '<path class="shelf" d="M400 90v178M780 90v178M392 266h396"/>' +
    gem(165, 190, 1.4, 0.1) +
    R(0.2, '<rect class="paper" x="70" y="268" width="110" height="46" rx="8"/>' + T(125, 297, 'PO-7710', 16, '', 'middle')) +
    beam(420, 1.2) + beam(512, 3.2) + beam(604, 5.2) + beam(696, 7) +
    crate(420, 1.2, 'GRN-2291', '240 of 240') + crate(512, 3.2, 'QC-1187', '240 accepted') + crate(604, 5.2, 'Quality hold', 'none open') + crate(696, 7, 'Delivery', '2 days early');

  /* 3. The match */
  const doc = (x, at, title, l1, l2) => R(at, '<rect class="paper" x="' + x + '" y="62" width="180" height="150" rx="12"/>' + T(x + 16, 92, title, 17) +
    '<rect class="line" x="' + (x + 16) + '" y="108" width="148" height="7" rx="3"/><rect class="line" x="' + (x + 16) + '" y="124" width="110" height="7" rx="3"/>' + T(x + 16, 168, l1, 22) + T(x + 16, 194, l2, 15, 't-m'));
  const pill = (x, at, label, warn) => R(at, '<rect class="pill" x="' + x + '" y="246" width="176" height="46" rx="23"/><circle class="' + (warn ? 'warn-c' : 'ok-c') + '" cx="' + (x + 26) + '" cy="269" r="13"/>' +
    (warn ? '<path class="tick" d="M' + (x + 26) + ' 263v7M' + (x + 26) + ' 275h.1"/>' : '<path class="tick" d="M' + (x + 20) + ' 269l4.5 5 8-9.5"/>') + T(x + 48, 275, label, 16));
  const s3 = R(0.1, '<rect class="bubble" x="296" y="12" width="208" height="34" rx="17"/>' + T(400, 35, 'AI is matching', 16, '', 'middle')) + gem(318, 29, 0.42, 0.1) +
    doc(50, 0.4, 'Purchase order', '240 units', '₹1,700.00 each') + doc(310, 1, 'Goods receipt', '240 received', 'GRN-2291') + doc(570, 1.6, 'Quality result', '240 accepted', '0 rejected') +
    R(2.3, '<path class="link" d="M230 137H310"/><path class="link" d="M490 137H570"/>') + chk(270, 137, 0, 2.3) + chk(530, 137, 0, 2.5) +
    pill(30, 3, 'Quantity') + pill(218, 4, 'Rate') + pill(406, 5, 'Supplier tax') + pill(594, 6, 'Tax at source', true);

  /* 4. The decision */
  const li = (i, at, txt, warn) => chk(262, 134 + i * 31, 0, at, warn) + R(at, T(286, 140 + i * 31, txt, 16, warn ? '' : 't-m'));
  const s4 = person(110, 0.1) + R(0.3, '<path class="arm" d="M128 262 C 160 262, 196 250, 226 232"/>') +
    R(0.6, '<rect class="decide" x="236" y="30" width="360" height="282" rx="18"/>' + T(256, 66, 'PO-7710 is ready to bill.', 20) + T(256, 92, 'Create the bill for ₹4,81,440.00?', 17, 't-m')) +
    li(0, 1.6, 'Goods received · GRN-2291') + li(1, 2.4, 'Quality passed · QC-1187') + li(2, 3.2, 'Quantity and rate match') + li(3, 4, 'Supplier tax verified') + li(4, 4.8, 'Tax at source: please review', true) +
    R(6, '<rect class="btn-g" x="376" y="274" width="92" height="30" rx="8"/>' + T(422, 295, 'Not now', 15, '', 'middle') + '<rect class="btn-p" x="478" y="274" width="104" height="30" rx="8"/>' + T(530, 295, 'Create bill', 15, 't-w', 'middle')) +
    gem(690, 160, 1.3, 0.4) +
    R(6.9, '<rect class="bubble" x="612" y="250" width="156" height="40" rx="20"/>' + T(690, 276, 'Decision recorded', 15, '', 'middle'));

  const SCENES = [
    { d: 6, title: 'Ask', cap: CAPS[0], html: art(s1, CAPS[0]) },
    { d: 10, title: 'Verify in Inventory', cap: CAPS[1], html: art(s2, CAPS[1]) },
    { d: 8, title: 'Match the records', cap: CAPS[2], html: art(s3, CAPS[2]) },
    { d: 8, title: 'You decide', cap: CAPS[3], html: art(s4, CAPS[3]) }
  ];
  const TOTAL = SCENES.reduce((s, x) => s + x.d, 0);
  const starts = []; SCENES.reduce((s, x) => (starts.push(s), s + x.d), 0);

  stage.innerHTML = SCENES.map((s, i) => `<div class="vs art" data-i="${i}">${s.html}</div>`).join('');
  const layers = [...stage.querySelectorAll('.vs')];
  const STORY = CAPS;
  const chaps = document.getElementById('vidChaps');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  chaps.innerHTML = SCENES.map((s, i) => `<li><button type="button" data-i="${i}" aria-label="Scene ${i + 1}: ${s.title}" title="${s.title}"><b>${i + 1}</b><i class="bar"><u></u></i></button></li>`).join('');
  const btns = [...chaps.querySelectorAll('button')];

  let t = 0, playing = false, last = 0, raf = 0, wait = 0;
  function apply(tt) {
    let si = 0; starts.forEach((s, i) => { if (tt >= s) si = i; });
    const el = tt - starts[si];
    layers.forEach((l, i) => {
      l.classList.toggle('on', i === si);
      l.style.setProperty('--d', i - si);                       // position on the storyboard strip
      if (i !== si) l.querySelectorAll('[data-at]').forEach(n => n.classList.toggle('on', i < si));   // past frames stay drawn, future ones stay blank
    });
    layers[si].querySelectorAll('[data-at]').forEach(n => {
      const at = +n.dataset.at, until = n.dataset.until ? +n.dataset.until : Infinity;
      n.classList.toggle('on', el >= at && el < until);
    });
    btns.forEach((b, i) => {
      if (i === si) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
      b.classList.toggle('done', i < si);
      b.querySelector('u').style.width = (i < si ? 100 : i === si ? Math.min(100, el / SCENES[i].d * 100) : 0) + '%';
    });
  }
  function tick(ts) {
    if (!playing) return;
    t = Math.min(TOTAL, t + (ts - last) / 1000); last = ts; apply(t);
    if (t >= TOTAL) { playing = false; wait = setTimeout(() => { t = 0; play(); }, 3500); return; }  // hold the last frame, then loop
    raf = requestAnimationFrame(tick);
  }
  function play() { clearTimeout(wait); if (t >= TOTAL) t = 0; playing = true; last = performance.now(); raf = requestAnimationFrame(tick); }
  function pause() { playing = false; clearTimeout(wait); cancelAnimationFrame(raf); }

  btns.forEach(b => b.addEventListener('click', () => { t = starts[+b.dataset.i]; apply(t); play(); }));
  // start when scrolled into view, pause when out of view (stays still for reduced-motion users until a step is chosen)
  new IntersectionObserver(es => {
    if (es[0].isIntersecting) { if (!reduce && !playing) play(); }
    else pause();
  }, { threshold: 0.4 }).observe(document.getElementById('vid'));

  apply(4.2);   // poster frame: first scene, fully drawn
})();


/* ---------- Hero: one order through all seven stages, as a rolling feed (illustrative) ---------- */
(function () {
  const box = document.getElementById('heroCards');
  if (!box) return;
  const cards = [...box.querySelectorAll('.hc')];
  const rail = [...box.querySelectorAll('.hc-rail span')];
  const OP = [1, 0.7, 0.42, 0.18];                       // newest card is brightest; older ones fade as they roll up
  const show = n => {
    cards.forEach((c, i) => { const k = n - i; c.style.setProperty('--k', k >= 0 && k < 4 ? k : (k < 0 ? -1 : 4)); c.style.setProperty('--o', k >= 0 && k < 4 ? OP[k] : 0); });
    rail.forEach((r, i) => { r.classList.toggle('on', i === n); r.classList.toggle('done', i < n); });
  };
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { show(cards.length - 1); return; }
  show(-1);
  let n = -1;
  setInterval(() => { n = n >= cards.length + 1 ? -1 : n + 1; show(Math.min(n, cards.length - 1)); if (n < 0) show(-1); }, 2000);
})();
