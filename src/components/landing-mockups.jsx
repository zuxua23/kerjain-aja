/* global React */
/* Inline app mockups for showcase + demos. Pure presentational. */

// ===================================================================
// MANUAL LEDGER — buku tulis catatan penjualan (handwritten paper)
// ===================================================================
function ManualLedgerMockup() {
  return (
    <div className="mockup paper">
      <div className="paper-content">
        <div className="paper-title">Buku Penjualan</div>
        <div className="paper-date">~ 12 Mei '26 ~</div>
        <div className="paper-table">
          <span className="paper-th">Tgl</span>
          <span className="paper-th">Item</span>
          <span className="paper-th">Qty</span>
          <span className="paper-th">Harga</span>
          <span className="paper-th">Total</span>

          <span>1/5</span><span>Kopi</span><span>12</span><span>25rb</span><span>300rb</span>

          <span>2/5</span><span>Roti</span>
          <span><s className="paper-strike">12</s> <em className="paper-fix">21</em></span>
          <span>8rb</span>
          <span className="paper-smudge">??</span>

          <span>2/5</span><span>Teh manis</span><span>5</span>
          <span className="paper-smudge">15rb</span>
          <span>—</span>

          <span>3/5</span><span>kopi</span><span>8</span><span>25.000</span><span>200rb</span>

          <span>3/5</span><span>Susu</span><span>3</span><span>15rb</span><span className="paper-fix">?</span>
        </div>
        <div className="paper-footnote">cek lagi <span className="paper-fix">!!</span></div>
      </div>
    </div>
  );
}
// Alias for backwards-compat with older imports
const ExcelChaosMockup = ManualLedgerMockup;

