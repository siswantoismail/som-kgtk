import express from 'express';
import path from 'path';
import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

// Port dynamic detection for Railway (PORT) or local 3000
const PORT = Number(process.env.PORT) || 3000;
const app = express();

// MySQL Configuration (Railway / Cloud / Laragon)
// Supports Railway MYSQL_URL, DATABASE_URL, or individual MYSQLHOST/MYSQLPORT vars
const MYSQL_URL = process.env.MYSQL_URL || process.env.DATABASE_URL || '';

const MYSQL_CONFIG = {
  host: process.env.MYSQLHOST || process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
  port: Number(process.env.MYSQLPORT || process.env.MYSQL_PORT || process.env.DB_PORT) || 3306,
  user: process.env.MYSQLUSER || process.env.MYSQL_USER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || process.env.DB_NAME || 'sim_sop_gtk',
  connectTimeout: 5000
};

const isRailway = Boolean(
  process.env.RAILWAY_ENVIRONMENT || 
  process.env.RAILWAY_PROJECT_ID || 
  MYSQL_URL || 
  process.env.MYSQLHOST
);

const isRemoteDb = Boolean(
  MYSQL_URL || 
  (MYSQL_CONFIG.host !== 'localhost' && MYSQL_CONFIG.host !== '127.0.0.1')
);

// Native CORS Middleware (Zero External Dependency - Works anywhere without npm cors)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-email'
  );

  // Handle preflight OPTIONS request instantly
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Healthcheck endpoints for Railway Deployment Monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: isMySqlConnected ? 'connected' : 'connecting',
    environment: process.env.NODE_ENV || 'development',
    platform: isRailway ? 'Railway' : 'Express.js Node'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: isMySqlConnected ? 'connected' : 'connecting',
    environment: process.env.NODE_ENV || 'development',
    platform: isRailway ? 'Railway' : 'Express.js Node'
  });
});

// Initial Seed Data for fallback and table population
const DEFAULT_USERS = [
  {
    email: 'admin@kemdikbud.go.id',
    password: 'admin123',
    fullName: 'Administrator SIM-SOP GTK',
    nip: '198503152008011003',
    roleTitle: 'Administrator Sistem'
  },
  {
    email: 'admin.gtk@kemdikbud.go.id',
    password: 'AdminGTK#2026',
    fullName: 'Administrator SIM-SOP GTK',
    nip: '198503152008011003',
    roleTitle: 'Administrator Sistem'
  },
  {
    email: 'kepala.kantor@kemdikbud.go.id',
    password: 'gtk2026',
    fullName: 'Dr. H. Siswanto Ismail, M.Pd.',
    nip: '197405121998031002',
    roleTitle: 'Kepala Kantor GTK Gorontalo'
  },
  {
    email: 'pelaksana.gtk@kemdikbud.go.id',
    password: 'gtk2026',
    fullName: 'Pengelola Mutu GTK',
    nip: '198810202010012005',
    roleTitle: 'Pelaksana / Pengelola SOP AP'
  }
];

// Pre-determined Authorized Emails (Whitelist Pembatasan Akses SIM-SOP GTK Gorontalo)
// Hanya email yang telah ditentukan ini yang diizinkan untuk mendaftarkan password dan login
const DEFAULT_AUTHORIZED_EMAILS = [
  {
    email: 'siswantoismail173@gmail.com',
    fullName: 'Dr. H. Siswanto Ismail, M.Pd.',
    nip: '197405121998031002',
    roleTitle: 'Kepala Kantor Guru dan Tenaga Kependidikan Provinsi Gorontalo',
    isRegistered: false,
    registeredAt: null as string | null
  },
  {
    email: 'admin@kemdikbud.go.id',
    fullName: 'Administrator SIM-SOP GTK',
    nip: '198503152008011003',
    roleTitle: 'Administrator Sistem',
    isRegistered: true,
    registeredAt: '2026-02-08T08:00:00.000Z'
  },
  {
    email: 'admin.gtk@kemdikbud.go.id',
    fullName: 'Administrator SIM-SOP GTK',
    nip: '198503152008011003',
    roleTitle: 'Administrator Sistem',
    isRegistered: true,
    registeredAt: '2026-02-08T08:00:00.000Z'
  },
  {
    email: 'kepala.kantor@kemdikbud.go.id',
    fullName: 'Dr. H. Siswanto Ismail, M.Pd.',
    nip: '197405121998031002',
    roleTitle: 'Kepala Kantor GTK Gorontalo',
    isRegistered: true,
    registeredAt: '2026-02-08T08:00:00.000Z'
  },
  {
    email: 'pelaksana.gtk@kemdikbud.go.id',
    fullName: 'Pengelola Mutu GTK',
    nip: '198810202010012005',
    roleTitle: 'Pelaksana / Pengelola SOP AP',
    isRegistered: true,
    registeredAt: '2026-02-08T08:00:00.000Z'
  },
  {
    email: 'verifikator.gtk@kemdikbud.go.id',
    fullName: 'Verifikator Mutu & Tata Laksana GTK',
    nip: '198904122012032001',
    roleTitle: 'Verifikator Tata Kelola POS AP',
    isRegistered: false,
    registeredAt: null as string | null
  }
];

const DEFAULT_SOP = {
  id: 'sop-pemetaan-mutu-gtk-01',
  nomorPos: '0029/T/B7.33/OT.02.00/2026',
  instansi: 'KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH\nDIREKTORAT JENDERAL GURU DAN TENAGA KEPENDIDIKAN',
  unitKerja: 'KANTOR GURU DAN TENAGA KEPENDIDIKAN PROVINSI GORONTALO',
  tanggalPembuatan: '08 Februari 2026',
  tanggalRevisi: '',
  tanggalEfektif: '08 Februari 2026',
  namaPos: 'PROSEDUR OPERASIONAL STANDAR PELAKSANAAN PEMETAAN KOMPETENSI GURU DAN TENAGA KEPENDIDIKAN',
  disahkanOleh: {
    nama: 'Dr. H. Siswanto Ismail, M.Pd.',
    nip: '197405121998031002',
    jabatan: 'Kepala Kantor Guru dan Tenaga Kependidikan Provinsi Gorontalo'
  },
  dasarHukum: [
    'Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional',
    'Undang-Undang Nomor 14 Tahun 2005 tentang Guru dan Dosen',
    'Peraturan Pemerintah Nomor 74 Tahun 2008 tentang Guru sebagaimana telah diubah dengan PP Nomor 19 Tahun 2017',
    'Peraturan Menteri PAN-RB Nomor 35 Tahun 2012 tentang Pedoman Penyusunan Standar Operasional Prosedur Administrasi Pemerintahan (SOP AP)',
    'Peraturan Menteri Pendidikan Dasar dan Menengah Nomor 1 Tahun 2024 tentang Organisasi dan Tata Kerja Kemendikdasmen'
  ],
  kualifikasiPelaksana: [
    'Memiliki kualifikasi pendidikan minimal Sarjana (S-1) / Diploma IV di bidang Pendidikan atau Manajemen',
    'Memahami regulasi dan instrumen uji kompetensi guru dan tenaga kependidikan',
    'Mampu mengoperasikan aplikasi pengolahan data instrumen pemetaan kompetensi berbasis komputer dan jaringan',
    'Memiliki integritas, ketelitian, dan objektivitas dalam pengolahan nilai kompetensi GTK'
  ],
  keterkaitan: [
    'POS AP Pelaksanaan Uji Kompetensi Guru (UKG)',
    'POS AP Pengelolaan Sistem Informasi Manajemen Pengembangan Keprofesian Berkelanjutan (SIM-PKB)',
    'POS AP Layanan Pengaduan dan Verifikasi Data GTK'
  ],
  peralatan: [
    'Komputer / Laptop Server dan Workstation dengan koneksi internet stabil',
    'Aplikasi SIM-SOP GTK Provinsi Gorontalo',
    'Instrumen Pemetaan Kompetensi dan Lembar Verifikasi Berkas',
    'Printer laser dan scanner dokumen naskah dinas',
    'Jaringan lokal (LAN/WLAN) dan database terenkripsi'
  ],
  peringatan: [
    'Jika prosedur pemetaan kompetensi tidak dilaksanakan sesuai tahapan, data hasil pemetaan GTK tidak valid dan menghambat perencanaan diklat keprofesian berkelanjutan',
    'Kelalaian dalam verifikasi instrumen dapat menyebabkan kesalahan rekomendasi peningkatan kompetensi GTK di Provinsi Gorontalo'
  ],
  pencatatan: [
    'Disimpan dalam database SIM-SOP GTK Provinsi Gorontalo dalam bentuk digital dan arsip fisik naskah berita acara',
    'Didokumentasikan dalam Berita Acara Hasil Pemetaan Kompetensi GTK yang disahkan Kepala Kantor'
  ]
};

