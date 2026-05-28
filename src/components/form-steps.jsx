const { useState, useRef, useEffect } = React;

const SERVICES = [
  {
    id: 'uml-db',
    label: 'Diagram UML & Desain Database',
    desc: 'UML, ERD, PDM, plus pilihan jenis database',
    icon: '◫',
  },
  {
    id: 'landing',
    label: 'Landing Page',
    desc: 'Website landing page profesional, responsive',
    icon: '◧',
  },
  {
    id: 'revision',
    label: 'Revisi / Bug Fix',
    desc: 'Memperbaiki atau meningkatkan aplikasi yang sudah ada',
    icon: '↻',
  },
  {
    id: 'build',
    label: 'Build dari 0',
    desc: 'Membangun aplikasi full-stack dari nol — bisa dijelaskan dengan bahasa sederhana',
    icon: '⊞',
    highlight: true,
  },
];

const CATEGORIES = [
  { key: 'master',    label: 'Master Data', desc: 'Tabel data utama (pengguna, produk, kategori)', namePh: 'Contoh: Produk',          hasOps: true },
  { key: 'transaksi', label: 'Transaksi',   desc: 'Modul pencatatan transaksi & alurnya',          namePh: 'Contoh: Penjualan',        hasOps: true },
  { key: 'laporan',   label: 'Laporan',     desc: 'Keluaran laporan (PDF, Excel, cetak)',          namePh: 'Contoh: Laporan harian',   hasOps: true },
  { key: 'dashboard', label: 'Dashboard',   desc: 'Widget statis: sum, chart, log activity',       namePh: 'Contoh: Dashboard Admin',  hasOps: false /* pakai widgets */ },
];

// ============================================
// ATTRIBUTE DATA TYPES — derived dari CONFIG (admin-managed)
// ============================================
const ATTR_TYPES = window.KA.getActiveDataTypes();

// ============================================
// TECH GROUPS — dibaca dari KA.loadConfig().techStack
// Admin bisa edit/tambah/nonaktifkan via halaman Manage Tech.
// ============================================
const TECH_GROUP_META = [
  { key: 'bahasa', label: 'Bahasa Pemrograman', hint: 'Pilih satu atau lebih', autoId: 'bahasa_dev' },
  { key: 'fe',     label: 'Frontend',           hint: 'Framework / library untuk tampilan', autoId: 'fe_dev' },
  { key: 'be',     label: 'Backend',            hint: 'Framework server-side',              autoId: 'be_dev' },
  { key: 'db',     label: 'Database',           hint: 'Tempat data disimpan',               autoId: 'db_dev' },
];

function buildTechGroups() {
  const stack = (window.KA && window.KA.loadConfig) ? window.KA.loadConfig().techStack : [];
  return TECH_GROUP_META.map(meta => {
    const opts = stack
      .filter(t => t.kind === meta.key && t.active)
      .map(t => ({ id: t.id, label: t.name }));
    // Always append "Saran kami" auto option
    opts.push({ id: meta.autoId, label: 'Saran kami', auto: true });
    return { ...meta, options: opts };
  });
}

// Live getter so admin changes pick up on next render.
// Wrap in try/catch — Babel may re-execute this script in some contexts (HMR /
// double-mount), and the property defined here is already `configurable: true`
// so redefining should be safe; but guard against any environment that locks it.
try { delete window.TECH_GROUPS; } catch (e) { /* ignore */ }
try { delete window.TECH_FLAT;   } catch (e) { /* ignore */ }
try {
  Object.defineProperty(window, 'TECH_GROUPS', { get: buildTechGroups, configurable: true });
  Object.defineProperty(window, 'TECH_FLAT', {
    get: () => buildTechGroups().flatMap(g => g.options.map(o => ({ ...o, group: g.key, groupLabel: g.label }))),
    configurable: true,
  });
} catch (e) {
  // Fallback: plain assignment (won't be live-reactive, but won't crash)
  window.TECH_GROUPS = buildTechGroups();
  window.TECH_FLAT   = window.TECH_GROUPS.flatMap(g => g.options.map(o => ({ ...o, group: g.key, groupLabel: g.label })));
}
const TECH_GROUPS = window.TECH_GROUPS;
const TECH_FLAT   = window.TECH_FLAT;

