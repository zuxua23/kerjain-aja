const { useEffect: lpUseEffect, useState: lpUseState } = React;
const I = {
  folder: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/><path d="M3 11h18"/></svg>,
  money: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="M16 7c0-1.7-1.8-3-4-3s-4 1.3-4 3 1.8 3 4 3 4 1.3 4 3-1.8 3-4 3-4-1.3-4-3"/></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  ghost: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a7 7 0 0 0-7 7v10l2.5-1.5L10 20l2-1.5 2 1.5 2.5-1.5L19 20V10a7 7 0 0 0-7-7Z"/><circle cx="9.5" cy="11" r="1" fill="currentColor"/><circle cx="14.5" cy="11" r="1" fill="currentColor"/></svg>,
  brain: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3a3 3 0 0 0-3 3v.5a2.5 2.5 0 0 0-2 4A3 3 0 0 0 6 16v1a3 3 0 0 0 6 0V3a3 3 0 0 0-3 0Z"/><path d="M15 3a3 3 0 0 1 3 3v.5a2.5 2.5 0 0 1 2 4A3 3 0 0 1 18 16v1a3 3 0 0 1-6 0"/></svg>,
  box: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="m3 8 9 5 9-5"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>,
  chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 14l3-3 4 4 5-6"/></svg>,
  zap: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 5v6c0 5 3.5 9.4 8 11 4.5-1.6 8-6 8-11V5l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>,
  whatsapp: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.8-.9-2.1-1-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5 0-.2 0-.4-.1-.5 0-.1-.7-1.6-.9-2.2-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1-1.1 2.5s1.1 3 1.3 3.2c.2.2 2.2 3.4 5.4 4.7.7.3 1.3.5 1.8.6.8.3 1.5.2 2 .1.6-.1 1.8-.7 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.3ZM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.3c1.5.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2Zm0 18c-1.5 0-3-.4-4.3-1.1l-.3-.2-3.2.8.8-3.1-.2-.3C4.3 14.8 4 13.4 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8Z"/></svg>,
  arrow: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
  play: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7Z"/></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>,
  trophy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4h8v4a4 4 0 0 1-8 0V4Z"/><path d="M16 5h3v2a3 3 0 0 1-3 3M8 5H5v2a3 3 0 0 0 3 3"/><path d="M12 12v4M9 20h6v-4H9v4Z"/></svg>,
  spark: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>,
};

// =================================================================
// PAIN POINTS DATA
// =================================================================
const PAIN_POINTS = [
  {
    icon: I.folder,
    title: 'Catatan Tercecer di Buku & Kertas',
    desc: 'Buku tulis, nota kasir, kertas catatan, sticky note — semua nyebar. Pas dicari, lupa naro di mana.',
    quote: '“Buku catetan kemarin di mana ya?”',
  },
  {
    icon: I.money,
    title: 'Salah Input Satu Angka, Rugi Sebulan',
    desc: 'Cuma satu typo bisa bikin laporan jeblok. Susah dicek satu-satu karena rumusnya udah kebablasan.',
    quote: '“Lho kok minus? Padahal jualan rame…”',
  },
  {
    icon: I.clock,
    title: 'Lembur 3 Hari Buat Rekap Bulanan',
    desc: 'Tiap awal bulan, tim lu nggak tidur cuma buat nyatuin data dari banyak file & banyak orang.',
    quote: '“Bos, laporan masih digabungin nih…”',
  },
  {
    icon: I.ghost,
    title: 'Data Hilang Tanpa Jejak',
    desc: 'Laptop ngadat, flashdisk ilang, atau accidentally close without save. Kerjaan sebulan tinggal kenangan.',
    quote: '“Tadi belum ke-save ya? 😭”',
  },
  {
    icon: I.brain,
    title: 'Karyawan Baru Bingung Seminggu',
    desc: 'Tiap orang punya gaya nyatet sendiri-sendiri. Onboarding tim baru jadi misi mustahil tiap kali.',
    quote: '“Ini diisi ke kolom mana ya?”',
  },
  {
    icon: I.box,
    title: 'Cek Stok Harus Bolak-Balik Gudang',
    desc: 'Customer nanya stok via WA, lu masih lari ke gudang & hitungin satu-satu sambil keringetan.',
    quote: '“Bentar ya kak, gw cek dulu…”',
  },
];