// Fallback in-memory / cache storage when MySQL is initializing or unreachable
let memoryUsers = [...DEFAULT_USERS];
let memoryAuthorizedEmails = [...DEFAULT_AUTHORIZED_EMAILS];
let memorySopDocs = [DEFAULT_SOP];
let memoryChanges: Array<{
  id: number;
  entityType: string;
  entityId: string;
  actionType: string;
  userEmail: string;
  description: string;
  changesJson: any;
  createdAt: string;
}> = [
  {
    id: 1,
    entityType: 'SYSTEM',
    entityId: 'SYSTEM-INIT',
    actionType: 'INIT',
    userEmail: 'system@kemdikbud.go.id',
    description: 'Sistem SIM-SOP GTK Express.js Backend diinisialisasi',
    changesJson: { framework: 'Express.js (Node.js)', targetDb: 'MySQL Laragon' },
    createdAt: new Date().toISOString()
  }
];

let memoryLoginLogs: Array<{
  id: number;
  userEmail: string;
  status: string;
  ipAddress: string;
  userAgent?: string;
  message: string;
  createdAt: string;
}> = [];

let currentActiveSession: {
  email: string;
  fullName: string;
  nip: string;
  roleTitle: string;
  loginTime: string;
} | null = null;

let dbPool: mysql.Pool | null = null;
let isMySqlConnected = false;
let mySqlLastError: string | null = null;

