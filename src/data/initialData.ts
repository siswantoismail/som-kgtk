import { SopDocument, KinerjaPemetaanItem, UserProfile, ApiSyncLog, BaganAlirStep } from '../types';

export const INITIAL_SOP_DOCUMENT: SopDocument = {
  id: 'sop-0029-2026',
  nomorPos: '0029/T/B7.33/OT.02.00/2026',
  namaPos: 'Pemetaan Kompetensi Guru, Kepala Sekolah, Pendidik Lainnya dan Tenaga Kependidikan',
  instansi: 'KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH\nDIREKTORAT JENDERAL GURU, TENAGA KEPENDIDIKAN, DAN PENDIDIKAN GURU',
  unitKerja: 'KANTOR GURU DAN TENAGA KEPENDIDIKAN PROVINSI GORONTALO',
  tanggalPembuatan: '08 Februari 2026',
  tanggalRevisi: '',
  tanggalEfektif: '08 Februari 2026',
  disahkanOleh: {
    jabatan: 'Kepala Kantor Guru dan Tenaga Kependidikan Provinsi Gorontalo',
    nama: 'Eky Aristanto P. Punu, SE.MM.',
    nip: '197004162003121001'
  },
  dasarHukum: [
    'Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional.',
    'Undang-Undang Nomor 14 Tahun 2005 tentang Guru dan Dosen.',
    'Undang-Undang Nomor 5 Tahun 2014 tentang Aparatur Sipil Negara.',
    'Peraturan Pemerintah Nomor 19 Tahun 2017 tentang Perubahan atas Peraturan Pemerintah Nomor 74 Tahun 2008 tentang Guru.',
    'Peraturan Pemerintah Nomor 17 Tahun 2020 tentang Manajemen Pegawai Negeri Sipil.',
    'Peraturan Menteri Pendidikan Nasional Nomor 16 Tahun 2007 tentang Standar Kualifikasi Akademik dan Kompetensi Guru.',
    'Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 35 Tahun 2012 tentang Pedoman Penyusunan Standar Operasional Prosedur Administrasi Pemerintah',
    'Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 19 Tahun 2018 tentang Penyusunan Peta Proses Bisnis Instansi Pemerintah',
    'Peraturan Menteri Pendidikan Dasar dan Menengah Nomor 1 Tahun 2024 tentang Organisasi dan Tata Kerja Kemendikdasmen.',
    'Peraturan Menteri Pendidikan Dasar dan Menengah Republik Indonesia Nomor 5 Tahun 2025',
    'Peraturan Menteri Pendidikan Dasar dan Menengah Republik Indonesia Nomor 2 Tahun 2026',
    'Keputusan Menteri Pendidikan Dasar dan Menengah Republik Indonesia Nomor 1/M/2025 tentang Uraian Jabatan Pelaksana di Luar Bidang Pendidikan pada Kementerian Pendidikan Dasar dan Menengah'
  ],
  kualifikasiPelaksana: [
    'Memahami prosedur pelaksanaan pemetaan kompetensi',
    'Mampu berkoordinasi dalam penyelesaian pelaksanaan tugas',
    'Memahami peraturan dan ketentuan yang berlaku',
    'Memahami tugas dan fungsi unit organisasi'
  ],
  keterkaitan: [
    'POS Pelaksanaan Peningkatan Kompetensi Guru dan Tenaga Kependidikan Lainnya',
    'POS AP Pemrosesan Surat Masuk',
    'POS AP Pemrosesan Surat Keluar'
  ],
  peralatan: [
    'Instrumen',
    'Komputer/Laptop',
    'Jaringan internet',
    'Printer'
  ],
  peringatan: [
    'Pelaksana bertanggung jawab atas pelaksanaan aktivitas yang telah dibakukan dan ditetapkan.',
    'Segala bentuk penyimpangan atas mutu baku terkait perlengkapan, waktu maupun output dikategorikan sebagai bentuk kegagalan yang harus dipertanggungjawabkan oleh pelaksana.'
  ],
  pencatatan: [
    'Dicatat dan didata dalam berkas kearsipan Unit Kerja secara elektronik dan/atau manual'
  ],
  status: 'Aktif'
};

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    name: 'Eky Aristanto P. Punu, SE.MM.',
    nip: '197004162003121001',
    role: 'kepala_kantor',
    roleTitle: 'Kepala Kantor GTK Gorontalo (Pengesah)',
    unit: 'Kantor GTK Provinsi Gorontalo',
    email: 'kepala.gtk.gorontalo@kemendikdasmen.go.id',
    avatarColor: 'bg-emerald-600'
  },
  {
    id: 'usr-2',
    name: 'Admin Sistem Kemendikdasmen',
    nip: '198409122008011005',
    role: 'super_admin',
    roleTitle: 'Super Administrator SIM-SOP',
    unit: 'Subbag Tata Usaha & Data',
    email: 'admin.sop@kemendikdasmen.go.id',
    avatarColor: 'bg-indigo-600'
  },
  {
    id: 'usr-3',
    name: 'Dr. Rahmawati Ilahude, M.Pd.',
    nip: '197805202005012004',
    role: 'verifikator',
    roleTitle: 'Ketua Tim Asesor & Verifikator Pemetaan',
    unit: 'Pokja Pemetaan Mutu GTK',
    email: 'rahmawati.verifikator@kemendikdasmen.go.id',
    avatarColor: 'bg-blue-600'
  },
  {
    id: 'usr-4',
    name: 'Siswanto Ismail',
    nip: '198903152014021002',
    role: 'operator',
    roleTitle: 'Operator Pelaksana Satuan Pendidikan',
    unit: 'Dinas Dikbud Kab/Kota Gorontalo',
    email: 'siswantoismail173@gmail.com',
    avatarColor: 'bg-amber-600'
  },
  {
    id: 'usr-5',
    name: 'Drs. H. Mulyadi Usman, M.Si',
    nip: '196701021992031003',
    role: 'auditor',
    roleTitle: 'Auditor Pengawas Mutu Pemerintahan',
    unit: 'Inspektorat Jenderal Kemendikdasmen',
    email: 'auditor.itjen@kemendikdasmen.go.id',
    avatarColor: 'bg-slate-700'
  }
];