function ProblemSection() {
  return (
    <section id="masalah" className="lp-section lp-problem">
      <div className="lp-problem-head">
        <span className="lp-eyebrow"><span className="lp-eyebrow-dot"></span>Masalah Klasik UMKM</span>
        <h2 className="lp-h2">Lu pasti familiar sama <span className="lp-serif">drama</span> kayak gini…</h2>
        <p className="lp-lead">Kalo minimal 2 dari 6 ini bikin lu nyengir miris, berarti udah waktunya bisnis lu naik kelas.</p>
      </div>

      <div className="lp-problem-grid">
        {PAIN_POINTS.map((p, i) => (
          <div key={i} className="lp-pain-card">
            <span className="lp-pain-num">{String(i + 1).padStart(2, '0')} / 06</span>
            <div className="lp-pain-icon">{p.icon}</div>
            <h3 className="lp-pain-title">{p.title}</h3>
            <p className="lp-pain-desc">{p.desc}</p>
            <div className="lp-pain-quote">{p.quote}</div>
          </div>
        ))}
      </div>

      <div className="lp-problem-footer">
        <span className="lp-mute">Bisnis lu udah jalan. </span>
        Sekarang waktunya <span className="lp-em">sistemnya ikut jalan</span>.
      </div>
    </section>
  );
}

// =================================================================
// SHOWCASE — products + demo modals
// =================================================================
const PRODUCTS = [
  {
    id: 'penjualan',
    tag: 'Best Seller',
    title: 'Aplikasi Pencatatan Penjualan',
    desc: 'Pengganti pencatatan manual di buku & kertas. Input transaksi 5 detik, invoice otomatis, laporan harian/bulanan langsung jadi.',
    features: [
      'Input transaksi 5 detik',
      'Auto-generate invoice & struk',
      'Laporan harian / bulanan',
      'Multi-user kasir & shift',
      'Database produk + harga',
      'Export ke Excel & PDF',
    ],
    Mockup: window.SalesAppMockup,
    Demo: window.SalesAppDemo,
  },
  {
    id: 'inventory',
    tag: 'Paling Diminta',
    title: 'Sistem Manajemen Inventory',
    desc: 'Lacak setiap barang masuk-keluar real-time. Stok menipis? Otomatis dapet notifikasi sebelum kehabisan.',
    features: [
      'Notif otomatis stok menipis',
      'Support barcode / QR scan',
      'History keluar-masuk barang',
      'Sinkron multi-cabang / gudang',
      'Stock opname digital',
      'Valuasi stok real-time',
    ],
    Mockup: window.InventoryAppMockup,
    Demo: window.InventoryAppDemo,
  },
];

