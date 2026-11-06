/* ═══════════════════════════════════════════════════
   EnginePulse — Common Utilities
═══════════════════════════════════════════════════ */

'use strict';

// ── Theme ──────────────────────────────────────────
// The saved choice wins; otherwise follow the device setting.
// A small script in each page <head> applies it before first paint.
const THEME_KEY = 'enginepulse-theme';

function savedTheme() {
  try { const t = localStorage.getItem(THEME_KEY); return (t === 'light' || t === 'dark') ? t : null; } catch { return null; }
}
function systemTheme() { return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
function currentTheme() { return document.documentElement.getAttribute('data-theme') || savedTheme() || systemTheme(); }

function applyTheme(t, persist) {
  document.documentElement.setAttribute('data-theme', t);
  if (persist) { try { localStorage.setItem(THEME_KEY, t); } catch {} }
  const btn = document.getElementById('btn-theme');
  if (btn) {
    btn.innerHTML = t === 'dark' ? epIcon('sun') : epIcon('moon');
    btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
  epChartTheme();
}

function initTheme() {
  applyTheme(currentTheme(), false);
  document.getElementById('btn-theme')?.addEventListener('click', () => {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!savedTheme()) applyTheme(systemTheme(), false);
  });
}

// ── Brand colour tokens (for charts and canvas drawing) ──
function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

// Chart.js defaults follow the current theme; existing charts are refreshed on toggle.
function epChartTheme() {
  if (typeof Chart === 'undefined') return;
  const muted = cssVar('--muted') || '#4B5263';
  const grid = (currentTheme() === 'dark') ? 'rgba(255,255,255,0.08)' : 'rgba(10,11,18,0.08)';
  Chart.defaults.color = muted;
  Chart.defaults.borderColor = grid;
  Chart.defaults.font.family = "'Geist', system-ui, sans-serif";
  Chart.defaults.font.size = 11;
  Object.values(Chart.instances || {}).forEach(ch => {
    Object.values(ch.options.scales || {}).forEach(sc => {
      if (sc.grid) sc.grid.color = grid;
      if (sc.ticks) sc.ticks.color = muted;
      if (sc.title) sc.title.color = muted;
    });
    if (ch.options.plugins?.legend?.labels) ch.options.plugins.legend.labels.color = muted;
    ch.update('none');
  });
}

// ── Line icons (replace emoji) ─────────────────────
const EP_ICONS = {
  save:'<path d="M5 3h11l3 3v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M8 3v5h7V3M8 21v-7h8v7"/>',
  sheet:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16M10 3v18"/>',
  printer:'<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
  pen:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  file:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  clipboard:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2.5h6V4M9 10h6M9 14h6M9 18h4"/>',
  trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  alert:'<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
  wrench:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8V21h3.2l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.8-2.8z"/>',
  zap:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  siren:'<path d="M7 18v-6a5 5 0 0 1 10 0v6"/><path d="M5 18h14v3H5zM12 2v2M4.2 5.2l1.4 1.4M19.8 5.2l-1.4 1.4"/>',
  plug:'<path d="M9 2v6M15 2v6M6 8h12v3a6 6 0 0 1-12 0zM12 17v5"/>',
  ship:'<path d="M3 17l2 4h14l2-4-9-3z"/><path d="M6 15V9h12v6M12 9V4M9 6h6"/>',
  timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
  trend:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  book:'<path d="M4 4h6a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h7z"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  cog:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  nut:'<path d="M12 2l8.7 5v10L12 22l-8.7-5V7z"/><circle cx="12" cy="12" r="3.5"/>',
  hammer:'<path d="M14 6l4 4M3 21l9-9M12 4l6 6-3 3-6-6z"/>',
  crane:'<path d="M4 21V5l10-2v4M4 7h16M18 7v6M16 13h4v3h-4zM2 21h8"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  close:'<path d="M6 6l12 12M18 6 6 18"/>',
};
function epIcon(name) {
  const d = EP_ICONS[name]; if (!d) return '';
  return `<span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${d}</svg></span>`;
}
function hydrateIcons(root) {
  (root || document).querySelectorAll('i[data-ic]').forEach(el => { el.outerHTML = epIcon(el.dataset.ic); });
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
  const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const vesselName = proj.vesselName ? `<span class="nav-vessel" title="${esc(proj.vesselName)}">${esc(proj.vesselName)}</span>` : '';
  const links = NAV_LINKS.map(l => `<a class="nav-link${l.key===activeKey?' active':''}" href="${l.href}"${l.key===activeKey?' aria-current="page"':''}>${l.label}</a>`).join('');
  el.innerHTML = `
    <div class="nav-bar">
      <a class="nav-logo" href="index.html">
        <img src="favicon.svg" alt="SS emblem" width="36" height="36">
        <span>
          <span class="nav-logo-name">EnginePulse</span>
          <span class="nav-logo-sub">Engine Test Suite</span>
        </span>
      </a>
      ${vesselName}
      <nav class="nav-links" aria-label="Modules">${links}</nav>
      <div class="nav-right">
        <button class="btn-icon" id="btn-theme" type="button" title="Toggle theme"></button>
        <button class="btn-icon" id="btn-menu" type="button" aria-label="Open menu" aria-expanded="false">${epIcon('menu')}</button>
      </div>
    </div>
    <nav class="nav-menu" id="nav-menu" aria-label="Modules">${links}</nav>
  `;
  const menuBtn = document.getElementById('btn-menu');
  const menu = document.getElementById('nav-menu');
  menuBtn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuBtn.innerHTML = epIcon(open ? 'close' : 'menu');
  });
  initTheme();
  buildCredit();
  hydrateIcons();
}

// ── sujikumar.com credit badge (one place for every page) ──
function buildCredit() {
  if (document.querySelector('.ss-credit')) return;
  const div = document.createElement('div');
  div.className = 'ss-credit';
  div.innerHTML = `<a href="https://sujikumar.com/" rel="author" title="Built by Suji Kumar C — Digital Maritime Engineer"><img src="favicon.svg" alt="" width="20" height="20"><span>Built by <b>Suji Kumar C</b> · sujikumar.com</span></a>`;
  document.body.appendChild(div);
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
    <style>
      body{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;font-size:12px;color:#000;background:#fff;padding:20px}
      table{width:100%;border-collapse:collapse}th,td{padding:6px 8px;border:1px solid #ccc;font-size:11px}
      th{background:#F3F4F8;font-weight:600} .no-print{display:none}
    </style></head><body>${clone.innerHTML}</body></html>`);
  win.document.close();
  win.print();
}

// ── Toast ────────────────────────────────────────────
function toast(msg, type = 'info') {
  const colors = { info:'var(--action)', pass:'var(--pass)', fail:'var(--fail)', warn:'var(--warn)' };
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;
    padding:10px 16px;border-radius:14px;font-size:13px;font-weight:500;
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