// ===================================================================
// SALES APP MOCKUP — clean side-nav dashboard
// ===================================================================
function SalesAppMockup({ compact = false }) {
  return (
    <div className="mockup">
      <div className="mockup-chrome">
        <div className="mockup-dot red"></div>
        <div className="mockup-dot yellow"></div>
        <div className="mockup-dot green"></div>
        <div className="mockup-url">app.kerjainaja.id/penjualan</div>
      </div>
      <div className="mockup-sidebar">
        <div className="mockup-sidebar-nav">
          <div className="mockup-sidebar-logo">
            <div className="mockup-sidebar-mark">KA</div>
            <span>Penjualan</span>
          </div>
          <div className="mockup-nav-item active"><span className="mockup-nav-dot"></span>Dashboard</div>
          <div className="mockup-nav-item"><span className="mockup-nav-dot"></span>Transaksi</div>
          <div className="mockup-nav-item"><span className="mockup-nav-dot"></span>Produk</div>
          <div className="mockup-nav-item"><span className="mockup-nav-dot"></span>Pelanggan</div>
          <div className="mockup-nav-item"><span className="mockup-nav-dot"></span>Laporan</div>
          {!compact && <div className="mockup-nav-item"><span className="mockup-nav-dot"></span>Pengaturan</div>}
        </div>
        <div className="mockup-main">
          <div className="mockup-h">Penjualan Hari Ini</div>
          <div className="mockup-stat-row">
            <div className="mockup-stat">
              <div className="mockup-stat-label">Omzet</div>
              <div className="mockup-stat-val">Rp 4.8jt</div>
              <div className="mockup-stat-trend">↑ 18%</div>
            </div>
            <div className="mockup-stat">
              <div className="mockup-stat-label">Transaksi</div>
              <div className="mockup-stat-val">87</div>
              <div className="mockup-stat-trend">↑ 12%</div>
            </div>
            <div className="mockup-stat">
              <div className="mockup-stat-label">Avg Bill</div>
              <div className="mockup-stat-val">55rb</div>
              <div className="mockup-stat-trend">↑ 4%</div>
            </div>
          </div>
          <div className="mockup-bar">
            <div className="mockup-bar-col" style={{ height: '45%' }}></div>
            <div className="mockup-bar-col" style={{ height: '60%' }}></div>
            <div className="mockup-bar-col" style={{ height: '38%' }}></div>
            <div className="mockup-bar-col" style={{ height: '72%' }}></div>
            <div className="mockup-bar-col" style={{ height: '88%' }}></div>
            <div className="mockup-bar-col" style={{ height: '65%' }}></div>
            <div className="mockup-bar-col" style={{ height: '95%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================================================================
// INVENTORY APP MOCKUP — stock table with status pills
// ===================================================================
function InventoryAppMockup({ compact = false }) {
  return (
    <div className="mockup">
      <div className="mockup-chrome">
        <div className="mockup-dot red"></div>
        <div className="mockup-dot yellow"></div>
        <div className="mockup-dot green"></div>
        <div className="mockup-url">app.kerjainaja.id/inventory</div>
      </div>
      <div className="mockup-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div className="mockup-h" style={{ margin: 0 }}>Stok Gudang</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div className="mockup-pill info">+ Tambah</div>
            <div className="mockup-pill ok">Scan QR</div>
          </div>
        </div>
        <div className="mockup-table">
          <div className="mockup-table-head" style={{ gridTemplateColumns: '1.4fr 0.7fr 0.6fr 0.8fr' }}>
            <span>Produk</span><span>SKU</span><span>Stok</span><span>Status</span>
          </div>
          <div className="mockup-table-row" style={{ gridTemplateColumns: '1.4fr 0.7fr 0.6fr 0.8fr' }}>
            <span>Kopi Arabika 250g</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>KP-001</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>124</span>
            <span><span className="mockup-pill ok">Aman</span></span>
          </div>
          <div className="mockup-table-row" style={{ gridTemplateColumns: '1.4fr 0.7fr 0.6fr 0.8fr' }}>
            <span>Susu UHT 1L</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>SU-014</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>8</span>
            <span><span className="mockup-pill warn">Menipis</span></span>
          </div>
          <div className="mockup-table-row" style={{ gridTemplateColumns: '1.4fr 0.7fr 0.6fr 0.8fr' }}>
            <span>Gula Pasir 1kg</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>GP-007</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>0</span>
            <span><span className="mockup-pill danger">Habis</span></span>
          </div>
          <div className="mockup-table-row" style={{ gridTemplateColumns: '1.4fr 0.7fr 0.6fr 0.8fr' }}>
            <span>Teh Celup Box</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>TC-023</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>67</span>
            <span><span className="mockup-pill ok">Aman</span></span>
          </div>
          {!compact && (
            <div className="mockup-table-row" style={{ gridTemplateColumns: '1.4fr 0.7fr 0.6fr 0.8fr' }}>
              <span>Roti Tawar</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>RT-002</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>15</span>
              <span><span className="mockup-pill warn">Menipis</span></span>
            </div>
          )}
        </div>
        {!compact && (
          <div style={{
            marginTop: 12,
            background: 'var(--primary-soft)',
            border: '1px solid color-mix(in oklch, var(--primary) 22%, transparent)',
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 11,
            color: 'var(--primary)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span>🔔</span>
            <span>Notifikasi: 2 produk stoknya menipis. Restock sekarang?</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ===================================================================
// FULL DEMO — Sales (richer view for modal)
// ===================================================================
function SalesAppDemo() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
      <SalesAppMockup compact={false} />
      <div style={{
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border)',
        borderRadius: 14,
        padding: '18px 20px',
      }}>
        <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          5 Transaksi Terakhir
        </div>
        <div className="mockup-table" style={{ fontSize: 12 }}>
          <div className="mockup-table-head" style={{ gridTemplateColumns: '0.6fr 1.4fr 1.4fr 0.8fr 0.8fr', fontSize: 10 }}>
            <span>Waktu</span><span>Invoice</span><span>Customer</span><span>Total</span><span>Status</span>
          </div>
          {[
            ['14:32', 'INV-0871', 'Bu Yanti', 'Rp 285k', 'ok', 'Lunas'],
            ['14:18', 'INV-0870', 'Pak Budi', 'Rp 540k', 'ok', 'Lunas'],
            ['13:57', 'INV-0869', 'Ibu Sari', 'Rp 125k', 'warn', 'Pending'],
            ['13:42', 'INV-0868', 'Cafe Kopi Lah', 'Rp 1.2jt', 'ok', 'Lunas'],
            ['13:21', 'INV-0867', 'Walk-in', 'Rp 45k', 'ok', 'Lunas'],
          ].map((row, i) => (
            <div key={i} className="mockup-table-row" style={{ gridTemplateColumns: '0.6fr 1.4fr 1.4fr 0.8fr 0.8fr' }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{row[0]}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row[1]}</span>
              <span>{row[2]}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{row[3]}</span>
              <span><span className={'mockup-pill ' + row[4]}>{row[5]}</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InventoryAppDemo() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
      <InventoryAppMockup compact={false} />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
      }}>
        {[
          { label: 'Total SKU', val: '347', sub: 'aktif di sistem' },
          { label: 'Nilai Stok', val: 'Rp 142jt', sub: 'real-time valuation' },
          { label: 'Perlu Restock', val: '23', sub: 'di bawah min. stok' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border)',
            borderRadius: 12,
            padding: '14px 16px',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {s.label}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 800, marginTop: 4, letterSpacing: '-0.02em' }}>
              {s.val}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// expose globals
Object.assign(window, {
  ExcelChaosMockup,
  ManualLedgerMockup,
  SalesAppMockup,
  InventoryAppMockup,
  SalesAppDemo,
  InventoryAppDemo,
});