function ShowcaseSection() {
  return (
    <section id="showcase" className="lp-section">
      <div className="lp-showcase-head">
        <div className="lp-showcase-head-left">
          <span className="lp-eyebrow"><span className="lp-eyebrow-dot"></span>Showcase</span>
          <h2 className="lp-h2">Aplikasi real, <span className="lp-serif">bukan cuma</span> mockup di slide.</h2>
        </div>
        <div className="lp-showcase-head-right">
          <p className="lp-lead">
            Berikut dua aplikasi yang paling sering kami bikin. Tampilannya rapi,
            alurnya gampang, dan semua bisa dikustom sesuai kebutuhan bisnis lu.
          </p>
        </div>
      </div>

      <div className="lp-showcase-grid">
        {PRODUCTS.map(p => {
          const Mock = p.Mockup;
          return (
            <article key={p.id} className="lp-product-card">
              <div className="lp-product-mockup">
                <Mock compact />
              </div>
              <div className="lp-product-body">
                <span className="lp-product-tag">{p.tag}</span>
                <h3 className="lp-product-title">{p.title}</h3>
                <p className="lp-product-desc">{p.desc}</p>
                <ul className="lp-product-features">
                  {p.features.map(f => <li key={f}>{f}</li>)}
                </ul>
                <div className="lp-product-actions">
                  <a className="lp-btn lp-btn-primary" href="form.html">
                    Pesan Sekarang {I.arrow}
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="lp-showcase-cta">
        <div className="lp-showcase-cta-text">
          <span className="lp-showcase-cta-title">Butuh aplikasi yang lain?</span>
          <span className="lp-showcase-cta-sub">POS resto, sistem booking, CRM, dashboard kantor — kita kerjain juga. Ceritain aja kebutuhan lu.</span>
        </div>
        <a className="lp-btn lp-btn-primary" href="form.html">
          Diskusiin Project Lu {I.arrow}
        </a>
      </div>
    </section>
  );
}

// =================================================================
// TRUST / PRESTASI
// =================================================================
const TECH_STACK = [
  { name: 'React', color: '#61DAFB', glyph: 'R'  },
  { name: 'Next.js', color: '#000000', glyph: 'N'  },
  { name: 'python', color: '#02569B', glyph: 'P' },
  { name: 'Node.js', color: '#339933', glyph: 'No' },
  { name: 'Firebase', color: '#FFA000', glyph: 'F'  },
  { name: 'Supabase', color: '#3ECF8E', glyph: 'Sb' },
  { name: 'Laravel', color: '#FF2D20', glyph: 'L'  },
  { name: 'PostgreSQL',color: '#336791', glyph: 'Pg' },
  { name: 'MySQL', color: '#00758F', glyph: 'My' },
  { name: 'SQL Server',  color: '#06B6D4', glyph: 'MS' },
  { name: 'Java',color: '#3178C6', glyph: 'J' },
  { name: 'Figma', color: '#A259FF', glyph: 'Fg' },
  { name: 'ASP.NET', color: '#000000', glyph: 'AN'  },
  { name: 'Android Java', color: '#2496ED', glyph: 'AJ' },
  { name: 'Android Kontlin', color: '#635BFF', glyph: 'AK' },
  { name: 'C#',  color: '#1F8AE0', glyph: 'C#' },
];

function TrustSection() {
  return (
    <section id="prestasi" className="lp-section lp-trust">
      <div className="lp-trust-head">
        <span className="lp-eyebrow"><span className="lp-eyebrow-dot"></span>Tech Stack</span>
        <h2 className="lp-h2">Dibangun pake <span className="lp-serif">teknologi</span> kelas industri.</h2>
        <p className="lp-lead">
          Kami pilih teknologi paling tepat buat kebutuhan & budget lu — bukan yang lagi hype doang.
          Semua stack di bawah ini udah teruji di project production.
        </p>
      </div>

      <div className="lp-tech-block">
        <div className="lp-tech-grid">
          {TECH_STACK.map(t => (
            <div key={t.name} className="lp-tech">
              <div className="lp-tech-logo" style={{
                background: t.color,
                color: 'white',
                borderRadius: 10,
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: '-0.02em',
              }}>
                {t.glyph}
              </div>
              <div className="lp-tech-name">{t.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =================================================================
// JOKI TUGAS / PROJECT KULIAH
// =================================================================
const JOKI_PERKS = [
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v14H4zM4 9h16"/><path d="m9 14 2 2 4-4"/></svg>,
    title: 'Source Code Lengkap + Dokumentasi',
    desc: 'Bukan cuma file jadi — ada komentar, README, dan struktur folder rapi yang gampang dijelasin.',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4"/></svg>,
    title: 'Garansi Revisi Sampai ACC',
    desc: 'Dosen minta revisi? Kami ikutin sampai disetujui — gratis, tanpa biaya tambahan.',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>,
    title: 'Siap Presentasi & Sidang',
    desc: 'Kami siapin alur demo, kasih tau bagian yang mungkin ditanyain dosen, plus tips defense.',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
    title: 'Bisa Ngebut, Deadline Aman',
    desc: 'Project mepet seminggu? Kami bantu — selama scope-nya masuk akal, kami usahain on-time.',
  },
];

const JOKI_TAGS = [
  { label: 'Tugas Akhir', hot: true },
  { label: 'Project UAS / UTS' },
  { label: 'Tubes Pemrograman' },
  { label: 'Web App Kuliah' },
  { label: 'Mobile App Kuliah' },
  { label: 'Capstone Project' },
  { label: 'Project Magang' },
];

function JokiSection() {
  return (
    <section id="joki" className="lp-section lp-joki">
      <div className="lp-joki-grid">
        <div className="lp-joki-copy">
          <span className="lp-eyebrow lp-joki-eyebrow">
            <span className="lp-eyebrow-dot"></span>
            Buat Anak Kuliah / Pelajar
          </span>
          <h2 className="lp-h2">
            Project tugas mepet?<br />
            <span className="lp-serif">Tenang,</span> kami yang <span className="lp-em">kerjain</span>.
          </h2>
          <p className="lp-lead">
            Bukan asal jadi — kami bikinin project lu dari nol pake stack yang kekinian,
            kode rapi, dokumentasi lengkap, dan dipastiin lulus sidang. Lu fokus belajar materinya,
            biar urusan ngoding kami yang tanggung.
          </p>

          <ul className="lp-joki-features">
            {JOKI_PERKS.map((p, i) => (
              <li key={i}>
                <div className="lp-joki-features-icon">{p.icon}</div>
                <div>
                  <div className="lp-joki-features-title">{p.title}</div>
                  <div className="lp-joki-features-desc">{p.desc}</div>
                </div>
              </li>
            ))}
          </ul>

          <div className="lp-joki-tags">
            {JOKI_TAGS.map(t => (
              <span key={t.label} className={'lp-joki-tag' + (t.hot ? ' hot' : '')}>{t.label}</span>
            ))}
          </div>
        </div>

        {/* Visual: layered "kartu tugas" notes */}
        <div className="lp-joki-visual" aria-hidden="true">
          <div className="lp-joki-note lp-joki-note-1">
            <div className="lp-joki-note-head"><span className="dot"></span>Tugas Akhir</div>
            <div className="lp-joki-note-title">Sistem Informasi Perpustakaan</div>
            <div className="lp-joki-note-meta">PHP · MySQL · Bootstrap</div>
            <div className="lp-joki-note-progress"><span style={{ width: '100%' }}></span></div>
            <span className="lp-joki-note-badge acc">✓ ACC Pembimbing</span>
          </div>

          <div className="lp-joki-note lp-joki-note-3">
            <div className="lp-joki-note-head"><span className="dot"></span>Deadline · 3 hari</div>
            <div className="lp-joki-note-title">UAS Web Programming</div>
            <span className="lp-joki-note-badge urgent">URGENT</span>
          </div>

          <div className="lp-joki-note lp-joki-note-2">
            <div className="lp-joki-note-head"><span className="dot"></span>Capstone Project</div>
            <div className="lp-joki-note-title">Aplikasi Inventaris Lab</div>
            <div className="lp-joki-note-meta">React · Node · Postgres</div>
            <div className="lp-joki-note-checks">
              <span><span className="x">✓</span>Database + ERD</span>
              <span><span className="x">✓</span>Frontend + Backend</span>
              <span><span className="x">✓</span>Dokumentasi BAB 1–5</span>
              <span><span className="x">✓</span>Slide presentasi</span>
            </div>
          </div>
        </div>
      </div>

      <div className="lp-joki-cta-row">
        <div className="lp-joki-cta-row-text">
          <span className="lp-joki-cta-row-title">Cerita dulu, gratis konsultasi.</span>
          <span className="lp-joki-cta-row-sub">Kasih tau spek tugas + deadline, kami kasih estimasi waktu & budget. No drama.</span>
        </div>
        <a className="lp-btn lp-btn-wa" href={`https://wa.me/${WA_NUM}?text=Halo%2C%20gw%20mau%20konsultasi%20joki%20project%20kuliah`} target="_blank" rel="noopener">
          {I.whatsapp} Chat Buat Joki Project
        </a>
      </div>
    </section>
  );
}

// =================================================================
// FINAL CTA
// =================================================================
const WA_NUM = '6285111212455'; 
const WA_MSG = 'Halo%20Kerjain%20Aja%21%20Gw%20mau%20konsultasi%20gratis%20soal%20bikin%20aplikasi%20buat%20bisnis%20gw.';

function FinalCTA() {
  return (
    <section id="cta" className="lp-final">
      <div className="lp-final-inner">
        <div className="lp-final-content">
          <span className="lp-final-eyebrow">
            <span className="lp-final-eyebrow-dot"></span>
            Konsultasi Gratis · Online
          </span>
          <h2 className="lp-final-title">Yuk <span className="lp-serif">ngobrol</span> dulu. Gratis, kok.</h2>
          <p className="lp-final-sub">
            30 menit via WhatsApp. Kita bahas kebutuhan bisnis lu, kasih saran sistem
            paling pas, plus rough estimate budget & timeline. Nggak ada paksaan,
            nggak ada drama jualan.
          </p>
          <div className="lp-final-buttons">
            <a className="lp-btn lp-btn-wa" href={`https://wa.me/${WA_NUM}?text=${WA_MSG}`} target="_blank" rel="noopener">
              {I.whatsapp} Chat WhatsApp Sekarang
            </a>
            <a className="lp-btn lp-btn-ghost" href="form.html" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
              Atau Isi Form Pesanan {I.arrow}
            </a>
          </div>
          <div className="lp-final-meta">
            <span><span className="lp-final-meta-dot"></span>Balas chat ≤ 15 menit (jam kerja)</span>
            <span><span className="lp-final-meta-dot"></span>Gratis estimasi & saran teknis</span>
            <span><span className="lp-final-meta-dot"></span>NDA tersedia kalau perlu</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-inner">
        <div className="lp-footer-meta">
          © 2026 Kerjain Aja · Jasa Coding buat UMKM & Perusahaan
        </div>
        <div className="lp-footer-links">
          <a href="#masalah">Masalah</a>
          <a href="#showcase">Aplikasi Bisnis</a>
          <a href="#joki">Joki Project</a>
          <a href="#prestasi">Teknologi</a>
          <a href="form.html">Pesan Jasa</a>
          <a href={`https://wa.me/${WA_NUM}`} target="_blank" rel="noopener">WhatsApp</a>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, {
  ProblemSection,
  ShowcaseSection,
  JokiSection,
  TrustSection,
  FinalCTA,
  Footer,
  LP_ICONS: I,
  WA_NUM,
  WA_MSG,
});
