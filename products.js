/* Products page: application demo + suite switch (Scutoid Space turns the page dark) + secondary navigation */
const $ = id => document.getElementById(id);
const root = document.documentElement;
/* ---------- Application glimpse (illustrative data) ---------- */
// Accents follow the design system: operations = teal, finance = pink (color-tokens.md, App accent tokens)
const TEAL = { brand: '#2DA2B5', dark: '#24818F', light: '#81C7D3', fg: '#0C0C0C' };
const PINK = { brand: '#E84271', dark: '#C73660', light: '#F18EAA', fg: '#FFFFFF' };

const APPS = {
  plm: {
    label: 'PLM', logo: 'assets/1.PLM.png', accent: TEAL, crumb: 'Design', title: 'Parts', view: 'All Parts', newLabel: 'New Part',
    kpis: [['Active parts', '1,248', 'purple', null, '+4.2%', 'up', 'across 18 assemblies'], ['Open changes', '14', 'blue', null, '−2', 'down', '3 awaiting approval'], ['Compliance flags', '3', 'purple', 'sparkles', '+1', 'down', 'to review']],
    cols: ['Part', 'Name', 'Phase', 'Revision', 'Owner'],
    rows: [
      { c: ['PRT-1042', 'Gear housing', ['Design', 'teal'], ['Rev C', 'outline'], 'A. Rao'], facts: [['Material', 'EN-GJL-250'], ['Used in', '3 assemblies']],
        find: [['warn', 'Rev C changes the material grade. 2 open work orders still use Rev B.'], ['warn', 'Customer certificate is missing for this revision.'], ['ok', 'Drawing and specification are attached.']],
        next: 'Notify the owners of the 2 work orders and request the certificate before release.' },
      { c: ['PRT-1043', 'Shaft coupling', ['Production', 'yellow'], ['Rev B', 'outline'], 'S. Nair'], facts: [['Material', 'C45 steel'], ['Used in', '5 assemblies']],
        find: [['ok', 'All approvals are complete.'], ['ok', 'No open changes.']], next: 'No action needed.' },
      { c: ['PRT-1051', 'Sensor bracket', ['Prototype', 'pink'], ['Rev A', 'outline'], 'M. Iyer'], facts: [['Material', 'Aluminium 6061'], ['Used in', '1 assembly']],
        find: [['warn', 'Supplier specification is not linked to this part.'], ['ok', 'Drawing is attached.']], next: 'Link the supplier specification, then submit for review.' },
      { c: ['PRT-1060', 'Cover plate', ['Pre-Production', 'orange'], ['Rev A', 'outline'], 'A. Rao'], facts: [['Material', 'Mild steel'], ['Used in', '2 assemblies']],
        find: [['ok', 'Inspection plan is attached.'], ['ok', 'Cost roll-up is current.']], next: 'No action needed.' }
    ]
  },
  mes: {
    label: 'MES', logo: 'assets/1.MES_Manufactoring.png', accent: TEAL, crumb: 'Manufacturing', title: 'Work Orders', view: 'All Work Orders', newLabel: 'New Work Order',
    kpis: [['In progress', '23', 'blue', null, '+3', 'up', 'on 4 lines'], ['On hold', '2', 'orange', null, '+1', 'down', 'quality hold'], ['Compliance flags', '2', 'purple', 'sparkles', '+1', 'down', 'to review']],
    cols: ['Work order', 'Item', 'Quantity', 'Status', 'Due'],
    rows: [
      { c: ['WO-2231', 'Gear housing', '120', ['In Progress', 'orange'], '14/11/2026'], facts: [['Line', 'Line 2'], ['Batch', 'B-0192']],
        find: [['warn', 'Inspection step 4 has no reading recorded. A quality hold is suggested.'], ['ok', 'Material batch is traced.']],
        next: 'Place a quality hold on WO-2231 and ask the inspector to record step 4.' },
      { c: ['WO-2232', 'Shaft coupling', '300', ['Released', 'blue'], '18/11/2026'], facts: [['Line', 'Line 1'], ['Batch', 'B-0185']],
        find: [['ok', 'Routing and tooling are ready.'], ['ok', 'Operators are certified.']], next: 'No action needed.' },
      { c: ['WO-2229', 'Cover plate', '80', ['On Hold', 'neutral'], '12/11/2026'], facts: [['Line', 'Line 3'], ['Batch', 'B-0179']],
        find: [['warn', 'Hold has lasted 5 days. Due date is at risk.'], ['ok', 'Root cause is recorded.']], next: 'Review the hold with the quality lead and set a release date.' },
      { c: ['WO-2227', 'Sensor bracket', '50', ['Complete', 'green'], '09/11/2026'], facts: [['Line', 'Line 2'], ['Batch', 'B-0176']],
        find: [['ok', 'All inspections passed.'], ['ok', 'Batch history is complete.']], next: 'No action needed.' }
    ]
  },
  pro: {
    label: 'Procurement', logo: 'assets/1.Procurement.png', accent: TEAL, crumb: 'Buy', title: 'Purchase Orders', view: 'All Orders', newLabel: 'New Order',
    kpis: [['Open orders', '38', 'blue', null, '+5', 'up', '₹62,40,000.00 committed'], ['Awaiting approval', '6', 'orange', null, '+2', 'down', 'oldest 3 days'], ['Compliance flags', '2', 'purple', 'sparkles', '+1', 'down', 'to review']],
    cols: ['Order', 'Supplier', 'Amount', 'Status', 'Delivery'],
    rows: [
      { c: ['PO-7710', 'Mehta Castings', '₹4,81,440.00', ['Pending Approval', 'orange'], '24/11/2026'], facts: [['Item', 'Gear housing blank'], ['Terms', '30 days']],
        find: [['warn', 'Supplier tax registration is not verified yet.'], ['warn', 'Tax rate differs from the item master.'], ['ok', 'Price is within 3% of the last order.']],
        next: 'Verify the supplier registration and confirm the tax rate before approving.' },
      { c: ['PO-7708', 'Sai Fasteners', '₹92,300.00', ['Approved', 'teal'], '20/11/2026'], facts: [['Item', 'Fasteners M8'], ['Terms', '45 days']],
        find: [['ok', 'Supplier verified.'], ['ok', 'Matches the approved quote.']], next: 'No action needed.' },
      { c: ['PO-7705', 'Kaveri Steels', '₹12,40,000.00', ['Sent', 'blue'], '28/11/2026'], facts: [['Item', 'C45 steel bar'], ['Terms', '30 days']],
        find: [['ok', 'Supplier verified.'], ['warn', 'Delivery date is later than the production plan needs.']], next: 'Ask the supplier to bring the delivery forward.' },
      { c: ['PO-7701', 'Orion Tooling', '₹58,750.00', ['Received', 'green'], '08/11/2026'], facts: [['Item', 'Inserts'], ['Terms', '30 days']],
        find: [['ok', 'Order, receipt and invoice match.']], next: 'No action needed.' }
    ]
  },
  inv: {
    label: 'Inventory', logo: 'assets/1.Inventory.png', accent: TEAL, crumb: 'Stock', title: 'Batches', view: 'All Batches', newLabel: 'New Batch',
    kpis: [['Items in stock', '3,420', 'blue', null, '+1.8%', 'up', 'across 4 locations'], ['With job workers', '5', 'orange', null, '+1', 'down', 'goods out'], ['Compliance flags', '2', 'purple', 'sparkles', '+1', 'down', 'to review']],
    cols: ['Batch', 'Item', 'Quantity', 'Location', 'Status'],
    rows: [
      { c: ['B-0192', 'Rubber seal 40 mm', '1,200', 'Stores A', ['Active', 'green']], facts: [['Received', '02/10/2026'], ['Shelf life ends', '22/11/2026']],
        find: [['warn', 'Shelf life ends in 12 days. Use this batch first.'], ['ok', 'Test certificate is on file.']], next: 'Move the batch to the front of the pick list.' },
      { c: ['B-0188', 'Gear housing blank', '240', 'Job worker', ['Job Work', 'orange']], facts: [['Job worker', 'Delta Machining'], ['Return due', '13/11/2026']],
        find: [['warn', 'Return is due in 3 days. The challan is not reconciled.'], ['ok', 'Quantity sent matches the challan.']], next: 'Remind the job worker and reconcile the challan on return.' },
      { c: ['B-0185', 'Shaft coupling', '300', 'Stores B', ['Active', 'green']], facts: [['Received', '28/10/2026'], ['Shelf life ends', 'Not applicable']],
        find: [['ok', 'Stock matches the last count.']], next: 'No action needed.' },
      { c: ['B-0179', 'Cover plate', '80', 'Quarantine', ['Quality Hold', 'red']], facts: [['Received', '20/10/2026'], ['Hold reason', 'Dimension check']],
        find: [['warn', 'Linked to WO-2229, which is on hold.'], ['ok', 'Hold is recorded with a reason.']], next: 'Decide: release, rework or return to the supplier.' }
    ]
  },
  bk: {
    label: 'Bookkeeping', logo: 'assets/2.Books.png', accent: PINK, crumb: 'Purchases', title: 'Bills', view: 'All Bills', newLabel: 'New Bill',
    kpis: [['Payables', '₹16,00,000.00', 'orange', null, '−4.1%', 'down', '12 bills due'], ['Receivables', '₹12,00,000.00', 'purple', null, '+8.2%', 'up', '7 overdue'], ['Compliance flags', '2', 'purple', 'sparkles', '+1', 'down', 'to review']],
    cols: ['Bill', 'Supplier', 'Amount', 'Status', 'Due'],
    rows: [
      { c: ['BILL-0381', 'Mehta Castings', '₹4,81,440.00', ['Pending Approval', 'orange'], '20/11/2026'], facts: [['Order', 'PO-7710'], ['Terms', '30 days']],
        find: [['warn', 'Check whether tax deducted at source applies to this bill.'], ['ok', 'Matches PO-7710 and the goods receipt.']],
        next: 'Confirm the deduction treatment, then approve the bill.' },
      { c: ['BILL-0377', 'Sai Fasteners', '₹92,300.00', ['Fully Paid', 'green'], '05/11/2026'], facts: [['Order', 'PO-7708'], ['Paid on', '04/11/2026']],
        find: [['ok', 'Payment matched to the bank line.']], next: 'No action needed.' },
      { c: ['BILL-0372', 'Kaveri Steels', '₹12,40,000.00', ['Overdue', 'red'], '01/11/2026'], facts: [['Order', 'PO-7705'], ['Overdue by', '9 days']],
        find: [['warn', 'Bill is overdue. Early-payment discount has lapsed.'], ['ok', 'Supplier tax details are verified.']], next: 'Schedule payment this week.' },
      { c: ['BILL-0369', 'Orion Tooling', '₹58,750.00', ['Approved', 'teal'], '15/11/2026'], facts: [['Order', 'PO-7701'], ['Terms', '30 days']],
        find: [['ok', 'Matches order and receipt.']], next: 'No action needed.' }
    ]
  }
};

