/* global React, ReactDOM, TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakColor, TweakToggle,
   StepIdentity, StepService, StepScope, StepTechDesign, StepTimeline, StepSummary, SuccessScreen,
   CATEGORIES, SERVICES */
const { useState, useEffect, useMemo } = React;

const INITIAL_FORM = {
  name: '',
  wa: '',
  email: '',
  services: [],        // ['build', 'consult', ...]
  buildMode: '',       // 'simple' | 'technical' — hanya relevan kalau services includes 'build'
  simpleBuild: { description: '', goal: '', reference: '' },
  scopeBackground: '', // latar belakang singkat — diisi pada step Scope (technical mode)
  consult: { fields: '', pdm: false, activity: false, usecase: false, probis: '' },
  extras: {},          // { 'uml-db': { notes }, 'landing': { notes }, 'revision': { notes } }
  counts: { master: 0, transaksi: 0, laporan: 0, dashboard: 0 },
  items: { master: [], transaksi: [], laporan: [], dashboard: [] },
  tech: [],
  palette: '',
  customColor: '',
  notes: '',
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "primaryColor": "#5B3FE5",
  "fontPair": "jakarta"
}/*EDITMODE-END*/;

// Compute step list based on services & build mode
//   - build + buildMode='technical'  → scope + tech steps
//   - build + buildMode='simple'    → skip scope + tech (cukup brief description)
//   - non-build services             → skip scope + tech (detail diisi langsung di StepService)
function getSteps(services, buildMode) {
  const steps = [
    { id: 'identity', label: 'Data Diri' },
    { id: 'service', label: 'Jasa' },
  ];
  const hasBuildTechnical = services.includes('build') && buildMode === 'technical';
  if (hasBuildTechnical) {
    steps.push({ id: 'scope', label: 'Scope' });
    steps.push({ id: 'tech', label: 'Tech' });
  }
  steps.push(
    { id: 'timeline', label: 'Catatan' },
    { id: 'summary', label: 'Kirim' },
  );
  return steps;
}

