/* firebase-services.js — Wrapper Firebase Auth + Firestore untuk Kerjain Aja.
 * Expose `window.KAFire` dengan API yang seragam supaya code lain ga import langsung.
 *
 * Depends on (loaded sebelum file ini di HTML):
 *   - firebase-app-compat.js
 *   - firebase-auth-compat.js
 *   - firebase-firestore-compat.js
 *   - firebase-config.js (provides window.KA_FIREBASE_CONFIG)
 *   - config.js (provides KA.DEFAULT_CONFIG)
 */
(function () {
  if (!window.firebase) {
    console.error('[KAFire] Firebase SDK belum dimuat. Pastikan firebase-*-compat.js dimuat sebelum file ini.');
    return;
  }
  if (!window.KA_FIREBASE_CONFIG || window.KA_FIREBASE_CONFIG.apiKey === 'GANTI_DENGAN_API_KEY_LU') {
    console.warn('[KAFire] firebase-config.js belum diisi. Edit file itu dengan config dari Firebase Console.');
  }

  // ============================================
  // INIT
  // ============================================
  const app = firebase.initializeApp(window.KA_FIREBASE_CONFIG);
  const auth = firebase.auth();
  const db = firebase.firestore();

  // Persist auth session across tabs/reloads
  try { auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); } catch (e) { /* noop */ }

  const COLL = {
    orders:   'orders',
    config:   'config',     // doc: 'main'
    settings: 'settings',   // doc: 'studio'
  };

  // ============================================
  // AUTH
  // ============================================
  const Auth = {
    /** Subscribe to auth state. cb(user|null) */
    onChange(cb) { return auth.onAuthStateChanged(cb); },

    currentUser() { return auth.currentUser; },

    isReady() {
      return new Promise(resolve => {
        const unsub = auth.onAuthStateChanged(u => { unsub(); resolve(u); });
      });
    },

    async login(email, password) {
      try {
        const res = await auth.signInWithEmailAndPassword(email.trim(), password);
        return { ok: true, user: res.user };
      } catch (e) {
        return { ok: false, error: friendlyAuthError(e) };
      }
    },

    async logout() { return auth.signOut(); },

    async sendReset(email) {
      try {
        await auth.sendPasswordResetEmail(email.trim());
        return { ok: true };
      } catch (e) {
        return { ok: false, error: friendlyAuthError(e) };
      }
    },

    async changePassword(currentPw, newPw) {
      const u = auth.currentUser;
      if (!u) return { ok: false, error: 'Belum login.' };
      try {
        const cred = firebase.auth.EmailAuthProvider.credential(u.email, currentPw);
        await u.reauthenticateWithCredential(cred);
        await u.updatePassword(newPw);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: friendlyAuthError(e) };
      }
    },
  };

  function friendlyAuthError(e) {
    const map = {
      'auth/invalid-email': 'Format email tidak valid.',
      'auth/user-disabled': 'Akun ini dinonaktifkan.',
      'auth/user-not-found': 'Email tidak terdaftar.',
      'auth/wrong-password': 'Password salah.',
      'auth/invalid-credential': 'Email atau password salah.',
      'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi dalam beberapa menit.',
      'auth/network-request-failed': 'Koneksi internet bermasalah.',
      'auth/weak-password': 'Password terlalu lemah (minimal 6 karakter).',
      'auth/requires-recent-login': 'Sesi terlalu lama, silakan login ulang.',
    };
    return map[e?.code] || (e?.message || 'Terjadi kesalahan, coba lagi.');
  }

  // ============================================
  // ORDERS
  // ============================================
  const Orders = {
    /**
     * Subscribe ke daftar order (real-time, descending by createdAt).
     * cb(orders[]) — orders = [{ id, code, status, createdAt, form }]
     * Returns unsubscribe function.
     */
    subscribe(cb, onError) {
      return db.collection(COLL.orders)
        .orderBy('createdAt', 'desc')
        .onSnapshot(
          snap => {
            const list = snap.docs.map(d => {
              const data = d.data();
              return {
                id: d.id,
                ...data,
                // normalize: Firestore Timestamp → ISO string for legacy consumers
                createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || new Date().toISOString(),
              };
            });
            cb(list);
          },
          err => { console.error('[KAFire.Orders.subscribe]', err); onError?.(err); }
        );
    },

    /** Push order baru dari customer form. Returns { ok, id, code } */
    async create(order) {
      const code = order.code || ('DV-' + Date.now().toString(36).toUpperCase().slice(-7));
      const payload = {
        code,
        status: 'pending',
        form: sanitize(order.form),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        invoice: null,
      };
      try {
        const ref = await db.collection(COLL.orders).add(payload);
        return { ok: true, id: ref.id, code };
      } catch (e) {
        console.error('[KAFire.Orders.create]', e);
        return { ok: false, error: e.message };
      }
    },

    async updateStatus(id, status) {
      return db.collection(COLL.orders).doc(id).update({
        status,
        statusUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    },

    async saveInvoice(id, invoice) {
      return db.collection(COLL.orders).doc(id).update({
        invoice,
        invoiceUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    },

    async remove(id) {
      return db.collection(COLL.orders).doc(id).delete();
    },
  };

  // remove undefined/function before sending to Firestore (Firestore rejects undefined)
  function sanitize(obj) {
    if (obj === null || obj === undefined) return null;
    if (Array.isArray(obj)) return obj.map(sanitize);
    if (typeof obj === 'object') {
      const out = {};
      for (const k in obj) {
        const v = obj[k];
        if (v === undefined || typeof v === 'function') continue;
        out[k] = sanitize(v);
      }
      return out;
    }
    return obj;
  }

  // ============================================
  // CONFIG (single doc: config/main)
  // ============================================
  const Config = {
    /**
     * Subscribe ke konfigurasi (real-time).
     * cb(config) — config = { umlTypes, revisionTypes, operations, dataTypes, techStack }
     * Kalau Firestore doc kosong, return KA.DEFAULT_CONFIG (read-only fallback).
     */
    subscribe(cb, onError) {
      return db.collection(COLL.config).doc('main').onSnapshot(
        snap => {
          const data = snap.exists ? snap.data() : null;
          cb(mergeWithDefaults(data));
        },
        err => { console.error('[KAFire.Config.subscribe]', err); onError?.(err); }
      );
    },

    /** One-shot load (returns Promise<config>). */
    async load() {
      try {
        const snap = await db.collection(COLL.config).doc('main').get();
        return mergeWithDefaults(snap.exists ? snap.data() : null);
      } catch (e) {
        console.error('[KAFire.Config.load]', e);
        return mergeWithDefaults(null);
      }
    },

    async save(config) {
      return db.collection(COLL.config).doc('main').set(sanitize(config), { merge: false });
    },

    async reset() {
      return db.collection(COLL.config).doc('main').set(sanitize(window.KA.DEFAULT_CONFIG), { merge: false });
    },
  };

  function mergeWithDefaults(data) {
    const def = window.KA && window.KA.DEFAULT_CONFIG ? window.KA.DEFAULT_CONFIG : {};
    const merge = (key) => Array.isArray(data?.[key]) && data[key].length > 0 ? data[key] : (def[key] || []).slice();
    return {
      umlTypes:      merge('umlTypes'),
      revisionTypes: merge('revisionTypes'),
      operations:    merge('operations'),
      dataTypes:     merge('dataTypes'),
      techStack:     merge('techStack'),
    };
  }

  // ============================================
  // SETTINGS (settings/studio)
  // ============================================
  const Settings = {
    DEFAULT: { studioName: 'Kerjain Aja', adminWa: '6281234567890', signerName: '' },

    subscribe(cb, onError) {
      return db.collection(COLL.settings).doc('studio').onSnapshot(
        snap => cb({ ...this.DEFAULT, ...(snap.exists ? snap.data() : {}) }),
        err => { console.error('[KAFire.Settings.subscribe]', err); onError?.(err); }
      );
    },

    async load() {
      try {
        const snap = await db.collection(COLL.settings).doc('studio').get();
        return { ...this.DEFAULT, ...(snap.exists ? snap.data() : {}) };
      } catch (e) {
        console.error('[KAFire.Settings.load]', e);
        return { ...this.DEFAULT };
      }
    },

    async save(settings) {
      return db.collection(COLL.settings).doc('studio').set(sanitize(settings), { merge: true });
    },
  };

  // ============================================
  // CACHED CONFIG (sync access for legacy code paths)
  // Beberapa file lama akses config secara synchronous (mis. summary di customer
  // form). Kita maintain in-memory cache di sini, di-update otomatis oleh
  // boot helper di bawah, supaya KA.loadConfig() bisa tetap sync.
  // ============================================
  let _cachedConfig = mergeWithDefaults(null);
  let _cachedSettings = { ...Settings.DEFAULT };

  Config.getCached = () => _cachedConfig;
  Settings.getCached = () => _cachedSettings;

  // ============================================
  // BOOT — initialize listeners shared across pages
  // ============================================
  const Boot = {
    /**
     * Start listening to global config & settings (used by both customer & admin).
     * Call once per page load. Returns an unsubscribe function.
     */
    start({ onConfig, onSettings } = {}) {
      const unsubA = Config.subscribe(cfg => {
        _cachedConfig = cfg;
        // backward-compat: keep KA.loadConfig() working synchronously
        if (window.KA) window.KA._cachedConfig = cfg;
        onConfig?.(cfg);
      });
      const unsubB = Settings.subscribe(s => {
        _cachedSettings = s;
        if (window.KA) window.KA._cachedSettings = s;
        onSettings?.(s);
      });
      return () => { unsubA(); unsubB(); };
    },
  };

  // ============================================
  // EXPORT
  // ============================================
  window.KAFire = { app, auth, db, Auth, Orders, Config, Settings, Boot };

  // Override KA.loadConfig with Firestore-backed cached version
  if (window.KA) {
    window.KA.loadConfig = () => Config.getCached();
    window.KA.loadSettings = () => Settings.getCached();
    window.KA.getOpsForCategory = function (catKey) {
      return Config.getCached().operations.filter(o => o.active && Array.isArray(o.categories) && o.categories.includes(catKey));
    };
    window.KA.getActiveDataTypes  = () => Config.getCached().dataTypes.filter(t => t.active);
    window.KA.getActiveUmlTypes   = (kind) => {
      const list = Config.getCached().umlTypes.filter(t => t.active);
      return kind ? list.filter(t => t.kind === kind) : list;
    };
    window.KA.getActiveRevisionTypes = () => Config.getCached().revisionTypes.filter(t => t.active);
    window.KA.getActiveTechStack     = (kind) => {
      const list = Config.getCached().techStack.filter(t => t.active);
      return kind ? list.filter(t => t.kind === kind) : list;
    };
  }
})();
