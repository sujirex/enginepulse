/* ═══════════════════════════════════════════════════
   EnginePulse — Common Utilities
═══════════════════════════════════════════════════ */

'use strict';

// ── Theme ──────────────────────────────────────────
const THEME_KEY = 'enginepulse-theme';

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem(THEME_KEY, t);
  const btn = document.getElementById('btn-theme');
  if (!btn) return;
  btn.innerHTML = t === 'dark'
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
}

function initTheme() {
  const t = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(t);
  document.getElementById('btn-theme')?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  });
}

// ── Storage helpers ────────────────────────────────
const EP = {
  save(key, data) { localStorage.setItem('ep-' + key, JSON.stringify(data)); },
  load(key, def = null) {
    try { const v = localStorage.getItem('ep-' + key); return v ? JSON.parse(v) : def; }
    catch { return def; }
  },
  remove(key) { localStorage.removeItem('ep-' + key); },
};

// Vessel/project info
function getProject() { return EP.load('project', {}); }
function saveProject(data) { EP.save('project', data); }

// Module completion status
function getModuleStatus(mod) { return EP.load('status-' + mod, 'pending'); }
function setModuleStatus(mod, status) { EP.save('status-' + mod, status); }

// ── Navbar ─────────────────────────────────────────
const NAV_LINKS = [
  { href: 'index.html',         label: 'Dashboard',    key: 'dashboard' },
  { href: 'commissioning.html', label: 'Commissioning',key: 'commissioning' },
  { href: 'dgtest.html',        label: 'D.G. Test',    key: 'dgtest' },
  { href: 'emergencyGen.html',  label: 'Emerg. Gen',   key: 'emergencyGen' },
  { href: 'switchboard.html',   label: 'Switchboard',  key: 'switchboard' },
  { href: 'seatrial.html',      label: 'Sea Trial',    key: 'seatrial' },
  { href: 'longtrial.html',     label: 'Long Trial',   key: 'longtrial' },
  { href: 'predictive.html',    label: 'Predictive',   key: 'predictive' },
  { href: 'signoff.html',       label: 'Sign-off',     key: 'signoff' },
  { href: 'guide.html',         label: 'Guide',        key: 'guide' },
];

function buildNavbar(activeKey) {
  const el = document.getElementById('navbar');
  if (!el) return;
  const proj = getProject();
  const vesselName = proj.vesselName ? `<span style="font-size:11px;color:var(--text-dim);margin-left:4px">${proj.vesselName}</span>` : '';
  el.innerHTML = `
    <a class="nav-logo" href="index.html">
      <div class="nav-logo-icon">⚙️</div>
      <div>
        <span class="nav-logo-name">EnginePulse</span>
        <span class="nav-logo-sub">Engine Test Suite</span>
      </div>
    </a>
    ${vesselName}
    <nav class="nav-links">
      ${NAV_LINKS.map(l => `<a class="nav-link${l.key===activeKey?' active':''}" href="${l.href}">${l.label}</a>`).join('')}
    </nav>
    <div class="nav-right">
      <button class="btn-icon" id="btn-theme" title="Toggle theme"></button>
    </div>
  `;
  initTheme();
}

// ── Vessel header strip ─────────────────────────────
function buildVesselStrip() {
  const p = getProject();
  if (!p.vesselName) return '';
  return `<div style="display:flex;gap:20px;flex-wrap:wrap;background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:10px 16px;margin-bottom:20px;font-size:12px;">
    <div><span style="color:var(--text-dim)">Vessel</span> <strong>${p.vesselName||'—'}</strong></div>
    <div><span style="color:var(--text-dim)">IMO</span> <strong>${p.imo||'—'}</strong></div>
    <div><span style="color:var(--text-dim)">Flag</span> <strong>${p.flag||'—'}</strong></div>
    <div><span style="color:var(--text-dim)">Class</span> <strong>${p.classSociety||'—'}</strong></div>
    <div><span style="color:var(--text-dim)">Engine</span> <strong>${p.engineMaker||'—'} ${p.engineModel||''}</strong></div>
    <div><span style="color:var(--text-dim)">MCR</span> <strong>${p.mcr||'—'} kW @ ${p.ratedRpm||'—'} RPM</strong></div>
  </div>`;
}

// ── Auto-save form ──────────────────────────────────
function autoSaveForm(formId, storeKey) {
  const form = document.getElementById(formId);
  if (!form) return;
  // Restore
  const saved = EP.load(storeKey, {});
  Object.entries(saved).forEach(([name, val]) => {
    const el = form.elements[name];
    if (!el) return;
    if (el.type === 'radio') { const r = form.querySelector(`[name="${name}"][value="${val}"]`); if(r) r.checked=true; }
    else if (el.type === 'checkbox') el.checked = !!val;
    else el.value = val;
  });
  // Listen
  form.addEventListener('change', () => {
    const data = {};
    new FormData(form).forEach((v, k) => { data[k] = v; });
    // Also capture checkboxes that are unchecked (not in FormData)
    form.querySelectorAll('input[type=checkbox]').forEach(cb => { if (!cb.checked) data[cb.name] = false; });
    EP.save(storeKey, data);
  });
  form.addEventListener('input', () => form.dispatchEvent(new Event('change')));
}