// Scutoid Space: no accent is assigned in the style guide yet, so it uses the platform default (purple) — open decision.
const PURPLE = { brand: '#9C2DB7', dark: '#7A2491', light: '#C481D4', fg: '#FFFFFF' };
Object.assign(APPS, {
  mcc: {
    label: 'Mission Command Center', short: 'MCC', logo: 'assets/space-mcc.svg', accent: PURPLE, crumb: 'Operations', title: 'Passes', view: 'All Passes', newLabel: 'New Pass',
    kpis: [['Passes today', '14', 'blue', null, '+2', 'up', 'across 3 ground stations'], ['Awaiting review', '3', 'orange', null, '+1', 'down', 'second operator'], ['Compliance flags', '2', 'purple', 'sparkles', '+1', 'down', 'to review']],
    cols: ['Pass', 'Spacecraft', 'Ground station', 'Status', 'Start (UTC)'],
    rows: [
      { c: ['P-0412', 'SAT-1', 'Station A', ['Pending Review', 'orange'], '14:32'], facts: [['Duration', '9 min'], ['Sequence', 'CS-118']],
        find: [['warn', 'Command sequence CS-118 has not been reviewed by a second operator.'], ['ok', 'Contact window is within the pass plan.']],
        next: 'Send CS-118 for second-operator review before the pass starts.' },
      { c: ['P-0413', 'SAT-2', 'Station B', ['Scheduled', 'blue'], '15:07'], facts: [['Duration', '11 min'], ['Sequence', 'CS-121']],
        find: [['ok', 'Sequence reviewed and approved.'], ['ok', 'Ground station is available.']], next: 'No action needed.' },
      { c: ['P-0409', 'SAT-1', 'Station C', ['Complete', 'green'], '11:48'], facts: [['Duration', '8 min'], ['Sequence', 'CS-115']],
        find: [['ok', 'Operator log is complete.']], next: 'No action needed.' },
      { c: ['P-0407', 'SAT-2', 'Station A', ['Cancelled', 'neutral'], '09:20'], facts: [['Duration', '10 min'], ['Sequence', 'CS-113']],
        find: [['warn', 'Cancelled without a recorded reason.'], ['ok', 'No commands were sent.']], next: 'Record the reason for the cancellation.' }
    ]
  },
  eo: {
    label: 'Earth Observation', short: 'EO', logo: 'assets/space-eo.svg', accent: PURPLE, crumb: 'Data', title: 'Scenes', view: 'All Scenes', newLabel: 'New Order',
    kpis: [['Scenes this week', '312', 'blue', null, '+8.4%', 'up', 'from 2 sensors'], ['Awaiting processing', '18', 'orange', null, '−4', 'up', 'oldest 2 hours'], ['Compliance flags', '2', 'purple', 'sparkles', '+1', 'down', 'to review']],
    cols: ['Scene', 'Area', 'Sensor', 'Status', 'Captured (UTC)'],
    rows: [
      { c: ['SC-88104', 'Coastal region 4', 'Optical', ['Processed', 'green'], '10/11/2026 06:12'], facts: [['Cloud cover', '6%'], ['Resolution', '3 m']],
        find: [['warn', 'Licence and usage terms are not recorded for this scene.'], ['ok', 'Source acquisition is traced.']],
        next: 'Record the licence terms, then release the scene to users.' },
      { c: ['SC-88101', 'Farmland block 12', 'Optical', ['Processing', 'orange'], '10/11/2026 05:40'], facts: [['Cloud cover', '22%'], ['Resolution', '3 m']],
        find: [['ok', 'Source acquisition is traced.'], ['ok', 'Licence terms are recorded.']], next: 'No action needed.' },
      { c: ['SC-88097', 'River basin 7', 'Radar', ['Delivered', 'teal'], '09/11/2026 21:03'], facts: [['Cloud cover', 'Not applicable'], ['Resolution', '10 m']],
        find: [['ok', 'Delivered with provenance record.']], next: 'No action needed.' },
      { c: ['SC-88090', 'Industrial zone 2', 'Optical', ['Quality Hold', 'red'], '09/11/2026 06:25'], facts: [['Cloud cover', '71%'], ['Resolution', '3 m']],
        find: [['warn', 'Cloud cover is above the product threshold.'], ['ok', 'Hold is recorded with a reason.']], next: 'Reject the scene or request a new capture.' }
    ]
  }
});
const SUITES = { works: ['plm', 'mes', 'pro', 'inv', 'bk'], space: ['mcc', 'eo'] };
let suite = 'works';

