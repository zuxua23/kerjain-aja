/* global React, ReactDOM */
const { useState, useEffect, useMemo } = React;

function rupiah(n) {
  const num = Math.round(Number(n) || 0);
  return 'Rp ' + num.toLocaleString('id-ID');
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    const d = typeof iso === 'string' ? new Date(iso) : iso;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch (e) { return iso; }
}

function getParams() {
  const sp = new URLSearchParams(window.location.search);
  return {
    orderId: sp.get('orderId'),
    kind: sp.get('kind') || 'invoice', // 'invoice' | 'bast'
  };
}

function App() {
  const initialParams = getParams();
  const [kind, setKind] = useState(initialParams.kind);
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!window.KAFire) {
      setError('Firebase belum siap. Cek firebase-config.js.');
      setLoading(false);
      return;
    }
    let unsubOrder = null;

    const unsubAuth = window.KAFire.Auth.onChange(async user => {
      if (!user) {
        window.location.replace('login.html?next=' + encodeURIComponent(window.location.pathname + window.location.search));
        return;
      }
      setAuthed(true);
      try {
        const s = await window.KAFire.Settings.load();
        setSettings(s);

        // Subscribe to this order doc only
        if (!initialParams.orderId) {
          setError('Order ID tidak ditemukan di URL. Buka invoice dari admin panel.');
          setLoading(false);
          return;
        }
        unsubOrder = window.KAFire.db.collection('orders').doc(initialParams.orderId)
          .onSnapshot(
            snap => {
              if (!snap.exists) {
                setError('Order tidak ditemukan.');
                setLoading(false);
                return;
              }
              const data = snap.data();
              setOrder({
                id: snap.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt,
              });
              setLoading(false);
            },
            err => { setError(err.message); setLoading(false); }
          );
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    });

    return () => { unsubAuth(); if (unsubOrder) unsubOrder(); };
  }, []);

  useEffect(() => {
    document.title = (kind === 'bast' ? 'BAST' : 'Invoice') + (order?.invoice?.number ? ' ' + order.invoice.number : '') + ' — Kerjain Aja';
  }, [kind, order?.invoice?.number]);

  if (loading) {
    return (
      <div className="inv-shell">
        <div className="inv-loading">
          <div className="inv-spinner" />
          <div>Memuat dokumen…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inv-shell">
        <div className="inv-error">
          <h2>Gagal Memuat</h2>
          <p>{error}</p>
          <button className="inv-btn" onClick={() => window.close()}>Tutup</button>
        </div>
      </div>
    );
  }

  if (!order || !order.invoice || !order.invoice.items?.length) {
    return (
      <div className="inv-shell">
        <div className="inv-error">
          <h2>Invoice Belum Dibuat</h2>
          <p>Order ini belum punya data invoice. Buka modal order di admin → klik "+ Buat Invoice".</p>
          <button className="inv-btn" onClick={() => window.close()}>Tutup</button>
        </div>
      </div>
    );
  }

  return (
    <div className="inv-shell">
      <Toolbar kind={kind} setKind={setKind} order={order} />
      {kind === 'bast'
        ? <BastPaper order={order} settings={settings} />
        : <InvoicePaper order={order} settings={settings} />}
    </div>
  );
}

function Toolbar({ kind, setKind, order }) {
  return (
    <div className="inv-toolbar">
      <div className="inv-toolbar-left">
        <div>
          <div className="inv-toolbar-title">
            {kind === 'bast' ? 'Berita Acara Serah Terima' : 'Invoice'}
          </div>
          <div className="inv-toolbar-sub">{order.invoice?.number || order.code}</div>
        </div>
      </div>
      <div className="inv-toolbar-right">
        <div className="inv-kind-toggle">
          <button className={'inv-kind-btn' + (kind === 'invoice' ? ' active' : '')} onClick={() => setKind('invoice')}>📄 Invoice</button>
          <button className={'inv-kind-btn' + (kind === 'bast' ? ' active' : '')} onClick={() => setKind('bast')}>📋 BAST</button>
        </div>
        <button className="inv-btn" onClick={() => window.close()}>Tutup</button>
        <button className="inv-btn inv-btn-primary" onClick={() => window.print()}>🖨 Print / Save PDF</button>
      </div>
    </div>
  );
}

