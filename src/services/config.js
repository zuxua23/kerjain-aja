/* config.js — Shared config & defaults for Kerjain Aja
 * Loaded by both index.html (customer form) and admin.html (admin panel).
 * Stores admin-manageable lists in localStorage under 'ka_config'.
 */

window.KA = window.KA || {};

// ============================================
// BRAND
// ============================================
KA.BRAND = {
  name: 'Kerjain Aja',
  short: 'K.A',
  logo: '{K.A}',
  tagline: 'Jasa coding & build aplikasi',
};
KA.ADMIN_WA = '6285111212455';

// ============================================
// DEFAULT CONFIG (used when localStorage is empty / a key is missing)
// ============================================
KA.DEFAULT_CONFIG = {
  /* Jenis Diagram UML, Desain Database, Jenis Database
     kind: 'uml' | 'desain-db' | 'jenis-db'
  */
  umlTypes: [
    // Diagram UML
    { id: 'uml-class',     name: 'Class Diagram',         kind: 'uml',        active: true },
    { id: 'uml-usecase',   name: 'Use Case Diagram',      kind: 'uml',        active: true },
    { id: 'uml-activity',  name: 'Activity Diagram',      kind: 'uml',        active: true },
    { id: 'uml-sequence',  name: 'Sequence Diagram',      kind: 'uml',        active: true },
    { id: 'uml-state',     name: 'State Diagram',         kind: 'uml',        active: false },
    { id: 'uml-component', name: 'Component Diagram',     kind: 'uml',        active: false },
    // Desain Database
    { id: 'db-erd', name: 'ERD (Entity Relationship Diagram)', kind: 'desain-db', active: true },
    { id: 'db-pdm', name: 'PDM (Physical Data Model)',         kind: 'desain-db', active: true },
    { id: 'db-cdm', name: 'CDM (Conceptual Data Model)',       kind: 'desain-db', active: false },
    // Jenis Database (DBMS)
    { id: 'jdb-mysql',    name: 'MySQL',              kind: 'jenis-db', active: true },
    { id: 'jdb-postgres', name: 'PostgreSQL',         kind: 'jenis-db', active: true },
    { id: 'jdb-sqlite',   name: 'SQLite',             kind: 'jenis-db', active: true },
    { id: 'jdb-mongodb',  name: 'MongoDB',            kind: 'jenis-db', active: true },
    { id: 'jdb-mariadb',  name: 'MariaDB',            kind: 'jenis-db', active: false },
    { id: 'jdb-firebase', name: 'Firebase Firestore', kind: 'jenis-db', active: false },
  ],

  /* Jenis Revisi / Bug Fix */
  revisionTypes: [
    { id: 'rev-bug',        name: 'Bug Fix / Perbaikan Error',  active: true },
    { id: 'rev-fitur',      name: 'Penambahan Fitur Baru',      active: true },
    { id: 'rev-ui',         name: 'Redesign UI / Tampilan',     active: true },
    { id: 'rev-performa',   name: 'Optimasi Performa',          active: true },
    { id: 'rev-security',   name: 'Perbaikan Keamanan',         active: true },
    { id: 'rev-database',   name: 'Restrukturisasi Database',   active: false },
    { id: 'rev-deployment', name: 'Setup Deployment / Hosting', active: false },
  ],

  /* Operasi yang dibutuhkan (per kategori master/transaksi/laporan/dashboard)
     id: short slug (cocok dgn item.ops[id])
     categories: array of one or more of 'master', 'transaksi', 'laporan', 'dashboard'
  */
  operations: [
    { id: 'create',      label: 'Create',          desc: 'Tambah data baru',          categories: ['master', 'transaksi'],                   active: true },
    { id: 'get',         label: 'Get / List',      desc: 'Lihat data (read)',         categories: ['master', 'transaksi', 'laporan'],        active: true },
    { id: 'update',      label: 'Update',          desc: 'Edit data',                 categories: ['master', 'transaksi'],                   active: true },
    { id: 'delete',      label: 'Delete',          desc: 'Hapus data',                categories: ['master', 'transaksi'],                   active: true },
    { id: 'filter',      label: 'Filter / Search', desc: 'Cari + filter terindeks',   categories: ['master', 'transaksi', 'laporan'],        active: true },
    { id: 'sum',         label: 'Get Sum',         desc: 'Hitung total / agregasi',   categories: ['master', 'transaksi', 'laporan'],        active: true },
    { id: 'exportPdf',   label: 'Export PDF',      desc: 'Cetak ke PDF',              categories: ['laporan'],                               active: true },
    { id: 'exportExcel', label: 'Export Excel',    desc: 'Cetak ke .xlsx',            categories: ['laporan'],                               active: true },
    { id: 'print',       label: 'Print Langsung',  desc: 'Print ke printer',          categories: ['laporan'],                               active: true },
  ],

  /* Tech Stack — Bahasa Pemrograman, Frontend, Backend, Database
     kind: 'bahasa' | 'fe' | 'be' | 'db'
  */
  techStack: [
    // Bahasa Pemrograman
    { id: 'php',         name: 'PHP',                       kind: 'bahasa', active: true },
    { id: 'js',          name: 'JavaScript / TypeScript',   kind: 'bahasa', active: true },
    { id: 'python',      name: 'Python',                    kind: 'bahasa', active: true },
    { id: 'java',        name: 'Java',                      kind: 'bahasa', active: true },
    { id: 'dart',        name: 'Dart',                      kind: 'bahasa', active: true },
    { id: 'cs',          name: 'C#',                        kind: 'bahasa', active: true },
    { id: 'go',          name: 'Go',                        kind: 'bahasa', active: false },
    { id: 'ruby',        name: 'Ruby',                      kind: 'bahasa', active: false },
    // Frontend
    { id: 'react',       name: 'React',                     kind: 'fe',     active: true },
    { id: 'next',        name: 'Next.js',                   kind: 'fe',     active: true },
    { id: 'vue',         name: 'Vue / Nuxt',                kind: 'fe',     active: true },
    { id: 'svelte',      name: 'Svelte',                    kind: 'fe',     active: true },
    { id: 'flutter',     name: 'Flutter (mobile)',          kind: 'fe',     active: true },
    { id: 'html_native', name: 'HTML/CSS/JS Native',        kind: 'fe',     active: true },
    { id: 'blade',       name: 'Laravel Blade',             kind: 'fe',     active: true },
    { id: 'angular',     name: 'Angular',                   kind: 'fe',     active: false },
    // Backend
    { id: 'laravel',     name: 'Laravel',                   kind: 'be',     active: true },
    { id: 'codeigniter', name: 'CodeIgniter',               kind: 'be',     active: true },
    { id: 'node',        name: 'Node.js + Express',         kind: 'be',     active: true },
    { id: 'django',      name: 'Django',                    kind: 'be',     active: true },
    { id: 'flask',       name: 'Flask',                     kind: 'be',     active: true },
    { id: 'spring',      name: 'Spring Boot',               kind: 'be',     active: true },
    { id: 'dotnet',      name: '.NET',                      kind: 'be',     active: true },
    { id: 'fastapi',     name: 'FastAPI',                   kind: 'be',     active: false },
    { id: 'nestjs',      name: 'NestJS',                    kind: 'be',     active: false },
    // Database
    { id: 'mysql',       name: 'MySQL',                     kind: 'db',     active: true },
    { id: 'pg',          name: 'PostgreSQL',                kind: 'db',     active: true },
    { id: 'sqlite',      name: 'SQLite',                    kind: 'db',     active: true },
    { id: 'mongo',       name: 'MongoDB',                   kind: 'db',     active: true },
    { id: 'firebase',    name: 'Firebase',                  kind: 'db',     active: true },
    { id: 'supabase',    name: 'Supabase',                  kind: 'db',     active: true },
    { id: 'redis',       name: 'Redis',                     kind: 'db',     active: false },
  ],

  /* Tipe Data untuk atribut/field */
  dataTypes: [
    { id: 'text',     label: 'Text',          active: true },
    { id: 'longtext', label: 'Long Text',     active: true },
    { id: 'number',   label: 'Number',        active: true },
    { id: 'currency', label: 'Currency',      active: true },
    { id: 'date',     label: 'Date',          active: true },
    { id: 'datetime', label: 'Datetime',      active: true },
    { id: 'boolean',  label: 'Boolean',       active: true },
    { id: 'email',    label: 'Email',         active: true },
    { id: 'phone',    label: 'Phone',         active: true },
    { id: 'image',    label: 'Image / File',  active: true },
    { id: 'relation', label: 'Relasi',        active: true },
  ],
};

