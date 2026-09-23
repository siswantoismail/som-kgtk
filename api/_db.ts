import mysql from "mysql2/promise";

// Cloud MySQL Connection configuration for Vercel Serverless Functions & Local Node
const TIDB_DEFAULT_URL =
  'mysql://BDmitH2gbZrQghR.root:xQNmcG5Rr9pCY74E@gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/sim_sop_gtk?ssl={"rejectUnauthorized":false}';
const MYSQL_URL =
  process.env.MYSQL_URL || process.env.DATABASE_URL || TIDB_DEFAULT_URL;

const MYSQL_CONFIG = {
  host:
    process.env.MYSQLHOST ||
    process.env.MYSQL_HOST ||
    process.env.DB_HOST ||
    "gateway01.ap-northeast-1.prod.aws.tidbcloud.com",
  port:
    Number(
      process.env.MYSQLPORT || process.env.MYSQL_PORT || process.env.DB_PORT,
    ) || 4000,
  user:
    process.env.MYSQLUSER ||
    process.env.MYSQL_USER ||
    process.env.DB_USER ||
    "BDmitH2gbZrQghR.root",
  password:
    process.env.MYSQLPASSWORD ||
    process.env.MYSQL_PASSWORD ||
    process.env.DB_PASSWORD ||
    "xQNmcG5Rr9pCY74E",
  database:
    process.env.MYSQLDATABASE ||
    process.env.MYSQL_DATABASE ||
    process.env.DB_NAME ||
    "sim_sop_gtk",
  connectTimeout: 10000,
};

const isRemoteDb = Boolean(
  MYSQL_URL ||
  (MYSQL_CONFIG.host !== "localhost" && MYSQL_CONFIG.host !== "127.0.0.1"),
);

// Global pool cached across Vercel serverless invocations
let globalPool: mysql.Pool | null = null;
let tablesInitialized = false;