const app = $('app'), rail = $('rail'), tbody = $('tbody'), thead = $('thead'), qv = $('qv'), drawer = $('drawer'), ov = $('ov'), toastEl = $('toast');
let current = 'plm', selected = null, clickTimer = null, toastTimer = null;

const icon = (n, cls = '') => `<svg class="i ${cls}"><use href="#i-${n}"/></svg>`;
const badge = ([t, tone]) => `<span class="badge ${tone}${tone === 'outline' ? '' : ' dot'}">${t}</span>`;

function buildRail() {
  rail.innerHTML = `<img class="mark" src="assets/Scutoid_Mark_Vector.svg" alt="Scutoid">` +
    SUITES[suite].map(k => { const a = APPS[k]; return `<button data-app="${k}" aria-label="${a.label}" title="${a.label}"><img src="${a.logo}" alt=""><span>${a.label}</span></button>`; }).join('');
  rail.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { render(b.dataset.app); demoStep(2); }));
}

function render(key) {
  current = key; const a = APPS[key];
  app.style.setProperty('--brand', a.accent.brand);
  app.style.setProperty('--brand-dark', a.accent.dark);
  app.style.setProperty('--brand-light', a.accent.light);
  app.style.setProperty('--brand-fg', a.accent.fg);
  rail.querySelectorAll('button').forEach(b => {
    if (b.dataset.app === key) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
  });
  $('crumb').textContent = a.crumb; $('ptitle').textContent = a.title;
  $('viewName').textContent = a.view; $('newLabel').textContent = a.newLabel;
  $('kpis').innerHTML = a.kpis.map(([label, val, tone, ic, delta, dir, note]) => `
    <div class="kpi"><div class="kpi-top"><span>${label}</span><div class="tile sm ${tone}">${icon(ic || 'file')}</div></div>
    <strong>${val}</strong><div class="kpi-foot"><span class="badge outline ${dir}">${icon(dir === 'up' ? 'up' : 'down')}${delta}</span><small>${note}</small></div></div>`).join('');
  const last = a.cols.length - 1;
  thead.innerHTML = `<tr>${a.cols.map((c, i) => `<th class="${i === last ? 'col-x' : ''}">${c}</th>`).join('')}</tr>`;
  tbody.innerHTML = a.rows.map((r, ri) => `<tr tabindex="0" data-i="${ri}" aria-selected="false">${r.c.map((v, i) =>
    `<td class="${i > 0 && !Array.isArray(v) ? 'sub' : ''} ${i === last ? 'col-x' : ''}">${Array.isArray(v) ? badge(v) : v}</td>`).join('')}</tr>`).join('');
  tbody.querySelectorAll('tr').forEach(tr => {
    tr.addEventListener('click', () => { clearTimeout(clickTimer); clickTimer = setTimeout(() => toggleRow(+tr.dataset.i), 200); });
    tr.addEventListener('dblclick', () => { clearTimeout(clickTimer); toast('Double click opens the full record on its own page.'); });
    tr.addEventListener('keydown', e => { if (e.key === 'Enter') toggleRow(+tr.dataset.i); });
  });
  closeQV();
}