// Initialize MySQL Connection & Schema
async function initMySqlConnection(): Promise<boolean> {
  try {
    // 1. For local development, check if local MySQL server is actively listening
    if (!MYSQL_URL && (MYSQL_CONFIG.host === 'localhost' || MYSQL_CONFIG.host === '127.0.0.1')) {
      try {
        const serverConnection = await mysql.createConnection({
          host: MYSQL_CONFIG.host,
          port: MYSQL_CONFIG.port,
          user: MYSQL_CONFIG.user,
          password: MYSQL_CONFIG.password,
          connectTimeout: 1000
        });

        await serverConnection.query(
          `CREATE DATABASE IF NOT EXISTS \`${MYSQL_CONFIG.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
        );
        await serverConnection.end();
      } catch {
        // Silently ignore if local MySQL daemon (Laragon/XAMPP) is not currently running
      }
    }

    // 2. Create Pool connecting to database (Railway MYSQL_URL or MYSQL_CONFIG)
    if (MYSQL_URL) {
      console.log('[DB] Connecting to MySQL using Railway MYSQL_URL / DATABASE_URL...');
      dbPool = mysql.createPool({
        uri: MYSQL_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 8000,
        ssl: process.env.MYSQL_SSL === 'false' ? undefined : { rejectUnauthorized: false }
      });
    } else {
      console.log(`[DB] Connecting to MySQL host=${MYSQL_CONFIG.host}:${MYSQL_CONFIG.port} database=${MYSQL_CONFIG.database}...`);
      dbPool = mysql.createPool({
        ...MYSQL_CONFIG,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 8000,
        ssl: isRemoteDb && process.env.MYSQL_SSL !== 'false' ? { rejectUnauthorized: false } : undefined
      });
    }

    // 3. Test ping to ensure connection is live
    const testConn = await dbPool.getConnection();
    await testConn.ping();
    testConn.release();

    // 4. Create Tables if they don't exist
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`email\` VARCHAR(191) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`full_name\` VARCHAR(255) NOT NULL,
        \`nip\` VARCHAR(64) DEFAULT '-',
        \`role_title\` VARCHAR(255) DEFAULT 'Pegawai / Operator GTK',
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS \`sop_documents\` (
        \`id\` VARCHAR(100) PRIMARY KEY,
        \`nomor_pos\` VARCHAR(100) NOT NULL,
        \`instansi\` TEXT NOT NULL,
        \`unit_kerja\` VARCHAR(255) NOT NULL,
        \`tanggal_pembuatan\` VARCHAR(100) NOT NULL,
        \`tanggal_revisi\` VARCHAR(100) DEFAULT '',
        \`tanggal_efektif\` VARCHAR(100) NOT NULL,
        \`nama_pos\` TEXT NOT NULL,
        \`disahkan_nama\` VARCHAR(255) NOT NULL,
        \`disahkan_nip\` VARCHAR(100) NOT NULL,
        \`disahkan_jabatan\` VARCHAR(255) NOT NULL,
        \`dasar_hukum\` JSON NOT NULL,
        \`kualifikasi_pelaksana\` JSON NOT NULL,
        \`keterkaitan\` JSON NOT NULL,
        \`peralatan\` JSON NOT NULL,
        \`peringatan\` JSON NOT NULL,
        \`pencatatan\` JSON NOT NULL,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS \`data_changes\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`entity_type\` VARCHAR(50) NOT NULL,
        \`entity_id\` VARCHAR(100) NOT NULL,
        \`action_type\` VARCHAR(50) NOT NULL,
        \`user_email\` VARCHAR(191) NOT NULL,
        \`description\` TEXT NOT NULL,
        \`changes_json\` JSON DEFAULT NULL,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS \`authorized_emails\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`email\` VARCHAR(191) NOT NULL UNIQUE,
        \`full_name\` VARCHAR(255) NOT NULL,
        \`nip\` VARCHAR(64) DEFAULT '-',
        \`role_title\` VARCHAR(255) DEFAULT 'Pegawai / Operator GTK',
        \`is_registered\` TINYINT(1) DEFAULT 0,
        \`registered_at\` DATETIME DEFAULT NULL,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS \`login_logs\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_email\` VARCHAR(191) NOT NULL,
        \`status\` VARCHAR(50) NOT NULL,
        \`ip_address\` VARCHAR(100) DEFAULT '127.0.0.1',
        \`user_agent\` TEXT DEFAULT NULL,
        \`message\` TEXT NOT NULL,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Seed initial authorized emails if empty
    const [authRows]: any = await dbPool.query('SELECT COUNT(*) as count FROM `authorized_emails`');
    if (authRows[0]?.count === 0) {
      for (const a of DEFAULT_AUTHORIZED_EMAILS) {
        await dbPool.query(
          'INSERT INTO `authorized_emails` (`email`, `full_name`, `nip`, `role_title`, `is_registered`, `registered_at`) VALUES (?, ?, ?, ?, ?, ?)',
          [a.email, a.fullName, a.nip, a.roleTitle, a.isRegistered ? 1 : 0, a.registeredAt]
        );
      }
    }

    // 5. Seed initial users if empty
    const [userRows]: any = await dbPool.query('SELECT COUNT(*) as count FROM `users`');
    if (userRows[0]?.count === 0) {
      for (const u of DEFAULT_USERS) {
        await dbPool.query(
          'INSERT INTO `users` (`email`, `password`, `full_name`, `nip`, `role_title`) VALUES (?, ?, ?, ?, ?)',
          [u.email, u.password, u.fullName, u.nip, u.roleTitle]
        );
      }
    }

    // 5. Seed initial SOP if empty
    const [sopRows]: any = await dbPool.query('SELECT COUNT(*) as count FROM `sop_documents`');
    if (sopRows[0]?.count === 0) {
      await dbPool.query(`
        INSERT INTO \`sop_documents\` (
          \`id\`, \`nomor_pos\`, \`instansi\`, \`unit_kerja\`,
          \`tanggal_pembuatan\`, \`tanggal_revisi\`, \`tanggal_efektif\`,
          \`nama_pos\`, \`disahkan_nama\`, \`disahkan_nip\`, \`disahkan_jabatan\`,
          \`dasar_hukum\`, \`kualifikasi_pelaksana\`, \`keterkaitan\`,
          \`peralatan\`, \`peringatan\`, \`pencatatan\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        DEFAULT_SOP.id,
        DEFAULT_SOP.nomorPos,
        DEFAULT_SOP.instansi,
        DEFAULT_SOP.unitKerja,
        DEFAULT_SOP.tanggalPembuatan,
        DEFAULT_SOP.tanggalRevisi,
        DEFAULT_SOP.tanggalEfektif,
        DEFAULT_SOP.namaPos,
        DEFAULT_SOP.disahkanOleh.nama,
        DEFAULT_SOP.disahkanOleh.nip,
        DEFAULT_SOP.disahkanOleh.jabatan,
        JSON.stringify(DEFAULT_SOP.dasarHukum),
        JSON.stringify(DEFAULT_SOP.kualifikasiPelaksana),
        JSON.stringify(DEFAULT_SOP.keterkaitan),
        JSON.stringify(DEFAULT_SOP.peralatan),
        JSON.stringify(DEFAULT_SOP.peringatan),
        JSON.stringify(DEFAULT_SOP.pencatatan)
      ]);
    }

    isMySqlConnected = true;
    mySqlLastError = null;
    console.log(`[Database] Terhubung ke database "${MYSQL_CONFIG.database}" di ${MYSQL_CONFIG.host}:${MYSQL_CONFIG.port}`);
    return true;
  } catch (error: any) {
    isMySqlConnected = false;
    mySqlLastError = error.message || 'Koneksi database belum aktif';
    return false;
  }
}

// Helper to log changes to MySQL or memory
async function recordDataChange(
  entityType: string,
  entityId: string,
  actionType: string,
  userEmail: string,
  description: string,
  changesJson?: any
) {
  const timestamp = new Date().toISOString();
  if (isMySqlConnected && dbPool) {
    try {
      await dbPool.query(
        'INSERT INTO `data_changes` (`entity_type`, `entity_id`, `action_type`, `user_email`, `description`, `changes_json`) VALUES (?, ?, ?, ?, ?, ?)',
        [entityType, entityId, actionType, userEmail, description, changesJson ? JSON.stringify(changesJson) : null]
      );
    } catch (err) {
      console.warn('Gagal mencatat perubahan ke MySQL data_changes:', err);
    }
  }

  memoryChanges.unshift({
    id: memoryChanges.length + 1,
    entityType,
    entityId,
    actionType,
    userEmail,
    description,
    changesJson,
    createdAt: timestamp
  });
}

// Helper to log logins to MySQL or memory
async function recordLoginLog(
  userEmail: string,
  status: string,
  message: string,
  req?: express.Request
) {
  const ipAddress = (req?.headers['x-forwarded-for'] as string) || req?.socket?.remoteAddress || '127.0.0.1';
  const userAgent = (req?.headers['user-agent'] as string) || 'Browser Client';
  const timestamp = new Date().toISOString();

  if (isMySqlConnected && dbPool) {
    try {
      await dbPool.query(
        'INSERT INTO `login_logs` (`user_email`, `status`, `ip_address`, `user_agent`, `message`) VALUES (?, ?, ?, ?, ?)',
        [userEmail, status, ipAddress, userAgent, message]
      );
    } catch (err) {
      console.warn('Gagal mencatat ke MySQL login_logs:', err);
    }
  }

  memoryLoginLogs.unshift({
    id: memoryLoginLogs.length + 1,
    userEmail,
    status,
    ipAddress,
    userAgent,
    message,
    createdAt: timestamp
  });
}

// ==========================================
// API ROUTES (Backend JavaScript / Express)
// ==========================================

// 1. Health & Server Info (Bukan PHP)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    framework: 'Express.js (Node.js/TypeScript)',
    isPHP: false,
    timestamp: new Date().toISOString()
  });
});

// 2. Status Koneksi MySQL Laragon & Metadata
app.get('/api/database/status', async (req, res) => {
  // Test connection on-demand
  await initMySqlConnection();

  let userCount = memoryUsers.length;
  let docCount = memorySopDocs.length;
  let changeCount = memoryChanges.length;
  let authEmailCount = memoryAuthorizedEmails.length;
  let loginLogCount = memoryLoginLogs.length;

  if (isMySqlConnected && dbPool) {
    try {
      const [uRows]: any = await dbPool.query('SELECT COUNT(*) as count FROM `users`');
      const [dRows]: any = await dbPool.query('SELECT COUNT(*) as count FROM `sop_documents`');
      const [cRows]: any = await dbPool.query('SELECT COUNT(*) as count FROM `data_changes`');
      const [aRows]: any = await dbPool.query('SELECT COUNT(*) as count FROM `authorized_emails`');
      const [lRows]: any = await dbPool.query('SELECT COUNT(*) as count FROM `login_logs`');
      userCount = uRows[0]?.count || 0;
      docCount = dRows[0]?.count || 0;
      changeCount = cRows[0]?.count || 0;
      authEmailCount = aRows[0]?.count || 0;
      loginLogCount = lRows[0]?.count || 0;
    } catch (e) {
      // ignore
    }
  }

  res.json({
    mysqlConnected: isMySqlConnected,
    lastError: mySqlLastError,
    config: {
      host: MYSQL_CONFIG.host,
      port: MYSQL_CONFIG.port,
      user: MYSQL_CONFIG.user,
      database: MYSQL_CONFIG.database
    },
    tables: [
      { name: 'authorized_emails', description: 'Daftar Whitelist Email Terotorisasi & Status Registrasi', recordCount: authEmailCount },
      { name: 'users', description: 'Kredensial Akun Login Aktif (Email, Password, NIP, Peran)', recordCount: userCount },
      { name: 'login_logs', description: 'Riwayat Log Login, Aktivasi Kata Sandi & Akses Masuk MySQL', recordCount: loginLogCount },
      { name: 'sop_documents', description: 'Naskah Dokumen Resmi POS AP Format PermenPAN-RB No. 35/2012', recordCount: docCount },
      { name: 'data_changes', description: 'Log Audit Riwayat Setiap Perubahan Data Sistem', recordCount: changeCount }
    ],
    backendInfo: {
      framework: 'Express.js v4.21',
      runtime: 'Node.js',
      driver: 'mysql2/promise',
      isPHP: false
    }
  });
});

// 3. Download/View SQL Schema File
app.get('/api/database/schema-sql', (req, res) => {
  const schemaPath = path.join(process.cwd(), 'sim_sop_gtk_laragon.sql');
  if (fs.existsSync(schemaPath)) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.sendFile(schemaPath);
  } else {
    res.status(404).send('File sim_sop_gtk_laragon.sql tidak ditemukan.');
  }
});

// 4. Test Koneksi Manual
app.post('/api/database/test-connection', async (req, res) => {
  const connected = await initMySqlConnection();
  res.json({
    success: connected,
    mysqlConnected: connected,
    message: connected 
      ? `Berhasil terhubung ke MySQL Laragon (${MYSQL_CONFIG.host}:${MYSQL_CONFIG.port}/${MYSQL_CONFIG.database})`
      : `Tidak dapat terhubung ke MySQL: ${mySqlLastError || 'Koneksi timeout'}`
  });
});

// -------------------------------------------------------------
// 5. WHITELIST PEMBATASAN AKSES & PENDAFTARAN KATA SANDI
// -------------------------------------------------------------

// 5A. Ambil Semua Email Terotorisasi (Whitelist)
app.get('/api/auth/authorized-emails', async (req, res) => {
  if (isMySqlConnected && dbPool) {
    try {
      const [rows]: any = await dbPool.query(
        'SELECT `id`, `email`, `full_name` as `fullName`, `nip`, `role_title` as `roleTitle`, `is_registered` as `isRegistered`, `registered_at` as `registeredAt`, `created_at` as `createdAt` FROM `authorized_emails` ORDER BY `id` ASC'
      );
      return res.json(rows);
    } catch (e) {
      console.warn('MySQL get authorized_emails failed, using memory:', e);
    }
  }
  res.json(memoryAuthorizedEmails);
});

// 5B. Cek Status Izin Email (Untuk Verifikasi Pra-Pendaftaran / Whitelist Check)
app.get('/api/auth/check-whitelist/:email', async (req, res) => {
  const targetEmail = (req.params.email || '').trim().toLowerCase();

  let match: any = null;

  if (isMySqlConnected && dbPool) {
    try {
      const [rows]: any = await dbPool.query(
        'SELECT `email`, `full_name` as `fullName`, `nip`, `role_title` as `roleTitle`, `is_registered` as `isRegistered` FROM `authorized_emails` WHERE LOWER(`email`) = ?',
        [targetEmail]
      );
      if (rows.length > 0) {
        match = {
          email: rows[0].email,
          fullName: rows[0].fullName,
          nip: rows[0].nip,
          roleTitle: rows[0].roleTitle,
          isRegistered: Boolean(rows[0].isRegistered)
        };
      }
    } catch (e) {
      console.warn('MySQL check whitelist failed:', e);
    }
  }

  if (!match) {
    const memFound = memoryAuthorizedEmails.find(a => a.email.toLowerCase() === targetEmail);
    if (memFound) {
      match = {
        email: memFound.email,
        fullName: memFound.fullName,
        nip: memFound.nip,
        roleTitle: memFound.roleTitle,
        isRegistered: Boolean(memFound.isRegistered)
      };
    }
  }

  if (match) {
    return res.json({
      isAuthorized: true,
      isRegistered: match.isRegistered,
      authorizedAccount: match,
      message: match.isRegistered 
        ? 'Alamat email ini terdaftar dan sudah aktif. Anda dapat masuk atau memperbarui kata sandi baru Anda.'
        : 'Alamat email terdaftar dan terverifikasi dalam sistem izin. Silakan daftarkan kata sandi Anda.'
    });
  } else {
    return res.json({
      isAuthorized: false,
      isRegistered: false,
      message: `Akses Ditolak: Alamat email "${targetEmail}" belum terdaftar dalam daftar izin SIM-SOP GTK Provinsi Gorontalo. Pembatasan akses aktif.`
    });
  }
});

// 5C. Pendaftaran / Pembuatan Kata Sandi untuk Email yang Diizinkan (User Tinggal Mendaftarkan Password)
app.post('/api/auth/register-password', async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !password) {
    return res.status(400).json({ success: false, error: 'Email dan kata sandi wajib diisi.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Kata sandi minimal 6 karakter.' });
  }

  // 1. Verifikasi apakah email masuk dalam whitelist
  let authorized: any = null;

  if (isMySqlConnected && dbPool) {
    try {
      const [rows]: any = await dbPool.query(
        'SELECT * FROM `authorized_emails` WHERE LOWER(`email`) = ?',
        [cleanEmail]
      );
      if (rows.length > 0) {
        authorized = rows[0];
      }
    } catch (e) {
      console.warn('MySQL query authorized_emails error:', e);
    }
  }

  if (!authorized) {
    authorized = memoryAuthorizedEmails.find(a => a.email.toLowerCase() === cleanEmail);
  }

  if (!authorized) {
    await recordDataChange(
      'AUTH',
      cleanEmail,
      'REGISTER_DENIED',
      cleanEmail,
      `Pendaftaran ditolak untuk email "${cleanEmail}" karena tidak terdaftar dalam whitelist akses.`
    );
    return res.status(403).json({
      success: false,
      error: `Akses Ditolak: Email "${cleanEmail}" tidak terdaftar dalam daftar izin SIM-SOP GTK Provinsi Gorontalo. Pembatasan akses ketat berlaku.`
    });
  }

  const fullName = authorized.full_name || authorized.fullName || 'Pegawai GTK Terdaftar';
  const nip = authorized.nip || '-';
  const roleTitle = authorized.role_title || authorized.roleTitle || 'Pelaksana / Pengelola SOP AP';

  // 2. Simpan atau perbarui kata sandi di tabel `users` MySQL
  if (isMySqlConnected && dbPool) {
    try {
      await dbPool.query(`
        INSERT INTO \`users\` (\`email\`, \`password\`, \`full_name\`, \`nip\`, \`role_title\`)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          \`password\` = VALUES(\`password\`),
          \`full_name\` = VALUES(\`full_name\`),
          \`nip\` = VALUES(\`nip\`),
          \`role_title\` = VALUES(\`role_title\`),
          \`updated_at\` = NOW()
      `, [cleanEmail, password, fullName, nip, roleTitle]);

      // Tandai di authorized_emails bahwa user telah mendaftarkan password
      await dbPool.query(
        'UPDATE `authorized_emails` SET `is_registered` = 1, `registered_at` = NOW() WHERE LOWER(`email`) = ?',
        [cleanEmail]
      );
    } catch (err: any) {
      console.warn('MySQL register password failed, updating memory:', err);
    }
  }

  // 3. Update memory state
  const existingUserIdx = memoryUsers.findIndex(u => u.email.toLowerCase() === cleanEmail);
  const userRecord = {
    email: cleanEmail,
    password,
    fullName,
    nip,
    roleTitle
  };

  if (existingUserIdx >= 0) {
    memoryUsers[existingUserIdx] = userRecord;
  } else {
    memoryUsers.push(userRecord);
  }

  const authIdx = memoryAuthorizedEmails.findIndex(a => a.email.toLowerCase() === cleanEmail);
  if (authIdx >= 0) {
    memoryAuthorizedEmails[authIdx].isRegistered = true;
    memoryAuthorizedEmails[authIdx].registeredAt = new Date().toISOString();
  }

  // 4. Catat ke audit log data_changes dan login_logs
  await recordLoginLog(
    cleanEmail,
    'REGISTER_PASSWORD',
    `Pengguna ${fullName} (${cleanEmail}) berhasil mendaftarkan kata sandi baru. Akun aktif.`,
    req
  );

  await recordDataChange(
    'AUTH',
    cleanEmail,
    'REGISTER_PASSWORD',
    cleanEmail,
    `Pengguna ${fullName} (${cleanEmail}) berhasil mendaftarkan/mengatur kata sandi akun.`
  );

  return res.json({
    success: true,
    message: `Pendaftaran kata sandi berhasil untuk akun ${fullName} (${cleanEmail})! Akun Anda kini aktif. Silakan login sekarang.`
  });
});

