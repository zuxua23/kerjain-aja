/* global React, ReactDOM */
const { useState, useEffect, useMemo } = React;

// Pricing removed — harga & DP didiskusikan langsung via WhatsApp setelah order masuk.

// ============================================
// FIRESTORE-BACKED STORAGE HOOKS
// ============================================

function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!window.KAFire) return;
    const unsub = window.KAFire.Orders.subscribe(
      (list) => { setOrders(list); setLoaded(true); setError(null); },
      (err)  => { setError(err.message || 'Gagal load orders'); setLoaded(true); }
    );
    return unsub;
  }, []);

  const refresh = () => { /* no-op — real-time subscription */ };

  const updateStatus = (id, status) => {
    window.KAFire.Orders.updateStatus(id, status).catch(e => alert('Gagal update: ' + e.message));
  };

  const remove = (id, code) => {
    if (!confirm(`Hapus order ${code}? Aksi ini gak bisa di-undo.`)) return;
    window.KAFire.Orders.remove(id).catch(e => alert('Gagal hapus: ' + e.message));
  };

  const clearAll = () => {
    if (!confirm('Hapus SEMUA order? Aksi ini gak bisa di-undo.')) return;
    // delete one-by-one (no bulk via client SDK)
    Promise.all(orders.map(o => window.KAFire.Orders.remove(o.id)))
      .catch(e => alert('Gagal hapus semua: ' + e.message));
  };

  const saveInvoice = (id, invoice) => {
    return window.KAFire.Orders.saveInvoice(id, invoice);
  };

  return { orders, loaded, error, refresh, updateStatus, remove, clearAll, saveInvoice };
}

// Demo seed removed — Firestore is source of truth, clean slate start.

// ============================================
// APP
// ============================================
const PAGES = [
  { id: 'overview',  label: 'Overview',      icon: '◐' },
  { id: 'orders',    label: 'Order Masuk',   icon: '◉' },
  { id: 'konfig',    label: 'Konfigurasi',   icon: '◈' },
  { id: 'settings',  label: 'Pengaturan',    icon: '⚙' },
];

function AdminApp() {
  const [authState, setAuthState] = useState({ ready: false, user: null });

  useEffect(() => {
    if (!window.KAFire) {
      // firebase not loaded — send to login (which will show config error)
      window.location.replace('login.html?next=admin.html');
      return;
    }
    const unsub = window.KAFire.Auth.onChange(user => {
      setAuthState({ ready: true, user });
      if (!user) window.location.replace('login.html?next=admin.html');
    });
    return unsub;
  }, []);

  if (!authState.ready) {
    return (
      <div className="admin-boot">
        <div className="admin-boot-spinner" />
        <div className="admin-boot-text">Memuat dashboard…</div>
      </div>
    );
  }
  if (!authState.user) return null;
  return <AdminAppInner user={authState.user} />;
}