function App() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [configReady, setConfigReady] = useState(false);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Boot Firestore config + settings listeners (kept alive while page mounted)
  useEffect(() => {
    if (!window.KAFire) return;
    const stop = window.KAFire.Boot.start({
      onConfig:   () => setConfigReady(true),
      onSettings: () => {},
    });
    return stop;
  }, []);

  const STEPS = useMemo(() => getSteps(form.services, form.buildMode), [form.services, form.buildMode]);
  const currentStep = STEPS[step];

  // Apply theme + primary color
  useEffect(() => {
    const themeMap = { light: '', cream: 'cream', dark: 'dark' };
    document.documentElement.setAttribute('data-theme', themeMap[t.theme] || '');
  }, [t.theme]);

  useEffect(() => {
    if (t.theme === 'light' && t.primaryColor) {
      document.documentElement.style.setProperty('--primary', t.primaryColor);
      document.documentElement.style.setProperty('--primary-hover', adjust(t.primaryColor, -15));
      document.documentElement.style.setProperty('--primary-soft', hexToRgba(t.primaryColor, 0.12));
    } else {
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--primary-hover');
      document.documentElement.style.removeProperty('--primary-soft');
    }
  }, [t.primaryColor, t.theme]);

  useEffect(() => {
    const fontMap = {
      jakarta: "'Plus Jakarta Sans', sans-serif",
      inter: "'Inter', sans-serif",
      manrope: "'Manrope', sans-serif",
    };
    document.documentElement.style.setProperty('--font-sans', fontMap[t.fontPair] || fontMap.jakarta);
  }, [t.fontPair]);

  // Validation
  const validateStep = (s) => {
    const e = {};
    const stepId = STEPS[s]?.id;
    if (stepId === 'identity') {
      if (!form.name.trim()) e.name = true;
      if (!form.wa || form.wa.length < 9) e.wa = true;
    }
    if (stepId === 'service') {
      if (form.services.length === 0) e.services = true;
      if (form.services.includes('build')) {
        if (!form.buildMode) e.buildMode = true;
        if (form.buildMode === 'simple' && !(form.simpleBuild?.description || '').trim()) {
          e.simpleBuildDescription = true;
        }
      }
    }
    if (stepId === 'scope') {
      if (form.services.includes('build')) {
        const total = Object.values(form.counts).reduce((a, b) => a + b, 0);
        if (total === 0) e.scope = true;
        // Dashboard widget required if dashboard count > 0
        const dashItems = form.items.dashboard || [];
        if ((form.counts.dashboard || 0) > 0) {
          const anyWidget = dashItems.some(it => {
            const w = it.widgets || { sums: [], charts: [], logs: [] };
            return w.sums.length + w.charts.length + w.logs.length > 0;
          });
          if (!anyWidget) e.scope = true;
        }
      }
    }
    if (stepId === 'tech') {
      if (form.tech.length === 0) e.tech = true;
    }
    if (stepId === 'timeline') {
      // Tidak ada validasi wajib di tahap ini
    }
    return e;
  };

  const next = async () => {
    const e = validateStep(step);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setTimeout(() => {
        const errEl = document.querySelector('.error-msg, .input.error');
        errEl?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
      }, 50);
      return;
    }
    if (step === STEPS.length - 1) {
      // Final step — submit to Firestore
      if (submitting) return;
      setSubmitError(null);
      setSubmitting(true);
      if (!window.KAFire) {
        setSubmitError('Layanan belum siap. Refresh halaman dan coba lagi.');
        setSubmitting(false);
        return;
      }
      try {
        const res = await window.KAFire.Orders.create({ form });
        if (res.ok) {
          setSubmittedOrder({ id: res.id, code: res.code });
          setDone(true);
        } else {
          setSubmitError(res.error || 'Gagal kirim pesanan, coba lagi.');
        }
      } catch (err) {
        setSubmitError(err.message || 'Gagal kirim pesanan, coba lagi.');
      } finally {
        setSubmitting(false);
      }
      return;
    }
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prev = () => {
    setErrors({});
    setStep(s => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => {
    setForm(INITIAL_FORM);
    setStep(0);
    setDone(false);
    setErrors({});
    setSubmittedOrder(null);
    setSubmitError(null);
  };

  if (done) {
    return (
      <>
        <div className="main">
          <SuccessScreen form={form} onReset={reset} orderCode={submittedOrder?.code} />
        </div>
        <TweaksUI t={t} setTweak={setTweak} />
      </>
    );
  }

  return (
    <div className="app">
      <Stepper steps={STEPS} step={step} />

      <div className="main">
        {currentStep?.id === 'identity' && <StepIdentity form={form} setForm={setForm} errors={errors} />}
        {currentStep?.id === 'service' && <StepService form={form} setForm={setForm} errors={errors} />}
        {currentStep?.id === 'scope' && <StepScope form={form} setForm={setForm} errors={errors} />}
        {currentStep?.id === 'tech' && <StepTechDesign form={form} setForm={setForm} errors={errors} />}
        {currentStep?.id === 'timeline' && <StepTimeline form={form} setForm={setForm} errors={errors} />}
        {currentStep?.id === 'summary' && <StepSummary form={form} />}

        <div className="nav-bar">
          <button className="btn btn-ghost" onClick={prev} disabled={step === 0 || submitting} style={{ visibility: step === 0 ? 'hidden' : 'visible' }}>
            ← Kembali
          </button>
          <div className="right">
            {submitError && (
              <div className="submit-error">⚠ {submitError}</div>
            )}
            {step < STEPS.length - 1 && (
              <button className="btn btn-primary btn-lg" onClick={next}>
                Lanjut →
              </button>
            )}
            {step === STEPS.length - 1 && (
              <button className="btn btn-primary btn-lg" onClick={next} disabled={submitting}>
                {submitting ? 'Mengirim…' : 'Kirim Pesanan ✓'}
              </button>
            )}
          </div>
        </div>
      </div>

      {t.showEstimate /* legacy flag, no-op since harga dihapus */ && false}

      <TweaksUI t={t} setTweak={setTweak} />
    </div>
  );
}

function Topbar() {
  // Topbar dihapus dari customer form (hanya kept sebagai stub kalau-kalau dipakai).
  return null;
}

function Stepper({ steps, step }) {
  return (
    <div className="stepper-wrap">
      <div className="stepper">
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className={'step-item ' + (i === step ? 'active' : i < step ? 'done' : '')}>
              <div className="step-num">{i < step ? '✓' : String(i + 1).padStart(2, '0')}</div>
              <span className="step-label-text">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={'step-line' + (i < step ? ' done' : '')} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function TweaksUI({ t, setTweak }) {
  return (
    <TweaksPanel>
      <TweakSection label="Tema Visual" />
      <TweakRadio
        label="Theme"
        value={t.theme}
        onChange={v => setTweak('theme', v)}
        options={[
          { value: 'light', label: 'Light' },
          { value: 'cream', label: 'Cream' },
          { value: 'dark', label: 'Dark' },
        ]}
      />

      {t.theme === 'light' && (
        <TweakColor
          label="Aksen"
          value={t.primaryColor}
          onChange={v => setTweak('primaryColor', v)}
          options={['#5B3FE5', '#0891B2', '#16A34A', '#DC2626', '#EA580C']}
        />
      )}

      <TweakSection label="Typography" />
      <TweakRadio
        label="Font"
        value={t.fontPair}
        onChange={v => setTweak('fontPair', v)}
        options={[
          { value: 'jakarta', label: 'Jakarta' },
          { value: 'inter', label: 'Inter' },
          { value: 'manrope', label: 'Manrope' },
        ]}
      />
    </TweaksPanel>
  );
}

// ============== color utils ==============
function hexToRgba(hex, a) {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
function adjust(hex, amt) {
  const m = hex.replace('#', '');
  let r = parseInt(m.slice(0, 2), 16);
  let g = parseInt(m.slice(2, 4), 16);
  let b = parseInt(m.slice(4, 6), 16);
  r = Math.max(0, Math.min(255, r + amt));
  g = Math.max(0, Math.min(255, g + amt));
  b = Math.max(0, Math.min(255, b + amt));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

(function loadExtraFonts() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap';
  document.head.appendChild(link);
})();

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