// 5D. Tambah Email Baru ke Whitelist (Khusus Administrator)
app.post('/api/auth/authorized-emails', async (req, res) => {
  const { email, fullName, nip, roleTitle, currentActorEmail } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !fullName) {
    return res.status(400).json({ error: 'Email dan nama lengkap pegawai wajib diisi.' });
  }

  if (isMySqlConnected && dbPool) {
    try {
      await dbPool.query(
        'INSERT INTO `authorized_emails` (`email`, `full_name`, `nip`, `role_title`, `is_registered`) VALUES (?, ?, ?, ?, 0)',
        [cleanEmail, fullName, nip || '-', roleTitle || 'Pegawai / Operator GTK']
      );
    } catch (err: any) {
      return res.status(400).json({ error: 'Email sudah terdaftar dalam whitelist: ' + err.message });
    }
  }

  const newAuth = {
    email: cleanEmail,
    fullName,
    nip: nip || '-',
    roleTitle: roleTitle || 'Pegawai / Operator GTK',
    isRegistered: false,
    registeredAt: null
  };

  const existIdx = memoryAuthorizedEmails.findIndex(a => a.email.toLowerCase() === cleanEmail);
  if (existIdx >= 0) {
    memoryAuthorizedEmails[existIdx] = newAuth;
  } else {
    memoryAuthorizedEmails.push(newAuth);
  }

  await recordDataChange(
    'WHITELIST',
    cleanEmail,
    'ADD_WHITELIST',
    currentActorEmail || 'admin',
    `Menambahkan izin akses whitelist untuk email: ${cleanEmail} (${fullName})`
  );

  res.json({ success: true, authorizedEmail: newAuth });
});