function toggleRow(i) { selected === i ? closeQV() : openQV(i); }

function openQV(i) {
  selected = i; const a = APPS[current], r = a.rows[i];
  tbody.querySelectorAll('tr').forEach(tr => tr.setAttribute('aria-selected', +tr.dataset.i === i));
  const flags = r.find.filter(f => f[0] === 'warn').length;
  qv.innerHTML = `<div class="qv-in">
    <div class="qv-head"><img src="${a.logo}" alt=""><div><h5>${r.c[0]}</h5><p>${r.c[1]}</p></div>
      <button class="ib" id="qvExp" aria-label="Open full record" title="Open full record">${icon('expand')}</button>
      <button class="ib" id="qvX" aria-label="Close" title="Close">${icon('x')}</button></div>
    <div class="panel">${r.facts.map(([l, v]) => `<div class="lv"><span>${l}</span><b>${v}</b></div>`).join('')}</div>
    <div class="panel"><h6>${icon('sparkles')}Compliance AI ${flags ? `<span class="badge orange dot">${flags} to review</span>` : `<span class="badge green dot">All clear</span>`}</h6>
      <div class="finds">${r.find.map(([t, x]) => `<div class="find ${t}"><span class="dotc">${icon(t === 'ok' ? 'check' : 'alert')}</span><span>${x}</span></div>`).join('')}</div></div>
    <div class="qv-act">${flags ? `<button class="btn t2 sm" id="qvReview">Review Findings</button>` : ''}<a class="inline" href="#experience" id="qvFull">View Full Entry</a></div></div>`;
  qv.classList.add('open');
  $('qvX').onclick = closeQV;
  $('qvExp').onclick = $('qvFull').onclick = e => { e.preventDefault(); toast('The full record opens on its own page in the application.'); };
  const rv = $('qvReview'); if (rv) rv.onclick = openDrawer;
  demoStep(rv ? 3 : 2.5);
}

function closeQV() {
  selected = null; qv.classList.remove('open');
  tbody.querySelectorAll('tr').forEach(tr => tr.setAttribute('aria-selected', 'false'));
}

