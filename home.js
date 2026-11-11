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
  const ic = n => `<svg class="i"><use href="#i-${n}"/></svg>`;
  const head = (cur, crumb) => `<div class="vs-head">${['Procurement', 'Inventory', 'Bookkeeping'].map(a => `<span class="vs-app${a === cur ? ' cur' : ''}">${a}</span>`).join('')}<span class="vs-crumb">${crumb}</span></div>`;
  const row = (tone, title, sub, badge, at) => `<div class="crow rv" data-at="${at}"><span class="cdot ${tone === 'warn' ? 'warn' : ''}">${ic(tone === 'warn' ? 'alert' : 'check')}</span><div><b>${title}</b><small>${sub}</small></div><span class="badge ${tone === 'warn' ? 'orange' : 'green'} dot">${badge}</span></div>`;
  const poCard = at => `<div class="vs-card rv" data-at="${at}"><h5>PO-7710 · Mehta Castings <span class="badge teal dot">Approved</span></h5>
      <div class="lv"><span>Item</span><b>Gear housing blank</b></div><div class="lv"><span>Ordered</span><b>240 units</b></div>
      <div class="lv"><span>Rate</span><b>₹1,700.00</b></div><div class="lv"><span>Order total</span><b>₹4,81,440.00</b></div></div>`;

  const SCENES = [
    { d: 6, title: 'Ask', cap: 'You ask in plain language. Compliance AI starts from the purchase order.',
      html: head('Procurement', 'Purchase Orders › PO-7710') + `<div class="vs-body two">${poCard(0.4)}
        <div class="vs-chat"><div class="msg me rv" data-at="1.8">Can I bill PO-7710?</div>
        <div class="msg ai rv" data-at="3.4">${ic('sparkles')}<span>Let me check that the goods are received and have passed quality in Inventory first.</span></div></div></div>` },
    { d: 10, title: 'Verify in Inventory', cap: 'It verifies that every operation in Inventory is complete for this purchase order.',
      html: head('Inventory', 'Inventory › Checks for PO-7710') + `<div class="vs-body"><div class="vs-card rv" data-at="0.3" style="width:100%"><h5>Compliance AI is checking Inventory ${'<span class="badge purple dot rv" data-at="0.3" data-until="8.4">Checking</span><span class="badge green dot rv" data-at="8.4">All complete</span>'}</h5>
        ${row('ok', 'Goods receipt note GRN-2291', '240 of 240 units received on 22/11/2026', 'Complete', 1.2)}
        ${row('ok', 'Quality inspection QC-1187', '240 accepted, 0 rejected', 'Passed', 3.2)}
        ${row('ok', 'Quality hold', 'No open hold on batch B-0201', 'Clear', 5.2)}
        ${row('ok', 'Delivery date', 'Received 2 days before the due date', 'On time', 7)}</div></div>` },
    { d: 8, title: 'Match the records', cap: 'It matches the purchase order, receipt and quality results, and checks the supplier.',
      html: head('Bookkeeping', 'Bills › Pre-bill checks') + `<div class="vs-body"><div class="vs-card rv" data-at="0.3" style="width:100%"><h5>Three-way match</h5>
        <table class="vtable"><thead><tr><th>Check</th><th>Purchase order</th><th>Receipt and quality</th><th></th></tr></thead><tbody>
        <tr class="rv" data-at="1"><td>Quantity</td><td>240</td><td>240 accepted</td><td class="ok">✓</td></tr>
        <tr class="rv" data-at="2.2"><td>Rate</td><td>₹1,700.00</td><td>Not applicable</td><td class="ok">✓</td></tr>
        <tr class="rv" data-at="3.4"><td>Supplier tax details</td><td>On file</td><td>Verified</td><td class="ok">✓</td></tr>
        <tr class="rv" data-at="4.6"><td>Deduction at source</td><td>Not recorded</td><td>Needs your review</td><td style="color:var(--c-orange-fg);font-weight:700">!</td></tr></tbody></table></div></div>` },
    { d: 8, title: 'Asks you', cap: 'It shows its checks, then asks you whether to create the bill. You decide.',
      html: head('Procurement', 'Purchase Orders › PO-7710') + `<div class="vs-body two">${poCard(0.2)}
        <div class="vs-card prompt rv" data-at="0.9"><div class="pq">${ic('sparkles')}<span>PO-7710 is ready to bill. Would you like me to create the bill for ₹4,81,440.00?</span></div>
          ${row('ok', 'Goods received', 'GRN-2291 · 240 of 240 units', 'Complete', 2)}
          ${row('ok', 'Quality inspection', 'QC-1187 · 240 accepted, 0 rejected', 'Passed', 2.8)}
          ${row('ok', 'Quantity and rate match', 'Purchase order and receipt agree', 'Matched', 3.6)}
          ${row('ok', 'Supplier tax details', 'Verified', 'Verified', 4.4)}
          ${row('warn', 'Deduction at source', 'Check whether it applies to this bill', 'Review', 5.2)}
          <div class="pact rv" data-at="6"><button class="btn t4 sm" type="button" tabindex="-1">Not Now</button><button class="btn t1 sm pulse-btn" type="button" tabindex="-1">Create Bill</button></div></div></div>` }
  ];
  const TOTAL = SCENES.reduce((s, x) => s + x.d, 0);
  const starts = []; SCENES.reduce((s, x) => (starts.push(s), s + x.d), 0);

  stage.innerHTML = SCENES.map((s, i) => `<div class="vs" data-i="${i}">${s.html}</div>`).join('');
  const layers = [...stage.querySelectorAll('.vs')];
  const big = document.getElementById('vidBig'), playBtn = document.getElementById('vidPlay'), seek = document.getElementById('vidSeek');
  const timeEl = document.getElementById('vidTime'), capEl = document.getElementById('vidCap'), chaps = document.getElementById('vidChaps');
  const ICON = {
    play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>',
    replay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/></svg>'
  };
  chaps.innerHTML = SCENES.map((s, i) => `<button type="button" data-i="${i}"><b>${i + 1}</b>${s.title}</button>`).join('');
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  let t = 0, playing = false, last = 0, raf = 0;
  function apply(tt) {
    let si = 0; starts.forEach((s, i) => { if (tt >= s) si = i; });
    const el = tt - starts[si];
    layers.forEach((l, i) => l.classList.toggle('on', i === si));
    layers[si].querySelectorAll('[data-at]').forEach(n => {
      const at = +n.dataset.at, until = n.dataset.until ? +n.dataset.until : Infinity;
      n.classList.toggle('on', el >= at && el < until);
    });
    capEl.textContent = SCENES[si].cap;
    chaps.querySelectorAll('button').forEach((b, i) => { if (i === si) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    seek.value = Math.round(tt * 10);
    timeEl.textContent = `${fmt(tt)} / ${fmt(TOTAL)}`;
  }
  function setBtn() { playBtn.innerHTML = playing ? ICON.pause : (t >= TOTAL ? ICON.replay : ICON.play); playBtn.setAttribute('aria-label', playing ? 'Pause' : (t >= TOTAL ? 'Replay' : 'Play')); }
  function tick(ts) {
    if (!playing) return;
    t = Math.min(TOTAL, t + (ts - last) / 1000); last = ts; apply(t);
    if (t >= TOTAL) { playing = false; setBtn(); return; }
    raf = requestAnimationFrame(tick);
  }
  function play() { if (t >= TOTAL) t = 0; playing = true; big.classList.add('hide'); last = performance.now(); setBtn(); raf = requestAnimationFrame(tick); }
  function pause() { playing = false; cancelAnimationFrame(raf); setBtn(); }

  big.addEventListener('click', play);
  playBtn.addEventListener('click', () => (playing ? pause() : play()));
  seek.addEventListener('input', () => { t = +seek.value / 10; big.classList.add('hide'); apply(t); setBtn(); });
  chaps.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { t = starts[+b.dataset.i]; apply(t); play(); }));
  // pause when scrolled out of view
  new IntersectionObserver(es => { if (!es[0].isIntersecting && playing) pause(); }, { threshold: 0.2 }).observe(document.getElementById('vid'));

  apply(TOTAL - 0.4);   // poster frame: the final prompt, behind the play button
  setBtn();
})();