// ── Number helpers ──────────────────────────────────
function n(val, dec = 2) {
  const v = parseFloat(val);
  return isNaN(v) ? '—' : v.toFixed(dec);
}
function pct(a, b, dec = 1) {
  const va = parseFloat(a), vb = parseFloat(b);
  if (!va || !vb) return '—';
  return (((va - vb) / vb) * 100).toFixed(dec) + '%';
}
function passFailBadge(pass, label) {
  return pass
    ? `<span class="badge badge-pass">✓ ${label||'PASS'}</span>`
    : `<span class="badge badge-fail">✗ ${label||'FAIL'}</span>`;
}
function resultBadge(val, limit, higher='fail') {
  if (val === null || val === undefined || val === '' || isNaN(parseFloat(val))) return '<span class="badge badge-na">—</span>';
  const v = parseFloat(val), l = parseFloat(limit);
  const pass = higher === 'fail' ? v <= l : v >= l;
  return passFailBadge(pass);
}

// ── Date/time helpers ───────────────────────────────
function nowISO() { return new Date().toISOString().slice(0,16); }
function fmtDatetime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' });
}

// ── Table data helpers ──────────────────────────────
function tableToArray(tableId) {
  const rows = [];
  const tbl = document.getElementById(tableId);
  if (!tbl) return rows;
  tbl.querySelectorAll('tbody tr').forEach(tr => {
    const row = {};
    tr.querySelectorAll('td').forEach((td, i) => {
      const inp = td.querySelector('input,select');
      const hdr = tbl.querySelectorAll('thead th')[i];
      const key = hdr ? (hdr.dataset.key || hdr.textContent.trim().toLowerCase().replace(/\s+/g,'_')) : `col${i}`;
      row[key] = inp ? inp.value : td.textContent.trim();
    });
    rows.push(row);
  });
  return rows;
}

// ── Excel export (SheetJS) ──────────────────────────
function exportExcel(sheets, filename) {
  if (typeof XLSX === 'undefined') { alert('SheetJS not loaded'); return; }
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ name, data }) => {
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0,31));
  });
  XLSX.writeFile(wb, filename);
}

// ── PDF export (jsPDF) ──────────────────────────────
function exportPDF(elementId, filename) {
  if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
    alert('PDF library not loaded. Please check internet connection.');
    return;
  }
  const el = document.getElementById(elementId);
  html2canvas(el, { scale: 2, useCORS: true }).then(canvas => {
    const { jsPDF } = jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    let pos = 0;
    const pageH = pdf.internal.pageSize.getHeight();
    pdf.addImage(canvas, 'PNG', 0, 0, w, h);
    let remaining = h - pageH;
    while (remaining > 0) {
      pos += pageH;
      pdf.addPage();
      pdf.addImage(canvas, 'PNG', 0, -pos, w, h);
      remaining -= pageH;
    }
    pdf.save(filename);
  });
}

// ── Print ───────────────────────────────────────────
function printSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const clone = el.cloneNode(true);
  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      body{font-family:Roboto,sans-serif;font-size:12px;color:#000;background:#fff;padding:20px}
      table{width:100%;border-collapse:collapse}th,td{padding:6px 8px;border:1px solid #ccc;font-size:11px}
      th{background:#e0f0f0;font-weight:600} .no-print{display:none}
    </style></head><body>${clone.innerHTML}</body></html>`);
  win.document.close();
  win.print();
}

// ── Toast ────────────────────────────────────────────
function toast(msg, type = 'info') {
  const colors = { info:'var(--teal-br)', pass:'var(--pass)', fail:'var(--fail)', warn:'var(--warn)' };
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;
    padding:10px 16px;border-radius:9px;font-size:13px;font-weight:500;
    background:var(--bg-card);border:1px solid ${colors[type]||'var(--border)'};
    color:${colors[type]||'var(--text)'};box-shadow:var(--shadow);
    animation:toastIn .25s ease;max-width:320px;`;
  el.textContent = msg;
  const style = document.createElement('style');
  style.textContent = `@keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`;
  document.head.appendChild(style);
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ── JSON Backup / Restore ───────────────────────────
function exportAllData() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('ep-')) keys.push(k);
  }
  const data = {};
  keys.forEach(k => { try { data[k] = JSON.parse(localStorage.getItem(k)); } catch { data[k] = localStorage.getItem(k); } });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const proj = getProject();
  a.href = url; a.download = `EnginePulse_${proj.vesselName||'backup'}_${new Date().toISOString().slice(0,10)}.json`;
  a.click(); URL.revokeObjectURL(url);
  toast('Data exported successfully', 'pass');
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (typeof data !== 'object') throw new Error('Invalid format');
      Object.entries(data).forEach(([k, v]) => {
        if (k.startsWith('ep-')) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
      });
      toast('Data imported — reloading…', 'pass');
      setTimeout(() => location.reload(), 1000);
    } catch { toast('Import failed: invalid JSON file', 'fail'); }
  };
  reader.readAsText(file);
}

// ── Module status dots for dashboard ────────────────
function statusDot(status) {
  const map = {
    pending: ['badge-pending','Pending'],
    wip:     ['badge-warn','In Progress'],
    done:    ['badge-pass','Complete'],
    signed:  ['badge-done','Signed'],
  };
  const [cls, label] = map[status] || map.pending;
  return `<span class="badge ${cls}">${label}</span>`;
}