// 5E. Cabut Izin Email dari Whitelist (Khusus Administrator)
app.delete('/api/auth/authorized-emails/:email', async (req, res) => {
  const targetEmail = (req.params.email || '').trim().toLowerCase();
  const currentActorEmail = req.headers['x-user-email'] as string || 'admin';

  if (isMySqlConnected && dbPool) {
    try {
      await dbPool.query('DELETE FROM `authorized_emails` WHERE LOWER(`email`) = ?', [targetEmail]);
      // Optional: juga hapus dari users jika dicabut
      await dbPool.query('DELETE FROM `users` WHERE LOWER(`email`) = ?', [targetEmail]);
    } catch (err) {
      console.warn('MySQL delete authorized_emails failed:', err);
    }
  }

  memoryAuthorizedEmails = memoryAuthorizedEmails.filter(a => a.email.toLowerCase() !== targetEmail);
  memoryUsers = memoryUsers.filter(u => u.email.toLowerCase() !== targetEmail);

  await recordDataChange(
    'WHITELIST',
    targetEmail,
    'DELETE_WHITELIST',
    currentActorEmail,
    `Mencabut izin akses email ${targetEmail} dari sistem SIM-SOP GTK.`
  );

  res.json({ success: true, message: `Izin akses email ${targetEmail} telah dicabut.` });
});