function AdminAppInner({ user }) {
  const [page, setPage] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const orderStore = useOrders();
  const [detailOrder, setDetailOrder] = useState(null);
  const [settings, setSettings] = useState(() => window.KAFire.Settings.getCached());
  const [toasts, setToasts] = useState([]);

  // Boot shared listeners (config + settings) for the whole admin
  useEffect(() => {
    const stop = window.KAFire.Boot.start({
      onSettings: setSettings,
    });
    return stop;
  }, []);

  // Lock body scroll when sidebar open on mobile
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  // === Real-time NEW-ORDER notification ===
  const prevOrderIds = React.useRef(null);
  useEffect(() => {
    if (!orderStore.loaded) return;
    const ids = new Set(orderStore.orders.map(o => o.id));
    if (prevOrderIds.current === null) {
      prevOrderIds.current = ids;
      return;
    }
    // find new orders
    const newOnes = orderStore.orders.filter(o => !prevOrderIds.current.has(o.id));
    if (newOnes.length > 0) {
      newOnes.forEach(o => {
        pushToast({
          id: o.id,
          title: 'Order baru masuk!',
          body: `${o.form?.name || 'Anonim'} — ${o.code}`,
          onClick: () => { setPage('orders'); setDetailOrder(o); },
        });
        playBeep();
        tryBrowserNotification(o);
      });
    }
    prevOrderIds.current = ids;
  }, [orderStore.orders, orderStore.loaded]);

  // Ask browser notification permission once
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      // soft delay so it doesn't pop instantly on load
      const t = setTimeout(() => { try { Notification.requestPermission(); } catch (e) {} }, 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const pushToast = (t) => {
    const id = t.id || ('t-' + Date.now());
    setToasts(arr => [...arr, { ...t, id }]);
    setTimeout(() => setToasts(arr => arr.filter(x => x.id !== id)), 6000);
  };
  const dismissToast = (id) => setToasts(arr => arr.filter(x => x.id !== id));

  // Tab title flash with pending count
  const pendingCount = useMemo(() => orderStore.orders.filter(o => o.status === 'pending').length, [orderStore.orders]);
  useEffect(() => {
    const base = 'Admin Dashboard — Kerjain Aja';
    document.title = pendingCount > 0 ? `(${pendingCount}) ${base}` : base;
  }, [pendingCount]);

  const handleLogout = async () => {
    if (!confirm('Yakin mau logout?')) return;
    await window.KAFire.Auth.logout();
    window.location.replace('login.html');
  };

  return (
    <div className="admin-shell">
      <aside className={'admin-sidebar' + (sidebarOpen ? ' open' : '')}>
        <div className="admin-brand">
          <div className="admin-brand-mark">{'<K.A/>'}</div>
          <div>
            <div className="admin-brand-title">{settings.studioName || 'Kerjain Aja'}</div>
            <div className="admin-brand-sub">Admin Panel</div>
          </div>
        </div>
        <nav className="admin-nav">
          {PAGES.map(p => (
            <button
              key={p.id}
              className={'admin-nav-item' + (page === p.id ? ' active' : '')}
              onClick={() => { setPage(p.id); setSidebarOpen(false); }}
            >
              <span className="admin-nav-icon">{p.icon}</span>
              <span>{p.label}</span>
              {p.id === 'orders' && pendingCount > 0 && (
                <span className="admin-nav-badge">{pendingCount}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-user-pill" title={user.email}>
            <span className="admin-user-avatar">{(user.email || '?').slice(0, 1).toUpperCase()}</span>
            <span className="admin-user-email">{user.email}</span>
          </div>
          <a href="index.html" className="admin-back-link">← Form pelanggan</a>
        </div>
      </aside>

      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="admin-main">
        <div className="admin-topbar">
          <button className="admin-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="menu">☰</button>
          <div className="admin-topbar-title">{PAGES.find(p => p.id === page)?.label}</div>
          <div className="admin-topbar-meta">
            <span className="admin-meta-dot" />
            Live
            <button
              className="admin-logout-btn"
              onClick={handleLogout}
              title={'Logout (' + user.email + ')'}
            >⏻ Logout</button>
          </div>
        </div>

        <div className="admin-content">
          {!orderStore.loaded && page !== 'konfig' && page !== 'settings' && (
            <div className="admin-card admin-loading-card">
              <div className="admin-boot-spinner small" />
              <span>Memuat data dari Firestore…</span>
            </div>
          )}
          {orderStore.error && (
            <div className="admin-card admin-error-card">
              <strong>Gagal memuat:</strong> {orderStore.error}
              <div style={{ fontSize: 12, marginTop: 6, opacity: 0.8 }}>
                Cek <code>firebase-config.js</code> + pastikan Firestore Rules sudah di-deploy.
              </div>
            </div>
          )}
          {page === 'overview' && <PageOverview orders={orderStore.orders} setPage={setPage} setDetailOrder={setDetailOrder} />}
          {page === 'orders'   && <PageOrders store={orderStore} setDetailOrder={setDetailOrder} />}
          {page === 'konfig'   && <PageKonfigurasi />}
          {page === 'settings' && <PageSettings settings={settings} user={user} />}
        </div>
      </main>

      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          settings={settings}
          onClose={() => setDetailOrder(null)}
          onStatusChange={(s) => { orderStore.updateStatus(detailOrder.id, s); setDetailOrder({ ...detailOrder, status: s }); }}
          onSaveInvoice={async (invoice) => {
            await orderStore.saveInvoice(detailOrder.id, invoice);
            setDetailOrder({ ...detailOrder, invoice });
          }}
        />
      )}

      {/* Toasts — new order notifications */}
      <div className="admin-toast-stack">
        {toasts.map(t => (
          <button key={t.id} className="admin-toast" onClick={() => { t.onClick?.(); dismissToast(t.id); }}>
            <span className="admin-toast-icon">◉</span>
            <span className="admin-toast-body">
              <span className="admin-toast-title">{t.title}</span>
              <span className="admin-toast-sub">{t.body}</span>
            </span>
            <span className="admin-toast-close" onClick={(e) => { e.stopPropagation(); dismissToast(t.id); }}>×</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function playBeep() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.42);
    setTimeout(() => ctx.close(), 800);
  } catch (e) { /* ignore */ }
}

function tryBrowserNotification(order) {
  try {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;
    if (document.visibilityState === 'visible') return; // already in tab, toast is enough
    const n = new Notification('Order baru masuk!', {
      body: `${order.form?.name || 'Anonim'} — ${order.code}`,
      tag: order.id,
    });
    n.onclick = () => { window.focus(); n.close(); };
  } catch (e) { /* ignore */ }
}

// ============================================
// OVERVIEW
// ============================================
function PageOverview({ orders, setPage, setDetailOrder }) {
  const stats = useMemo(() => {
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const paidCount = orders.filter(o => o.status === 'paid' || o.status === 'in-progress' || o.status === 'done').length;
    const last7Count = orders.filter(o => Date.now() - new Date(o.createdAt).getTime() < 7 * 86400000).length;
    return { pendingCount, paidCount, last7Count, total: orders.length };
  }, [orders]);

  // Bar chart data: last 7 days — jumlah order per hari
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0,0,0,0);
      d.setDate(d.getDate() - i);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const count = orders
        .filter(o => { const t = new Date(o.createdAt).getTime(); return t >= d.getTime() && t < next.getTime(); })
        .length;
      days.push({ label: d.toLocaleDateString('id-ID', { weekday: 'short' }), value: count });
    }
    return days;
  }, [orders]);

  const maxVal = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div>
      <div className="stat-grid">
        <StatCard label="Total Order" val={stats.total} eyebrow="all-time" />
        <StatCard label="Pending" val={stats.pendingCount} eyebrow="butuh konfirmasi" tone="warning" />
        <StatCard label="Paid / In-progress" val={stats.paidCount} eyebrow="dalam pengerjaan" tone="accent" />
        <StatCard label="Order 7 Hari" val={stats.last7Count} eyebrow="masuk minggu ini" tone="primary" />
      </div>

      <div className="admin-card">
        <div className="admin-card-head">
          <div>
            <div className="admin-card-title">Order 7 Hari Terakhir</div>
            <div className="admin-card-sub">Jumlah order yang masuk per hari</div>
          </div>
        </div>
        <div className="bar-chart">
          {chartData.map((d, i) => (
            <div key={i} className="bar-col">
              <div className="bar-val">{d.value > 0 ? d.value : ''}</div>
              <div className="bar-track">
                <div className="bar-fill" style={{ height: (d.value / maxVal * 100) + '%' }} />
              </div>
              <div className="bar-label">{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-head">
          <div>
            <div className="admin-card-title">Order Terbaru</div>
            <div className="admin-card-sub">5 order paling baru</div>
          </div>
          <button className="admin-btn-ghost" onClick={() => setPage('orders')}>Lihat semua →</button>
        </div>
        <OrderTable orders={orders.slice(0, 5)} onRowClick={setDetailOrder} compact />
      </div>
    </div>
  );
}

function StatCard({ label, val, eyebrow, tone }) {
  return (
    <div className={'stat-card' + (tone ? ' tone-' + tone : '')}>
      <div className="stat-label">{label}</div>
      <div className="stat-val">{val}</div>
      <div className="stat-eyebrow">{eyebrow}</div>
    </div>
  );
}

// ============================================
// ORDERS PAGE
// ============================================
const STATUS_OPTIONS = [
  { id: 'pending', label: 'Pending', tone: 'warning' },
  { id: 'paid', label: 'Paid', tone: 'accent' },
  { id: 'in-progress', label: 'In Progress', tone: 'primary' },
  { id: 'done', label: 'Done', tone: 'success' },
  { id: 'cancelled', label: 'Cancelled', tone: 'muted' },
];

function PageOrders({ store, setDetailOrder }) {
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    return store.orders.filter(o => {
      if (filter !== 'all' && o.status !== filter) return false;
      if (q && !(o.code.toLowerCase().includes(q.toLowerCase()) || (o.form?.name || '').toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
  }, [store.orders, filter, q]);

  return (
    <div>
      <div className="admin-card">
        <div className="admin-toolbar">
          <input
            className="admin-input"
            placeholder="🔍 Cari kode atau nama..."
            value={q}
            onChange={e => setQ(e.target.value)}
            style={{ flex: 1, minWidth: 180 }}
          />
          <div className="filter-tabs">
            {[{ id: 'all', label: 'Semua' }, ...STATUS_OPTIONS].map(f => (
              <button
                key={f.id}
                className={'filter-tab' + (filter === f.id ? ' active' : '')}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                {f.id !== 'all' && <span className="filter-count">{store.orders.filter(o => o.status === f.id).length}</span>}
              </button>
            ))}
          </div>
          <button className="admin-btn-danger-ghost" onClick={store.clearAll}>Hapus semua</button>
        </div>

        <OrderTable orders={filtered} onRowClick={setDetailOrder} onDelete={(id, code) => store.remove(id, code)} />

        {filtered.length === 0 && (
          <div className="admin-empty">
            <div className="admin-empty-icon">∅</div>
            <div className="admin-empty-title">Belum ada order</div>
            <div className="admin-empty-sub">Pesanan yang masuk dari formulir akan muncul di sini.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderTable({ orders, onRowClick, onDelete, compact }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Customer</th>
            <th>Jasa</th>
            <th>Status</th>
            <th>Tanggal</th>
            {onDelete && <th></th>}
          </tr>
        </thead>
        <tbody>
          {orders.map(o => {
            const status = STATUS_OPTIONS.find(s => s.id === o.status) || STATUS_OPTIONS[0];
            const services = (o.form?.services || []).map(sid => ({
              build: 'Build', 'uml-db': 'UML+DB', landing: 'Landing', revision: 'Revisi'
            })[sid] || sid);
            return (
              <tr key={o.code} onClick={() => onRowClick(o)} className="order-row">
                <td className="mono"><strong>{o.code}</strong></td>
                <td>
                  <div className="cell-stack">
                    <div className="cell-strong">{o.form?.name || '—'}</div>
                    <div className="cell-muted">+62{o.form?.wa}</div>
                  </div>
                </td>
                <td>
                  <div className="svc-chips">
                    {services.map((s, i) => <span key={i} className="svc-chip">{s}</span>)}
                  </div>
                </td>
                <td><span className={'status-pill tone-' + status.tone}>{status.label}</span></td>
                <td className="cell-muted mono">{new Date(o.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</td>
                {onDelete && (
                  <td onClick={e => e.stopPropagation()}>
                    <button className="row-delete" onClick={() => onDelete(o.id, o.code)} title="Hapus">×</button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// ORDER DETAIL MODAL
// ============================================
function OrderDetailModal({ order, settings, onClose, onStatusChange, onSaveInvoice }) {
  const f = order.form || {};
  const services = (f.services || []).map(sid => ({
    build: 'Build dari 0', 'uml-db': 'UML & Database', landing: 'Landing Page', revision: 'Revisi'
  })[sid] || sid);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-eyebrow">Order Detail</div>
            <div className="modal-title">{order.code}</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <div className="modal-section-title">Status</div>
            <div className="status-grid">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s.id}
                  className={'status-btn tone-' + s.tone + (order.status === s.id ? ' active' : '')}
                  onClick={() => onStatusChange(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-section">
            <div className="modal-section-title">Pelanggan</div>
            <DetailRow label="Nama" val={f.name || '—'} />
            <DetailRow label="WhatsApp" val={
              <a href={`https://wa.me/62${f.wa}`} target="_blank" rel="noopener" className="link">+62{f.wa} →</a>
            } />
            {f.email && <DetailRow label="Email" val={f.email} />}
            <DetailRow label="Tanggal Order" val={new Date(order.createdAt).toLocaleString('id-ID')} />
          </div>

          <div className="modal-section">
            <div className="modal-section-title">Jasa Dipilih</div>
            <div className="svc-chips">
              {services.map((s, i) => <span key={i} className="svc-chip lg">{s}</span>)}
            </div>
            {f.services?.includes('uml-db') && f.extras?.['uml-db'] && (
              <UmlDbAdminBlock extras={f.extras['uml-db']} />
            )}
            {f.services?.includes('revision') && f.extras?.revision && (
              <RevisionAdminBlock extras={f.extras.revision} />
            )}
            {['landing'].map(sid => {
              const notes = f.extras?.[sid]?.notes;
              if (!f.services?.includes(sid) || !notes) return null;
              return (
                <div key={sid} className="modal-paragraph">
                  <strong>Catatan Landing Page:</strong>
                  <pre>{notes}</pre>
                </div>
              );
            })}
          </div>

          {f.services?.includes('build') && f.buildMode === 'simple' && f.simpleBuild && (f.simpleBuild.description || f.simpleBuild.goal || f.simpleBuild.reference) && (
            <div className="modal-section">
              <div className="modal-section-title">Build dari 0 — Deskripsi Pelanggan</div>
              {f.simpleBuild.description && (
                <div className="modal-paragraph">
                  <strong>Cerita aplikasi:</strong>
                  <pre>{f.simpleBuild.description}</pre>
                </div>
              )}
              {f.simpleBuild.goal && <DetailRow label="Tujuan utama" val={f.simpleBuild.goal} />}
              {f.simpleBuild.reference && <DetailRow label="Aplikasi sejenis" val={f.simpleBuild.reference} />}
            </div>
          )}

          {(f.counts && Object.values(f.counts).some(v => v > 0)) && (
            <div className="modal-section">
              <div className="modal-section-title">Cakupan Build (Teknis)</div>
              {f.scopeBackground && (
                <div className="modal-paragraph">
                  <strong>Latar belakang:</strong>
                  <pre>{f.scopeBackground}</pre>
                </div>
              )}
              {['master', 'transaksi', 'laporan', 'dashboard'].map(k => {
                const items = f.items?.[k] || [];
                if (!items.length) return null;
                return (
                  <div key={k} className="scope-block">
                    <div className="scope-block-title">{k.charAt(0).toUpperCase() + k.slice(1)} ({items.length})</div>
                    {items.map((it, i) => (
                      <div key={i} className="scope-item">
                        <strong>{it.name || `(belum diisi #${i + 1})`}</strong>
                        {it.attrs && it.attrs.length > 0 && (
                          <div className="scope-meta">
                            atribut: {it.attrs.map(a => `${a.name}:${a.type}`).join(', ')}
                          </div>
                        )}
                        {it.ops && (
                          <div className="scope-meta">
                            operasi: {Object.keys(it.ops).filter(o => it.ops[o]).join(', ') || '—'}
                          </div>
                        )}
                        {it.widgets && (
                          <div className="scope-meta">
                            widget: {it.widgets.sums.length} sum, {it.widgets.charts.length} chart, {it.widgets.logs.length} log
                          </div>
                        )}
                        {it.notes && <div className="scope-meta italic">"{it.notes}"</div>}
                      </div>
                    ))}
                  </div>
                );
              })}
              {f.tech && f.tech.length > 0 && <DetailRow label="Tech" val={f.tech.join(', ')} />}
            </div>
          )}

          <div className="modal-section">
            <div className="modal-section-title">Catatan</div>
            {f.notes ? <div className="modal-paragraph"><pre>{f.notes}</pre></div> : <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>—</div>}
          </div>

          <div className="modal-section modal-total">
            <InvoiceBlock order={order} settings={settings} onSave={onSaveInvoice} />
          </div>

          <a className="modal-wa-cta" href={`https://wa.me/62${f.wa}?text=${encodeURIComponent(`Halo ${f.name}, pesanan ${order.code} sudah kami terima.`)}`} target="_blank" rel="noopener">
            💬 Hubungi pelanggan via WhatsApp →
          </a>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, val, big }) {
  return (
    <div className={'detail-row' + (big ? ' big' : '')}>
      <span className="detail-row-label">{label}</span>
      <span className="detail-row-val">{val}</span>
    </div>
  );
}

function UmlDbAdminBlock({ extras }) {
  const items = extras.items || {};
  const config = window.KA ? window.KA.loadConfig() : { umlTypes: [] };
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
  return (
    <div className="scope-block">
      <div className="scope-block-title">UML & Desain Database</div>
      {rows.length === 0 && <div className="scope-meta italic">Tidak ada jenis yang dipilih.</div>}
      {rows.map((r, i) => (
        <div key={i} className="scope-item">
          <strong>{r.label}</strong>
          <div className="scope-meta">{r.val}</div>
        </div>
      ))}
      {extras.notes && <div className="modal-paragraph" style={{ marginTop: 8 }}><strong>Catatan:</strong><pre>{extras.notes}</pre></div>}
    </div>
  );
}

function RevisionAdminBlock({ extras }) {
  const config = window.KA ? window.KA.loadConfig() : { revisionTypes: [] };
  const selected = extras.types || [];
  const labels = selected
    .map(id => config.revisionTypes.find(t => t.id === id)?.name)
    .filter(Boolean);
  return (
    <div className="scope-block">
      <div className="scope-block-title">Revisi / Bug Fix</div>
      {labels.length === 0 ? (
        <div className="scope-meta italic">Tidak ada jenis revisi yang dipilih.</div>
      ) : (
        <div className="scope-item">
          <strong>Jenis dipilih</strong>
          <div className="scope-meta">{labels.join(', ')}</div>
        </div>
      )}
      {extras.notes && <div className="modal-paragraph" style={{ marginTop: 8 }}><strong>Catatan:</strong><pre>{extras.notes}</pre></div>}
    </div>
  );
}

// ============================================
// KONFIGURASI PAGE (admin manages dropdowns/lists)
// ============================================
const KONFIG_TABS = [
  { id: 'tech',    label: 'Manage Tech' },
  { id: 'uml',     label: 'UML & Database' },
  { id: 'revisi',  label: 'Jenis Revisi' },
  { id: 'operasi', label: 'Operasi' },
  { id: 'data',    label: 'Tipe Data' },
];

const TECH_KIND_OPTIONS = [
  { id: 'bahasa', label: 'Bahasa Pemrograman' },
  { id: 'fe',     label: 'Frontend' },
  { id: 'be',     label: 'Backend' },
  { id: 'db',     label: 'Database' },
];

const UML_KIND_OPTIONS = [
  { id: 'uml',       label: 'Diagram UML' },
  { id: 'desain-db', label: 'Desain Database' },
  { id: 'jenis-db',  label: 'Jenis Database' },
];

const OP_CATEGORY_OPTIONS = [
  { id: 'master',    label: 'Master Data' },
  { id: 'transaksi', label: 'Transaksi' },
  { id: 'laporan',   label: 'Laporan' },
  { id: 'dashboard', label: 'Dashboard' },
];

function PageKonfigurasi() {
  const [tab, setTab] = useState('tech');
  const [config, setConfigState] = useState(() => window.KAFire.Config.getCached());
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  // subscribe to live config
  useEffect(() => {
    return window.KAFire.Config.subscribe(setConfigState);
  }, []);

  const persist = async (next) => {
    setConfigState(next);
    setSaving(true);
    try {
      await window.KAFire.Config.save(next);
      setSavedAt(Date.now());
    } catch (e) { alert('Gagal simpan: ' + e.message); }
    finally { setSaving(false); }
  };

  const updateList = (listKey, mapper) => {
    persist({ ...config, [listKey]: mapper(config[listKey]) });
  };

  const resetDefaults = async () => {
    if (!confirm('Reset semua konfigurasi ke nilai default?')) return;
    setSaving(true);
    try {
      await window.KAFire.Config.reset();
      setSavedAt(Date.now());
    } catch (e) { alert('Gagal reset: ' + e.message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="admin-card admin-info-card">
        <div className="admin-info-icon">i</div>
        <div>
          <strong>Konfigurasi form pemesanan.</strong> Item yang <strong>aktif</strong> akan tampil di form pelanggan. Nonaktifkan untuk menyembunyikan sementara tanpa menghapus.
        </div>
        <button className="admin-btn-ghost" onClick={resetDefaults}>↺ Reset semua</button>
        {saving && <span className="konfig-save-status saving">Menyimpan…</span>}
        {!saving && savedAt && (Date.now() - savedAt < 3500) && (
          <span className="konfig-save-status saved">✓ Tersimpan</span>
        )}
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="konfig-tabs">
          {KONFIG_TABS.map(t => (
            <button
              key={t.id}
              className={'konfig-tab' + (tab === t.id ? ' active' : '')}
              onClick={() => setTab(t.id)}
              type="button"
            >
              {t.label}
              <span className="konfig-tab-count">
                {t.id === 'tech'    ? config.techStack.length :
                 t.id === 'uml'     ? config.umlTypes.length :
                 t.id === 'revisi'  ? config.revisionTypes.length :
                 t.id === 'operasi' ? config.operations.length :
                 t.id === 'data'    ? config.dataTypes.length : 0}
              </span>
            </button>
          ))}
        </div>

        <div style={{ padding: 24 }}>
          {tab === 'tech' && (
            <TechConfigPanel
              list={config.techStack}
              onChange={(mapper) => updateList('techStack', mapper)}
            />
          )}
          {tab === 'uml' && (
            <UmlConfigPanel
              list={config.umlTypes}
              onChange={(mapper) => updateList('umlTypes', mapper)}
            />
          )}
          {tab === 'revisi' && (
            <RevisionConfigPanel
              list={config.revisionTypes}
              onChange={(mapper) => updateList('revisionTypes', mapper)}
            />
          )}
          {tab === 'operasi' && (
            <OperationConfigPanel
              list={config.operations}
              onChange={(mapper) => updateList('operations', mapper)}
            />
          )}
          {tab === 'data' && (
            <DataTypeConfigPanel
              list={config.dataTypes}
              onChange={(mapper) => updateList('dataTypes', mapper)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ----- Shared utils -----
function genId(prefix) {
  return `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

// ----- Tech Stack tab -----
function TechConfigPanel({ list, onChange }) {
  const [draftName, setDraftName] = useState('');
  const [draftKind, setDraftKind] = useState('bahasa');

  const add = () => {
    const v = draftName.trim();
    if (!v) return;
    onChange(arr => [...arr, { id: genId('tech'), name: v, kind: draftKind, active: true }]);
    setDraftName('');
  };

  const grouped = TECH_KIND_OPTIONS.map(g => ({
    ...g,
    items: list.filter(t => t.kind === g.id),
  }));

  return (
    <div className="konfig-panel">
      <div className="konfig-add-row">
        <input
          className="admin-input"
          placeholder="Nama tech baru (contoh: Rust, Tailwind, Prisma)"
          value={draftName}
          onChange={e => setDraftName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') add(); }}
        />
        <select
          className="admin-input"
          value={draftKind}
          onChange={e => setDraftKind(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          {TECH_KIND_OPTIONS.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}
        </select>
        <button className="admin-btn-primary" onClick={add} disabled={!draftName.trim()} type="button">+ Tambah</button>
      </div>

      {grouped.map(g => (
        <div key={g.id} className="konfig-group">
          <div className="konfig-group-title">{g.label} <span className="konfig-group-count">({g.items.length})</span></div>
          {g.items.length === 0 && <div className="konfig-empty">Belum ada item dalam kategori ini.</div>}
          {g.items.map(item => (
            <ConfigRow
              key={item.id}
              item={item}
              onToggle={() => onChange(arr => arr.map(x => x.id === item.id ? { ...x, active: !x.active } : x))}
              onRename={(name) => onChange(arr => arr.map(x => x.id === item.id ? { ...x, name } : x))}
              onChangeKind={(kind) => onChange(arr => arr.map(x => x.id === item.id ? { ...x, kind } : x))}
              kindOptions={TECH_KIND_OPTIONS}
              onDelete={() => {
                if (confirm(`Hapus "${item.name}"? Aksi ini tidak bisa dibatalkan.`)) {
                  onChange(arr => arr.filter(x => x.id !== item.id));
                }
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ----- UML/DB tab -----
function UmlConfigPanel({ list, onChange }) {
  const [draftName, setDraftName] = useState('');
  const [draftKind, setDraftKind] = useState('uml');

  const add = () => {
    const v = draftName.trim();
    if (!v) return;
    onChange(arr => [...arr, { id: genId('uml'), name: v, kind: draftKind, active: true }]);
    setDraftName('');
  };

  const grouped = UML_KIND_OPTIONS.map(g => ({
    ...g,
    items: list.filter(t => t.kind === g.id),
  }));

  return (
    <div className="konfig-panel">
      <div className="konfig-add-row">
        <input
          className="admin-input"
          placeholder="Nama jenis baru (contoh: ERD lanjutan)"
          value={draftName}
          onChange={e => setDraftName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') add(); }}
        />
        <select
          className="admin-input"
          value={draftKind}
          onChange={e => setDraftKind(e.target.value)}
          style={{ maxWidth: 180 }}
        >
          {UML_KIND_OPTIONS.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}
        </select>
        <button className="admin-btn-primary" onClick={add} disabled={!draftName.trim()} type="button">+ Tambah</button>
      </div>

      {grouped.map(g => (
        <div key={g.id} className="konfig-group">
          <div className="konfig-group-title">{g.label} <span className="konfig-group-count">({g.items.length})</span></div>
          {g.items.length === 0 && <div className="konfig-empty">Belum ada item dalam kategori ini.</div>}
          {g.items.map(item => (
            <ConfigRow
              key={item.id}
              item={item}
              onToggle={() => onChange(arr => arr.map(x => x.id === item.id ? { ...x, active: !x.active } : x))}
              onRename={(name) => onChange(arr => arr.map(x => x.id === item.id ? { ...x, name } : x))}
              onChangeKind={(kind) => onChange(arr => arr.map(x => x.id === item.id ? { ...x, kind } : x))}
              kindOptions={UML_KIND_OPTIONS}
              onDelete={() => {
                if (confirm(`Hapus "${item.name}"? Aksi ini tidak bisa dibatalkan.`)) {
                  onChange(arr => arr.filter(x => x.id !== item.id));
                }
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ----- Revisi tab -----
function RevisionConfigPanel({ list, onChange }) {
  const [draftName, setDraftName] = useState('');

  const add = () => {
    const v = draftName.trim();
    if (!v) return;
    onChange(arr => [...arr, { id: genId('rev'), name: v, active: true }]);
    setDraftName('');
  };

  return (
    <div className="konfig-panel">
      <div className="konfig-add-row">
        <input
          className="admin-input"
          placeholder="Nama jenis revisi (contoh: Migrasi Database)"
          value={draftName}
          onChange={e => setDraftName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') add(); }}
        />
        <button className="admin-btn-primary" onClick={add} disabled={!draftName.trim()} type="button">+ Tambah</button>
      </div>

      <div className="konfig-group">
        {list.length === 0 && <div className="konfig-empty">Belum ada jenis revisi.</div>}
        {list.map(item => (
          <ConfigRow
            key={item.id}
            item={item}
            onToggle={() => onChange(arr => arr.map(x => x.id === item.id ? { ...x, active: !x.active } : x))}
            onRename={(name) => onChange(arr => arr.map(x => x.id === item.id ? { ...x, name } : x))}
            onDelete={() => {
              if (confirm(`Hapus "${item.name}"? Aksi ini tidak bisa dibatalkan.`)) {
                onChange(arr => arr.filter(x => x.id !== item.id));
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ----- Operasi tab -----
function OperationConfigPanel({ list, onChange }) {
  const [draftLabel, setDraftLabel] = useState('');
  const [draftDesc, setDraftDesc] = useState('');
  const [draftCats, setDraftCats] = useState(['master']);

  const add = () => {
    const v = draftLabel.trim();
    if (!v || draftCats.length === 0) return;
    onChange(arr => [...arr, {
      id: genId('op'),
      label: v,
      desc: draftDesc.trim(),
      categories: [...draftCats],
      active: true,
    }]);
    setDraftLabel('');
    setDraftDesc('');
    setDraftCats(['master']);
  };

  const toggleDraftCat = (cat) => {
    setDraftCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  return (
    <div className="konfig-panel">
      <div className="konfig-form-card">
        <div className="konfig-form-title">Tambah Operasi Baru</div>
        <input
          className="admin-input"
          placeholder="Nama operasi (contoh: Approve)"
          value={draftLabel}
          onChange={e => setDraftLabel(e.target.value)}
        />
        <input
          className="admin-input"
          placeholder="Deskripsi singkat"
          value={draftDesc}
          onChange={e => setDraftDesc(e.target.value)}
        />
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>Berlaku untuk kategori:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {OP_CATEGORY_OPTIONS.map(c => (
              <button
                key={c.id}
                type="button"
                className={'konfig-cat-chip' + (draftCats.includes(c.id) ? ' active' : '')}
                onClick={() => toggleDraftCat(c.id)}
              >
                {draftCats.includes(c.id) ? '✓ ' : ''}{c.label}
              </button>
            ))}
          </div>
        </div>
        <button className="admin-btn-primary" onClick={add} disabled={!draftLabel.trim() || draftCats.length === 0} type="button">+ Tambah Operasi</button>
      </div>

      <div className="konfig-group">
        <div className="konfig-group-title">Daftar Operasi <span className="konfig-group-count">({list.length})</span></div>
        {list.length === 0 && <div className="konfig-empty">Belum ada operasi.</div>}
        {list.map(item => (
          <OperationRow
            key={item.id}
            item={item}
            onToggle={() => onChange(arr => arr.map(x => x.id === item.id ? { ...x, active: !x.active } : x))}
            onPatch={(patch) => onChange(arr => arr.map(x => x.id === item.id ? { ...x, ...patch } : x))}
            onDelete={() => {
              if (confirm(`Hapus "${item.label}"? Aksi ini tidak bisa dibatalkan.`)) {
                onChange(arr => arr.filter(x => x.id !== item.id));
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ----- Tipe Data tab -----
function DataTypeConfigPanel({ list, onChange }) {
  const [draftLabel, setDraftLabel] = useState('');

  const add = () => {
    const v = draftLabel.trim();
    if (!v) return;
    onChange(arr => [...arr, { id: genId('dt'), label: v, active: true }]);
    setDraftLabel('');
  };

  return (
    <div className="konfig-panel">
      <div className="konfig-add-row">
        <input
          className="admin-input"
          placeholder="Nama tipe data (contoh: URL, JSON)"
          value={draftLabel}
          onChange={e => setDraftLabel(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') add(); }}
        />
        <button className="admin-btn-primary" onClick={add} disabled={!draftLabel.trim()} type="button">+ Tambah</button>
      </div>

      <div className="konfig-group">
        {list.length === 0 && <div className="konfig-empty">Belum ada tipe data.</div>}
        {list.map(item => (
          <ConfigRow
            key={item.id}
            item={{ ...item, name: item.label }}
            onToggle={() => onChange(arr => arr.map(x => x.id === item.id ? { ...x, active: !x.active } : x))}
            onRename={(name) => onChange(arr => arr.map(x => x.id === item.id ? { ...x, label: name } : x))}
            onDelete={() => {
              if (confirm(`Hapus "${item.label}"? Aksi ini tidak bisa dibatalkan.`)) {
                onChange(arr => arr.filter(x => x.id !== item.id));
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ----- Generic row component -----
function ConfigRow({ item, onToggle, onRename, onChangeKind, onDelete, kindOptions }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.name);

  useEffect(() => { setDraft(item.name); }, [item.name]);

  const commit = () => {
    const v = draft.trim();
    if (v && v !== item.name) onRename(v);
    else setDraft(item.name);
    setEditing(false);
  };

  return (
    <div className={'konfig-row' + (item.active ? '' : ' inactive')}>
      <div className="konfig-row-main">
        {editing ? (
          <input
            autoFocus
            className="admin-input"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(item.name); setEditing(false); } }}
            style={{ padding: '6px 10px' }}
          />
        ) : (
          <span className="konfig-row-name" onClick={() => setEditing(true)} title="Klik untuk edit">{item.name}</span>
        )}
      </div>
      {kindOptions && (
        <select
          className="admin-input"
          value={item.kind}
          onChange={e => onChangeKind && onChangeKind(e.target.value)}
          style={{ padding: '6px 10px', maxWidth: 170 }}
        >
          {kindOptions.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}
        </select>
      )}
      <label className="konfig-toggle" title={item.active ? 'Aktif (tampil di form)' : 'Nonaktif (tersembunyi)'}>
        <input type="checkbox" checked={item.active} onChange={onToggle} />
        <span className="konfig-toggle-track">
          <span className="konfig-toggle-thumb" />
        </span>
        <span className="konfig-toggle-label">{item.active ? 'Aktif' : 'Nonaktif'}</span>
      </label>
      <button className="row-delete" onClick={onDelete} type="button" title="Hapus">×</button>
    </div>
  );
}

function OperationRow({ item, onToggle, onPatch, onDelete }) {
  const [editingLabel, setEditingLabel] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [draftLabel, setDraftLabel] = useState(item.label);
  const [draftDesc, setDraftDesc] = useState(item.desc || '');

  useEffect(() => { setDraftLabel(item.label); }, [item.label]);
  useEffect(() => { setDraftDesc(item.desc || ''); }, [item.desc]);

  const commitLabel = () => {
    const v = draftLabel.trim();
    if (v && v !== item.label) onPatch({ label: v });
    else setDraftLabel(item.label);
    setEditingLabel(false);
  };
  const commitDesc = () => {
    if (draftDesc !== item.desc) onPatch({ desc: draftDesc });
    setEditingDesc(false);
  };

  const toggleCat = (cat) => {
    const cats = item.categories || [];
    const next = cats.includes(cat) ? cats.filter(c => c !== cat) : [...cats, cat];
    onPatch({ categories: next });
  };

  return (
    <div className={'konfig-row konfig-row-op' + (item.active ? '' : ' inactive')}>
      <div className="konfig-row-main">
        {editingLabel ? (
          <input
            autoFocus
            className="admin-input"
            value={draftLabel}
            onChange={e => setDraftLabel(e.target.value)}
            onBlur={commitLabel}
            onKeyDown={e => { if (e.key === 'Enter') commitLabel(); if (e.key === 'Escape') { setDraftLabel(item.label); setEditingLabel(false); } }}
            style={{ padding: '6px 10px' }}
          />
        ) : (
          <div onClick={() => setEditingLabel(true)} title="Klik untuk edit" style={{ cursor: 'pointer' }}>
            <span className="konfig-row-name">{item.label}</span>
          </div>
        )}
        {editingDesc ? (
          <input
            autoFocus
            className="admin-input"
            value={draftDesc}
            onChange={e => setDraftDesc(e.target.value)}
            onBlur={commitDesc}
            onKeyDown={e => { if (e.key === 'Enter') commitDesc(); if (e.key === 'Escape') { setDraftDesc(item.desc || ''); setEditingDesc(false); } }}
            placeholder="Deskripsi"
            style={{ padding: '6px 10px', fontSize: 12 }}
          />
        ) : (
          <div className="konfig-row-desc" onClick={() => setEditingDesc(true)} title="Klik untuk edit">{item.desc || <em style={{ color: 'var(--text-faint)' }}>klik untuk tambah deskripsi</em>}</div>
        )}
        <div className="konfig-cat-row">
          {OP_CATEGORY_OPTIONS.map(c => {
            const on = (item.categories || []).includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                className={'konfig-cat-chip' + (on ? ' active' : '')}
                onClick={() => toggleCat(c.id)}
              >
                {on ? '✓ ' : ''}{c.label}
              </button>
            );
          })}
        </div>
      </div>
      <label className="konfig-toggle" title={item.active ? 'Aktif (tampil di form)' : 'Nonaktif (tersembunyi)'}>
        <input type="checkbox" checked={item.active} onChange={onToggle} />
        <span className="konfig-toggle-track">
          <span className="konfig-toggle-thumb" />
        </span>
        <span className="konfig-toggle-label">{item.active ? 'Aktif' : 'Nonaktif'}</span>
      </label>
      <button className="row-delete" onClick={onDelete} type="button" title="Hapus">×</button>
    </div>
  );
}

// ============================================
// SETTINGS
// ============================================
function PageSettings({ settings, user }) {
  const [wa, setWa] = useState(settings.adminWa || '6281234567890');
  const [studio, setStudio] = useState(settings.studioName || 'Kerjain Aja');
  const [signer, setSigner] = useState(settings.signerName || '');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  // sync local state when remote settings change
  useEffect(() => {
    setWa(settings.adminWa || '6281234567890');
    setStudio(settings.studioName || 'Kerjain Aja');
    setSigner(settings.signerName || '');
  }, [settings.adminWa, settings.studioName, settings.signerName]);

  const save = async () => {
    setSaving(true);
    try {
      await window.KAFire.Settings.save({ studioName: studio, adminWa: wa, signerName: signer });
      setSavedAt(Date.now());
    } catch (e) { alert('Gagal simpan: ' + e.message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-head">
          <div>
            <div className="admin-card-title">Pengaturan Studio</div>
            <div className="admin-card-sub">Info dasar yang muncul di form customer & dokumen invoice</div>
          </div>
        </div>
        <div className="settings-grid">
          <div>
            <label className="settings-label">Nama Studio</label>
            <input className="admin-input" value={studio} onChange={e => setStudio(e.target.value)} />
          </div>
          <div>
            <label className="settings-label">WhatsApp Admin (untuk konfirmasi customer)</label>
            <input className="admin-input" value={wa} onChange={e => setWa(e.target.value.replace(/\D/g, ''))} placeholder="6281234567890" />
            <div className="settings-hint">Format: 62xxxx (tanpa +/spasi). Muncul di success screen customer.</div>
          </div>
          <div>
            <label className="settings-label">Nama Penandatangan Invoice / BAST</label>
            <input className="admin-input" value={signer} onChange={e => setSigner(e.target.value)} placeholder="Contoh: Andi Pratama" />
            <div className="settings-hint">Muncul di kolom tanda tangan saat export PDF.</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <button className="admin-btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan'}
          </button>
          {!saving && savedAt && (Date.now() - savedAt < 3500) && (
            <span className="konfig-save-status saved">✓ Tersimpan</span>
          )}
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-head">
          <div>
            <div className="admin-card-title">Ganti Password Admin</div>
            <div className="admin-card-sub">Login: <strong>{user.email}</strong> — password disinkron via Firebase Auth.</div>
          </div>
        </div>
        <ChangePasswordForm />
      </div>

      <div className="admin-card">
        <div className="admin-card-head">
          <div>
            <div className="admin-card-title">Data Storage</div>
            <div className="admin-card-sub">Data tersimpan di Cloud Firestore (region asia-southeast2 / Jakarta)</div>
          </div>
        </div>
        <div className="settings-grid">
          <button className="admin-btn-ghost" onClick={async () => {
            try {
              const orders = await new Promise((resolve, reject) => {
                const unsub = window.KAFire.Orders.subscribe(
                  (list) => { unsub(); resolve(list); },
                  (err)  => { unsub(); reject(err); }
                );
              });
              const cfg = await window.KAFire.Config.load();
              const s   = await window.KAFire.Settings.load();
              const data = { orders, config: cfg, settings: s, exportedAt: new Date().toISOString() };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `kerjain-aja-backup-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            } catch (e) { alert('Gagal export: ' + e.message); }
          }}>↓ Export Backup (JSON)</button>
        </div>
      </div>
    </div>
  );
}

function ChangePasswordForm() {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [msg, setMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setMsg(null);
    if (newPw.length < 6) {
      setMsg({ tone: 'error', text: 'Password baru minimal 6 karakter (syarat Firebase Auth).' }); return;
    }
    if (newPw !== confirmPw) {
      setMsg({ tone: 'error', text: 'Konfirmasi password baru tidak cocok.' }); return;
    }
    setSubmitting(true);
    const res = await window.KAFire.Auth.changePassword(oldPw, newPw);
    setSubmitting(false);
    if (res.ok) {
      setOldPw(''); setNewPw(''); setConfirmPw('');
      setMsg({ tone: 'success', text: 'Password berhasil diubah.' });
    } else {
      setMsg({ tone: 'error', text: res.error });
    }
  };

  return (
    <div className="settings-grid">
      <div>
        <label className="settings-label">Password lama</label>
        <input className="admin-input" type="password" autoComplete="current-password" value={oldPw} onChange={e => setOldPw(e.target.value)} placeholder="••••••" />
      </div>
      <div>
        <label className="settings-label">Password baru</label>
        <input className="admin-input" type="password" autoComplete="new-password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="min. 6 karakter" />
      </div>
      <div>
        <label className="settings-label">Konfirmasi password baru</label>
        <input className="admin-input" type="password" autoComplete="new-password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="ulangi password baru" />
      </div>
      {msg && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: msg.tone === 'error' ? 'rgba(220,38,38,0.1)' : 'rgba(22,163,74,0.1)',
          color: msg.tone === 'error' ? '#dc2626' : '#16a34a',
        }}>{msg.text}</div>
      )}
      <button className="admin-btn-primary" onClick={submit} disabled={submitting} style={{ alignSelf: 'flex-start' }}>
        {submitting ? 'Memproses…' : 'Ubah Password'}
      </button>
    </div>
  );
}

// ============================================
// INVOICE / BAST EDITOR (inline in modal)
// ============================================

const EMPTY_INVOICE = () => ({
  number: '',
  date: new Date().toISOString().slice(0, 10),
  dueDate: '',
  items: [{ desc: '', qty: 1, unitPrice: 0 }],
  discount: 0,
  tax: 0,
  paid: 0,
  notes: '',
  bastDate: '',
  customerSigner: '',
  studioSigner: '',
});

function InvoiceBlock({ order, settings, onSave }) {
  const [editing, setEditing] = useState(false);
  const [inv, setInv] = useState(() => order.invoice || EMPTY_INVOICE());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setInv(order.invoice || EMPTY_INVOICE());
  }, [order.id, order.invoice]);

  // Auto-fill invoice number on first edit if empty
  useEffect(() => {
    if (editing && !inv.number) {
      setInv(s => ({ ...s, number: 'INV-' + (order.code || '').replace(/^DV-/, '') }));
    }
    // eslint-disable-next-line
  }, [editing]);

  const f = order.form || {};

  const total = useMemo(() => {
    const sub = (inv.items || []).reduce((acc, it) => acc + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0);
    const afterDisc = sub - (Number(inv.discount) || 0);
    const withTax = afterDisc + (Number(inv.tax) || 0);
    const due = withTax - (Number(inv.paid) || 0);
    return { sub, afterDisc, withTax, due };
  }, [inv]);

  const updItem = (i, patch) => {
    setInv(s => ({ ...s, items: s.items.map((it, idx) => idx === i ? { ...it, ...patch } : it) }));
  };
  const addItem = () => setInv(s => ({ ...s, items: [...s.items, { desc: '', qty: 1, unitPrice: 0 }] }));
  const delItem = (i) => setInv(s => ({ ...s, items: s.items.filter((_, idx) => idx !== i) }));

  const save = async () => {
    setSaving(true);
    try {
      const clean = {
        ...inv,
        items: (inv.items || []).filter(it => it.desc || it.qty > 0 || it.unitPrice > 0),
      };
      await onSave(clean);
      setEditing(false);
    } catch (e) {
      alert('Gagal simpan invoice: ' + e.message);
    } finally { setSaving(false); }
  };

  const cancel = () => {
    setInv(order.invoice || EMPTY_INVOICE());
    setEditing(false);
  };

  const exportInvoice = (kind /* 'invoice' | 'bast' */) => {
    const url = `invoice.html?orderId=${encodeURIComponent(order.id)}&kind=${kind}`;
    window.open(url, '_blank', 'noopener,width=900,height=1100');
  };

  // === View mode ===
  if (!editing) {
    const hasInvoice = !!(order.invoice && order.invoice.items && order.invoice.items.length > 0);
    return (
      <div className="invoice-view">
        <div className="invoice-view-head">
          <div>
            <div className="invoice-view-title">Invoice & BAST</div>
            <div className="invoice-view-sub">
              {hasInvoice
                ? `${order.invoice.number || '(no number)'} · Total ${rupiah(total.withTax)}`
                : 'Belum dibuat — klik "Buat Invoice" untuk input harga & generate PDF.'}
            </div>
          </div>
          <div className="invoice-view-actions">
            {hasInvoice && (
              <>
                <button className="admin-btn-ghost" onClick={() => exportInvoice('invoice')} type="button">📄 Export Invoice</button>
                <button className="admin-btn-ghost" onClick={() => exportInvoice('bast')} type="button">📋 Export BAST</button>
              </>
            )}
            <button className="admin-btn-primary" onClick={() => setEditing(true)} type="button">
              {hasInvoice ? '✎ Edit' : '+ Buat Invoice'}
            </button>
          </div>
        </div>

        {hasInvoice && (
          <div className="invoice-summary">
            <div><span>Subtotal</span><strong>{rupiah(total.sub)}</strong></div>
            {order.invoice.discount > 0 && <div><span>Diskon</span><strong>−{rupiah(order.invoice.discount)}</strong></div>}
            {order.invoice.tax > 0 && <div><span>Pajak</span><strong>+{rupiah(order.invoice.tax)}</strong></div>}
            <div className="invoice-summary-total"><span>Total</span><strong>{rupiah(total.withTax)}</strong></div>
            {order.invoice.paid > 0 && <div><span>Sudah dibayar</span><strong>−{rupiah(order.invoice.paid)}</strong></div>}
            {order.invoice.paid !== total.withTax && (
              <div className={'invoice-summary-due ' + (total.due > 0 ? 'unpaid' : 'paid')}>
                <span>{total.due > 0 ? 'Sisa tagihan' : 'Lunas'}</span>
                <strong>{rupiah(Math.max(0, total.due))}</strong>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // === Edit mode ===
  return (
    <div className="invoice-edit">
      <div className="invoice-edit-head">
        <div className="invoice-edit-title">{order.invoice ? 'Edit Invoice' : 'Buat Invoice'}</div>
        <div className="invoice-edit-meta">untuk {f.name} · {order.code}</div>
      </div>

      <div className="invoice-edit-grid">
        <div>
          <label className="settings-label">No. Invoice</label>
          <input className="admin-input" value={inv.number} onChange={e => setInv(s => ({ ...s, number: e.target.value }))} placeholder="INV-XXXX" />
        </div>
        <div>
          <label className="settings-label">Tanggal Invoice</label>
          <input className="admin-input" type="date" value={inv.date} onChange={e => setInv(s => ({ ...s, date: e.target.value }))} />
        </div>
        <div>
          <label className="settings-label">Jatuh Tempo</label>
          <input className="admin-input" type="date" value={inv.dueDate} onChange={e => setInv(s => ({ ...s, dueDate: e.target.value }))} />
        </div>
        <div>
          <label className="settings-label">Tanggal BAST</label>
          <input className="admin-input" type="date" value={inv.bastDate} onChange={e => setInv(s => ({ ...s, bastDate: e.target.value }))} />
        </div>
      </div>

      <div className="invoice-items">
        <div className="invoice-items-head">
          <div style={{ flex: 1 }}>Deskripsi Pekerjaan</div>
          <div style={{ width: 70, textAlign: 'right' }}>Qty</div>
          <div style={{ width: 140, textAlign: 'right' }}>Harga Satuan</div>
          <div style={{ width: 140, textAlign: 'right' }}>Total</div>
          <div style={{ width: 32 }}></div>
        </div>
        {inv.items.map((it, i) => (
          <div key={i} className="invoice-item-row">
            <input className="admin-input invoice-item-desc" placeholder="Contoh: Build aplikasi inventory" value={it.desc} onChange={e => updItem(i, { desc: e.target.value })} />
            <input className="admin-input invoice-item-qty" type="number" min="0" value={it.qty} onChange={e => updItem(i, { qty: e.target.value })} />
            <input className="admin-input invoice-item-price" type="number" min="0" value={it.unitPrice} onChange={e => updItem(i, { unitPrice: e.target.value })} />
            <div className="invoice-item-total">{rupiah((Number(it.qty) || 0) * (Number(it.unitPrice) || 0))}</div>
            <button className="row-delete" onClick={() => delItem(i)} type="button" disabled={inv.items.length === 1}>×</button>
          </div>
        ))}
        <button className="admin-btn-ghost" onClick={addItem} type="button" style={{ alignSelf: 'flex-start', marginTop: 6 }}>+ Tambah Item</button>
      </div>

      <div className="invoice-totals">
        <div className="invoice-totals-grid">
          <div><span>Subtotal</span><strong>{rupiah(total.sub)}</strong></div>
          <div>
            <span>Diskon (Rp)</span>
            <input className="admin-input invoice-amount-input" type="number" min="0" value={inv.discount} onChange={e => setInv(s => ({ ...s, discount: e.target.value }))} />
          </div>
          <div>
            <span>Pajak / PPN (Rp)</span>
            <input className="admin-input invoice-amount-input" type="number" min="0" value={inv.tax} onChange={e => setInv(s => ({ ...s, tax: e.target.value }))} />
          </div>
          <div className="invoice-totals-final"><span>Total</span><strong>{rupiah(total.withTax)}</strong></div>
          <div>
            <span>Sudah dibayar (Rp)</span>
            <input className="admin-input invoice-amount-input" type="number" min="0" value={inv.paid} onChange={e => setInv(s => ({ ...s, paid: e.target.value }))} />
          </div>
          <div className={'invoice-totals-due ' + (total.due > 0 ? 'unpaid' : 'paid')}>
            <span>{total.due > 0 ? 'Sisa tagihan' : 'Lunas'}</span>
            <strong>{rupiah(Math.max(0, total.due))}</strong>
          </div>
        </div>
      </div>

      <div className="invoice-edit-grid">
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="settings-label">Catatan tambahan</label>
          <textarea className="admin-input" rows="3" value={inv.notes} onChange={e => setInv(s => ({ ...s, notes: e.target.value }))} placeholder="Catatan untuk pelanggan, garansi, terms, dll." />
        </div>
        <div>
          <label className="settings-label">Penandatangan Pelanggan</label>
          <input className="admin-input" value={inv.customerSigner} onChange={e => setInv(s => ({ ...s, customerSigner: e.target.value }))} placeholder={f.name} />
        </div>
        <div>
          <label className="settings-label">Penandatangan Studio</label>
          <input className="admin-input" value={inv.studioSigner} onChange={e => setInv(s => ({ ...s, studioSigner: e.target.value }))} placeholder={settings?.signerName || 'Admin'} />
        </div>
      </div>

      <div className="invoice-edit-actions">
        <button className="admin-btn-ghost" onClick={cancel} type="button">Batal</button>
        <button className="admin-btn-primary" onClick={save} disabled={saving} type="button">
          {saving ? 'Menyimpan…' : '💾 Simpan Invoice'}
        </button>
      </div>
    </div>
  );
}

function rupiah(n) {
  const num = Math.round(Number(n) || 0);
  return 'Rp ' + num.toLocaleString('id-ID');
}

// expose for invoice.html
window.KA_RUPIAH = rupiah;

ReactDOM.createRoot(document.getElementById('admin-root')).render(<AdminApp />);