function openDrawer() {
  const r = APPS[current].rows[selected];
  drawer.innerHTML = `
    <div class="dh"><h5>Review Findings</h5><button class="ib" id="dX" aria-label="Close">${icon('x')}</button></div>
    <div class="db">
      <div class="dsec"><h6>${r.c[0]} · ${r.c[1]}</h6><div class="finds">${r.find.map(([t, x]) => `<div class="find ${t}"><span class="dotc">${icon(t === 'ok' ? 'check' : 'alert')}</span><span>${x}</span></div>`).join('')}</div></div>
      <div class="dsec"><h6>Suggested next step</h6><p style="margin:0;color:var(--fg)">${r.next}</p><p>Prepared by Compliance AI. Nothing changes until you approve.</p></div>
      <div class="dsec"><h6>Signed approval</h6>
        <label class="fld">Approval note<input type="text" placeholder="Add a note for the record"></label>
        <label class="chk"><input type="checkbox" id="dChk"><span>I have reviewed these findings and approve the suggested next step.</span></label></div>
    </div>
    <div class="df"><button class="btn t4" id="dCancel">Cancel</button><button class="btn t1" id="dOk" disabled>Sign and Approve</button></div>`;
  drawer.setAttribute('aria-hidden', 'false'); drawer.classList.add('on'); ov.classList.add('on');
  $('dX').onclick = $('dCancel').onclick = closeDrawer;
  $('dChk').onchange = e => { $('dOk').disabled = !e.target.checked; };
  $('dOk').onclick = () => { closeDrawer(); toast('Signed approval recorded with the record.', true); demoStep(5); };
  $('dX').focus(); demoStep(4);
}
function closeDrawer() { drawer.classList.remove('on'); ov.classList.remove('on'); drawer.setAttribute('aria-hidden', 'true'); }
ov.addEventListener('click', closeDrawer);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (drawer.classList.contains('on')) closeDrawer(); else if (document.querySelector('.frame.max')) setMax(false); else if (selected !== null) closeQV(); } });

function toast(text, ok) {
  toastEl.innerHTML = `${icon(ok ? 'check' : 'sparkles')}<span>${text}</span>`;
  toastEl.classList.add('on'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('on'), 3500);
}