export const INITIAL_KINERJA_DATA: KinerjaPemetaanItem[] = [
  {
    id: 'kin-01',
    kodeKegiatan: 'PM-KOTA-01',
    namaKegiatan: 'Pemetaan Kompetensi Guru Kelas & Mapel SD',
    wilayah: 'Kota Gorontalo',
    jenjang: 'SD',
    sasaranTarget: 850,
    realisasi: 810,
    satuan: 'Orang Guru',
    waktuBaku: '10 Hari Kerja',
    batasWaktu: '2026-03-15',
    pelaksana: 'Tim Asesor & Operator Kota Gorontalo',
    kelengkapan: 'Instrumen Asesmen Kemendikdasmen, Token Tes Online',
    output: 'Laporan Skor 4 Kompetensi Guru Terverifikasi',
    statusKinerja: 'Tercapai',
    terakhirDiperbarui: '2026-09-18 14:30'
  },
  {
    id: 'kin-02',
    kodeKegiatan: 'PM-KBGOR-02',
    namaKegiatan: 'Pemetaan Kompetensi Kepala Sekolah SD & SMP',
    wilayah: 'Kab. Gorontalo',
    jenjang: 'Semua Jenjang',
    sasaranTarget: 340,
    realisasi: 315,
    satuan: 'Kepala Sekolah',
    waktuBaku: '12 Hari Kerja',
    batasWaktu: '2026-03-25',
    pelaksana: 'Pokja Manajerial & Supervisi GTK',
    kelengkapan: 'Portofolio Kepemimpinan Pembelajaran, Hasil Wawancara',
    output: 'Rekomendasi Penugasan & Pelatihan Manajerial',
    statusKinerja: 'Tercapai',
    terakhirDiperbarui: '2026-09-19 09:15'
  },
  {
    id: 'kin-03',
    kodeKegiatan: 'PM-BONBOL-03',
    namaKegiatan: 'Asesmen Kompetensi Pedagogik & Profesional Guru SMP',
    wilayah: 'Kab. Bone Bolango',
    jenjang: 'SMP',
    sasaranTarget: 620,
    realisasi: 420,
    satuan: 'Orang Guru',
    waktuBaku: '14 Hari Kerja',
    batasWaktu: '2026-03-20',
    pelaksana: 'Tim Verifikator Wilayah Bone Bolango',
    kelengkapan: 'Instrumen Tes CBT Daring, Log Akses SIMPKB',
    output: 'Peta Kemampuan Literasi, Numerasi & Pedagogi',
    statusKinerja: 'Di Bawah Target',
    catatanPenyimpangan: 'Capaian baru 67.7% (di bawah batas 80%). Kendala jaringan di wilayah terpencil Suwawa Timur & Pinogu.',
    terakhirDiperbarui: '2026-09-20 11:00'
  },
  {
    id: 'kin-04',
    kodeKegiatan: 'PM-BOAL-04',
    namaKegiatan: 'Pemetaan Kompetensi Guru Kejuruan SMK & Guru SMA',
    wilayah: 'Kab. Boalemo',
    jenjang: 'SMA/SMK',
    sasaranTarget: 480,
    realisasi: 370,
    satuan: 'Orang Guru',
    waktuBaku: '10 Hari Kerja',
    batasWaktu: '2026-03-28',
    pelaksana: 'Pengawas Sekolah & Asesor Vokasi',
    kelengkapan: 'Modul Praktik Kejuruan & Rubrik Asesmen Mandiri',
    output: 'Profil Kebutuhan Diklat Upskilling Guru SMK',
    statusKinerja: 'Perhatian',
    catatanPenyimpangan: 'Capaian 77.1%. Memerlukan koordinasi ulang dengan MKKS Boalemo.',
    terakhirDiperbarui: '2026-09-19 16:45'
  },
  {
    id: 'kin-05',
    kodeKegiatan: 'PM-POHU-05',
    namaKegiatan: 'Pemetaan Tenaga Kependidikan (TU, Laboran & Pustakawan)',
    wilayah: 'Kab. Pohuwato',
    jenjang: 'Semua Jenjang',
    sasaranTarget: 290,
    realisasi: 180,
    satuan: 'Tenaga Kependidikan',
    waktuBaku: '8 Hari Kerja',
    batasWaktu: '2026-03-10',
    pelaksana: 'Operator Dapodik & Tata Usaha Sekolah',
    kelengkapan: 'Formulir Standar Sarpras & Dokumen Kompetensi Tenaga Teknis',
    output: 'Database Sertifikasi Tenaga Kependidikan',
    statusKinerja: 'Di Bawah Target',
    catatanPenyimpangan: 'Capaian 62.1%. Jadwal batas waktu telah terlewati; perlu surat peringatan dinas.',
    terakhirDiperbarui: '2026-09-20 08:30'
  },
  {
    id: 'kin-06',
    kodeKegiatan: 'PM-GORUT-06',
    namaKegiatan: 'Pemetaan Pendidik PAUD & Pengawas Sekolah',
    wilayah: 'Kab. Gorontalo Utara',
    jenjang: 'TK/PAUD',
    sasaranTarget: 310,
    realisasi: 275,
    satuan: 'Pendidik & Pengawas',
    waktuBaku: '10 Hari Kerja',
    batasWaktu: '2026-03-30',
    pelaksana: 'Fasilitator Daerah & Tim Kantor GTK',
    kelengkapan: 'Kuesioner Observasi Pembelajaran Berdiferensiasi',
    output: 'Peta Kesiapan Implementasi Kurikulum Merdeka PAUD',
    statusKinerja: 'Sedang Berjalan',
    terakhirDiperbarui: '2026-09-20 10:20'
  }
];