export function getDbPool(): mysql.Pool {
  const currentUrl =
    process.env.MYSQL_URL || process.env.DATABASE_URL || TIDB_DEFAULT_URL;

  if (!globalPool) {
    if (currentUrl) {
      try {
        // Strip any raw json query parameter like ?ssl={"rejectUnauthorized":false}
        const cleanUri = currentUrl.split("?")[0];
        const parsedUrl = new URL(cleanUri);
        const host = parsedUrl.hostname;
        const port = Number(parsedUrl.port) || 4000;
        const user = decodeURIComponent(parsedUrl.username);
        const password = decodeURIComponent(parsedUrl.password);
        const dbFromPath = parsedUrl.pathname
          ? parsedUrl.pathname.replace(/^\//, "")
          : "";
        const database =
          dbFromPath && dbFromPath !== "sys" ? dbFromPath : "sim_sop_gtk";

        globalPool = mysql.createPool({
          host,
          port,
          user,
          password,
          database,
          waitForConnections: true,
          connectionLimit: 5,
          queueLimit: 0,
          connectTimeout: 10000,
          ssl: {
            rejectUnauthorized: false,
          },
        });
      } catch {
        globalPool = mysql.createPool({
          uri: currentUrl,
          waitForConnections: true,
          connectionLimit: 5,
          queueLimit: 0,
          connectTimeout: 10000,
          ssl: { rejectUnauthorized: false },
        });
      }
    } else {
      globalPool = mysql.createPool({
        ...MYSQL_CONFIG,
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0,
        connectTimeout: 10000,
        ssl:
          isRemoteDb && process.env.MYSQL_SSL !== "false"
            ? { rejectUnauthorized: false }
            : undefined,
      });
    }
  }
  return globalPool;
}

export const DEFAULT_USERS = [
  {
    email: "admin@kemdikbud.go.id",
    password: "admin123",
    fullName: "Administrator SIM-SOP GTK",
    nip: "198503152008011003",
    roleTitle: "Administrator Sistem",
  },
  {
    email: "admin.gtk@kemdikbud.go.id",
    password: "AdminGTK#2026",
    fullName: "Administrator SIM-SOP GTK",
    nip: "198503152008011003",
    roleTitle: "Administrator Sistem",
  },
  {
    email: "kepala.kantor@kemdikbud.go.id",
    password: "gtk2026",
    fullName: "Dr. H. Siswanto Ismail, M.Pd.",
    nip: "197405121998031002",
    roleTitle: "Kepala Kantor GTK Gorontalo",
  },
  {
    email: "pelaksana.gtk@kemdikbud.go.id",
    password: "gtk2026",
    fullName: "Pengelola Mutu GTK",
    nip: "198810202010012005",
    roleTitle: "Pelaksana / Pengelola SOP AP",
  },
];

export const DEFAULT_AUTHORIZED_EMAILS = [
  {
    email: "siswantoismail173@gmail.com",
    fullName: "Dr. H. Siswanto Ismail, M.Pd.",
    nip: "197405121998031002",
    roleTitle: "Kepala Kantor Guru dan Tenaga Kependidikan Provinsi Gorontalo",
    isRegistered: false,
    registeredAt: null as string | null,
  },
  {
    email: "admin@kemdikbud.go.id",
    fullName: "Administrator SIM-SOP GTK",
    nip: "198503152008011003",
    roleTitle: "Administrator Sistem",
    isRegistered: true,
    registeredAt: "2026-02-08T08:00:00.000Z",
  },
  {
    email: "admin.gtk@kemdikbud.go.id",
    fullName: "Administrator SIM-SOP GTK",
    nip: "198503152008011003",
    roleTitle: "Administrator Sistem",
    isRegistered: true,
    registeredAt: "2026-02-08T08:00:00.000Z",
  },
  {
    email: "kepala.kantor@kemdikbud.go.id",
    fullName: "Dr. H. Siswanto Ismail, M.Pd.",
    nip: "197405121998031002",
    roleTitle: "Kepala Kantor GTK Gorontalo",
    isRegistered: true,
    registeredAt: "2026-02-08T08:00:00.000Z",
  },
  {
    email: "pelaksana.gtk@kemdikbud.go.id",
    fullName: "Pengelola Mutu GTK",
    nip: "198810202010012005",
    roleTitle: "Pelaksana / Pengelola SOP AP",
    isRegistered: true,
    registeredAt: "2026-02-08T08:00:00.000Z",
  },
  {
    email: "verifikator.gtk@kemdikbud.go.id",
    fullName: "Verifikator Mutu & Tata Laksana GTK",
    nip: "198904122012032001",
    roleTitle: "Verifikator Tata Kelola POS AP",
    isRegistered: false,
    registeredAt: null as string | null,
  },
];

export const DEFAULT_SOP = {
  id: "sop-pemetaan-mutu-gtk-01",
  nomorPos: "0029/T/B7.33/OT.02.00/2026",
  instansi:
    "KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH\nDIREKTORAT JENDERAL GURU DAN TENAGA KEPENDIDIKAN",
  unitKerja: "KANTOR GURU DAN TENAGA KEPENDIDIKAN PROVINSI GORONTALO",
  tanggalPembuatan: "08 Februari 2026",
  tanggalRevisi: "",
  tanggalEfektif: "08 Februari 2026",
  namaPos:
    "PROSEDUR OPERASIONAL STANDAR PELAKSANAAN PEMETAAN KOMPETENSI GURU DAN TENAGA KEPENDIDIKAN",
  disahkanOleh: {
    nama: "Dr. H. Siswanto Ismail, M.Pd.",
    nip: "197405121998031002",
    jabatan: "Kepala Kantor Guru dan Tenaga Kependidikan Provinsi Gorontalo",
  },
  dasarHukum: [
    "Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional",
    "Undang-Undang Nomor 14 Tahun 2005 tentang Guru dan Dosen",
    "Peraturan Pemerintah Nomor 74 Tahun 2008 tentang Guru sebagaimana telah diubah dengan PP Nomor 19 Tahun 2017",
    "Peraturan Menteri PAN-RB Nomor 35 Tahun 2012 tentang Pedoman Penyusunan Standar Operasional Prosedur Administrasi Pemerintahan (SOP AP)",
    "Peraturan Menteri Pendidikan Dasar dan Menengah Nomor 1 Tahun 2024 tentang Organisasi dan Tata Kerja Kemendikdasmen",
  ],
  kualifikasiPelaksana: [
    "Memiliki kualifikasi pendidikan minimal Sarjana (S-1) / Diploma IV di bidang Pendidikan atau Manajemen",
    "Memahami regulasi dan instrumen uji kompetensi guru dan tenaga kependidikan",
    "Mampu mengoperasikan aplikasi pengolahan data instrumen pemetaan kompetensi berbasis komputer dan jaringan",
    "Memiliki integritas, ketelitian, dan objektivitas dalam pengolahan nilai kompetensi GTK",
  ],
  keterkaitan: [
    "POS AP Pelaksanaan Uji Kompetensi Guru (UKG)",
    "POS AP Pengelolaan Sistem Informasi Manajemen Pengembangan Keprofesian Berkelanjutan (SIM-PKB)",
    "POS AP Layanan Pengaduan dan Verifikasi Data GTK",
  ],
  peralatan: [
    "Komputer / Laptop Server dan Workstation dengan koneksi internet stabil",
    "Aplikasi SIM-SOP GTK Provinsi Gorontalo",
    "Instrumen Pemetaan Kompetensi dan Lembar Verifikasi Berkas",
    "Printer laser dan scanner dokumen naskah dinas",
    "Jaringan lokal (LAN/WLAN) dan database terenkripsi",
  ],
  peringatan: [
    "Jika prosedur pemetaan kompetensi tidak dilaksanakan sesuai tahapan, data hasil pemetaan GTK tidak valid dan menghambat perencanaan diklat keprofesian berkelanjutan",
    "Kelalaian dalam verifikasi instrumen dapat menyebabkan kesalahan rekomendasi peningkatan kompetensi GTK di Provinsi Gorontalo",
  ],
  pencatatan: [
    "Disimpan dalam database SIM-SOP GTK Provinsi Gorontalo dalam bentuk digital dan arsip fisik naskah berita acara",
    "Didokumentasikan dalam Berita Acara Hasil Pemetaan Kompetensi GTK yang disahkan Kepala Kantor",
  ],
};

export async function ensureTablesCreated(): Promise<void> {
  if (tablesInitialized) return;
  const pool = getDbPool();

  try {
    try {
      await pool.query("CREATE DATABASE IF NOT EXISTS `sim_sop_gtk`;");
      await pool.query("USE `sim_sop_gtk`;");
    } catch (dbErr) {
      console.warn(
        "[MySQL Cloud] database create/use skipped or using current schema:",
        dbErr,
      );
    }

    await pool.query(`
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

    await pool.query(`
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

    await pool.query(`
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

    await pool.query(`
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

    await pool.query(`
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

    // Seed authorized_emails
    const [authRows]: any = await pool.query(
      "SELECT COUNT(*) as count FROM `authorized_emails`",
    );
    if (authRows[0]?.count === 0) {
      for (const a of DEFAULT_AUTHORIZED_EMAILS) {
        await pool.query(
          "INSERT INTO `authorized_emails` (`email`, `full_name`, `nip`, `role_title`, `is_registered`, `registered_at`) VALUES (?, ?, ?, ?, ?, ?)",
          [
            a.email,
            a.fullName,
            a.nip,
            a.roleTitle,
            a.isRegistered ? 1 : 0,
            a.registeredAt,
          ],
        );
      }
    }

    // Seed users
    const [userRows]: any = await pool.query(
      "SELECT COUNT(*) as count FROM `users`",
    );
    if (userRows[0]?.count === 0) {
      for (const u of DEFAULT_USERS) {
        await pool.query(
          "INSERT INTO `users` (`email`, `password`, `full_name`, `nip`, `role_title`) VALUES (?, ?, ?, ?, ?)",
          [u.email, u.password, u.fullName, u.nip, u.roleTitle],
        );
      }
    }

    // Seed sop_documents
    const [sopRows]: any = await pool.query(
      "SELECT COUNT(*) as count FROM `sop_documents`",
    );
    if (sopRows[0]?.count === 0) {
      await pool.query(
        `
        INSERT INTO \`sop_documents\` (
          \`id\`, \`nomor_pos\`, \`instansi\`, \`unit_kerja\`,
          \`tanggal_pembuatan\`, \`tanggal_revisi\`, \`tanggal_efektif\`,
          \`nama_pos\`, \`disahkan_nama\`, \`disahkan_nip\`, \`disahkan_jabatan\`,
          \`dasar_hukum\`, \`kualifikasi_pelaksana\`, \`keterkaitan\`,
          \`peralatan\`, \`peringatan\`, \`pencatatan\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
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
          JSON.stringify(DEFAULT_SOP.pencatatan),
        ],
      );
    }

    tablesInitialized = true;
  } catch (err) {
    console.error("[MySQL Cloud] ensureTablesCreated error:", err);
    throw err;
  }
}