/* ---------- Product detail + secondary navigation ---------- */
const PD = {
  plm: { tag: 'Design and engineering change, under control.',
    overview: 'PLM holds every part, bill of materials and revision in one place. Engineers release changes through a controlled workflow, and everyone downstream sees the same current revision.',
    points: ['Items and bills of materials with full revision history', 'Engineering change requests and orders', 'Drawings and documents linked to each part', 'Compliance AI (planned): flags missing specifications and certificates, and explains the impact of a change'],
    uses: [['Release a change safely', 'See which assemblies and open work orders a revision touches before you release it.'], ['Keep design records audit-ready', 'Drawings, specifications and approvals stay with the part they belong to.'], ['Share one bill of materials', 'Production, purchasing and stores work from the same current revision.']],
    faqs: [['Can I start with PLM alone?', 'Yes. Each product is sold alone or together, and you can add the others later without migrating.'], ['How does PLM connect to the shop floor?', 'It is designed so released revisions reach MES work orders and Procurement, so teams build and buy from the current revision.'], ['What will Compliance AI do in PLM?', 'It is planned to flag missing specifications and certificates and to explain change impact. A person gives a signed approval before any change is final.']] },
  mes: { tag: 'Work orders and the shop floor, recorded as they happen.',
    overview: 'MES turns released designs into work orders, tracks each step on the line and records inspections, so every batch has a complete history.',
    points: ['Work orders and routings', 'Inspection records and quality holds', 'Batch traceability from material to finished item', 'Compliance AI (planned): spots missed inspection steps and suggests a quality hold'],
    uses: [['Hold a batch before it moves on', 'Place a quality hold until someone decides to release, rework or reject.'], ['Trace a batch end to end', 'See which material, machine and operator went into a finished batch.'], ['Plan the day’s work orders', 'See what is released, in progress, on hold and due.']],
    faqs: [['Does MES need the other products?', 'No. You can run MES alone and add PLM, Procurement, Inventory or Bookkeeping later.'], ['What is a quality hold?', 'A stop placed on a batch or work order until a person decides what happens next.'], ['What will Compliance AI do in MES?', 'It is planned to check inspection records as work happens and recommend release or hold. People make the decision.']] },
  pro: { tag: 'Buy from suppliers you can trust.',
    overview: 'Procurement covers requests, quotes, purchase orders, receipts and supplier performance, so buying is controlled and every order can be matched to its receipt and invoice.',
    points: ['Requests, quotes and purchase orders', 'Goods receipts and three-way matching', 'Supplier records with tax details and performance', 'Compliance AI (planned): checks supplier details and flags unusual terms'],
    uses: [['Compare quotes', 'Put supplier quotes side by side before you order.'], ['Match order, receipt and invoice', 'Catch differences before a bill is approved.'], ['Check suppliers before you order', 'Keep tax and registration details on the supplier record.']],
    faqs: [['Can I connect Procurement to my books?', 'Yes. Approved orders and bills connect to Bookkeeping when you use both. Connectors for Tally, Zoho Books, QuickBooks and Xero are planned.'], ['Is it built for Indian tax rules?', 'Scutoid is India first, with tax details held on supplier and item records. Other countries follow as country packs.'], ['What will Compliance AI do in Procurement?', 'It is planned to check supplier tax details and match orders, receipts and invoices, then explain every flag.']] },
  inv: { tag: 'Stock you can account for.',
    overview: 'Inventory tracks batches, locations, stock movements, job work and despatch, so you always know what you have, where it is and who holds it.',
    points: ['Batches (lots) and locations', 'Job work out and back, against a challan', 'Despatch and delivery documents', 'Compliance AI (planned): warns about shelf life and checks despatch documents, and builds custom agentic workflows from your instructions'],
    uses: [['Track job work', 'Follow goods out to a job worker and chase what is due back.'], ['Use stock in the right order', 'Move the earliest-expiring batch to the front of the pick list.'], ['Check despatch before goods leave', 'Confirm documents and quantities match the order.']],
    faqs: [['What is job work?', 'Sending goods to a job worker to process and receiving them back. Scutoid tracks goods out and back against a challan.'], ['Can I automate stock tasks?', 'Compliance AI is planned to build custom agentic workflows from your plain-language instructions, with signed approvals where records change. See Workflows on this page.'], ['Can I use Inventory without Procurement?', 'Yes. Each product works alone, and they connect when you use them together.']] },
  bk: { tag: 'Books that close on time.',
    overview: 'Bookkeeping keeps ledgers, bills, invoices, GST and TDS, bank reconciliation and period close connected to the work behind them in design, buying and stores.',
    points: ['Ledgers, bills and invoices', 'GST and TDS, India first', 'Bank reconciliation and period close', 'Compliance AI (planned): reconciles returns against the books and explains what blocks the close'],
    uses: [['Reconcile tax returns', 'Compare returns with your books and see the differences.'], ['Close the period with a checklist', 'See what is blocking the close and who owns it.'], ['Keep one set of records', 'Purchases and stock feed the books without re-entry.']],
    faqs: [['Can I keep the accounting software I use now?', 'Connectors for Tally, Zoho Books, QuickBooks and Xero are planned so data can flow to the books you already keep.'], ['Which tax rules does it cover?', 'GST and TDS for India first, with country packs for other markets later. Compliance AI supports your team and is not legal or tax advice.'], ['What will Compliance AI do in Bookkeeping?', 'It is planned to reconcile returns, highlight deduction issues early and prepare the close checklist. A person approves.']] },
  mcc: { tag: 'Plan, command and monitor missions.',
    overview: 'Mission Command Center is where operators plan contact windows, send commands and monitor spacecraft. It is in design, and details may change.',
    points: ['Pass and contact-window planning', 'Command sequences with review', 'Operator log for every action', 'Compliance AI (planned): checks sequences against mission rules and flags passes that need a second operator'],
    uses: [['Plan contact windows', 'See upcoming passes across ground stations.'], ['Review command sequences', 'Get a second operator’s review before commands go out.'], ['Keep an operator log', 'Record every action with who, what and when.']],
    faqs: [['Is Mission Command Center available?', 'Not yet. It is in design, and what is shown here may change.'], ['What will Compliance AI do here?', 'It is planned to check command sequences against mission rules and explain what it finds. Operators stay in control.'], ['Why does Scutoid Space use dark mode?', 'Scutoid Space screens are designed in dark mode.']] },
  eo: { tag: 'Turn imagery and data into decisions.',
    overview: 'Earth Observation turns satellite imagery and sensor data into results your teams can act on, with a record of where every data product came from. It is in design, and details may change.',
    points: ['Scene catalogue and processing status', 'Provenance for every data product', 'Quality checks such as cloud cover', 'Compliance AI (planned): flags scenes with missing licence or usage terms'],
    uses: [['Find the right scene', 'Search scenes by area, sensor and capture time.'], ['Prove where data came from', 'Keep a source record for each product you deliver.'], ['Hold poor-quality scenes', 'Stop scenes above a cloud-cover limit from reaching users.']],
    faqs: [['Is Earth Observation available?', 'Not yet. It is in design, and what is shown here may change.'], ['What will Compliance AI do here?', 'It is planned to flag scenes with missing licence or usage terms and to explain each result with a link to its source data.'], ['Can I use it with Mission Command Center?', 'The two products are designed to work alone or together.']] }
};
let activeP = null;
const goTo = id => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); };
document.querySelectorAll('#snTop button').forEach(b => b.addEventListener('click', () => goTo(b.dataset.go)));