export const INITIAL_API_LOGS: ApiSyncLog[] = [
  {
    id: 'api-sync-1',
    timestamp: '2026-09-20 14:10:22',
    sumber: 'Dapodik Kemendikdasmen',
    arah: 'Tarik Data (Inbound)',
    jumlahData: 2890,
    status: 'Sukses',
    keterangan: 'Sinkronisasi master data guru dan tenaga kependidikan se-Provinsi Gorontalo selesai tanpa galat.',
    responseTimeMs: 342
  },
  {
    id: 'api-sync-2',
    timestamp: '2026-09-20 12:45:11',
    sumber: 'SIMPKB GTK',
    arah: 'Tarik Data (Inbound)',
    jumlahData: 1420,
    status: 'Sukses',
    keterangan: 'Sinkronisasi skor tes kompetensi pedagogik dan profesional guru selesai.',
    responseTimeMs: 280
  },
  {
    id: 'api-sync-3',
    timestamp: '2026-09-20 09:15:40',
    sumber: 'Platform Merdeka Mengajar (PMM)',
    arah: 'Kirim Laporan (Outbound)',
    jumlahData: 850,
    status: 'Sukses',
    keterangan: 'Laporan agregat status pemetaan kompetensi berhasil dikirim ke dashboard PMM.',
    responseTimeMs: 415
  },
  {
    id: 'api-sync-4',
    timestamp: '2026-09-19 17:30:05',
    sumber: 'BKD Gorontalo',
    arah: 'Kirim Laporan (Outbound)',
    jumlahData: 2370,
    status: 'Sinkronisasi Parsial',
    keterangan: 'Data NIP dan jabatan tersinkron, 12 data guru honorer perlu validasi manual NIK.',
    responseTimeMs: 512
  }
];

