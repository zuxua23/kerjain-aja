/* global React, CATEGORIES, OPS_CRUD, OPS_LAPORAN, TECH_GROUPS, TECH_FLAT, COLOR_PALETTES, SERVICES, ATTR_TYPES, CHART_TYPES */
const { useState: usePS, useRef: useRefPS, useEffect: useEffectPS } = React;

// ============================================
// STEP — RINGKASAN
// ============================================
function StepSummary({ form }) {
  const paletteLabel = form.palette ? COLOR_PALETTES.find(p => p.id === form.palette)?.label : null;

  return (
    <div className="step-content" data-screen-label="06 Ringkasan">
      <div className="step-header">
        <div className="step-eyebrow">Step / Ringkasan</div>
        <h1 className="step-title">Periksa Pesanan Anda</h1>
        <p className="step-subtitle">Pastikan sudah benar sebelum melanjutkan. Harga & DP akan didiskusikan langsung via WhatsApp setelah pesanan masuk.</p>
      </div>

      <div className="summary-card">
        <div className="summary-section">
          <div className="summary-section-title">Pelanggan</div>
          <SumRow label="Nama" val={form.name || '—'} />
          <SumRow label="WhatsApp" val={'+62' + (form.wa || '—')} />
          {form.email && <SumRow label="Email" val={form.email} />}
        </div>

        <div className="summary-section">
          <div className="summary-section-title">Jasa Dipilih</div>
          {(form.services || []).map(sid => {
            const svc = SERVICES.find(s => s.id === sid);
            if (!svc) return null;
            return <SumRow key={sid} label={svc.label} val="✓" />;
          })}
          {form.services.includes('uml-db') && form.extras?.['uml-db'] && (
            <UmlDbSummary extras={form.extras['uml-db']} />
          )}
          {form.services.includes('revision') && form.extras?.revision && (
            <RevisionSummary extras={form.extras.revision} />
          )}
          {['uml-db', 'landing', 'revision'].map(sid => {
            const notes = form.extras?.[sid]?.notes;
            if (!form.services.includes(sid) || !notes) return null;
            const svc = SERVICES.find(s => s.id === sid);
            return (
              <div key={sid} className="sum-paragraph">
                <div className="sum-paragraph-label">{svc.label} — Catatan</div>
                <pre>{notes}</pre>
              </div>
            );
          })}
        </div>

        {form.services.includes('build') && form.buildMode === 'simple' && (form.simpleBuild?.description || form.simpleBuild?.goal || form.simpleBuild?.reference) && (
          <div className="summary-section">
            <div className="summary-section-title">Deskripsi Aplikasi yang Diinginkan</div>
            {form.simpleBuild.description && (
              <div className="sum-paragraph">
                <div className="sum-paragraph-label">Cerita</div>
                <pre>{form.simpleBuild.description}</pre>
              </div>
            )}
            {form.simpleBuild.goal && <SumRow label="Tujuan utama" val={form.simpleBuild.goal} />}
            {form.simpleBuild.reference && <SumRow label="Aplikasi sejenis" val={form.simpleBuild.reference} />}
          </div>
        )}

        {form.services.includes('build') && form.buildMode === 'technical' && (
          <div className="summary-section">
            <div className="summary-section-title">Cakupan Build</div>
            {form.scopeBackground && (
              <div className="sum-paragraph">
                <div className="sum-paragraph-label">Latar belakang</div>
                <pre>{form.scopeBackground}</pre>
              </div>
            )}
            {CATEGORIES.map(cat => {
              const count = form.counts[cat.key] || 0;
              if (!count) return null;
              const items = form.items[cat.key] || [];
              return (
                <div key={cat.key} style={{ marginBottom: 14 }}>
                  <SumRow label={cat.label} val={`${count} item`} bold />
                  {items.map((it, i) => (
                    <ItemSummary key={i} idx={i} cat={cat} item={it} />
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {form.services.includes('build') && form.buildMode === 'technical' && form.tech.length > 0 && (
          <div className="summary-section">
            <div className="summary-section-title">Tech Stack</div>
            {TECH_GROUPS.map(g => {
              const selected = form.tech.filter(id => g.options.some(o => o.id === id));
              const labels = selected.map(id => g.options.find(o => o.id === id)?.label).filter(Boolean);
              return (
                <SumRow
                  key={g.key}
                  label={g.label}
                  val={labels.length > 0 ? labels.join(', ') : <span style={{ color: 'var(--text-faint)' }}>—</span>}
                />
              );
            })}
          </div>
        )}

        {(form.palette || form.customColor || form.notes) && (
          <div className="summary-section">
            <div className="summary-section-title">Preferensi & Catatan</div>
            {paletteLabel && <SumRow label="Palet" val={paletteLabel} />}
            {form.customColor && <SumRow label="Catatan warna" val={form.customColor} />}
            {form.notes && (
              <div className="sum-paragraph">
                <div className="sum-paragraph-label">Catatan</div>
                <pre>{form.notes}</pre>
              </div>
            )}
          </div>
        )}

        <div className="summary-info-note">
          <div className="summary-info-icon">💬</div>
          <div>
            <strong>Harga, DP, & metode pembayaran akan didiskusikan via WhatsApp.</strong>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              Setelah menekan "Kirim Pesanan", silakan hubungi admin via WhatsApp untuk mendapatkan penawaran harga & instruksi selanjutnya.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SumRow({ label, val, sub, bold }) {
  return (
    <div className="summary-row" style={sub ? { paddingLeft: 14, fontSize: 12, color: 'var(--text-muted)' } : {}}>
      <span className="label" style={{ ...(sub ? { fontWeight: 400 } : {}), ...(bold ? { color: 'var(--text)', fontWeight: 700 } : {}) }}>{label}</span>
      <span className="val" style={sub ? { fontWeight: 500 } : {}}>{val}</span>
    </div>
  );
}

function UmlDbSummary({ extras }) {
  const items = extras.items || {};
  const config = window.KA.loadConfig();
  const groups = [
    { kind: 'uml',       label: 'Diagram UML' },
    { kind: 'desain-db', label: 'Desain Database' },
    { kind: 'jenis-db',  label: 'Jenis Database' },
  ];
  const rows = groups.map(g => {
    const list = config.umlTypes
      .filter(t => t.kind === g.kind && items[t.id])
      .map(t => `${t.name} × ${items[t.id]}`);
    return list.length > 0 ? { label: g.label, val: list.join(', ') } : null;
  }).filter(Boolean);
  if (rows.length === 0) return null;
  return (
    <div className="sum-block">
      {rows.map((r, i) => <SumRow key={i} label={r.label} val={r.val} />)}
    </div>
  );
}

function RevisionSummary({ extras }) {
  const config = window.KA.loadConfig();
  const selected = extras.types || [];
  if (selected.length === 0) return null;
  const labels = selected
    .map(id => config.revisionTypes.find(t => t.id === id)?.name)
    .filter(Boolean);
  if (labels.length === 0) return null;
  return (
    <div className="sum-block">
      <SumRow label="Jenis Revisi" val={labels.join(', ')} />
    </div>
  );
}

function ItemSummary({ idx, cat, item }) {
  const typeLabel = (t) => ATTR_TYPES.find(x => x.id === t)?.label || 'Text';
  const opsCatalog = cat.hasOps ? window.KA.getOpsForCategory(cat.key) : [];
  const opsList = opsCatalog.filter(o => item.ops?.[o.id]).map(o => o.label);

  return (
    <div className="sum-item">
      <div className="sum-item-name">
        ↳ <strong>{item.name || <span style={{ color: 'var(--text-faint)' }}>{`(belum diisi #${idx + 1})`}</span>}</strong>
      </div>
      {cat.key !== 'dashboard' && (
        item.decideAttrs ? (
          <div className="sum-item-detail">· atribut diserahkan kepada kami</div>
        ) : item.attrs.length > 0 && (
          <div className="sum-item-detail">· atribut: {item.attrs.map(a => `${a.name} (${typeLabel(a.type)})`).join(', ')}</div>
        )
      )}
      {opsList.length > 0 && (
        <div className="sum-item-detail">· operasi: {opsList.join(', ')}</div>
      )}
      {cat.key === 'dashboard' && item.widgets && (
        <>
          {item.widgets.sums.length > 0 && (
            <div className="sum-item-detail">· {item.widgets.sums.length} sum: {item.widgets.sums.map(s => s.name || '(tanpa nama)').join(', ')}</div>
          )}
          {item.widgets.charts.length > 0 && (
            <div className="sum-item-detail">· {item.widgets.charts.length} chart: {item.widgets.charts.map(c => `${c.name || '(tanpa nama)'} [${c.type}]`).join(', ')}</div>
          )}
          {item.widgets.logs.length > 0 && (
            <div className="sum-item-detail">· {item.widgets.logs.length} log: {item.widgets.logs.map(l => l.name || '(tanpa nama)').join(', ')}</div>
          )}
        </>
      )}
      {item.notes && <div className="sum-item-detail italic">· catatan: "{item.notes}"</div>}
    </div>
  );
}

// ============================================
// STEP — KONFIRMASI METODE (no amounts)
// ============================================
const PAYMENT_METHODS = [
  { id: 'bca', name: 'BCA Transfer', logo: 'BCA', detail: '8290-456-789 · a.n. Kerjain Aja' },
  { id: 'mandiri', name: 'Mandiri Transfer', logo: 'MNDR', detail: '1410-0098-7654 · a.n. Kerjain Aja' },
  { id: 'dana', name: 'DANA', logo: 'DANA', detail: '0812-3456-7890' },
  { id: 'gopay', name: 'GoPay', logo: 'GO', detail: '0812-3456-7890' },
  { id: 'qris', name: 'QRIS', logo: 'QR', detail: 'Scan dari semua e-wallet' },
];

function StepPayment({ form, setForm, errors }) {
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const [copied, setCopied] = usePS(null);
  const [dragOver, setDragOver] = usePS(false);
  const fileRef = useRefPS(null);

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === form.paymentMethod);

  const copyAccount = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Ukuran file maksimal 5MB'); return; }
    const reader = new FileReader();
    reader.onload = (e) => upd('proof', { name: file.name, size: file.size, dataUrl: e.target.result, type: file.type });
    reader.readAsDataURL(file);
  };

  return (
    <div className="step-content" data-screen-label="07 Konfirmasi">
      <div className="step-header">
        <div className="step-eyebrow">Step / Konfirmasi</div>
        <h1 className="step-title">Pilih Metode Pembayaran Preferensi</h1>
        <p className="step-subtitle">Pilih metode yang paling nyaman bagi Anda. Nominal & DP akan didiskusikan via WhatsApp setelah pesanan masuk.</p>
      </div>

      <div className="payment-banner">
        <div className="payment-banner-icon">💬</div>
        <div className="payment-banner-text">
          <strong>Harga akan didiskusikan via WhatsApp.</strong> Setelah pesanan ini dikirim, admin akan menghubungi Anda untuk memberikan penawaran harga & instruksi transfer.
        </div>
      </div>

      <div className="card">
        <label className="label" style={{ marginBottom: 12 }}>Pilih Metode Pembayaran Preferensi</label>
        <div className="method-grid">
          {PAYMENT_METHODS.map(m => (
            <div
              key={m.id}
              className={'method-card' + (form.paymentMethod === m.id ? ' selected' : '')}
              onClick={() => upd('paymentMethod', m.id)}
            >
              <div className="method-logo" style={getLogoStyle(m.id)}>{m.logo}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="method-name">{m.name}</div>
                <div className="method-detail">{m.id === 'qris' ? 'Universal' : 'Ketuk untuk melihat detail'}</div>
              </div>
              <div className="method-radio" />
            </div>
          ))}
        </div>

        {errors.paymentMethod && <div className="error-msg" style={{ marginTop: 10 }}>Silakan pilih terlebih dahulu metode pembayarannya</div>}

        {selectedMethod && (
          <div className="account-card">
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Detail {selectedMethod.name}
            </div>
            {selectedMethod.id === 'qris' ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
                <div style={{ width: 180, height: 180, background: 'white', borderRadius: 12, padding: 12, border: '1.5px solid var(--border)' }}>
                  <FakeQR />
                </div>
              </div>
            ) : (
              <>
                <div className="account-row">
                  <span className="account-label">No. Rekening</span>
                  <span className="account-val">
                    {selectedMethod.detail.split(' · ')[0]}
                    <button
                      className={'copy-btn' + (copied === selectedMethod.detail.split(' · ')[0] ? ' copied' : '')}
                      onClick={() => copyAccount(selectedMethod.detail.split(' · ')[0])}
                    >
                      {copied === selectedMethod.detail.split(' · ')[0] ? '✓ Tersalin' : 'Salin'}
                    </button>
                  </span>
                </div>
                {selectedMethod.detail.includes(' · ') && (
                  <div className="account-row">
                    <span className="account-label">Atas nama</span>
                    <span className="account-val">{selectedMethod.detail.split(' · ')[1].replace('a.n. ', '')}</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <label className="label" style={{ marginBottom: 6 }}>
          Unggah Bukti Transfer <span className="label-hint">— opsional, jika sudah melakukan transfer</span>
        </label>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, marginTop: 0 }}>
          Lewati tahap ini jika belum mendapatkan informasi nominal — Anda dapat mengirim buktinya nanti via WhatsApp setelah didiskusikan dengan admin.
        </p>

        {!form.proof ? (
          <div
            className={'upload-zone' + (dragOver ? ' dragging' : '')}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          >
            <div className="upload-icon">↑</div>
            <div className="upload-title">Ketuk atau letakkan bukti transfer di sini</div>
            <div className="upload-hint">JPG, PNG, atau PDF · maks 5MB · opsional</div>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" hidden onChange={e => handleFile(e.target.files[0])} />
          </div>
        ) : (
          <div className="upload-preview">
            <div className="upload-thumb">
              {form.proof.type?.startsWith('image/') ? <img src={form.proof.dataUrl} alt="preview" /> : '📄'}
            </div>
            <div className="upload-info">
              <div className="upload-name">{form.proof.name}</div>
              <div className="upload-meta">{(form.proof.size / 1024).toFixed(1)} KB · Siap dikirim</div>
            </div>
            <button className="upload-remove" onClick={() => upd('proof', null)}>✕</button>
          </div>
        )}
      </div>
    </div>
  );
}

function getLogoStyle(id) {
  const map = {
    bca: { background: '#0060AF', color: 'white', border: 'none' },
    mandiri: { background: '#003D79', color: '#FFD700', border: 'none', fontSize: 10 },
    dana: { background: '#118EEA', color: 'white', border: 'none' },
    gopay: { background: '#00AED6', color: 'white', border: 'none' },
    qris: { background: '#ED1C24', color: 'white', border: 'none' },
  };
  return map[id] || {};
}

function FakeQR() {
  const cells = [];
  const seed = 7;
  for (let i = 0; i < 21; i++) {
    for (let j = 0; j < 21; j++) {
      const isFinder = (i < 7 && j < 7) || (i < 7 && j > 13) || (i > 13 && j < 7);
      const isFinderInner =
        ((i >= 2 && i <= 4) && (j >= 2 && j <= 4)) ||
        ((i >= 2 && i <= 4) && (j >= 16 && j <= 18)) ||
        ((i >= 16 && i <= 18) && (j >= 2 && j <= 4));
      const hash = ((i * 31 + j * seed + i * j) % 5) === 0;
      const fill = isFinderInner || (isFinder && (i === 0 || i === 6 || j === 0 || j === 6 || i === 14 || j === 14)) || (!isFinder && hash);
      cells.push(<rect key={`${i}-${j}`} x={j * 7} y={i * 7} width={7} height={7} fill={fill ? '#0A0A0A' : 'transparent'} />);
    }
  }
  return <svg viewBox="0 0 147 147" width="100%" height="100%"><rect width="147" height="147" fill="white" />{cells}</svg>;
}

// ============================================
// SUCCESS SCREEN — with prominent WA link
// ============================================
const ADMIN_WA = '6281234567890';

function SuccessScreen({ form, onReset, orderCode }) {
  const code = orderCode || ('DV-' + Date.now().toString(36).toUpperCase().slice(-7));
  const adminWa = (window.KAFire?.Settings.getCached().adminWa) || ADMIN_WA;

  const isSimpleBuild = form.services.includes('build') && form.buildMode === 'simple';
  const simpleBuildExcerpt = isSimpleBuild && form.simpleBuild?.description
    ? `\n\nDeskripsi aplikasi:\n${form.simpleBuild.description}`
    : '';

  const waMsg = encodeURIComponent(
    `Halo Admin Kerjain Aja! 👋\n\nSaya baru saja melakukan pemesanan dengan kode: *${code}*\nNama: ${form.name}${simpleBuildExcerpt}\n\nMohon informasikan penawaran harga & instruksi pembayarannya. Terima kasih!`
  );
  const waUrl = `https://wa.me/${adminWa}?text=${waMsg}`;

  return (
    <div className="success-shell step-content" data-screen-label="08 Success">
      <div className="success-badge">✓</div>
      <h1 className="success-title">Pesanan Berhasil Dikirim!</h1>
      <p className="success-sub">
        Data Anda sudah masuk ke sistem. <strong>Silakan klik tombol WhatsApp di bawah</strong> untuk melanjutkan diskusi harga, DP, dan tenggat waktu langsung dengan admin.
      </p>
      <div className="success-code">#{code}</div>

      {/* PROMINENT WHATSAPP CARD */}
      <a className="wa-cta" href={waUrl} target="_blank" rel="noopener">
        <div className="wa-cta-icon">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>
        <div className="wa-cta-body">
          <div className="wa-cta-eyebrow">Lanjutkan Diskusi Harga & DP</div>
          <div className="wa-cta-title">Hubungi Admin via WhatsApp</div>
          <div className="wa-cta-sub">+{adminWa.replace(/(\d{2})(\d{3})(\d{4})(\d{4})/, '$1 $2-$3-$4')}</div>
        </div>
        <div className="wa-cta-arrow">→</div>
      </a>

      <div className="next-steps-card">
        <div className="next-steps-title">Langkah Selanjutnya</div>
        <NextStep n={1} title="Hubungi admin via WhatsApp" desc="Klik tombol di atas — admin akan otomatis mengetahui pesanan Anda dari kode pesanan." />
        <NextStep n={2} title="Diskusi spesifikasi & penawaran harga" desc="Admin akan meninjau cakupan Anda, lalu memberikan penawaran harga, tenggat waktu, dan instruksi DP." />
        <NextStep n={3} title="Transfer DP & mulai pengerjaan" desc="Setelah kesepakatan, lakukan transfer DP via metode yang sudah dipilih — pengerjaan akan langsung dimulai." />
        <NextStep n={4} title="Pengiriman & pelunasan" desc="Aplikasi siap sesuai tenggat. Pelunasan dilakukan setelah pengerjaan selesai." />
      </div>

      <div className="success-actions">
        <button className="btn btn-ghost" onClick={onReset}>+ Pesan proyek lain</button>
      </div>
    </div>
  );
}

function NextStep({ n, title, desc }) {
  return (
    <div className="next-step-row">
      <div className="next-step-num">{n}</div>
      <div>
        <div className="next-step-title">{title}</div>
        <div className="next-step-desc">{desc}</div>
      </div>
    </div>
  );
}

Object.assign(window, {
  StepSummary, StepPayment, SuccessScreen, PAYMENT_METHODS, ADMIN_WA,
});
