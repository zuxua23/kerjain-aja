# Firebase Setup — Kerjain Aja (PO Project)

Panduan lengkap dari nol sampai aplikasi nyala di Firebase Hosting.
**Total biaya: Rp 0** (Spark plan / free tier).

---

## 0. Yang lu butuhin

- Akun Google
- Node.js (versi 18+) — buat install Firebase CLI
- Folder project ini di komputer lu

Cek Node sudah ada:
```bash
node -v
```
Kalau belum, install dari https://nodejs.org

---

## 1. Bikin Firebase Project

1. Buka https://console.firebase.google.com
2. Klik **"Add project"** / **"Tambah project"**
3. Kasih nama (contoh: `kerjain-aja-prod`)
4. **Google Analytics**: pilih **Disable** (ga perlu, hemat resource)
5. Klik **"Create project"** → tunggu

---

## 2. Aktifkan Firestore (database)

1. Di sidebar kiri Firebase Console, klik **Build → Firestore Database**
2. Klik **"Create database"**
3. **Lokasi (penting!):** pilih **`asia-southeast2` (Jakarta)** ← jangan salah, ga bisa diganti lagi
4. **Mode:** pilih **"Start in production mode"** (kita upload Rules sendiri nanti)
5. Klik **Enable**

---

## 3. Aktifkan Authentication

1. Sidebar kiri → **Build → Authentication**
2. Klik **"Get started"**
3. Tab **"Sign-in method"** → klik **Email/Password**
4. Toggle **Enable** → **Save**

### Bikin akun admin pertama

1. Masih di Authentication → tab **"Users"**
2. Klik **"Add user"**
3. Masukin email + password lu sendiri (ini buat login ke admin panel)
4. Klik **Add user**

> Cuma 1 admin sesuai kebutuhan lu. Mau nambah admin lain? Tinggal "Add user" lagi di sini.

---

## 4. Bikin Web App & Copy Config

1. Sidebar kiri → klik gerigi (⚙) → **Project settings**
2. Scroll ke **"Your apps"** → klik ikon **Web (</>)**
3. Daftarin app:
   - **App nickname:** `Kerjain Aja Web`
   - **JANGAN centang** "Also set up Firebase Hosting" (kita setup manual di terminal)
   - Klik **Register app**
4. Lu bakal liat snippet kayak gini:

   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyD...",
     authDomain: "kerjain-aja-prod.firebaseapp.com",
     projectId: "kerjain-aja-prod",
     storageBucket: "kerjain-aja-prod.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef123456"
   };
   ```

5. **Copy nilai-nilai itu** ke file `firebase-config.js` di project ini:

   ```javascript
   window.KA_FIREBASE_CONFIG = {
     apiKey:            "AIzaSyD...",
     authDomain:        "kerjain-aja-prod.firebaseapp.com",
     projectId:         "kerjain-aja-prod",
     storageBucket:     "kerjain-aja-prod.appspot.com",
     messagingSenderId: "1234567890",
     appId:             "1:1234567890:web:abcdef123456",
   };
   ```

6. Edit file `.firebaserc` — ganti `GANTI_DENGAN_PROJECT_ID_LU` dengan `projectId` lu (contoh: `kerjain-aja-prod`).

> **API key aman buat dipublikasikan** — bukan secret. Yang amanin data tu **Firestore Rules** (`firestore.rules`).

---

## 5. Install Firebase CLI

Di terminal:
```bash
npm install -g firebase-tools
```

Cek:
```bash
firebase --version
```

Login ke akun Google lu:
```bash
firebase login
```
(bakal buka browser, sign in pake akun yang sama dengan Firebase Console)

---

## 6. Deploy Firestore Rules

Dari folder project ini di terminal:
```bash
firebase use --add
```
Pilih project lu → kasih alias `default`.

Lalu deploy rules:
```bash
firebase deploy --only firestore:rules
```

Hasilnya:
```
✔  firestore: released rules firestore.rules to cloud.firestore
```

> Rules ini bilang: customer bisa CREATE order tanpa login, admin (terautentikasi) bisa baca/update/delete semua, config & settings bisa dibaca siapa aja tapi cuma admin yang bisa edit.

---

## 7. Test di Lokal Dulu

```bash
firebase serve --only hosting
```
Akan jalan di `http://localhost:5000`

Test:
- `/login.html` → login pakai email/password yang lu bikin di step 3
- `/admin.html` → harus masuk dashboard
- `/index.html` → form customer; submit → harus muncul di admin real-time

Kalau ada error di console (F12), cek `firebase-config.js` lu udah bener ga.

---

## 8. Deploy ke Firebase Hosting (Production)

```bash
firebase deploy --only hosting
```

Hasilnya:
```
✔  hosting: release complete
Hosting URL: https://kerjain-aja-prod.web.app
```

Cuy, website lu udah online! Free SSL, free domain, CDN global.

**Custom domain (opsional, gratis):**
- Firebase Console → Hosting → **Add custom domain**
- Ikutin instruksi verifikasi DNS (TXT record), lalu A record

---

## 9. Deploy Semua Sekaligus (next time)

```bash
firebase deploy
```
Otomatis deploy hosting + rules.

---

## Quota Free Tier (Spark Plan)

| Resource | Free quota | Cukup buat |
|---|---|---|
| Firestore reads | 50.000/hari | ~10.000 buka admin panel |
| Firestore writes | 20.000/hari | ratusan order/hari |
| Auth users | unlimited | banyak admin |
| Hosting transfer | 10 GB/bulan | website traffic normal |
| Hosting storage | 10 GB | static files |

Kalau lebih dari ini = upgrade ke Blaze (pay-as-you-go), tapi 99% project sekelas ini ga bakal kelewatan.

---

## Troubleshooting

**"Missing or insufficient permissions"** di console
→ Firestore Rules belum di-deploy. Run `firebase deploy --only firestore:rules`.

**"Firebase: Error (auth/invalid-credential)"** waktu login
→ Email/password salah, atau user belum dibikin di step 3.

**Form submit ga muncul di admin**
→ Cek tab Network di DevTools, cari request ke `firestore.googleapis.com`. Kalau 403 = rules belum bener. Kalau pending = `firebase-config.js` salah.

**Region salah** (kepilih default `us-central` waktu bikin database)
→ Sayangnya ga bisa diubah. Solusi: bikin project baru, set ke `asia-southeast2`.

---

## Ngecek Data Manual

Firebase Console → **Firestore Database** → bisa liat:
- `orders/` ← semua order masuk
- `config/main` ← konfigurasi admin (tech stack, UML, dll)
- `settings/studio` ← settings studio (nama, WA)

Bisa edit langsung dari sini juga (buat debug).

---

## Backup

Export semua data:
```bash
gcloud firestore export gs://YOUR_BUCKET_NAME --collection-ids=orders,config,settings
```

Atau lewat Firebase Console → Firestore → **Import/Export**.

Note: butuh enable Storage API. Buat backup manual cepat, di admin panel ada tombol **"Export Backup (JSON)"** yang download semua order.

---

Selesai bre 🚀