export const INITIAL_BAGAN_ALIR_STEPS: BaganAlirStep[] = [
  {
    id: 'step-1',
    no: 1,
    langkahKegiatan: 'Menyusun instrumen Pemetaan Kompetensi',
    pelaksana: {
      pengolahData: true,
      fungsionalWiPtp: true,
      ptkBidangPendidikan: true,
      kepala: false,
      kepalaOpsi: null,
      publikasi: false
    },
    diagramType: 'start_grouped',
    mutuBaku: {
      kelengkapan: 'Instrumen Pemetaan',
      waktu: '24 Jam',
      waktuJam: 24,
      output: 'Instrumen Pemetaan'
    },
    keterangan: 'Pengolah data dan informasi melakukan penyusunan instrumen dengan melibatkan fungsional WI, PTP dan PTK bidang pendidikan',
    catatanDetail: 'Penyusunan instrumen mengacu pada standar kompetensi pedagogik, profesional, sosial, dan kepribadian serta modul asesmen resmi Kemendikdasmen.',
    statusEksekusi: 'Selesai',
    waktuSelesai: '2026-09-18 10:00'
  },
  {
    id: 'step-2',
    no: 2,
    langkahKegiatan: 'Validasi Instrumen Pemetaan Kompetensi',
    pelaksana: {
      pengolahData: false,
      fungsionalWiPtp: false,
      ptkBidangPendidikan: false,
      kepala: true,
      kepalaOpsi: 'Ya',
      publikasi: false
    },
    diagramType: 'decision_reviu',
    mutuBaku: {
      kelengkapan: 'Instrumen Pemetaan',
      waktu: '2 Jam',
      waktuJam: 2,
      output: 'Instrumen Pemetaan yang telah di validasi dan siap disebar'
    },
    keterangan: 'Kepala melakukan reviu terhadap instrumen pemetaan untuk menentukan apakah instrumen tersebut dapat disebarluaskan atau tidak data untuk dilakukan perbaikan. Selanjutnya, Kepala melakukan validasi apabila instrumen telah dinyatakan bisa disebarluaskan.',
    catatanDetail: 'Pemeriksaan butir pertanyaan dan kesesuaian target jenjang oleh Kepala Kantor Guru dan Tenaga Kependidikan Provinsi Gorontalo.',
    statusEksekusi: 'Selesai',
    waktuSelesai: '2026-09-18 12:00'
  },
  {
    id: 'step-3',
    no: 3,
    langkahKegiatan: 'Melakukan pengumpulan data dan informasi Pemetaan Kompetensi',
    pelaksana: {
      pengolahData: true,
      fungsionalWiPtp: false,
      ptkBidangPendidikan: false,
      kepala: false,
      kepalaOpsi: null,
      publikasi: false
    },
    diagramType: 'process_single',
    mutuBaku: {
      kelengkapan: 'Instrumen Pemetaan',
      waktu: '168 Jam',
      waktuJam: 168,
      output: 'Data Pemetaan'
    },
    keterangan: 'Melaksanakan pemetaan kompetensi dengan menyebarkan instrumen kepada target sasaran serta melakukan pengumpulan data dan informasi dengan melibatkan seluruh pegawai',
    catatanDetail: 'Pelaksanaan selama 7 hari (168 jam) ke seluruh 6 Kabupaten/Kota di Provinsi Gorontalo melalui sistem daring dan visitasi.',
    statusEksekusi: 'Sedang Berjalan',
    waktuSelesai: undefined
  },
  {
    id: 'step-4',
    no: 4,
    langkahKegiatan: 'Mengolah data dan informasi Pemetaan Kompetensi',
    pelaksana: {
      pengolahData: true,
      fungsionalWiPtp: true,
      ptkBidangPendidikan: false,
      kepala: false,
      kepalaOpsi: null,
      publikasi: false
    },
    diagramType: 'process_grouped_connector',
    mutuBaku: {
      kelengkapan: 'Data hasil pemetaan',
      waktu: '48 jam',
      waktuJam: 48,
      output: 'Analisis pemetaan'
    },
    keterangan: 'Pengolahan data hasil pemetaan',
    catatanDetail: 'Pembersihan data mentah, kalkulasi skor per indikator kompetensi, dan tabulasi silang bersama fungsional WI dan PTP.',
    statusEksekusi: 'Menunggu',
    waktuSelesai: undefined
  },
  {
    id: 'step-5',
    no: 5,
    langkahKegiatan: 'Menyusun hasil pengolahan data dan informasi Pemetaan Kompetensi',
    pelaksana: {
      pengolahData: true,
      fungsionalWiPtp: true,
      ptkBidangPendidikan: false,
      kepala: false,
      kepalaOpsi: null,
      publikasi: false
    },
    diagramType: 'connector_grouped',
    mutuBaku: {
      kelengkapan: 'Dokumen analisis pemetaan',
      waktu: '48 jam',
      waktuJam: 48,
      output: 'Dashboard Data Pemetaan Kompetensi'
    },
    keterangan: 'Hasil analisis pemetaan disajikan dalam Dashboard Pemetaan Kompetensi',
    catatanDetail: 'Penyusunan hasil pengolahan data pemetaan oleh Pengolah Data dan Informasi bersama Fungsional WI dan PTP disajikan dalam Dashboard Pemetaan Kompetensi.',
    statusEksekusi: 'Menunggu',
    waktuSelesai: undefined
  },
  {
    id: 'step-6',
    no: 6,
    langkahKegiatan: 'Melakukan verifikasi hasil pengolahan data dan informasi Pemetaan Kompetensi',
    pelaksana: {
      pengolahData: false,
      fungsionalWiPtp: false,
      ptkBidangPendidikan: false,
      kepala: true,
      kepalaOpsi: 'Ya',
      publikasi: false
    },
    diagramType: 'decision_verifikasi',
    mutuBaku: {
      kelengkapan: 'Dashboard Data Pemetaan Kompetensi',
      waktu: '1 Jam',
      waktuJam: 1,
      output: 'Dashboard Data Pemetaan Kompetensi yang telah diverifikasi dan siap dipublikasikan'
    },
    keterangan: 'Kepala melakukan reviu terhadap Dashboard Data Pemetaan Kompetensi untuk menentukan apakah Dashboard tersebut dapat dipublikasikan atau tidak',
    catatanDetail: 'Kepala Kantor memberikan persetujuan final (Ya) untuk publikasi atau instruksi revisi (Tidak) kembali ke penyusun.',
    statusEksekusi: 'Menunggu',
    waktuSelesai: undefined
  },
  {
    id: 'step-7',
    no: 7,
    langkahKegiatan: 'Mempublikasikan hasil pemetaan kompetensi Pemetaan Kompetensi',
    pelaksana: {
      pengolahData: false,
      fungsionalWiPtp: false,
      ptkBidangPendidikan: false,
      kepala: false,
      kepalaOpsi: null,
      publikasi: true
    },
    diagramType: 'end_terminal',
    mutuBaku: {
      kelengkapan: 'Dashboard Data Pemetaan Kompetensi yang telah diverifikasi dan siap dipublikasikan',
      waktu: '30 menit',
      waktuJam: 0.5,
      output: 'Dashboard Visualisasi Pemetaan Kompetensi yang siap dipublikasikan'
    },
    keterangan: 'Dashboard Visualisasi Pemetaan Kompetensi yang siap dipublikasikan',
    catatanDetail: 'Rilis publik dan distribusi laporan capaian kompetensi GTK Gorontalo ke portal Kemendikdasmen dan stakeholder daerah.',
    statusEksekusi: 'Menunggu',
    waktuSelesai: undefined
  }
];

