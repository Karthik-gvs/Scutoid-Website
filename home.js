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

/* ---------- Native AI story: one order, eight steps, an agent prepares and a person approves (scripted simulation) ---------- */
(function () {
  const stage = document.getElementById('vidStage');
  if (!stage) return;
  /* Agent at work, after the way an AI explainer shows an agent: a glossy orb with a live status line, a checklist that
     ticks itself off, a result card, and a person who approves. Everything reveals on a timeline: data-at / data-until are
     seconds from the start of the scene. .ev fades in and out; .tg only flips a state (a tick, a strike-through). */
  const JIDS = ['J01 · Enquiry to production', 'J04, J05 · Design to change', 'J06, J07 · Plan to produce', 'J08 · Procure to pay', 'J06, J14 · Production and quality', 'J07 · Despatch', 'J09 · Invoice to payment received', 'J08, J10 · Pay the supplier, close the books'];
  const TIMES = ['8:40', '9:15', '10:30', '11:10', '2:00', '4:45', '5:30', '6:20'];
  const CAPS = [
    "A parts list lands: 240 controller boards. Costed once at today's prices, the quote is ready for you to approve.",
    "The order is won, then a connector moves to Rev C. Before anyone signs, the effect on stock and open orders is on screen.",
    "Demand meets live stock and line capacity, and the plan assembles itself. Clear to build, except one connector: J7.",
    "The J7 shortage becomes a purchase request. Three suppliers answer, and the best order is drafted for your approval.",
    "Line 2 hums. An operator says 'reel 88 loaded', and every board remembers which reel it came from.",
    "Boxes stacked, papers ready. The e-invoice and e-way bill are prepared before the truck is loaded.",
    "The invoice goes out against the quote, with GST and e-invoice. The payment arrives and matches itself.",
    "Mehta's bill matches the order and the receipt. A person approves the payment, and both entries land in the books, balanced."
  ];

  const A = (a, u) => ' data-at="' + a.toFixed(2) + '"' + (u ? ' data-until="' + u.toFixed(2) + '"' : '');
  const TICK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"/></svg>';
  const CURSOR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3l14 8-6.2 1.6L9.6 19z"/></svg>';
  const H = { teal: 'var(--brand)', blue: 'var(--blue)', green: 'var(--green)', purple: 'var(--purple)', pink: 'var(--pink)', orange: 'var(--orange)' };
  /* the common rhythm of a scene (seconds): read, check, prepare, ask, a person approves, result */
  const D = { st: [0.2, 3.2, 5.6], li: [0.5, 0.65, 0.8, 0.95], dn: [1.6, 2.7, 3.8, 4.9], card: 0.9, ready: 5.2, click: 6.7 };

  const status = (list, st) => '<div class="ag-status"><i class="ag-orb"></i><div class="ag-sts">' +
    list.map((txt, i) => '<span class="ag-st ev"' + A(st[i], st[i + 1]) + ' style="--n:' + txt.length + '">' + txt + '</span>').join('') + '</div></div>';
  const checklist = (items, d) => '<ul class="ag-list">' + items.map((txt, i) =>
    '<li class="ag-it ev"' + A(d.li[i]) + '><i class="ag-tk tg"' + A(d.dn[i]) + '>' + TICK + '</i><span class="lb tg"' + A(d.dn[i]) + '>' + txt + '</span></li>').join('') + '</ul>';
  const rowsHtml = (rows, d) => rows.map(r =>
    '<div class="ag-rw ' + (r[3] || '') + '"><span class="sk ev"' + A(d.card, d.dn[r[2]]) + '></span><div class="ag-rv ev"' + A(d.dn[r[2]]) + '><em>' + r[0] + '</em><b>' + r[1] + '</b></div></div>').join('');
  const card = (c, d) =>
    '<div class="ag-card ev"' + A(d.card) + '>' +
      '<div class="ag-ch"><b>' + c.title + '</b><div class="ag-chips"><span class="ag-chip warn ev"' + A(d.ready, d.click) + '>For approval</span>' +
        '<span class="ag-chip ok ev"' + A(d.click) + '>' + c.chip + '</span></div></div>' +
      (c.body ? c.body(d) : '<div class="ag-rows">' + rowsHtml(c.rows, d) + '</div>') +
      (c.total ? '<div class="ag-tot ev"' + A(d.dn[3]) + '><b>' + c.total[0] + '</b><small>' + c.total[1] + '</small></div>' : '') +
      '<div class="ag-act"><span class="ag-ghost ev"' + A(d.ready, d.click) + '>Not now</span><div class="ag-go">' +
        '<span class="ag-btn ev"' + A(d.ready, d.click) + '>' + c.btn + '</span>' +
        '<span class="ag-btn ok ev"' + A(d.click) + '>' + TICK + c.done + '</span>' +
        '<span class="ag-cur ev"' + A(d.click - 0.9, d.click + 0.8) + '>' + CURSOR + '</span></div></div></div>';
  const result = rs => '<div class="ag-resw">' + rs.map(r =>
    '<div class="ag-res ev"' + A(r[0], r[4]) + '><b>' + r[1] + '</b><span class="' + (r[3] || 'ok') + '">' + r[2] + '</span></div>').join('') + '</div>';
  const scene = o => {
    const d = Object.assign({}, D, o.t || {});
    return '<div class="ag-mesh" style="--m1:' + o.hue[0] + ';--m2:' + o.hue[1] + ';--m3:' + o.hue[2] + '"></div>' +
      status(o.status, d.st) +
      '<div class="ag-body"><div class="ag-left">' + checklist(o.list, d) + (o.mid || '') + result(o.res) + '</div>' + card(o.card, d) + '</div>' +
      '<p class="ag-cap">' + o.cap + '</p>';
  };
  /* Plan: bars slot onto three lines, one flag goes up */
  const gantt = d => {
    const bar = (l, w, at, c) => '<i class="bar ev"' + A(at) + ' style="left:' + l + '%;width:' + w + '%;--c:' + c + '"></i>';
    const lane = (n, inner) => '<div class="ln"><em>' + n + '</em><div class="tr">' + inner + '</div></div>';
    return '<div class="ag-gantt">' +
      lane('Line 1', bar(0, 38, d.dn[0], 'var(--brand)') + bar(42, 30, d.dn[3], 'var(--purple)') + '<span class="flag ev"' + A(d.dn[3] + 0.4) + '>J7 short</span>') +
      lane('Line 2', bar(14, 50, d.dn[1], 'var(--green)')) +
      lane('Line 3', bar(4, 56, d.dn[2], 'var(--blue)')) + '</div>';
  };
  /* Settle: both sides of the books */
  const ledger = (a, b) => '<div class="ag-ledger"><div class="ev"' + A(a) + '><em>Sales · INV-3081</em><b>₹21,71,200.00 in</b></div><div class="ev"' + A(b) + '><em>Purchase · PO-7710</em><b>₹4,81,440.00 out</b></div></div>';

  const SCENES = [
    { d: 8.6, title: 'Quote', cap: CAPS[0], html: scene({
      hue: [H.teal, H.blue, H.green], cap: CAPS[0],
      status: ['Reading the parts list from the enquiry…', 'Matching 240 controller boards to your items…', 'Quote QT-2204 is ready for your approval.'],
      list: ['Read the enquiry', 'Match each part to your items', 'Cost it at today’s prices', 'Draft the quote'],
      card: { title: 'Quote QT-2204', chip: 'Approved', rows: [['Customer', 'Aarav Electronics', 0], ['Request', '240 controller boards', 1], ['Costing', 'At today’s prices', 2]], total: ['₹18,40,000', 'Quote value'], btn: 'Approve quote', done: 'Approved by you' },
      res: [[7.1, 'Quote approved.', 'Ready to send to Aarav Electronics']] }) },
    { d: 8.6, title: 'Design', cap: CAPS[1], html: scene({
      hue: [H.purple, H.blue, H.teal], cap: CAPS[1],
      status: ['Order won. Opening Rev C of connector J7…', 'Showing the effect before anyone signs…', 'Revision C is ready for your signed approval.'],
      list: ['Compare Rev B with Rev C', 'Find the open work orders affected', 'Check stock of the new connector', 'Set the point it takes effect'],
      card: { title: 'Connector J7 · Rev C', chip: 'Released', rows: [['Open work orders', '2 affected', 0], ['Stock on hand', '1 reel', 1], ['Takes effect', 'From board 0101', 2]], total: ['Rev C', 'Effect shown before approval'], btn: 'Sign approval', done: 'Signed by you' },
      res: [[7.1, 'Rev C released.', 'Takes effect from board 0101']] }) },
    { d: 8.6, title: 'Plan', cap: CAPS[2], html: scene({
      hue: [H.green, H.teal, H.blue], cap: CAPS[2],
      status: ['Reading demand, stock and line capacity…', 'Placing builds against Lines 1 to 3…', 'Plan drafted. One shortage needs your eye.'],
      list: ['Read demand for 240 boards', 'Check live stock', 'Check capacity on each line', 'Place the builds'],
      card: { title: 'Build plan · 240 boards', chip: 'Approved', body: gantt, btn: 'Approve plan', done: 'Plan approved by you' },
      res: [[7.1, 'Clear to build, except J7.', 'One shortage, passed to Buy', 'warn']] }) },
    { d: 8.6, title: 'Buy', cap: CAPS[3], html: scene({
      hue: [H.blue, H.purple, H.teal], cap: CAPS[3],
      status: ['Turning the J7 shortage into a purchase request…', 'Comparing three supplier quotes…', 'PO-7710 is ready for your approval.'],
      list: ['Raise the purchase request for J7', 'Collect three supplier quotes', 'Compare price and delivery days', 'Draft the purchase order'],
      card: { title: 'Order PO-7710', chip: 'Sent', rows: [['Orion Tooling', '₹5,02,900 · 5 days', 0], ['Mehta Castings <i class="bo">Best overall</i>', '₹4,81,440 · 6 days', 1, 'hi'], ['Kaveri Steels', '₹4,95,000 · 9 days', 2]], total: ['₹4,81,440.00', 'Mehta Castings'], btn: 'Approve order', done: 'Sent to supplier' },
      res: [[7.1, 'PO-7710 sent.', 'Mehta Castings · 6 days']] }) },
    { d: 8.6, title: 'Make', cap: CAPS[4], html: scene({
      hue: [H.teal, H.green, H.orange], cap: CAPS[4],
      status: ['Listening on Line 2…', 'Linking reel R-88 to each board…', 'The report is ready for the operator to confirm.'],
      list: ['Hear “reel 88 loaded”', 'Fill in the production entry', 'Trace reel R-88, lot L-0412', 'Check each board'],
      card: { title: 'WO-2231 · Line 2', chip: 'Confirmed', rows: [['Operator says', '“Reel 88 loaded.”', 0], ['Reel and lot', 'R-88 · L-0412', 1], ['Boards traced', 'Board 0007 and counting', 2]], total: ['0 defects', 'so far'], btn: 'Confirm entry', done: 'Confirmed by operator' },
      res: [[7.1, 'Every board remembers its reel.', 'Traced to R-88']] }) },
    { d: 8.6, title: 'Deliver', cap: CAPS[5], html: scene({
      hue: [H.blue, H.teal, H.green], cap: CAPS[5],
      status: ['Reading delivery note DN-1190…', 'Preparing the e-invoice and e-way bill…', 'The papers are ready for your approval.'],
      list: ['Check order SO-4410 is complete', 'Prepare the e-invoice', 'Prepare the e-way bill', 'Check the tax details'],
      card: { title: 'Despatch DN-1190', chip: 'Approved', rows: [['Order', 'SO-4410', 0], ['E-invoice', 'Prepared', 1], ['E-way bill', 'Prepared', 2]], total: ['Ready', 'before the truck is loaded'], btn: 'Approve despatch', done: 'Despatch approved' },
      res: [[7.1, 'The truck can be loaded.', 'Papers approved before despatch']] }) },
    { d: 10, title: 'Invoice', cap: CAPS[6], html: scene({
      hue: [H.pink, H.purple, H.blue], cap: CAPS[6],
      status: ['Drafting the invoice from quote QT-2204…', 'Adding GST and the e-invoice number…', 'Invoice INV-3081 is ready to send.'],
      list: ['Pull in QT-2204 and DN-1190', 'Work out GST at 18%', 'Issue the e-invoice number', 'Set terms: payment in 30 days'],
      card: { title: 'Invoice INV-3081', chip: 'Sent', rows: [['Quote', 'QT-2204, approved', 0], ['GST at 18%', '₹3,31,200.00', 1], ['E-invoice', 'Number issued', 2]], total: ['₹21,71,200.00', 'Aarav Electronics, due in 30 days'], btn: 'Send invoice', done: 'Invoice sent' },
      res: [[7.1, 'Invoice sent.', 'Aarav Electronics, due in 30 days', 'ok', 8.4], [8.4, 'Payment received.', '₹21,71,200.00 · matched to the invoice']] }) },
    { d: 10.2, title: 'Settle', cap: CAPS[7], html: scene({
      hue: [H.green, H.teal, H.purple], cap: CAPS[7],
      status: ['Matching Mehta’s bill to the order and receipt…', 'Reviewing tax at source…', 'The payment is ready for your approval.'],
      list: ['Match the bill to order PO-7710', 'Match the receipt GRN-2291', 'Review tax at source', 'Prepare the payment'],
      card: { title: 'Pay Mehta Castings', chip: 'Recorded', rows: [['Order', 'PO-7710', 0], ['Receipt', 'GRN-2291', 1], ['Tax at source', 'Reviewed', 2]], total: ['₹4,81,440.00', 'against PO-7710'], btn: 'Approve payment', done: 'Payment recorded' },
      mid: ledger(7.2, 7.8),
      res: [[8.5, 'Both sides balanced.', 'Sales in and purchase out, recorded']] }) }
  ];
  const TOTAL = SCENES.reduce((s, x) => s + x.d, 0);
  const starts = []; SCENES.reduce((s, x) => (starts.push(s), s + x.d), 0);

  stage.innerHTML = SCENES.map((s, i) => `<div class="vs ag" data-i="${i}">${s.html}</div>`).join('');
  const layers = [...stage.querySelectorAll('.vs')];
  const evs = layers.map(l => [...l.querySelectorAll('[data-at]')].map(n => ({ n, at: +n.dataset.at, until: n.dataset.until ? +n.dataset.until : Infinity })));
  const chaps = document.getElementById('vidChaps');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  chaps.innerHTML = SCENES.map((s, i) => `<li><button type="button" data-i="${i}" aria-label="Scene ${i + 1}: ${s.title}" title="${s.title}"><b>${i + 1}</b><i class="bar"><u></u></i></button></li>`).join('');
  const btns = [...chaps.querySelectorAll('button')];

  let t = 0, playing = false, last = 0, raf = 0, wait = 0, cur = -1;
  const setDrawn = (i, drawn) => evs[i].forEach(e => e.n.classList.toggle('on', drawn));
  function apply(tt) {
    let si = 0; starts.forEach((s, i) => { if (tt >= s) si = i; });
    const el = tt - starts[si];
    if (si !== cur) {
      const left = cur; cur = si;
      layers.forEach((l, i) => { l.classList.toggle('on', i === si); if (i !== si && i !== left) setDrawn(i, i < si); });   // earlier scenes stay drawn, later ones blank
      if (left >= 0) setTimeout(() => { if (cur !== left) setDrawn(left, left < cur); }, 900);                            // the scene we just left finishes fading first
    }
    evs[si].forEach(e => e.n.classList.toggle('on', el >= e.at && el < e.until));
    const snT = document.getElementById('snTime'), snS = document.getElementById('snStage'), snK = document.getElementById('snStep');
    if (snT && snT.textContent !== TIMES[si]) { snT.textContent = TIMES[si]; snS.textContent = SCENES[si].title + ' · ' + JIDS[si]; if (snK) snK.textContent = 'Step ' + (si + 1) + ' of ' + SCENES.length; }
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

  apply(7.9);   // poster frame: first scene, approved and fully drawn
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

/* ---------- OANI info slider: tabs, arrows, swipe and keys. Without scripting every slide is simply shown in a stack ---------- */
(function () {
  const root = document.getElementById('oSlider');
  if (!root) return;
  const tabBar = root.querySelector('.o-tabs');
  const tabs = [...tabBar.querySelectorAll('[role=tab]')];
  const slides = [...root.querySelectorAll('.o-slide')];
  const view = root.querySelector('.o-view'), track = root.querySelector('.o-track'), ind = root.querySelector('.o-ind');
  const prev = root.querySelector('.o-prev'), next = root.querySelector('.o-next');
  const count = root.querySelector('.o-count'), bar = root.querySelector('.o-bar i');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = 0;
  root.classList.add('js');

  function fit() {                       // the view takes the height of the slide in front, so short slides leave no gap
    view.style.height = slides[cur].offsetHeight + 'px';
    const t = tabs[cur];
    ind.style.width = t.offsetWidth + 'px';
    ind.style.transform = 'translateX(' + t.offsetLeft + 'px)';
    ind.style.setProperty('--ot', t.style.getPropertyValue('--ot'));
  }

  function go(n, focus) {
    cur = Math.max(0, Math.min(slides.length - 1, n));
    track.style.transform = 'translateX(' + (-100 * cur) + '%)';
    tabs.forEach((t, i) => { const on = i === cur; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    slides.forEach((s, i) => s.toggleAttribute('inert', i !== cur));   // hidden slides cannot be tabbed into
    prev.disabled = cur === 0; next.disabled = cur === slides.length - 1;
    count.textContent = (cur + 1) + ' / ' + slides.length;
    bar.style.width = ((cur + 1) / slides.length * 100) + '%';
    fit();
    const sc = root.closest('.o-dbody');              // a new slide starts at its top
    if (sc) sc.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    if (tabBar.scrollWidth > tabBar.clientWidth) {   // small screens: keep the chosen tab in view without scrolling the page
      const t = tabs[cur];
      tabBar.scrollTo({ left: t.offsetLeft - (tabBar.clientWidth - t.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (focus) tabs[cur].focus();
  }

  tabs.forEach((t, i) => t.addEventListener('click', () => go(i)));
  tabBar.addEventListener('keydown', e => {
    const k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); go(cur + 1, true); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); go(cur - 1, true); }
    else if (k === 'Home') { e.preventDefault(); go(0, true); }
    else if (k === 'End') { e.preventDefault(); go(slides.length - 1, true); }
  });
  prev.addEventListener('click', () => go(cur - 1));
  next.addEventListener('click', () => go(cur + 1));
  root.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => go(+b.dataset.go)));

  // swipe on touch screens (vertical scrolling is left to the browser)
  let sx = null, sy = null;
  view.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') return; sx = e.clientX; sy = e.clientY; });
  view.addEventListener('pointerup', e => {
    if (sx === null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(cur + (dx < 0 ? 1 : -1));
  });
  view.addEventListener('pointercancel', () => { sx = null; });

  if ('ResizeObserver' in window) { const ro = new ResizeObserver(fit); slides.forEach(s => ro.observe(s)); ro.observe(tabBar); }
  window.addEventListener('resize', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  go(0);
})();

/* ---------- OANI drawer: click the tab, or pull it out with the mouse or a finger; Esc, the scrim, the cross or a drag back close it ---------- */
(function () {
  const dr = document.getElementById('oani'), handle = document.getElementById('oHandle'), scrim = document.getElementById('oScrim');
  const head = document.getElementById('oHead'), closeBtn = document.getElementById('oClose');
  if (!dr || !handle) return;
  let isOpen = false, drag = null;
  const W = () => dr.offsetWidth;

  function open() {
    if (isOpen) return; isOpen = true;
    dr.style.transform = ''; dr.classList.remove('dragging'); dr.classList.add('open');
    dr.removeAttribute('inert'); dr.setAttribute('aria-hidden', 'false');
    scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add('on'));
    handle.setAttribute('aria-expanded', 'true'); handle.classList.add('hide');
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => closeBtn.focus({ preventScroll: true }), 60);
    if (location.hash !== '#oani') history.replaceState(null, '', '#oani');
  }
  function close(restore) {
    const was = isOpen; isOpen = false;
    dr.style.transform = ''; dr.classList.remove('dragging', 'open');
    dr.setAttribute('inert', ''); dr.setAttribute('aria-hidden', 'true');
    scrim.classList.remove('on'); setTimeout(() => { if (!isOpen) scrim.hidden = true; }, 360);
    handle.setAttribute('aria-expanded', 'false'); handle.classList.remove('hide');
    if (location.hash === '#oani') history.replaceState(null, '', location.pathname + location.search);
    if (was && restore !== false) handle.focus({ preventScroll: true });
  }

  // pulling: the tab opens the drawer by dragging left, the header closes it by dragging right
  function startDrag(e, from) {
    if (e.button > 0) return;
    drag = { from, x: e.clientX, moved: false, id: e.pointerId, el: e.currentTarget };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function moveDrag(e) {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) < 6) return;
    if (!drag.moved) { drag.moved = true; dr.classList.add('dragging'); scrim.hidden = false; }
    const base = drag.from === 'closed' ? W() : 0;
    const pos = Math.max(0, Math.min(W(), base + dx));
    dr.style.transform = 'translateX(' + pos + 'px)';
    scrim.style.opacity = String(1 - pos / W()); scrim.classList.remove('on');
    drag.pos = pos;
  }
  function endDrag() {
    if (!drag) return;
    const d = drag; drag = null;
    scrim.style.opacity = '';
    if (!d.moved) return;
    d.el.dataset.dragged = '1'; setTimeout(() => delete d.el.dataset.dragged, 0);
    dr.classList.remove('dragging');
    if (d.pos < W() * 0.6) { isOpen = false; open(); } else { isOpen = true; close(); }
  }
  [[handle, 'closed'], [head, 'open']].forEach(([el, from]) => {
    el.addEventListener('pointerdown', e => { if (e.target.closest('.o-close')) return; startDrag(e, from); });
    el.addEventListener('pointermove', moveDrag);
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', () => { if (drag) { drag.pos = from === 'closed' ? W() : 0; endDrag(); } });
  });

  handle.addEventListener('click', () => { if (handle.dataset.dragged) return; open(); });
  closeBtn.addEventListener('click', () => close());
  scrim.addEventListener('click', () => close());
  document.addEventListener('keydown', e => {
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'Tab') {                                   // keep focus inside the open drawer
      const f = [...dr.querySelectorAll('a[href],button:not([disabled]),[tabindex="0"]')].filter(x => x.offsetParent !== null && !x.closest('[inert]'));
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // links such as index.html#oani (menu, footer, About) open the drawer
  const fromHash = () => { if (location.hash === '#oani') open(); };
  dr.addEventListener('pointermove', e => { const r = dr.getBoundingClientRect(); dr.style.setProperty('--mx', (e.clientX - r.left) + 'px'); dr.style.setProperty('--my', (e.clientY - r.top) + 'px'); }, { passive: true });
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
