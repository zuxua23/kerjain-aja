/* global React, ReactDOM */
const { useState, useEffect, useRef } = React;

function LoginApp() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState(null);
  const [info, setInfo] = useState(null);
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [booted, setBooted] = useState(false);
  const emailRef = useRef(null);

  // Auth state — kalau udah login, redirect
  useEffect(() => {
    if (!window.KAFire) {
      setErr('Firebase belum siap. Cek firebase-config.js lalu refresh.');
      return;
    }
    const unsub = window.KAFire.Auth.onChange(user => {
      setBooted(true);
      if (user) {
        window.location.replace(getNextUrl());
      } else {
        setTimeout(() => emailRef.current?.focus(), 30);
      }
    });
    return unsub;
  }, []);

  const getNextUrl = () => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const next = sp.get('next');
      if (next && !/^https?:|^\/\//i.test(next)) return next;
    } catch (e) { /* ignore */ }
    return 'admin.html';
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const submit = async (e) => {
    e?.preventDefault?.();
    if (submitting) return;
    setErr(null);
    setInfo(null);

    if (forgotMode) {
      if (!email.trim()) {
        setErr('Email masih kosong, isi dulu ya.');
        triggerShake();
        return;
      }
      setSubmitting(true);
      const res = await window.KAFire.Auth.sendReset(email);
      setSubmitting(false);
      if (res.ok) {
        setInfo('Link reset password sudah dikirim ke email lu. Cek inbox / spam.');
        setForgotMode(false);
      } else {
        setErr(res.error);
        triggerShake();
      }
      return;
    }

    if (!email.trim() || !pw.trim()) {
      setErr('Email dan password wajib diisi.');
      triggerShake();
      return;
    }
    setSubmitting(true);
    const res = await window.KAFire.Auth.login(email, pw);
    if (res.ok) {
      // onAuthStateChanged listener will redirect
    } else {
      setErr(res.error);
      setPw('');
      triggerShake();
      setSubmitting(false);
      emailRef.current?.focus();
    }
  };

  return (
    <div className="login-shell">
      <div className="login-brand">
        <div className="login-brand-mark">{'<K.A/>'}</div>
        <div>
          <div className="login-brand-name">Kerjain Aja</div>
          <div className="login-brand-sub">Admin Panel</div>
        </div>
      </div>

      <form className={'login-card' + (shake ? ' login-shake' : '')} onSubmit={submit} noValidate>
        <h1 className="login-title">{forgotMode ? 'Lupa Password?' : 'Login Admin'}</h1>
        <p className="login-subtitle">
          {forgotMode
            ? 'Masukin email admin lu, kami kirim link buat reset password.'
            : 'Masukin email & password buat akses dashboard.'}
        </p>

        {err && (
          <div className="login-error">
            <span className="login-error-icon">!</span>
            <span>{err}</span>
          </div>
        )}
        {info && (
          <div className="login-info">
            <span className="login-info-icon">✓</span>
            <span>{info}</span>
          </div>
        )}

        <div className="login-field">
          <label className="login-label" htmlFor="email">Email</label>
          <div className="login-input-wrap">
            <input
              id="email"
              ref={emailRef}
              className={'login-input' + (err && !pw ? ' error' : '')}
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); if (err) setErr(null); }}
              placeholder="admin@kerjainaja.com"
              autoComplete="username"
              spellCheck={false}
              disabled={submitting}
            />
          </div>
        </div>

        {!forgotMode && (
          <div className="login-field">
            <label className="login-label" htmlFor="pw">Password</label>
            <div className="login-input-wrap">
              <input
                id="pw"
                className={'login-input' + (err ? ' error' : '')}
                type={show ? 'text' : 'password'}
                value={pw}
                onChange={e => { setPw(e.target.value); if (err) setErr(null); }}
                placeholder="••••••••"
                autoComplete="current-password"
                spellCheck={false}
                disabled={submitting}
              />
              <button
                type="button"
                className="login-toggle"
                onClick={() => setShow(s => !s)}
                aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
                title={show ? 'Sembunyikan' : 'Tampilkan'}
                tabIndex={-1}
              >
                {show ? '🙈' : '👁'}
              </button>
            </div>
          </div>
        )}

        <button type="submit" className="login-submit" disabled={submitting || !booted}>
          {submitting
            ? 'Memeriksa…'
            : !booted ? 'Memuat…'
            : forgotMode ? 'Kirim Link Reset →'
            : 'Masuk →'}
        </button>

        <div className="login-meta">
          <span><span className="login-meta-dot" />Aman & terenkripsi</span>
          <button
            type="button"
            className="login-meta-link"
            onClick={() => { setForgotMode(m => !m); setErr(null); setInfo(null); }}
          >
            {forgotMode ? '← Kembali login' : 'Lupa password?'}
          </button>
        </div>
      </form>

      <a href="index.html" className="login-bottom-link">← Form pelanggan</a>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('login-root')).render(<LoginApp />);