// Reduced color palette options (only 3 + custom note fallback)
const COLOR_PALETTES = [
  { id: 'corp', label: 'Corporate', colors: ['#1E3A8A', '#3B82F6', '#DBEAFE'] },
  { id: 'mono', label: 'Mono Pro', colors: ['#0A0A0A', '#525252', '#E5E5E5'] },
  { id: 'fresh', label: 'Fresh', colors: ['#15803D', '#22C55E', '#DCFCE7'] },
];

// ============================================
// STEP 1 — DATA DIRI
// ============================================
function StepIdentity({ form, setForm, errors }) {
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="step-content" data-screen-label="01 Data Diri">
      <div className="step-header">
        <div className="step-eyebrow">Step 01 / Data Diri</div>
        <h1 className="step-title">Data Diri Anda</h1>
        <p className="step-subtitle">Data Anda hanya digunakan untuk keperluan koordinasi proyek ini.</p>
        <div className="negotiation-badge">
          <span className="negotiation-badge-icon" aria-hidden>🤝</span>
          <span>Kami siap bernegosiasi dengan Anda</span>
        </div>
      </div>

      <a
        className="quick-wa-banner"
        href={`https://wa.me/6281234567890?text=${encodeURIComponent('Halo Admin Kerjain Aja! 👋 Saya ingin konsultasi mengenai pembuatan aplikasi.')}`}
        target="_blank"
        rel="noopener"
      >
        <div className="quick-wa-icon" aria-hidden>💬</div>
        <div className="quick-wa-body">
          <div className="quick-wa-title">Tidak ingin mengisi formulir?</div>
          <div className="quick-wa-sub">Hubungi admin langsung via WhatsApp untuk konsultasi gratis.</div>
        </div>
        <div className="quick-wa-arrow" aria-hidden>→</div>
      </a>

      <div className="card">
        <div className="field">
          <label className="label">Nama Lengkap</label>
          <input
            className={'input' + (errors.name ? ' error' : '')}
            placeholder="Contoh: Andi Pratama"
            value={form.name}
            onChange={e => upd('name', e.target.value)}
          />
          {errors.name && <div className="error-msg">Nama wajib diisi</div>}
        </div>
        <div className="field">
          <label className="label">Nomor WhatsApp <span className="label-hint">— untuk koordinasi proyek</span></label>
          <div className="input-wrap">
            <div className="input-prefix">+62</div>
            <input
              className={'input has-prefix' + (errors.wa ? ' error' : '')}
              placeholder="81234567890"
              value={form.wa}
              onChange={e => upd('wa', e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
            />
          </div>
          {errors.wa && <div className="error-msg">Nomor WA tidak valid (min. 9 digit)</div>}
          {!errors.wa && form.wa && <div className="helper">+62{form.wa}</div>}
        </div>
        <div className="field">
          <label className="label">Email <span className="label-hint">— opsional, untuk invoice</span></label>
          <input
            className="input"
            placeholder="nama@email.com"
            value={form.email}
            onChange={e => upd('email', e.target.value)}
            type="email"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// STEP 2 — JENIS JASA
// ============================================
function StepService({ form, setForm, errors }) {
  const toggle = (id) => {
    setForm(f => ({
      ...f,
      services: f.services.includes(id) ? f.services.filter(x => x !== id) : [...f.services, id],
    }));
  };

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const updSimpleBuild = (patch) => setForm(f => ({
    ...f,
    simpleBuild: { ...(f.simpleBuild || {}), ...patch },
  }));
  const updExtra = (svcId, patch) => setForm(f => ({
    ...f, extras: { ...f.extras, [svcId]: { ...(f.extras?.[svcId] || {}), ...patch } }
  }));

  return (
    <div className="step-content" data-screen-label="02 Jenis Jasa">
      <div className="step-header">
        <div className="step-eyebrow">Step 02 / Jenis Jasa</div>
        <h1 className="step-title">Layanan apa yang Anda butuhkan{form.name ? ', ' + form.name.split(' ')[0] : ''}?</h1>
        <p className="step-subtitle">Anda dapat memilih lebih dari satu. Jika memilih "Build dari 0", akan ada tahapan untuk mengisi cakupannya.</p>
      </div>

      <div className="card">
        <div className="service-grid">
          {SERVICES.map(s => {
            const checked = form.services.includes(s.id);
            return (
              <div
                key={s.id}
                className={'service-card' + (checked ? ' selected' : '') + (s.highlight ? ' highlight' : '')}
                onClick={() => toggle(s.id)}
              >
                <div className="service-check">
                  <div className="checkbox-box">{checked && '✓'}</div>
                </div>
                <div className="service-icon" aria-hidden>{s.icon}</div>
                <div className="service-body">
                  <div className="service-title">{s.label}</div>
                  <div className="service-desc">{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {errors.services && (
          <div className="error-msg" style={{ marginTop: 12 }}>⚠ Silakan pilih minimal 1 jenis jasa</div>
        )}
      </div>

      {/* Build dari 0 — pilih mode pengisian */}
      {form.services.includes('build') && (
        <div className="card service-detail-card">
          <div className="detail-header">
            <div className="detail-icon">⊞</div>
            <div>
              <div className="detail-title">Build dari 0 — Pilih Mode Pengisian</div>
              <div className="detail-sub">Pilih cara yang paling nyaman buat menjelaskan kebutuhan aplikasi Anda</div>
            </div>
          </div>

          <div className="build-mode-grid">
            <div
              className={'build-mode-card' + (form.buildMode === 'simple' ? ' selected' : '')}
              onClick={() => upd('buildMode', 'simple')}
            >
              <div className="build-mode-badge">Direkomendasikan</div>
              <div className="build-mode-icon" aria-hidden>💬</div>
              <div className="build-mode-title">Saya baru punya ide</div>
              <div className="build-mode-desc">Ceritakan saja dengan kata-kata sendiri. Tim kami yang akan merumuskan detail teknisnya.</div>
              <ul className="build-mode-list">
                <li>Tanpa istilah teknis</li>
                <li>Cepat — cukup 1 paragraf</li>
                <li>Cocok untuk pemula</li>
              </ul>
            </div>

            <div
              className={'build-mode-card' + (form.buildMode === 'technical' ? ' selected' : '')}
              onClick={() => upd('buildMode', 'technical')}
            >
              <div className="build-mode-icon" aria-hidden>⚙</div>
              <div className="build-mode-title">Saya paham teknis</div>
              <div className="build-mode-desc">Isi sendiri detail teknis: master data, transaksi, dashboard, framework, dan lainnya.</div>
              <ul className="build-mode-list">
                <li>Kontrol penuh atas cakupan</li>
                <li>Pilih bahasa & framework</li>
                <li>Untuk yang sudah paham IT</li>
              </ul>
            </div>
          </div>

          {errors.buildMode && (
            <div className="error-msg" style={{ marginTop: 12 }}>⚠ Silakan pilih salah satu mode pengisian</div>
          )}

          {form.buildMode === 'simple' && (
            <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
              <div className="field">
                <label className="label">Ceritakan Aplikasi yang Anda Inginkan</label>
                <textarea
                  className={'textarea' + (errors.simpleBuildDescription ? ' error' : '')}
                  placeholder="Contoh: Saya ingin membuat aplikasi untuk toko roti milik saya. Ingin bisa mencatat pesanan pelanggan, stok bahan baku, dan laporan penjualan harian. Karyawan dapat login untuk input pesanan, dan saya sebagai pemilik dapat melihat laporan."
                  value={form.simpleBuild?.description || ''}
                  onChange={e => updSimpleBuild({ description: e.target.value })}
                  rows={6}
                />
                {errors.simpleBuildDescription && <div className="error-msg">Silakan ceritakan singkat aplikasi yang Anda inginkan</div>}
                <div className="helper">Jelaskan dengan bahasa sehari-hari — tidak perlu istilah teknis.</div>
              </div>

              <div className="field">
                <label className="label">Tujuan Utama Aplikasi <span className="label-hint">— opsional</span></label>
                <input
                  className="input"
                  placeholder="Contoh: Mempermudah pencatatan pesanan harian"
                  value={form.simpleBuild?.goal || ''}
                  onChange={e => updSimpleBuild({ goal: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="label">Contoh Aplikasi Sejenis <span className="label-hint">— opsional</span></label>
                <input
                  className="input"
                  placeholder="Contoh: Mirip seperti Tokopedia, atau aplikasi kasir milik kompetitor"
                  value={form.simpleBuild?.reference || ''}
                  onChange={e => updSimpleBuild({ reference: e.target.value })}
                />
              </div>
            </div>
          )}

          {form.buildMode === 'technical' && (
            <div className="build-mode-followup">
              <div className="build-mode-followup-icon" aria-hidden>→</div>
              <div>
                <strong>Lanjut ke tahapan teknis.</strong>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  Pada tahapan berikutnya, Anda akan mengisi cakupan (master/transaksi/laporan/dashboard) dan tech stack.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* UML & Desain Database — pilih jenis (counter) + catatan */}
      {form.services.includes('uml-db') && <UmlDbDetail form={form} updExtra={updExtra} />}

      {/* Revisi / Bug Fix — pilih jenis (checkbox) + catatan */}
      {form.services.includes('revision') && <RevisionDetail form={form} updExtra={updExtra} />}

      {/* Landing Page — catatan saja */}
      {form.services.includes('landing') && (
        <div className="card service-detail-card">
          <div className="detail-header">
            <div className="detail-icon">◧</div>
            <div>
              <div className="detail-title">Landing Page</div>
              <div className="detail-sub">Catatan tambahan, opsional</div>
            </div>
          </div>
          <textarea
            className="textarea"
            placeholder="Produk/jasa apa yang dijual? Warna brand seperti apa? Apakah ada referensi landing page yang disukai?"
            value={form.extras?.landing?.notes || ''}
            onChange={e => updExtra('landing', { notes: e.target.value })}
            rows={4}
          />
        </div>
      )}
    </div>
  );
}

// ----- UML & DB detail card -----
function UmlDbDetail({ form, updExtra }) {
  const extras = form.extras?.['uml-db'] || {};
  const items = extras.items || {};

  const updItemCount = (typeId, count) => {
    const next = { ...items };
    const c = Math.max(0, Math.min(20, count));
    if (c === 0) delete next[typeId];
    else next[typeId] = c;
    updExtra('uml-db', { items: next });
  };

  const config = window.KA.loadConfig();
  const groups = [
    { kind: 'uml',       label: 'Diagram UML',     desc: 'Diagram yang menggambarkan struktur & alur sistem' },
    { kind: 'desain-db', label: 'Desain Database', desc: 'ERD/PDM/CDM untuk menggambarkan struktur data' },
    { kind: 'jenis-db',  label: 'Jenis Database',  desc: 'DBMS yang ingin digunakan' },
  ];

  return (
    <div className="card service-detail-card">
      <div className="detail-header">
        <div className="detail-icon">◫</div>
        <div>
          <div className="detail-title">Diagram UML & Desain Database</div>
          <div className="detail-sub">Pilih jenis yang dibutuhkan & jumlahnya — semua opsional</div>
        </div>
      </div>

      {groups.map(g => {
        const types = config.umlTypes.filter(t => t.active && t.kind === g.kind);
        if (types.length === 0) return null;
        const totalCount = types.reduce((s, t) => s + (items[t.id] || 0), 0);
        return (
          <div key={g.kind} className="umldb-group">
            <div className="umldb-group-head">
              <div>
                <div className="umldb-group-title">{g.label}</div>
                <div className="umldb-group-desc">{g.desc}</div>
              </div>
              {totalCount > 0 && <span className="umldb-group-badge">{totalCount} dipilih</span>}
            </div>
            <div className="umldb-type-grid">
              {types.map(t => {
                const c = items[t.id] || 0;
                return (
                  <div key={t.id} className={'umldb-type-row' + (c > 0 ? ' active' : '')}>
                    <div className="umldb-type-name">{t.name}</div>
                    <div className="counter compact">
                      <button className="counter-btn" onClick={() => updItemCount(t.id, c - 1)} disabled={c <= 0} aria-label="kurangi" type="button">−</button>
                      <div className="counter-val">{c}</div>
                      <button className="counter-btn" onClick={() => updItemCount(t.id, c + 1)} aria-label="tambah" type="button">+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="field" style={{ marginTop: 18 }}>
        <label className="label">Catatan Tambahan <span className="label-hint">— opsional</span></label>
        <textarea
          className="textarea"
          placeholder="Aplikasi seperti apa? Apakah ada referensi atau spesifikasi tambahan?"
          value={extras.notes || ''}
          onChange={e => updExtra('uml-db', { notes: e.target.value })}
          rows={4}
        />
      </div>
    </div>
  );
}

// ----- Revisi detail card -----
function RevisionDetail({ form, updExtra }) {
  const extras = form.extras?.revision || {};
  const selectedTypes = extras.types || [];
  const config = window.KA.loadConfig();
  const types = config.revisionTypes.filter(t => t.active);

  const toggleType = (typeId) => {
    const next = selectedTypes.includes(typeId)
      ? selectedTypes.filter(x => x !== typeId)
      : [...selectedTypes, typeId];
    updExtra('revision', { types: next });
  };

  return (
    <div className="card service-detail-card">
      <div className="detail-header">
        <div className="detail-icon">↻</div>
        <div>
          <div className="detail-title">Revisi / Bug Fix</div>
          <div className="detail-sub">Pilih jenis revisi yang dibutuhkan (bisa lebih dari satu)</div>
        </div>
      </div>

      {types.length > 0 && (
        <div className="field">
          <label className="label">Jenis Revisi / Bug</label>
          <div className="checkbox-grid">
            {types.map(t => {
              const ck = selectedTypes.includes(t.id);
              return (
                <div
                  key={t.id}
                  className={'checkbox-row' + (ck ? ' checked' : '')}
                  onClick={() => toggleType(t.id)}
                >
                  <div className="checkbox-box">{ck && '✓'}</div>
                  <span>{t.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="field" style={{ marginBottom: 0 }}>
        <label className="label">Catatan Tambahan <span className="label-hint">— opsional</span></label>
        <textarea
          className="textarea"
          placeholder="Aplikasi mana yang ingin direvisi? Apa bug-nya? Fitur baru apa yang ingin ditambahkan?"
          value={extras.notes || ''}
          onChange={e => updExtra('revision', { notes: e.target.value })}
          rows={4}
        />
      </div>
    </div>
  );
}

// ============================================
// STEP 5 — CATATAN AKHIR
// ============================================
function StepTimeline({ form, setForm, errors }) {
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Palet hanya relevan kalau ada jasa visual (build / landing). UML & revisi tidak butuh palet.
  const needsPalette = form.services.some(s => s === 'build' || s === 'landing');

  return (
    <div className="step-content" data-screen-label="05 Catatan">
      <div className="step-header">
        <div className="step-eyebrow">Step / Catatan</div>
        <h1 className="step-title">Catatan & Preferensi</h1>
        <p className="step-subtitle">Beberapa preferensi tambahan untuk memperjelas pesanan Anda. Tenggat waktu pengerjaan akan didiskusikan bersama via WhatsApp.</p>
      </div>

      <div className="card">
        {needsPalette && (
          <div className="field">
            <label className="label">Warna / Mood Desain <span className="label-hint">— opsional</span></label>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, marginTop: -2 }}>
              Pilih palet siap pakai atau tuliskan catatan warna sendiri.
            </p>
            <div className="palette-row">
              {COLOR_PALETTES.map(p => (
                <div
                  key={p.id}
                  className={'palette-card' + (form.palette === p.id ? ' selected' : '')}
                  onClick={() => upd('palette', form.palette === p.id ? '' : p.id)}
                  title={p.label}
                >
                  <div className="palette-card-colors">
                    {p.colors.map((c, i) => (
                      <div key={i} className="palette-color" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="palette-label">{p.label}</div>
                </div>
              ))}
            </div>
            <input
              className="input"
              style={{ marginTop: 10 }}
              placeholder="Atau tuliskan sendiri: 'biru navy + putih', '#FF6B35', dll"
              value={form.customColor || ''}
              onChange={e => upd('customColor', e.target.value)}
            />
          </div>
        )}

        <div className="field" style={needsPalette ? {} : { marginBottom: 0 }}>
          <label className="label">Catatan Tambahan <span className="label-hint">— opsional</span></label>
          <textarea
            className="textarea"
            placeholder="Apakah ada referensi aplikasi serupa? Memiliki struktur database existing? Ada preferensi hosting? Tuliskan di sini."
            value={form.notes}
            onChange={e => upd('notes', e.target.value)}
            rows={5}
            maxLength={1000}
          />
          <div className="helper">{form.notes.length} / 1000 karakter</div>
        </div>
      </div>
    </div>
  );
}

// Export to window
Object.assign(window, {
  StepIdentity, StepService, StepTimeline,
  SERVICES, CATEGORIES,
  ATTR_TYPES, COLOR_PALETTES,
  // TECH_GROUPS & TECH_FLAT exposed as live getters on window (above)
});