function buildProducts() {
  const keys = SUITES[suite], space = suite === 'space';
  document.getElementById('snSuite').textContent = space ? 'Scutoid Space' : 'Scutoid Works';
  const sp = document.getElementById('snProducts');
  sp.innerHTML = keys.map(k => `<button type="button" data-p="${k}">${APPS[k].label}</button>`).join('');
  sp.querySelectorAll('button').forEach(b => b.addEventListener('click', () => goTo('p-' + b.dataset.p)));
  document.getElementById('pdetail').innerHTML = keys.map(k => {
    const a = APPS[k], d = PD[k];
    return `<article class="pblock" id="p-${k}" data-p="${k}">
      <header class="phead"><img src="${a.logo}" alt="" width="56" height="56"><div><h3>${a.label}</h3><p>${d.tag}</p></div>${space ? '<span class="badge neutral dot">In design</span>' : ''}</header>
      <section id="p-${k}-overview" data-sec="overview"><h4>Overview</h4><div class="ov"><p>${d.overview}</p><ul class="ticks">${d.points.map(x => `<li>${x}</li>`).join('')}</ul></div></section>
      <section id="p-${k}-uses" data-sec="uses"><h4>Business uses</h4><div class="grid3">${d.uses.map(([t, x]) => `<article class="card pad"><h3>${t}</h3><p>${x}</p></article>`).join('')}</div></section>
      <section id="p-${k}-faq" data-sec="faq"><h4>FAQs</h4>${d.faqs.map(([q, x]) => `<details class="faq"><summary>${q}</summary><p>${x}</p></details>`).join('')}</section>
    </article>`;
  }).join('');
  activeP = null; updateSpy();
}

function mark(sel, attr, val) {
  document.querySelectorAll(sel).forEach(b => { if (b.dataset[attr] === val) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
}
function updateSpy() {
  const line = 170;
  let top = null;
  ['pflow', 'see-app', 'products'].forEach(id => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top <= line) top = id; });
  mark('#snTop button', 'go', top);
  const sub = document.getElementById('snSub'); sub.hidden = top !== 'products';
  if (top !== 'products') { activeP = null; return; }
  const blocks = [...document.querySelectorAll('.pblock')]; let cur = null;
  blocks.forEach(b => { const r = b.getBoundingClientRect(); if (r.top <= line && r.bottom > line) cur = b; });
  const key = cur ? cur.dataset.p : null;
  mark('#snProducts button', 'p', key);
  if (key !== activeP) {
    activeP = key;
    const act = document.querySelector(`#snProducts button[data-p="${key}"]`);
    if (act) { const strip = document.getElementById('snProducts'); strip.scrollLeft = act.offsetLeft - strip.clientWidth / 3; }
  }
}
let spyTick = false;
window.addEventListener('scroll', () => { if (spyTick) return; spyTick = true; requestAnimationFrame(() => { updateSpy(); spyTick = false; }); }, { passive: true });



/* ---------- Suite hero, flow and cards ---------- */
const ACC = { plm: '#2DA2B5', mes: '#2DA2B5', pro: '#2DA2B5', inv: '#2DA2B5', bk: '#E84271', mcc: '#9C2DB7', eo: '#9C2DB7' };
const ART = {
  mcc: '<svg viewBox="0 0 400 200"><ellipse cx="200" cy="100" rx="170" ry="62" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-dasharray="4 6"/><ellipse cx="200" cy="100" rx="110" ry="40" fill="none" stroke="currentColor" stroke-opacity=".6" transform="rotate(-18 200 100)"/><circle cx="200" cy="100" r="30" fill="currentColor" fill-opacity=".18" stroke="currentColor"/><circle cx="296" cy="64" r="6" fill="currentColor"/><circle cx="96" cy="142" r="4" fill="currentColor" fill-opacity=".7"/></svg>',
  eo: '<svg viewBox="0 0 400 200"><g fill="none" stroke="currentColor" stroke-opacity=".3"><path d="M0 50h400M0 100h400M0 150h400M80 0v200M160 0v200M240 0v200M320 0v200"/></g><path d="M60 190 150 10h90l-90 180z" fill="currentColor" fill-opacity=".16" stroke="currentColor"/><path d="M250 190 330 40h50l-80 150z" fill="currentColor" fill-opacity=".1" stroke="currentColor" stroke-opacity=".6"/></svg>'
};
const SUITE_META = {
  works: {
    title: 'Scutoid Works', tag: 'Design · Make · Buy · Stock · Account',
    lead: 'A cloud manufacturing suite that connects design, shop floor, purchasing, stock and accounts on one set of records, with local compliance built in. Start with one product and add the others later.',
    flowTitle: 'One set of records, from design to books.', flowSub: 'Each product works alone. Used together, they are designed to share the same records, so nothing is typed twice.',
    flow: [['plm', 'Design', 'Parts, bills of materials and revisions'], ['mes', 'Make', 'Work orders and inspections'], ['pro', 'Buy', 'Orders, receipts and suppliers'], ['inv', 'Stock', 'Batches, job work and despatch'], ['bk', 'Account', 'Bills, GST, TDS and period close']],
    cardsTitle: 'Five products. Sold alone or together.', cardsSub: 'Add a product at any time without migrating. Compliance AI is being designed for each one.'
  },
  space: {
    title: 'Scutoid Space', tag: 'Mission operations · Earth observation',
    lead: 'Two products for space operations. Plan and command missions, then turn what your spacecraft capture into decisions, with Compliance AI checking the work and explaining what it finds.',
    flowTitle: 'From the first pass to the final product.', flowSub: 'Mission Command Center and Earth Observation are designed to work alone or together. Both are in design and may change.',
    flow: [['mcc', 'Plan', 'Contact windows and passes'], ['mcc', 'Command', 'Sequences with review'], ['eo', 'Observe', 'Scenes and sensors'], ['eo', 'Deliver', 'Data products with provenance']],
    cardsTitle: 'Two products. In design.', cardsSub: 'Scutoid Space screens use dark mode. Product details may change.'
  }
};
function renderSuite() {
  const m = SUITE_META[suite], keys = SUITES[suite], space = suite === 'space';
  $('phTitle').textContent = m.title; $('phTag').textContent = m.tag; $('phLead').textContent = m.lead;
  $('flowTitle').textContent = m.flowTitle; $('flowSub').textContent = m.flowSub;
  $('pcTitle').textContent = m.cardsTitle; $('pcSub').textContent = m.cardsSub;
  $('pChips').innerHTML = keys.map(k => `<button type="button" class="pchip" data-p="${k}"><img src="${APPS[k].logo}" alt="">${APPS[k].label}</button>`).join('');
  const fl = $('pFlow'); fl.style.setProperty('--n', m.flow.length);
  fl.innerHTML = m.flow.map(([k, step, d], i) => `<li><div class="node" style="--acc:${ACC[k]}"><img src="${APPS[k].logo}" alt=""></div><span class="step">Step ${i + 1}</span><b>${step}</b><small>${d}</small></li>`).join('');
  $('pCards').innerHTML = keys.map(k => {
    const d = PD[k], a = APPS[k];
    const top = space ? `<div class="pcard-top art" aria-hidden="true">${ART[k]}</div>` : `<div class="pcard-top"></div>`;
    return `<article class="card pcard" style="--acc:${ACC[k]}">${top}
      <img class="pcard-logo" src="${a.logo}" alt="" width="56" height="56">
      <div class="pcard-body"><h3>${a.label}</h3><p class="ptag">${d.tag}</p>
        <ul class="ticks tight">${d.points.slice(0, 3).map(x => `<li>${x}</li>`).join('')}</ul>
        <div class="pcard-foot"><span class="badge ${space ? 'neutral' : 'purple'} dot">${space ? 'In design' : 'Compliance AI planned'}</span><button type="button" class="inline" data-p="${k}">Explore overview</button></div></div></article>`;
  }).join('');
  document.querySelectorAll('#pChips [data-p], #pCards [data-p]').forEach(b => b.addEventListener('click', () => goTo('p-' + b.dataset.p)));
}