// ============================================
// LOAD / SAVE — LEGACY (overridden by firebase-services.js)
//
// File ini punya fallback localStorage supaya code lama tetap jalan jika
// firebase-services.js belum di-load. Tapi di production, semua call ini
// di-override jadi Firestore-backed. Lihat firebase-services.js.
// ============================================
KA.loadConfig = function () {
  // Kalau Firestore cache ada, pakai itu
  if (KA._cachedConfig) return KA._cachedConfig;
  // Otherwise return defaults
  return {
    umlTypes:      KA.DEFAULT_CONFIG.umlTypes.slice(),
    revisionTypes: KA.DEFAULT_CONFIG.revisionTypes.slice(),
    operations:    KA.DEFAULT_CONFIG.operations.slice(),
    dataTypes:     KA.DEFAULT_CONFIG.dataTypes.slice(),
    techStack:     KA.DEFAULT_CONFIG.techStack.slice(),
  };
};

KA.loadSettings = function () {
  if (KA._cachedSettings) return KA._cachedSettings;
  return { studioName: 'Kerjain Aja', adminWa: '6281234567890', signerName: '' };
};

// ============================================
// HELPERS used by form
// ============================================
KA.getOpsForCategory = function (catKey) {
  const cfg = KA.loadConfig();
  return cfg.operations.filter(o => o.active && Array.isArray(o.categories) && o.categories.includes(catKey));
};

KA.getActiveDataTypes = function () {
  return KA.loadConfig().dataTypes.filter(t => t.active);
};

KA.getActiveUmlTypes = function (kind) {
  const list = KA.loadConfig().umlTypes.filter(t => t.active);
  return kind ? list.filter(t => t.kind === kind) : list;
};

KA.getActiveRevisionTypes = function () {
  return KA.loadConfig().revisionTypes.filter(t => t.active);
};

KA.getActiveTechStack = function (kind) {
  const list = KA.loadConfig().techStack.filter(t => t.active);
  return kind ? list.filter(t => t.kind === kind) : list;
};

// Auth helpers removed — sekarang pakai Firebase Auth (lihat firebase-services.js KAFire.Auth)
