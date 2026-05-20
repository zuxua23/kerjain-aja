/* firebase-config.js — GANTI nilai di bawah dengan config dari Firebase Console.
 *
 * Cara dapetin nilai ini:
 *   1. Buka https://console.firebase.google.com → pilih project lu
 *   2. Klik gerigi (⚙) → Project settings → tab "General"
 *   3. Scroll ke bawah "Your apps" → klik ikon Web (</>)
 *   4. Daftarin app, lalu copy `firebaseConfig` object yang muncul
 *   5. Paste nilai-nilai itu ke sini
 *
 * Catatan: API key ini AMAN dipublikasikan (bukan secret). Keamanan
 * dihandle oleh Firestore Security Rules (lihat firestore.rules).
 */

window.KA_FIREBASE_CONFIG = {
  apiKey:            "GANTI_DENGAN_API_KEY_LU",
  authDomain:        "GANTI_PROJECT_ID.firebaseapp.com",
  projectId:         "GANTI_PROJECT_ID",
  storageBucket:     "GANTI_PROJECT_ID.appspot.com",
  messagingSenderId: "GANTI_SENDER_ID",
  appId:             "GANTI_APP_ID",
};

/* Region Firestore harus diset ke "asia-southeast2" (Jakarta) saat bikin database
 * di Firebase Console. Ini setting one-time, ga bisa diubah setelah set.
 */
