/* global React, ReactDOM, ManualLedgerMockup, SalesAppMockup,
   ProblemSection, ShowcaseSection, JokiSection, TrustSection, FinalCTA, Footer,
   LP_ICONS, WA_NUM, WA_MSG */
const LI = window.LP_ICONS;

function LandingNav() {
  return (
    <nav className="lp-nav">
      <div className="lp-nav-inner">
        <a className="lp-nav-logo" href="#top">
          <span className="lp-nav-mark">KA</span>
          <span>Kerjain Aja</span>
        </a>
        <div className="lp-nav-links">
          <a className="lp-nav-link" href="#masalah">Masalah</a>
          <a className="lp-nav-link" href="#showcase">Aplikasi Bisnis</a>
          <a className="lp-nav-link" href="#joki">Joki Project</a>
          <a className="lp-nav-link" href="#prestasi">Teknologi</a>
          <a className="lp-nav-link" href="kontak.html">Kontak</a>
        </div>
        <a className="lp-nav-cta" href="form.html">Pesan Sekarang →</a>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section id="top" className="lp-section lp-hero">
      <div className="lp-hero-grid">
        <div className="lp-hero-copy">
          <span className="lp-eyebrow">
            <span className="lp-eyebrow-dot"></span>
            Jasa Pembuatan Web & Aplikasi
          </span>

          <h1 className="lp-h1">
            Bisnisnya udah jalan.<br />
            <span className="lp-serif">Sistemnya</span> masih <span className="lp-em">manual?</span>
          </h1>

          <p className="lp-lead lp-hero-sub">
            Kami bantu UMKM, perusahaan, dan anak kuliah ganti pencatatan
            <strong> manual yang berantakan </strong>
            jadi aplikasi rapi yang bikin kerjaan
            <strong> 10× lebih cepet</strong>. Plus, kami juga
            <em> nge-joki project kuliah </em> kalo lu udah mepet deadline.
          </p>

          <div className="lp-hero-ctas">
            <a className="lp-btn lp-btn-primary" href="form.html">
              {LI.arrow} Pesan Sekarang
            </a>
            <a className="lp-btn lp-btn-wa" href={`https://wa.me/${WA_NUM}?text=${WA_MSG}`} target="_blank" rel="noopener">
              {LI.whatsapp} Konsultasi Gratis
            </a>
          </div>

          <div className="lp-trust-row">
            <span><span className="lp-trust-check">✓</span> Buat UMKM & Perusahaan</span>
            <span><span className="lp-trust-check">✓</span> Bisa Joki Project Kuliah</span>
            <span><span className="lp-trust-check">✓</span> Garansi Revisi sampai ACC</span>
          </div>
        </div>

        {/* HERO VISUAL: Manual paper → clean app transformation */}
        <div className="lp-hero-visual" aria-hidden="true">
          {/* Buku catatan manual — handwritten ledger */}
          <div className="lp-hv-card lp-hv-paper">
            <ManualLedgerMockup />
          </div>

          {/* Sticky note — yellow post-it */}
          <div className="lp-hv-sticky">
            <span className="lp-hv-sticky-small">Reminder</span>
            Lupa input<br />kemarin!!
          </div>

          {/* Nota / receipt strip */}
          <div className="lp-hv-nota">
            <div className="lp-hv-nota-head">NOTA · #0247</div>
            <div className="lp-hv-nota-line"><span>Kopi × 2</span><span>50rb</span></div>
            <div className="lp-hv-nota-line"><span>Roti × 1</span><span>8rb</span></div>
            <div className="lp-hv-nota-line dim"><span>Teh × 3</span><span>30rb</span></div>
            <div className="lp-hv-nota-total"><span>TOTAL</span><span>88rb</span></div>
            <div className="lp-hv-nota-thanks">~ trims! ~</div>
          </div>

          {/* Clean app mockup */}
          <div className="lp-hv-card lp-hv-app">
            <SalesAppMockup compact />
          </div>

          {/* Stat floaters */}
          <div className="lp-hv-stat lp-hv-stat-1">
            <div className="lp-hv-stat-icon green">↑</div>
            <div>
              <div className="lp-hv-stat-num">10×</div>
              <div className="lp-hv-stat-label">lebih cepet rekap</div>
            </div>
          </div>

          <div className="lp-hv-stat lp-hv-stat-2">
            <div className="lp-hv-stat-icon">✓</div>
            <div>
              <div className="lp-hv-stat-num">0 typo</div>
              <div className="lp-hv-stat-label">auto-itung total</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingApp() {
  return (
    <div className="landing">
      <LandingNav />
      <main>
        <HeroSection />
        <ProblemSection />
        <ShowcaseSection />
        <JokiSection />
        <TrustSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('landing-root')).render(<LandingApp />);