/* ---------- Demo guide: steps, reset, full screen ---------- */
const HINTS = {
  1: 'Start by choosing a product in the left rail.',
  2: 'Now select any row in the table to preview it.',
  2.5: 'This one is all clear. Try a row marked to review.',
  3: 'Compliance AI found something. Choose Review Findings.',
  4: 'Read the findings, tick the box, then choose Sign and Approve.',
  5: 'Done. Your signed approval is recorded. Reset to try another product.'
};
function demoStep(n) {
  const cur = Math.min(Math.floor(n), 4);
  document.querySelectorAll('#demoSteps li').forEach(li => {
    const s = +li.dataset.s;
    li.classList.toggle('done', n >= 5 || s < cur);
    if (s === cur && n < 5) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
  });
  $('demoHint').textContent = HINTS[n] || '';
}
function setMax(on) {
  document.querySelector('.frame').classList.toggle('max', on);
  document.body.classList.toggle('demo-max', on);
  $('demoMax').setAttribute('aria-pressed', on); $('demoMax').textContent = on ? 'Exit Full Screen' : 'Full Screen';
}
$('demoMax').addEventListener('click', () => setMax(!document.querySelector('.frame.max')));
$('demoReset').addEventListener('click', () => { closeDrawer(); render(current); demoStep(2); });

/* Theme: light by default. Scutoid Space turns the whole page dark. */
function setAppMode(m) {
  app.classList.toggle('dark', m === 'dark');
  $('modeBtn').innerHTML = icon(m === 'dark' ? 'sun' : 'moon');
}
$('modeBtn').addEventListener('click', () => {
  if (suite === 'space') return toast('Scutoid Space screens always use dark mode.');
  setAppMode(app.classList.contains('dark') ? 'light' : 'dark');
});
$('newBtn').addEventListener('click', () => toast('New records open in a form drawer.'));

function setSuite(next, product) {
  suite = next;
  const space = next === 'space';
  root.dataset.theme = space ? 'dark' : 'light';
  ['brand', 'brand-dark', 'brand-light', 'brand-fg'].forEach(v => root.style.removeProperty('--' + v));
  if (space) {
    root.style.setProperty('--brand', PURPLE.brand); root.style.setProperty('--brand-dark', PURPLE.dark);
    root.style.setProperty('--brand-light', PURPLE.light); root.style.setProperty('--brand-fg', PURPLE.fg);
  }
  setAppMode(space ? 'dark' : 'light');
  document.querySelectorAll('[data-suite-btn]').forEach(b => b.setAttribute('aria-selected', b.dataset.suiteBtn === next));
  closeDrawer(); buildRail(); render(SUITES[next][0]); renderSuite(); buildProducts(); demoStep(2);
  if (product) setTimeout(() => goTo('p-' + product), 60);
}
document.querySelectorAll('[data-suite-btn]').forEach(b => b.addEventListener('click', () => setSuite(b.dataset.suiteBtn)));

const qs = new URLSearchParams(location.search);
const startSuite = qs.get('suite') === 'space' ? 'space' : 'works';
const startProduct = SUITES[startSuite].includes(qs.get('p')) ? qs.get('p') : null;
setSuite(startSuite, startProduct);