// -------------------------------------------------------------
// 6. Auth Login dengan Pemeriksaan Pembatasan Akses Whitelist
// -------------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();

  // 1. Periksa apakah email ada dalam daftar izin (whitelist)
  let isAuthorized = false;
  let isRegistered = false;

  if (isMySqlConnected && dbPool) {
    try {
      const [authRows]: any = await dbPool.query(
        'SELECT `is_registered` FROM `authorized_emails` WHERE LOWER(`email`) = ?',
        [cleanEmail]
      );
      if (authRows.length > 0) {
        isAuthorized = true;
        isRegistered = Boolean(authRows[0].is_registered);
      }
    } catch (e) {
      console.warn('MySQL check auth email failed:', e);
    }
  }

  if (!isAuthorized) {
    const memAuth = memoryAuthorizedEmails.find(a => a.email.toLowerCase() === cleanEmail);
    if (memAuth) {
      isAuthorized = true;
      isRegistered = Boolean(memAuth.isRegistered);
    }
  }

  // Jika TIDAK ADA dalam whitelist: Tolak langsung!
  if (!isAuthorized) {
    await recordLoginLog(
      cleanEmail || 'unknown',
      'FAILED_UNAUTHORIZED',
      `Login ditolak: Email "${cleanEmail}" tidak terdaftar dalam whitelist izin akses.`,
      req
    );
    await recordDataChange(
      'AUTH',
      cleanEmail || 'unknown',
      'LOGIN_DENIED_UNAUTHORIZED',
      cleanEmail || 'unknown',
      `Login ditolak: Email "${cleanEmail}" tidak terdaftar dalam whitelist izin akses.`
    );
    return res.status(403).json({
      success: false,
      isUnauthorizedEmail: true,
      message: `Akses Ditolak: Alamat email "${cleanEmail}" tidak terdaftar dalam daftar izin SIM-SOP GTK Provinsi Gorontalo. Pembatasan akses aktif.`
    });
  }

  // Jika ada dalam whitelist tapi BELUM mendaftarkan kata sandi:
  if (!isRegistered) {
    await recordLoginLog(
      cleanEmail,
      'PENDING_REGISTRATION',
      `Login ditunda: Email "${cleanEmail}" belum mendaftarkan kata sandi di sistem.`,
      req
    );
    return res.status(400).json({
      success: false,
      isPendingRegistration: true,
      message: `Email Anda (${cleanEmail}) terdaftar dalam sistem izin, namun Anda belum mendaftarkan kata sandi. Silakan daftarkan kata sandi terlebih dahulu di tab "Daftar Akun / Aktivasi Kata Sandi".`
    });
  }

  // 2. Jika lolos verifikasi whitelist & status terdaftar, periksa kata sandi
  let user: any = null;

  if (isMySqlConnected && dbPool) {
    try {
      const [rows]: any = await dbPool.query(
        'SELECT * FROM `users` WHERE LOWER(`email`) = ? AND `password` = ?',
        [cleanEmail, password]
      );
      if (rows.length > 0) {
        user = {
          email: rows[0].email,
          fullName: rows[0].full_name,
          nip: rows[0].nip,
          roleTitle: rows[0].role_title
        };
      }
    } catch (err) {
      console.warn('MySQL auth query error:', err);
    }
  }

  // Fallback to memory
  if (!user) {
    const found = memoryUsers.find(
      u => u.email.toLowerCase() === cleanEmail && u.password === password
    );
    if (found) {
      user = {
        email: found.email,
        fullName: found.fullName,
        nip: found.nip,
        roleTitle: found.roleTitle
      };
    }
  }

  if (user) {
    currentActiveSession = {
      email: user.email,
      fullName: user.fullName,
      nip: user.nip,
      roleTitle: user.roleTitle,
      loginTime: new Date().toISOString()
    };

    await recordLoginLog(
      cleanEmail,
      'SUCCESS',
      `Pengguna ${user.fullName} (${cleanEmail}) berhasil login dan sesi aktif di MySQL.`,
      req
    );

    await recordDataChange(
      'AUTH',
      cleanEmail,
      'LOGIN_SUCCESS',
      cleanEmail,
      `Pengguna ${user.fullName} (${cleanEmail}) berhasil login.`
    );
    return res.json({ success: true, user });
  } else {
    await recordLoginLog(
      cleanEmail || 'unknown',
      'FAILED_PASSWORD',
      `Percobaan login gagal (kata sandi salah) untuk email "${cleanEmail}".`,
      req
    );

    await recordDataChange(
      'AUTH',
      cleanEmail || 'unknown',
      'LOGIN_FAILED',
      cleanEmail || 'unknown',
      `Percobaan login gagal (kata sandi salah) untuk email "${cleanEmail}".`
    );
    return res.status(401).json({ success: false, message: 'Kata sandi tidak sesuai!' });
  }
});

// 6A. Current Active Session (Tersinkronisasi Backend & MySQL)
app.get('/api/auth/current-session', (req, res) => {
  res.json({
    isAuthenticated: Boolean(currentActiveSession),
    user: currentActiveSession
  });
});

// 6B. Logout Session
app.post('/api/auth/logout', async (req, res) => {
  const userEmail = currentActiveSession?.email || req.body?.email || 'unknown';
  await recordLoginLog(
    userEmail,
    'LOGOUT',
    `Sesi pengguna ${userEmail} telah logout dari aplikasi.`,
    req
  );
  await recordDataChange(
    'AUTH',
    userEmail,
    'LOGOUT',
    userEmail,
    `Pengguna ${userEmail} keluar (logout) dari sistem.`
  );
  currentActiveSession = null;
  res.json({ success: true, message: 'Berhasil keluar dari sistem.' });
});

// 6C. Riwayat Log Login MySQL
app.get('/api/auth/login-logs', async (req, res) => {
  if (isMySqlConnected && dbPool) {
    try {
      const [rows]: any = await dbPool.query('SELECT `id`, `user_email` as `userEmail`, `status`, `ip_address` as `ipAddress`, `user_agent` as `userAgent`, `message`, `created_at` as `createdAt` FROM `login_logs` ORDER BY `id` DESC LIMIT 100');
      return res.json(rows);
    } catch (e) {
      console.warn('MySQL select login_logs failed:', e);
    }
  }
  res.json(memoryLoginLogs);
});

// 6D. Record System Change Endpoint (Untuk mencatat setiap interaksi UI ke data_changes MySQL)
app.post('/api/changes/record', async (req, res) => {
  const { entityType, entityId, actionType, userEmail, description, changesJson } = req.body;
  await recordDataChange(
    entityType || 'SYSTEM',
    entityId || 'SYS',
    actionType || 'UPDATE',
    userEmail || currentActiveSession?.email || 'user@kemdikbud.go.id',
    description || 'Perubahan data sistem',
    changesJson
  );
  res.json({ success: true });
});

// 6. Users CRUD
app.get('/api/auth/users', async (req, res) => {
  if (isMySqlConnected && dbPool) {
    try {
      const [rows]: any = await dbPool.query('SELECT `email`, `password`, `full_name` as `fullName`, `nip`, `role_title` as `roleTitle` FROM `users` ORDER BY `id` ASC');
      return res.json(rows);
    } catch (e) {
      console.warn('MySQL select users failed:', e);
    }
  }
  res.json(memoryUsers);
});

app.post('/api/auth/users', async (req, res) => {
  const { email, password, fullName, nip, roleTitle, currentActorEmail } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !password) {
    return res.status(400).json({ error: 'Email dan kata sandi wajib diisi.' });
  }

  if (isMySqlConnected && dbPool) {
    try {
      await dbPool.query(
        'INSERT INTO `users` (`email`, `password`, `full_name`, `nip`, `role_title`) VALUES (?, ?, ?, ?, ?)',
        [cleanEmail, password, fullName || 'Pegawai / Operator GTK', nip || '-', roleTitle || 'Pelaksana / Pengelola SOP AP']
      );
    } catch (err: any) {
      return res.status(400).json({ error: 'Email sudah terdaftar di MySQL: ' + err.message });
    }
  }

  const existingIdx = memoryUsers.findIndex(u => u.email.toLowerCase() === cleanEmail);
  const newUser = {
    email: cleanEmail,
    password,
    fullName: fullName || 'Pegawai / Operator GTK',
    nip: nip || '-',
    roleTitle: roleTitle || 'Pelaksana / Pengelola SOP AP'
  };

  if (existingIdx >= 0) {
    memoryUsers[existingIdx] = newUser;
  } else {
    memoryUsers.push(newUser);
  }

  await recordDataChange(
    'USER_ACCOUNT',
    cleanEmail,
    'CREATE',
    currentActorEmail || cleanEmail,
    `Menambahkan akun pengguna baru: ${cleanEmail} (${fullName})`,
    newUser
  );

  res.json({ success: true, user: newUser });
});

