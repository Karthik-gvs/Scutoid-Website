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
  const clock = label => R(0.1, '<rect class="bubble" x="20" y="14" width="96" height="32" rx="16"/><circle class="g2" cx="40" cy="30" r="5"/>' + T(54, 36, label, 16));
  const pillRow = (x, y, w, at, label, warn) => R(at, '<rect class="pill" x="' + x + '" y="' + y + '" width="' + w + '" height="44" rx="22"/><circle class="' + (warn ? 'warn-c' : 'g2') + '" cx="' + (x + 24) + '" cy="' + (y + 22) + '" r="9"/>' + T(x + 44, y + 28, label, 15));
  const paperCard = (x, y, w, h2, at, inner) => R(at, '<rect class="paper" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h2 + '" rx="12"/>' + inner);

  /* 1. 8:40  Quote: an email lands, a quote is drafted and approved */
  const s1 = clock(TIMES[0]) + person(110, 0.1) +
    R(0.3, '<rect class="paper" x="40" y="62" width="176" height="104" rx="10"/><path d="M40 72 L128 124 L216 72" fill="none" stroke="var(--outline-border)" stroke-width="2"/>' + T(128, 152, 'RFQ · 240 boards', 15, 't-m', 'middle')) +
    gem(400, 160, 1.1, 1.2) + R(1.2, '<path class="beam" d="M220 112 C 290 100, 320 140, 350 158"/>') + R(2.2, '<path class="beam" d="M452 160 C 480 160, 500 150, 520 150"/>') +
    paperCard(520, 62, 240, 190, 2.4, T(538, 94, 'Quote QT-2204', 17) + '<rect class="line" x="538" y="108" width="150" height="7" rx="3"/><rect class="line" x="538" y="124" width="110" height="7" rx="3"/>' + T(538, 176, '₹18,40,000', 30) + T(538, 204, 'Costed at today’s prices', 14, 't-m')) +
    chk(745, 62, 0, 4.6) + R(4.6, T(640, 236, 'Approved by you', 15, '', 'middle'));

  /* 2. 9:15  Design: Rev C, and the ripple it makes */
  const bx = (x, y, w, t, at, hi) => R(at, '<rect class="' + (hi ? 'decide' : 'paper') + '" x="' + x + '" y="' + y + '" width="' + w + '" height="46" rx="10"/>' + T(x + w / 2, y + 29, t, 16, '', 'middle'));
  const s2 = clock(TIMES[1]) + gem(100, 170, 1.1, 0.2) +
    bx(300, 36, 200, 'Controller board', 0.3) +
    R(0.6, '<path class="link" d="M400 82V108M245 108H605M245 108V128M425 108V128M605 108V128"/>') +
    bx(170, 128, 150, 'Main PCB', 0.9) + bx(350, 128, 150, 'Enclosure', 1.2) + bx(530, 128, 150, 'Connector J7', 1.5, true) +
    R(2, '<circle class="g2" cx="726" cy="128" r="26"/>' + T(726, 133, 'Rev C', 13, 't-w', 'middle')) +
    R(2.6, '<circle class="beam" cx="605" cy="151" r="52"/><circle class="beam" cx="605" cy="151" r="88"/>') +
    pillRow(120, 248, 200, 3.4, '2 open work orders') + pillRow(335, 248, 190, 4.2, '1 reel in stock') + pillRow(540, 248, 230, 5, 'Takes effect from board 0101');

  /* 3. 10:30  Plan: bars slot onto the lines, one flag goes up */
  const lane = (y, label) => T(36, y + 21, label, 14, 't-m');
  const bar = (x, y, w, at, cls) => R(at, '<rect class="' + cls + '" x="' + x + '" y="' + y + '" width="' + w + '" height="30" rx="8"/>');
  const s3 = clock(TIMES[2]) + lane(80, 'Line 1') + lane(130, 'Line 2') + lane(180, 'Line 3') +
    bar(110, 80, 220, 0.5, 'g2') + bar(290, 130, 240, 1.1, 'g1') + bar(170, 180, 270, 1.7, 'g3') + bar(340, 80, 180, 2.2, 'g1') +
    R(2.9, '<path class="link" d="M560 62V236"/><rect class="warn-c" x="560" y="62" width="104" height="28" rx="6"/>' + T(612, 81, 'J7 short', 14, 't-w', 'middle')) +
    gem(700, 175, 1.2, 3.5) +
    R(4.2, '<rect class="bubble" x="380" y="256" width="340" height="44" rx="14"/>' + T(400, 285, 'Clear to build, except J7.', 19));

  /* 4. 11:10  Buy: three quotes, one winner, one tap */
  const qc = (x, at, name, price, days) => paperCard(x, 66, 165, 146, at, T(x + 14, 96, name, 16) + T(x + 14, 142, price, 22) + T(x + 14, 168, days, 14, 't-m') + '<rect class="line" x="' + (x + 14) + '" y="184" width="110" height="7" rx="3"/>');
  const s4 = clock(TIMES[3]) +
    qc(30, 0.4, 'Orion Tooling', '₹5,02,900', '5 days') + qc(205, 0.9, 'Mehta Castings', '₹4,81,440', '6 days') + qc(380, 1.4, 'Kaveri Steels', '₹4,95,000', '9 days') +
    R(3, '<rect class="ring" x="203" y="64" width="169" height="150" rx="13"/><rect class="ok-c" x="238" y="52" width="100" height="24" rx="12"/>' + T(288, 69, 'Best overall', 12, 't-w', 'middle')) +
    gem(660, 262, 0.8, 2.6) + R(2.6, '<path class="beam" d="M628 252 C 520 290, 380 270, 300 222"/>') +
    paperCard(585, 66, 190, 132, 3.8, T(603, 96, 'PO-7710', 17) + T(603, 124, '₹4,81,440.00', 20) + T(603, 148, 'Mehta Castings', 14, 't-m') + '<rect class="warn-c" x="603" y="162" width="104" height="22" rx="11"/>' + T(655, 178, 'For approval', 12, 't-w', 'middle')) +
    chk(758, 66, 0, 5.8) + R(5.8, T(680, 222, 'Sent to supplier', 15, '', 'middle'));

  /* 5. 2:00  Make: Line 2, a voice, and boards that remember */
  const brd = (x, at) => R(at, '<rect class="ok-c" x="' + x + '" y="242" width="46" height="18" rx="3"/><rect class="line" x="' + (x + 8) + '" y="247" width="14" height="8"/>');
  const s5 = clock(TIMES[4]) + person(110, 0.1) + R(0.1, '<path class="arm" style="stroke-width:4" d="M90 196 C 90 172, 130 172, 130 196"/>') +
    R(0.3, '<rect class="paper" x="40" y="262" width="720" height="22" rx="11"/>') +
    paperCard(320, 120, 170, 142, 0.3, T(405, 150, 'Line 2', 16, '', 'middle') + '<rect class="g1" x="340" y="168" width="130" height="14" rx="4"/><rect class="line" x="340" y="192" width="90" height="8" rx="3"/>') +
    brd(210, 0.5) + brd(260, 0.9) + brd(520, 3.6) + brd(580, 4) + brd(640, 4.4) +
    R(1.4, '<rect class="bubble" x="150" y="92" width="176" height="44" rx="14"/><polygon class="bubble" points="166,136 186,136 140,176"/>' + T(166, 121, 'Reel 88 loaded.', 18)) +
    R(2.4, '<rect class="bubble" x="330" y="70" width="150" height="30" rx="15"/>' + T(405, 90, 'R-88 · lot L-0412', 13, '', 'middle') + '<path class="beam" d="M405 102V118"/>') +
    chk(580, 216, 0, 4.2) + R(4.2, T(580, 198, 'Board 0007 traced', 14, '', 'middle')) +
    gem(700, 150, 0.9, 3.8) +
    R(5.4, '<rect class="bubble" x="560" y="90" width="150" height="34" rx="17"/>' + T(635, 112, '0 defects so far', 14, '', 'middle'));

  /* 6. 4:45  Deliver: stacked boxes, papers ready, truck waiting */
  const cr = (i, at) => R(at, '<rect class="crate" x="' + (50 + (i % 3) * 62) + '" y="' + (270 - Math.floor(i / 3) * 54) + '" width="58" height="52" rx="5"/>');
  const s6 = clock(TIMES[5]) + cr(0, 0.3) + cr(1, 0.5) + cr(2, 0.7) + cr(3, 0.9) + cr(4, 1.1) + cr(5, 1.3) +
    R(1.6, '<rect class="paper" x="420" y="190" width="220" height="90" rx="10"/><path class="paper" d="M640 214h46l32 32v34h-78z"/><circle class="ink" cx="470" cy="284" r="16"/><circle class="ink" cx="690" cy="284" r="16"/>' + T(530, 242, 'SO-4410', 18, '', 'middle')) +
    paperCard(230, 44, 150, 96, 2, T(246, 74, 'E-invoice', 16) + '<rect class="line" x="246" y="90" width="100" height="7" rx="3"/><rect class="line" x="246" y="106" width="70" height="7" rx="3"/>') + chk(366, 44, 0, 2.5) +
    paperCard(400, 44, 150, 96, 3, T(416, 74, 'E-way bill', 16) + '<rect class="line" x="416" y="90" width="100" height="7" rx="3"/><rect class="line" x="416" y="106" width="70" height="7" rx="3"/>') + chk(536, 44, 0, 3.5) +
    gem(660, 100, 0.9, 4.2) +
    R(4.8, '<rect class="bubble" x="250" y="146" width="300" height="32" rx="16"/>' + T(400, 168, 'Prepared for your approval', 15, '', 'middle'));

  /* 7. 5:30  Account: invoice the customer against the quote, collect payment, know the margin */
  const li = (i, at, txt) => chk(262, 134 + i * 31, 0, at) + R(at, T(286, 140 + i * 31, txt, 16, 't-m'));
  const s7 = clock(TIMES[6]) + person(110, 0.1) + R(0.3, '<path class="arm" d="M128 262 C 160 262, 196 250, 226 232"/>') +
    R(0.6, '<rect class="decide" x="236" y="30" width="360" height="282" rx="18"/>' + T(256, 66, 'Invoice INV-3081 is ready.', 20) + T(256, 92, 'Send ₹21,71,200.00 to Aarav Electronics?', 17, 't-m')) +
    li(0, 1.4, 'Quote QT-2204, approved') + li(1, 2, 'Delivered: DN-1190') + li(2, 2.6, 'GST at 18%: ₹3,31,200.00') + li(3, 3.2, 'E-invoice number issued') + li(4, 3.8, 'Terms: payment in 30 days') +
    R(4.6, '<rect class="btn-g" x="376" y="274" width="92" height="30" rx="8"/>' + T(422, 295, 'Not now', 15, '', 'middle') + '<rect class="btn-p" x="478" y="274" width="104" height="30" rx="8"/>' + T(530, 295, 'Send', 15, 't-w', 'middle')) +
    gem(690, 90, 1.05, 0.4) +
    R(5.4, '<rect class="bubble" x="612" y="150" width="156" height="34" rx="17"/>' + T(690, 172, 'Invoice sent', 15, '', 'middle')) +
    R(6.6, '<rect class="ok-c" x="602" y="194" width="176" height="32" rx="16"/>' + T(690, 215, 'Payment received', 14, 't-w', 'middle') + T(690, 246, '₹21,71,200.00', 16, '', 'middle')) +
    R(7.6, '<rect class="ok-c" x="596" y="260" width="190" height="30" rx="15"/>' + T(691, 280, 'Matched to the invoice', 12.5, 't-w', 'middle'));

  /* 8. 6:20  Settle: pay Mehta against PO-7710, and the books balance on both sides */
  const s8 = clock(TIMES[7]) + person(110, 0.1) + R(0.3, '<path class="arm" d="M128 262 C 160 262, 196 250, 226 232"/>') +
    R(0.6, '<rect class="decide" x="236" y="30" width="330" height="246" rx="18"/>' + T(256, 66, 'Pay Mehta Castings?', 20) + T(256, 92, '₹4,81,440.00 against PO-7710', 17, 't-m')) +
    li(0, 1.4, 'Order PO-7710 matched') + li(1, 2, 'Receipt GRN-2291') + li(2, 2.6, 'Tax at source reviewed') +
    R(3.6, '<rect class="btn-g" x="346" y="226" width="92" height="30" rx="8"/>' + T(392, 247, 'Not now', 15, '', 'middle') + '<rect class="btn-p" x="448" y="226" width="102" height="30" rx="8"/>' + T(499, 247, 'Approve', 15, 't-w', 'middle')) +
    R(4.4, '<rect class="bubble" x="128" y="14" width="180" height="32" rx="16"/>' + T(218, 35, 'Payment recorded', 15, '', 'middle')) +
    R(5.2, '<rect class="paper" x="590" y="40" width="190" height="236" rx="12"/>' + T(608, 70, 'Books', 17)) +
    R(5.8, T(608, 108, 'Sales · INV-3081', 14, 't-m') + T(608, 132, '₹21,71,200.00 in', 16)) +
    R(6.5, T(608, 170, 'Purchase · PO-7710', 14, 't-m') + T(608, 194, '₹4,81,440.00 out', 16)) +
    R(7.4, '<rect class="ok-c" x="608" y="222" width="154" height="32" rx="16"/>' + T(685, 243, 'Both sides balanced', 12.5, 't-w', 'middle'));

  const SCENES = [
    { d: 6.5, title: 'Quote', cap: CAPS[0], html: art(s1, CAPS[0]) },
    { d: 6.5, title: 'Design', cap: CAPS[1], html: art(s2, CAPS[1]) },
    { d: 6.5, title: 'Plan', cap: CAPS[2], html: art(s3, CAPS[2]) },
    { d: 7, title: 'Buy', cap: CAPS[3], html: art(s4, CAPS[3]) },
    { d: 7, title: 'Make', cap: CAPS[4], html: art(s5, CAPS[4]) },
    { d: 6, title: 'Deliver', cap: CAPS[5], html: art(s6, CAPS[5]) },
    { d: 8.5, title: 'Invoice', cap: CAPS[6], html: art(s7, CAPS[6]) },
    { d: 9, title: 'Settle', cap: CAPS[7], html: art(s8, CAPS[7]) }
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
    const snT = document.getElementById('snTime'), snS = document.getElementById('snStage');
    if (snT && snT.textContent !== TIMES[si]) { snT.textContent = TIMES[si]; snS.textContent = SCENES[si].title + ' · ' + JIDS[si]; }
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

  apply(4.6);   // poster frame: first scene, fully drawn
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
