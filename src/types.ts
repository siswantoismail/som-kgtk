export type UserRole = 'kepala_kantor' | 'super_admin' | 'verifikator' | 'operator' | 'auditor';

export interface AuthorizedEmail {
  id?: number;
  email: string;
  fullName: string;
  nip: string;
  roleTitle: string;
  isRegistered: boolean;
  registeredAt?: string | null;
  createdAt?: string;
}

export interface WhitelistCheckResult {
  isAuthorized: boolean;
  isRegistered: boolean;
  authorizedAccount?: AuthorizedEmail;
  message: string;
}

export interface UserProfile {
  id: string;
  name: string;
  nip: string;
  role: UserRole;
  roleTitle: string;
  unit: string;
  email: string;
  avatarColor: string;
}

export interface SopDocument {
  id: string;
  nomorPos: string;
  namaPos: string;
  instansi: string;
  unitKerja: string;
  tanggalPembuatan: string;
  tanggalRevisi: string;
  tanggalEfektif: string;
  disahkanOleh: {
    jabatan: string;
    nama: string;
    nip: string;
  };
  dasarHukum: string[];
  kualifikasiPelaksana: string[];
  keterkaitan: string[];
  peralatan: string[];
  peringatan: string[];
  pencatatan: string[];
  status: 'Aktif' | 'Revisi' | 'Arsip';
}

export interface KinerjaPemetaanItem {
  id: string;
  kodeKegiatan: string;
  namaKegiatan: string;
  wilayah: 'Kota Gorontalo' | 'Kab. Gorontalo' | 'Kab. Bone Bolango' | 'Kab. Boalemo' | 'Kab. Pohuwato' | 'Kab. Gorontalo Utara';
  jenjang: 'TK/PAUD' | 'SD' | 'SMP' | 'SMA/SMK' | 'Semua Jenjang';
  sasaranTarget: number; // Jumlah GTK target
  realisasi: number; // Jumlah GTK telah terpetakan
  satuan: string; // misal: "Orang GTK"
  waktuBaku: string; // misal: "14 Hari Kerja"
  batasWaktu: string; // YYYY-MM-DD
  pelaksana: string; // misal: "Tim Asesor & Verifikator GTK"
  kelengkapan: string; // misal: "Instrumen Pemetaan, Akun SIMPKB/PMM"
  output: string; // misal: "Hasil Skor & Rekomendasi Pelatihan"
  statusKinerja: 'Tercapai' | 'Sedang Berjalan' | 'Perhatian' | 'Di Bawah Target';
  catatanPenyimpangan?: string;
  terakhirDiperbarui: string;
}

export interface EmailLog {
  id: string;
  tanggal: string;
  penerima: string;
  subjek: string;
  wilayah: string;
  capaianPersen: number;
  pesan: string;
  status: 'Terkirim' | 'Gagal' | 'Pending';
  tipeTrigger: 'Otomatis (<80%)' | 'Manual' | 'Jadwal Mingguan';
}

export interface BaganAlirStep {
  id?: string;
  no: number;
  langkahKegiatan: string;
  pelaksana: {
    pengolahData: boolean;
    fungsionalWiPtp: boolean;
    ptkBidangPendidikan: boolean;
    kepala: boolean;
    kepalaOpsi?: 'Ya' | 'Tidak' | 'Pending' | null;
    publikasi: boolean;
  };
  diagramType?: 'start_grouped' | 'decision_reviu' | 'process_single' | 'process_grouped_connector' | 'connector_grouped' | 'decision_verifikasi' | 'end_terminal' | string;
  mutuBaku: {
    kelengkapan: string;
    waktu: string;
    waktuJam: number;
    output: string;
  };
  keterangan: string;
  catatanDetail?: string;
  statusEksekusi?: 'Selesai' | 'Sedang Berjalan' | 'Menunggu' | 'Revisi';
  waktuSelesai?: string;
}

export interface ApiSyncLog {
  id: string;
  timestamp: string;
  sumber: 'Dapodik Kemendikdasmen' | 'SIMPKB GTK' | 'Platform Merdeka Mengajar (PMM)' | 'BKD Gorontalo';
  arah: 'Tarik Data (Inbound)' | 'Kirim Laporan (Outbound)';
  jumlahData: number;
  status: 'Sukses' | 'Gagal' | 'Sinkronisasi Parsial';
  keterangan: string;
  responseTimeMs: number;
}

export interface FilterOptions {
  searchQuery: string;
  wilayah: string;
  statusKinerja: string;
  jenjang: string;
  sortBy: 'terbaru' | 'capaian_terendah' | 'capaian_tertinggi' | 'target_terbesar';
}