app.put('/api/auth/users/:email', async (req, res) => {
  const targetEmail = req.params.email.trim().toLowerCase();
  const { password, fullName, nip, roleTitle, currentActorEmail } = req.body;

  if (isMySqlConnected && dbPool) {
    try {
      let query = 'UPDATE `users` SET `updated_at` = NOW()';
      const params: any[] = [];

      if (password) {
        query += ', `password` = ?';
        params.push(password);
      }
      if (fullName) {
        query += ', `full_name` = ?';
        params.push(fullName);
      }
      if (nip) {
        query += ', `nip` = ?';
        params.push(nip);
      }
      if (roleTitle) {
        query += ', `role_title` = ?';
        params.push(roleTitle);
      }

      query += ' WHERE LOWER(`email`) = ?';
      params.push(targetEmail);

      await dbPool.query(query, params);
    } catch (err) {
      console.warn('MySQL update user failed:', err);
    }
  }

  const userIdx = memoryUsers.findIndex(u => u.email.toLowerCase() === targetEmail);
  if (userIdx >= 0) {
    if (password) memoryUsers[userIdx].password = password;
    if (fullName) memoryUsers[userIdx].fullName = fullName;
    if (nip) memoryUsers[userIdx].nip = nip;
    if (roleTitle) memoryUsers[userIdx].roleTitle = roleTitle;
  }

  await recordDataChange(
    'USER_ACCOUNT',
    targetEmail,
    'UPDATE',
    currentActorEmail || targetEmail,
    `Kredensial atau profil akun ${targetEmail} diperbarui di database.`
  );

  res.json({ success: true });
});

app.delete('/api/auth/users/:email', async (req, res) => {
  const targetEmail = req.params.email.trim().toLowerCase();
  const { currentActorEmail } = req.body || {};

  if (isMySqlConnected && dbPool) {
    try {
      await dbPool.query('DELETE FROM `users` WHERE LOWER(`email`) = ?', [targetEmail]);
    } catch (err) {
      console.warn('MySQL delete user failed:', err);
    }
  }

  memoryUsers = memoryUsers.filter(u => u.email.toLowerCase() !== targetEmail);

  await recordDataChange(
    'USER_ACCOUNT',
    targetEmail,
    'DELETE',
    currentActorEmail || 'admin',
    `Menghapus akun ${targetEmail} dari database.`
  );

  res.json({ success: true });
});

// 7. SOP Documents CRUD
app.get('/api/sop', async (req, res) => {
  if (isMySqlConnected && dbPool) {
    try {
      const [rows]: any = await dbPool.query('SELECT * FROM `sop_documents` ORDER BY `created_at` ASC');
      if (rows.length > 0) {
        const formatted = rows.map((r: any) => ({
          id: r.id,
          nomorPos: r.nomor_pos,
          instansi: r.instansi,
          unitKerja: r.unit_kerja,
          tanggalPembuatan: r.tanggal_pembuatan,
          tanggalRevisi: r.tanggal_revisi,
          tanggalEfektif: r.tanggal_efektif,
          namaPos: r.nama_pos,
          disahkanOleh: {
            nama: r.disahkan_nama,
            nip: r.disahkan_nip,
            jabatan: r.disahkan_jabatan
          },
          dasarHukum: typeof r.dasar_hukum === 'string' ? JSON.parse(r.dasar_hukum) : r.dasar_hukum,
          kualifikasiPelaksana: typeof r.kualifikasi_pelaksana === 'string' ? JSON.parse(r.kualifikasi_pelaksana) : r.kualifikasi_pelaksana,
          keterkaitan: typeof r.keterkaitan === 'string' ? JSON.parse(r.keterkaitan) : r.keterkaitan,
          peralatan: typeof r.peralatan === 'string' ? JSON.parse(r.peralatan) : r.peralatan,
          peringatan: typeof r.peringatan === 'string' ? JSON.parse(r.peringatan) : r.peringatan,
          pencatatan: typeof r.pencatatan === 'string' ? JSON.parse(r.pencatatan) : r.pencatatan
        }));
        return res.json(formatted);
      }
    } catch (err) {
      console.warn('MySQL select sop_documents failed:', err);
    }
  }
  res.json(memorySopDocs);
});

app.post('/api/sop', async (req, res) => {
  const sop = req.body;
  const userEmail = req.headers['x-user-email'] as string || 'system';

  if (!sop || !sop.id) {
    return res.status(400).json({ error: 'Data dokumen SOP tidak valid.' });
  }

  if (isMySqlConnected && dbPool) {
    try {
      await dbPool.query(`
        INSERT INTO \`sop_documents\` (
          \`id\`, \`nomor_pos\`, \`instansi\`, \`unit_kerja\`,
          \`tanggal_pembuatan\`, \`tanggal_revisi\`, \`tanggal_efektif\`,
          \`nama_pos\`, \`disahkan_nama\`, \`disahkan_nip\`, \`disahkan_jabatan\`,
          \`dasar_hukum\`, \`kualifikasi_pelaksana\`, \`keterkaitan\`,
          \`peralatan\`, \`peringatan\`, \`pencatatan\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          \`nomor_pos\` = VALUES(\`nomor_pos\`),
          \`instansi\` = VALUES(\`instansi\`),
          \`unit_kerja\` = VALUES(\`unit_kerja\`),
          \`tanggal_pembuatan\` = VALUES(\`tanggal_pembuatan\`),
          \`tanggal_revisi\` = VALUES(\`tanggal_revisi\`),
          \`tanggal_efektif\` = VALUES(\`tanggal_efektif\`),
          \`nama_pos\` = VALUES(\`nama_pos\`),
          \`disahkan_nama\` = VALUES(\`disahkan_nama\`),
          \`disahkan_nip\` = VALUES(\`disahkan_nip\`),
          \`disahkan_jabatan\` = VALUES(\`disahkan_jabatan\`),
          \`dasar_hukum\` = VALUES(\`dasar_hukum\`),
          \`kualifikasi_pelaksana\` = VALUES(\`kualifikasi_pelaksana\`),
          \`keterkaitan\` = VALUES(\`keterkaitan\`),
          \`peralatan\` = VALUES(\`peralatan\`),
          \`peringatan\` = VALUES(\`peringatan\`),
          \`pencatatan\` = VALUES(\`pencatatan\`),
          \`updated_at\` = NOW()
      `, [
        sop.id,
        sop.nomorPos || '0000/T/B7.33/OT.02.00/2026',
        sop.instansi || '',
        sop.unitKerja || '',
        sop.tanggalPembuatan || '',
        sop.tanggalRevisi || '',
        sop.tanggalEfektif || '',
        sop.namaPos || '',
        sop.disahkanOleh?.nama || '',
        sop.disahkanOleh?.nip || '',
        sop.disahkanOleh?.jabatan || '',
        JSON.stringify(sop.dasarHukum || []),
        JSON.stringify(sop.kualifikasiPelaksana || []),
        JSON.stringify(sop.keterkaitan || []),
        JSON.stringify(sop.peralatan || []),
        JSON.stringify(sop.peringatan || []),
        JSON.stringify(sop.pencatatan || [])
      ]);
    } catch (err) {
      console.warn('MySQL insert SOP failed:', err);
    }
  }

  const existingIdx = memorySopDocs.findIndex(d => d.id === sop.id);
  const completeDoc = {
    ...DEFAULT_SOP,
    ...(existingIdx >= 0 ? memorySopDocs[existingIdx] : {}),
    ...sop
  };

  if (existingIdx >= 0) {
    memorySopDocs[existingIdx] = completeDoc;
  } else {
    memorySopDocs.unshift(completeDoc);
  }

  await recordDataChange(
    'SOP_DOCUMENT',
    sop.id,
    'CREATE',
    userEmail,
    `Menambahkan naskah POS AP baru "${sop.namaPos}" (${sop.nomorPos})`,
    sop
  );

  res.json({ success: true, document: completeDoc });
});