// ============================================
// INVOICE PAPER
// ============================================
function InvoicePaper({ order, settings }) {
  const inv = order.invoice;
  const f = order.form || {};

  const totals = useMemo(() => {
    const sub = (inv.items || []).reduce((acc, it) => acc + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0);
    const promoAmt = (() => {
      const p = inv.promo;
      if (!p || !p.active) return 0;
      const v = Number(p.value) || 0;
      if (p.type === 'percent') return Math.round((sub * v) / 100);
      return Math.round(v);
    })();
    const afterPromo = sub - promoAmt;
    const afterDisc = afterPromo - (Number(inv.discount) || 0);
    const withTax = afterDisc + (Number(inv.tax) || 0);
    const due = withTax - (Number(inv.paid) || 0);
    return { sub, promoAmt, afterPromo, afterDisc, withTax, due };
  }, [inv]);

  const isPaid = (inv.paid || 0) >= totals.withTax;

  return (
    <div className="inv-paper">
      <Header
        settings={settings}
        kind="invoice"
        title="INVOICE"
        number={inv.number || order.code}
        date={inv.date}
        dueDate={inv.dueDate}
      />

      <div className="inv-parties">
        <div>
          <div className="inv-party-label">Ditagihkan kepada</div>
          <div className="inv-party-name">{f.name || '—'}</div>
          {f.wa && <div className="inv-party-line">+62{f.wa}</div>}
          {f.email && <div className="inv-party-line">{f.email}</div>}
          {(f.customFields || []).map((cf, i) => (
            <div key={i} className="inv-party-line"><strong>{cf.label}:</strong> {cf.value}</div>
          ))}
        </div>
        <div>
          <div className="inv-party-label">Dari</div>
          <div className="inv-party-name">{settings?.studioName || 'Kerjain Aja'}</div>
          <div className="inv-party-line">WhatsApp: +{settings?.adminWa || '6281234567890'}</div>
          <div className="inv-party-line">Order: <strong>{order.code}</strong></div>
        </div>
      </div>

      <table className="inv-table">
        <thead>
          <tr>
            <th style={{ width: '5%' }}>#</th>
            <th>Deskripsi</th>
            <th className="num" style={{ width: '10%' }}>Qty</th>
            <th className="num" style={{ width: '20%' }}>Harga Satuan</th>
            <th className="num" style={{ width: '20%' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {inv.items.map((it, i) => (
            <tr key={i}>
              <td className="num">{i + 1}</td>
              <td><div className="item-desc">{it.desc || '—'}</div></td>
              <td className="num">{Number(it.qty) || 0}</td>
              <td className="num">{rupiah(it.unitPrice)}</td>
              <td className="num">{rupiah((Number(it.qty) || 0) * (Number(it.unitPrice) || 0))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="inv-totals">
        <div className="inv-totals-box">
          <div className="inv-total-row"><span>Subtotal</span><strong>{rupiah(totals.sub)}</strong></div>
          {inv.promo?.active && totals.promoAmt > 0 && (
            <div className="inv-total-row inv-total-promo">
              <span>
                🎟️ Promo
                {inv.promo.label ? ` (${inv.promo.label})` : ''}
                {inv.promo.type === 'percent' ? ` — ${Number(inv.promo.value) || 0}%` : ''}
              </span>
              <strong>−{rupiah(totals.promoAmt)}</strong>
            </div>
          )}
          {Number(inv.discount) > 0 && (
            <div className="inv-total-row"><span>Diskon</span><strong>−{rupiah(inv.discount)}</strong></div>
          )}
          {Number(inv.tax) > 0 && (
            <div className="inv-total-row"><span>Pajak</span><strong>+{rupiah(inv.tax)}</strong></div>
          )}
          <div className="inv-total-row grand"><span>Total</span><strong>{rupiah(totals.withTax)}</strong></div>
          {Number(inv.paid) > 0 && (
            <div className="inv-total-row"><span>Sudah dibayar</span><strong>−{rupiah(inv.paid)}</strong></div>
          )}
          <div className={'inv-total-row due ' + (isPaid ? 'paid' : 'unpaid')}>
            <span>{isPaid ? 'LUNAS' : 'Sisa Tagihan'}</span>
            <strong>{isPaid ? '✓' : rupiah(Math.max(0, totals.due))}</strong>
          </div>
        </div>
      </div>

      {inv.notes && (
        <div className="inv-notes">
          <div className="inv-notes-label">Catatan</div>
          <div className="inv-notes-body">{inv.notes}</div>
        </div>
      )}

      <Signatures
        leftLabel="Pelanggan"
        leftName={inv.customerSigner || f.name}
        rightLabel="Studio"
        rightName={inv.studioSigner || settings?.signerName || 'Admin'}
        rightRole={settings?.studioName || 'Kerjain Aja'}
      />

      <Footer order={order} />
    </div>
  );
}

// ============================================
// BAST PAPER (Berita Acara Serah Terima)
// ============================================
function BastPaper({ order, settings }) {
  const inv = order.invoice;
  const f = order.form || {};
  const bastDate = inv.bastDate || inv.date || new Date().toISOString().slice(0, 10);
  const studioName = settings?.studioName || 'Kerjain Aja';

  const serviceLabels = (f.services || []).map(sid => ({
    build: 'Pembuatan Aplikasi (Build dari 0)',
    'uml-db': 'Pembuatan Dokumentasi UML & Database',
    landing: 'Pembuatan Landing Page',
    revision: 'Revisi / Perbaikan Aplikasi',
  })[sid] || sid).filter(Boolean);
  const isManual = !!order.manual;

  return (
    <div className="inv-paper">
      <Header
        settings={settings}
        kind="bast"
        title="BAST"
        number={inv.number ? inv.number.replace(/^INV-/, 'BAST-') : 'BAST-' + (order.code || '').replace(/^DV-/, '')}
        date={bastDate}
      />

      <div className="inv-bast-body">
        <p>
          Pada hari ini, <strong>{formatDate(bastDate)}</strong>, kami yang bertanda tangan di bawah ini:
        </p>

        <div className="inv-parties">
          <div>
            <div className="inv-party-label">PIHAK PERTAMA (Pelaksana)</div>
            <div className="inv-party-name">{inv.studioSigner || settings?.signerName || 'Admin'}</div>
            <div className="inv-party-line">Mewakili: {studioName}</div>
            <div className="inv-party-line">WhatsApp: +{settings?.adminWa || '6281234567890'}</div>
          </div>
          <div>
            <div className="inv-party-label">PIHAK KEDUA (Pemberi Kerja)</div>
            <div className="inv-party-name">{inv.customerSigner || f.name}</div>
            {f.wa && <div className="inv-party-line">+62{f.wa}</div>}
            {f.email && <div className="inv-party-line">{f.email}</div>}
            {(f.customFields || []).map((cf, i) => (
              <div key={i} className="inv-party-line"><strong>{cf.label}:</strong> {cf.value}</div>
            ))}
          </div>
        </div>

        <p style={{ marginTop: 24 }}>
          Dengan ini menyatakan bahwa <strong>PIHAK PERTAMA</strong> telah menyerahkan, dan <strong>PIHAK KEDUA</strong> telah menerima, hasil pekerjaan sesuai dengan pesanan <strong>{order.code}</strong> dengan rincian sebagai berikut:
        </p>

        <div className="inv-bast-scope-list">
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--inv-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Lingkup Pekerjaan
          </div>
          <ul>
            {serviceLabels.length > 0
              ? serviceLabels.map((s, i) => <li key={i}>{s}</li>)
              : isManual
                ? <li>Pekerjaan sesuai rincian invoice (lihat item di bawah)</li>
                : <li>(tidak ada jasa terdaftar)</li>}
          </ul>
          {(inv.items || []).length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--inv-muted)', textTransform: 'uppercase', letterSpacing: 1, margin: '14px 0 8px' }}>
                Item Diselesaikan
              </div>
              <ul>
                {inv.items.map((it, i) => <li key={i}>{it.desc || '(item)'} {it.qty > 1 ? `(${it.qty}×)` : ''}</li>)}
              </ul>
            </>
          )}
        </div>

        <p>
          Hasil pekerjaan telah diperiksa oleh <strong>PIHAK KEDUA</strong> dan dinyatakan <strong>sesuai dengan spesifikasi</strong> yang disepakati. Sejak ditandatanganinya berita acara ini, hasil pekerjaan menjadi tanggung jawab <strong>PIHAK KEDUA</strong>.
        </p>

        {inv.notes && (
          <div className="inv-notes">
            <div className="inv-notes-label">Catatan Tambahan</div>
            <div className="inv-notes-body">{inv.notes}</div>
          </div>
        )}

        <div className="inv-bast-statement">
          Demikian berita acara serah terima ini dibuat dalam keadaan sehat dan tanpa tekanan dari pihak manapun, untuk dipergunakan sebagaimana mestinya.
        </div>
      </div>

      <Signatures
        leftLabel="PIHAK PERTAMA"
        leftName={inv.studioSigner || settings?.signerName || 'Admin'}
        leftRole={studioName}
        rightLabel="PIHAK KEDUA"
        rightName={inv.customerSigner || f.name}
      />

      <Footer order={order} />
    </div>
  );
}

// ============================================
// SHARED PARTIALS
// ============================================
function Header({ settings, kind, title, number, date, dueDate }) {
  return (
    <div className="inv-header">
      <div className="inv-brand">
        <div className="inv-brand-mark">{'<K.A/>'}</div>
        <div className="inv-brand-name">{settings?.studioName || 'Kerjain Aja'}</div>
        <div className="inv-brand-tag">Jasa coding & build aplikasi</div>
        <div className="inv-brand-tag">WhatsApp: +{settings?.adminWa || '6281234567890'}</div>
      </div>
      <div className="inv-doc">
        <div className="inv-doc-kind">{kind === 'bast' ? 'Berita Acara Serah Terima' : 'Tagihan Pembayaran'}</div>
        <div className="inv-doc-title">{title}</div>
        <div className="inv-doc-meta">
          No: <strong>{number}</strong><br />
          Tanggal: <strong>{formatDate(date)}</strong>
          {dueDate && <><br />Jatuh tempo: <strong>{formatDate(dueDate)}</strong></>}
        </div>
      </div>
    </div>
  );
}

function Signatures({ leftLabel, leftName, leftRole, rightLabel, rightName, rightRole }) {
  return (
    <div className="inv-signatures">
      <div className="inv-sig">
        <div className="inv-sig-label">{leftLabel}</div>
        <div className="inv-sig-line" />
        <div className="inv-sig-name">{leftName || '—'}</div>
        {leftRole && <div className="inv-sig-role">{leftRole}</div>}
      </div>
      <div className="inv-sig">
        <div className="inv-sig-label">{rightLabel}</div>
        <div className="inv-sig-line" />
        <div className="inv-sig-name">{rightName || '—'}</div>
        {rightRole && <div className="inv-sig-role">{rightRole}</div>}
      </div>
    </div>
  );
}

function Footer({ order }) {
  return (
    <div className="inv-footer">
      Dokumen ini dibuat otomatis oleh sistem Kerjain Aja · {order.code} · {formatDate(new Date())}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('invoice-root')).render(<App />);