app.put('/api/sop/:id', async (req, res) => {
  const docId = req.params.id;
  const sop = req.body;
  const userEmail = req.headers['x-user-email'] as string || 'operator';

  if (isMySqlConnected && dbPool) {
    try {
      await dbPool.query(`
        INSERT INTO \`sop_documents\` (
          \`id\`, \`nomor_pos\`, \`instansi\`, \`unit_kerja\`,
          \`tanggal_pembuatan\`, \`tanggal_revisi\`, \`tanggal_efektif\`,
          \`nama_pos\`, \`disahkan_nama\`, \`disahkan_nip\`, \`disahkan_jabatan\`,
          \`dasar_hukum\`, \`kualifikasi_pelaksana\`, \`keterkaitan\`,
          \`peralatan\`, \`peringatan\`, \`pencatatan\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          \`nomor_pos\` = VALUES(\`nomor_pos\`),
          \`instansi\` = VALUES(\`instansi\`),
          \`unit_kerja\` = VALUES(\`unit_kerja\`),
          \`tanggal_pembuatan\` = VALUES(\`tanggal_pembuatan\`),
          \`tanggal_revisi\` = VALUES(\`tanggal_revisi\`),
          \`tanggal_efektif\` = VALUES(\`tanggal_efektif\`),
          \`nama_pos\` = VALUES(\`nama_pos\`),
          \`disahkan_nama\` = VALUES(\`disahkan_nama\`),
          \`disahkan_nip\` = VALUES(\`disahkan_nip\`),
          \`disahkan_jabatan\` = VALUES(\`disahkan_jabatan\`),
          \`dasar_hukum\` = VALUES(\`dasar_hukum\`),
          \`kualifikasi_pelaksana\` = VALUES(\`kualifikasi_pelaksana\`),
          \`keterkaitan\` = VALUES(\`keterkaitan\`),
          \`peralatan\` = VALUES(\`peralatan\`),
          \`peringatan\` = VALUES(\`peringatan\`),
          \`pencatatan\` = VALUES(\`pencatatan\`),
          \`updated_at\` = NOW()
      `, [
        docId,
        sop.nomorPos || '0000/T/B7.33/OT.02.00/2026',
        sop.instansi || '',
        sop.unitKerja || '',
        sop.tanggalPembuatan || '',
        sop.tanggalRevisi || '',
        sop.tanggalEfektif || '',
        sop.namaPos || '',
        sop.disahkanOleh?.nama || '',
        sop.disahkanOleh?.nip || '',
        sop.disahkanOleh?.jabatan || '',
        JSON.stringify(sop.dasarHukum || []),
        JSON.stringify(sop.kualifikasiPelaksana || []),
        JSON.stringify(sop.keterkaitan || []),
        JSON.stringify(sop.peralatan || []),
        JSON.stringify(sop.peringatan || []),
        JSON.stringify(sop.pencatatan || [])
      ]);
    } catch (err) {
      console.warn('MySQL update SOP failed:', err);
    }
  }

  const idx = memorySopDocs.findIndex(d => d.id === docId);
  const updatedDoc = idx >= 0
    ? { ...memorySopDocs[idx], ...sop, id: docId }
    : { ...DEFAULT_SOP, ...sop, id: docId };

  if (idx >= 0) {
    memorySopDocs[idx] = updatedDoc;
  } else {
    memorySopDocs.unshift(updatedDoc);
  }

  await recordDataChange(
    'SOP_DOCUMENT',
    docId,
    'UPDATE',
    userEmail,
    `Memperbarui naskah POS AP "${updatedDoc.namaPos}" (${updatedDoc.nomorPos})`,
    { nomorPos: updatedDoc.nomorPos, namaPos: updatedDoc.namaPos, updatedAt: new Date().toISOString() }
  );

  res.json({ success: true, document: updatedDoc });
});

app.delete('/api/sop/:id', async (req, res) => {
  const docId = req.params.id;
  const userEmail = req.headers['x-user-email'] as string || 'admin';

  if (isMySqlConnected && dbPool) {
    try {
      await dbPool.query('DELETE FROM `sop_documents` WHERE `id` = ?', [docId]);
    } catch (err) {
      console.warn('MySQL delete SOP failed:', err);
    }
  }

  const deletedDoc = memorySopDocs.find(d => d.id === docId);
  memorySopDocs = memorySopDocs.filter(d => d.id !== docId);

  await recordDataChange(
    'SOP_DOCUMENT',
    docId,
    'DELETE',
    userEmail,
    `Menghapus naskah POS AP "${deletedDoc?.namaPos || docId}" dari database.`
  );

  res.json({ success: true });
});

// 8. Log Riwayat Perubahan Data (Audit Logs)
app.get('/api/changes', async (req, res) => {
  if (isMySqlConnected && dbPool) {
    try {
      const [rows]: any = await dbPool.query('SELECT * FROM `data_changes` ORDER BY `id` DESC LIMIT 100');
      const formatted = rows.map((r: any) => ({
        id: r.id,
        entityType: r.entity_type,
        entityId: r.entity_id,
        actionType: r.action_type,
        userEmail: r.user_email,
        description: r.description,
        changesJson: typeof r.changes_json === 'string' ? JSON.parse(r.changes_json) : r.changes_json,
        createdAt: r.created_at
      }));
      return res.json(formatted);
    } catch (err) {
      console.warn('MySQL select data_changes failed:', err);
    }
  }
  res.json(memoryChanges);
});

// ==========================================
// START SERVER WITH VITE MIDDLEWARE / PRODUCTION
// ==========================================
async function startServer() {
  // Attempt initial MySQL connect
  initMySqlConnection().catch(() => {});

  // Periodic reconnect retry for cloud container lifecycle (Railway)
  setInterval(async () => {
    if (!isMySqlConnected) {
      await initMySqlConnection().catch(() => {});
    }
  }, 12000);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const indexHtmlPath = path.join(distPath, 'index.html');
    
    if (fs.existsSync(indexHtmlPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(indexHtmlPath);
      });
    } else {
      // Standalone backend mode on Railway
      app.get('/', (req, res) => {
        res.status(200).json({
          name: 'SIM-SOP GTK Gorontalo - Backend API',
          status: 'online',
          platform: isRailway ? 'Railway' : 'Node.js Express',
          database: isMySqlConnected ? 'connected' : 'connecting',
          targetDb: MYSQL_URL ? 'Railway MySQL (MYSQL_URL)' : `${MYSQL_CONFIG.host}:${MYSQL_CONFIG.port}/${MYSQL_CONFIG.database}`,
          endpoints: {
            health: '/api/health',
            dbStatus: '/api/database/status',
            login: 'POST /api/auth/login',
            register: 'POST /api/auth/register-password',
            whitelist: 'GET /api/auth/check-whitelist/:email',
            sop: 'GET /api/sop'
          }
        });
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Express Backend] Server listening on http://0.0.0.0:${PORT}`);
    console.log(`[Deployment Mode] ${isRailway ? 'Railway Cloud Service' : 'Local Development'}`);
    console.log(`[Database Target] ${MYSQL_URL ? 'Railway MYSQL_URL' : `${MYSQL_CONFIG.host}:${MYSQL_CONFIG.port}/${MYSQL_CONFIG.database}`}`);
  });
}

startServer();
