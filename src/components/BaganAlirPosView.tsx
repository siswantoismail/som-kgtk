import React from 'react';
import { Download, Printer, Shield, Eye } from 'lucide-react';
import { exportBaganAlirPdf } from '../utils/exportPdf';
import { SopDocument, BaganAlirStep } from '../types';
import { INITIAL_BAGAN_ALIR_STEPS } from '../data/initialData';

interface BaganAlirPosViewProps {
  sopDocument: SopDocument;
  steps?: BaganAlirStep[];
}

export const BaganAlirPosView: React.FC<BaganAlirPosViewProps> = ({
  sopDocument,
  steps = INITIAL_BAGAN_ALIR_STEPS
}) => {
  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Official Control Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-300">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Standar Baku Tata Kelola Pemerintahan</span>
            </span>
            <span>•</span>
            <span className="flex items-center text-slate-500 font-medium">
              <Eye className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Mode Tampilan Alur Kerja (Read-Only)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Bagan Alir POS AP Pemetaan Kompetensi GTK
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Format resmi bagan alir operasional sesuai naskah dinas. Menampilkan prosedur alur kerja dan standar mutu baku antar pelaksana secara utuh dan terstandarisasi tanpa penambahan simbol.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors shadow-xs"
            title="Cetak Bagan Alir"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Dokumen</span>
          </button>
          <button
            type="button"
            onClick={() => exportBaganAlirPdf(steps, sopDocument)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors"
            title="Unduh Berkas PDF Resmi"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor PDF Resmi</span>
          </button>
        </div>
      </div>

      {/* Main Official Diagram Container */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-md p-4 sm:p-6 overflow-x-auto print:border-none print:shadow-none print:p-0">
        
        {/* Judul Tepat di Atas Tabel Sesuai Gambar:
            POS Pemetaan Kompetensi Guru, Kepala Sekolah, Pendidik Lainnya dan Tenaga Kependidikan */}
        <div className="text-black font-bold text-[12px] sm:text-[13px] tracking-tight mb-1.5 font-serif">
          POS Pemetaan Kompetensi Guru, Kepala Sekolah, Pendidik Lainnya dan Tenaga Kependidikan
        </div>

        {/* Tabel Bagan Alir 100% Sesuai Naskah Fisik Gambar */}
        <table className="w-full border-collapse border-2 border-black text-black font-serif text-[11px] sm:text-xs min-w-[1100px]">
          <thead>
            {/* Baris 1 Header */}
            <tr className="border-b border-black text-center font-bold">
              <th rowSpan={2} className="border-r border-black p-2 w-10 align-middle">
                No.
              </th>
              <th rowSpan={2} className="border-r border-black p-2 w-48 sm:w-56 align-middle">
                Langkah Kegiatan
              </th>
              <th colSpan={5} className="border-r border-black p-1 text-center font-bold">
                Pelaksana
              </th>
              <th colSpan={3} className="border-r border-black p-1 text-center font-bold">
                Mutu Baku
              </th>
              <th rowSpan={2} className="p-2 w-48 sm:w-56 align-middle">
                Keterangan
              </th>
            </tr>

            {/* Baris 2 Sub-Header Pelaksana & Mutu Baku */}
            <tr className="border-b border-black text-center font-bold">
              {/* 5 Kolom Pelaksana:
                  1: Pengolah Data dan Informasi
                  2: Fungsional WI dan PTP (border kanan putus-putus ke kolom 3)
                  3: PTK (Bidang Pendidikan)
                  4: Kepala
                  5: Publikasi
              */}
              <th className="border-r border-black p-1.5 w-24 sm:w-28 leading-tight">
                Pengolah Data dan Informasi
              </th>
              <th className="border-r border-black p-1.5 w-24 sm:w-28 leading-tight border-r-dashed">
                Fungsional WI dan PTP
              </th>
              <th className="border-r border-black p-1.5 w-24 sm:w-28 leading-tight">
                PTK (Bidang Pendidikan)
              </th>
              <th className="border-r border-black p-1.5 w-24 sm:w-28 leading-tight">
                Kepala
              </th>
              <th className="border-r border-black p-1.5 w-24 sm:w-28 leading-tight">
                Publikasi
              </th>

              {/* 3 Kolom Mutu Baku:
                  Kelengkapan | Waktu | Keluaran (Output)
              */}
              <th className="border-r border-black p-1.5 w-28 sm:w-32 leading-tight">
                Kelengkapan
              </th>
              <th className="border-r border-black border-r-dashed p-1.5 w-16 sm:w-20 leading-tight">
                Waktu
              </th>
              <th className="border-r border-black p-1.5 w-28 sm:w-36 leading-tight">
                Keluaran<br /><span className="italic font-normal">(Output)</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {/* ========================================================= */}
            {/* ROW 5 (PERSIS SEPERTI GAMBAR) */}
            {/* ========================================================= */}
            <tr className="border-b border-black align-top">
              {/* No */}
              <td className="border-r border-black p-2 text-center">
                5
              </td>

              {/* Langkah Kegiatan */}
              <td className="border-r border-black p-2 leading-relaxed">
                Menyusun hasil pengolahan data dan informasi Pemetaan Kompetensi
              </td>

              {/* Area 5 Kolom Pelaksana dengan Diagram Alur Eksak */}
              <td colSpan={5} className="border-r border-black p-0 relative h-44">
                <svg 
                  className="w-full h-full absolute inset-0 pointer-events-none" 
                  viewBox="0 0 500 176" 
                  preserveAspectRatio="none"
                >
                  {/* Kolom Garis Pembatas Vertikal:
                      col 0: 0-100 (Pengolah Data dan Informasi)
                      col 1: 100-200 (Fungsional WI dan PTP)
                      Garis batas kolom vertikal utuh dari atas (Y=0) sampai batas kotak putus-putus (Y=66),
                      dengan panah di ujung bawahnya (Y=66) yang terhubung ke kotak putus-putus!
                  */}
                  <line x1="100" y1="0" x2="100" y2="66" stroke="#000000" strokeWidth="1" />
                  {/* Panah di ujung garis batas tabel X=100 yang terhubung ke garis putus-putus pada Y=66 */}
                  <polygon points="97,60 100,66 103,60" fill="#000000" />

                  {/* Garis batas vertikal X=100 dari bawah kotak dashed (Y=136) menerus ke bawah baris 5 (Y=176) */}
                  <line x1="100" y1="136" x2="100" y2="176" stroke="#000000" strokeWidth="1" />
                  
                  {/* Pembatas kolom 2 & 3: X=200 bertipe putus-putus ke kolom 3 */}
                  <line x1="200" y1="0" x2="200" y2="176" stroke="#000000" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="300" y1="0" x2="300" y2="176" stroke="#000000" strokeWidth="1" />
                  <line x1="400" y1="0" x2="400" y2="176" stroke="#000000" strokeWidth="1" />

                  {/* 1. Simbol Off-page connector (Pentagon):
                         Lebar: 42 (X: 29 sampai 71), Tinggi: 44 (Y: 6 sampai 50)
                         Bagian atas lurus (Y=6), sisi vertikal ke Y=36,
                         mengerucut ke sudut panah pada (X=50, Y=50).
                  */}
                  <polygon 
                    points="29,6 71,6 71,36 50,50 29,36" 
                    fill="#ffffff" 
                    stroke="#000000" 
                    strokeWidth="1.2" 
                  />

                  {/* Garis dari ujung bawah pentagon (X=50, Y=50) turun ke Y=53.5, 
                      lalu berbelok horizontal ke kanan menyambung dengan garis pembatas tabel di tengah (X=100) */}
                  <line x1="50" y1="50" x2="50" y2="53.5" stroke="#000000" strokeWidth="1.2" />
                  <line x1="50" y1="53.5" x2="100" y2="53.5" stroke="#000000" strokeWidth="1.2" />

                  {/* 2. Kotak pembatas putus-putus (Dashed bounding box):
                         Membentang di kolom Pengolah Data dan Informasi serta Fungsional WI dan PTP
                         (X: 10 sampai 190, Y: 66 sampai 136)
                  */}
                  <rect 
                    x="10" 
                    y="66" 
                    width="180" 
                    height="70" 
                    fill="none" 
                    stroke="#000000" 
                    strokeWidth="1.2" 
                    strokeDasharray="3 3" 
                  />

                  {/* Kotak proses persegi panjang kiri (dalam kolom Pengolah Data dan Informasi) */}
                  <rect 
                    x="18" 
                    y="84" 
                    width="64" 
                    height="32" 
                    fill="#ffffff" 
                    stroke="#000000" 
                    strokeWidth="1.2" 
                  />

                  {/* Kotak proses persegi panjang kanan (dalam kolom Fungsional WI dan PTP) */}
                  <rect 
                    x="118" 
                    y="84" 
                    width="64" 
                    height="32" 
                    fill="#ffffff" 
                    stroke="#000000" 
                    strokeWidth="1.2" 
                  />

                  {/* Garis panah revisi (Feedback loop dari keputusan Kepala "Tidak"):
                         Masuk dari baris 6 (X=350) ke atas sampai Y=100 (tengah kotak proses kanan),
                         kemudian belok kiri secara horizontal menyeberang kolom PTK (X=350 ke 190),
                         lalu menyentuh sisi kanan kotak dashed (X=190) dengan ujung panah.
                  */}
                  <line x1="350" y1="176" x2="350" y2="100" stroke="#000000" strokeWidth="1.2" />
                  <line x1="350" y1="100" x2="190" y2="100" stroke="#000000" strokeWidth="1.2" />
                  <polygon points="196,96 190,100 196,104" fill="#000000" />
                </svg>
              </td>

              {/* Mutu Baku: Kelengkapan */}
              <td className="border-r border-black p-2 leading-relaxed">
                Dokumen analisis pemetaan
              </td>

              {/* Mutu Baku: Waktu */}
              <td className="border-r border-black border-r-dashed p-2 text-center leading-relaxed">
                48 jam
              </td>

              {/* Mutu Baku: Keluaran */}
              <td className="border-r border-black p-2 leading-relaxed">
                Dashboard Data Pemetaan Kompetensi
              </td>

              {/* Keterangan */}
              <td className="p-2 leading-relaxed">
                Hasil analisis pemetaan disajikan dalam Dashboard Pemetaan Kompetensi
              </td>
            </tr>

            {/* ========================================================= */}
            {/* ROW 6 (PERSIS SEPERTI GAMBAR) */}
            {/* ========================================================= */}
            <tr className="border-b border-black align-top">
              {/* No */}
              <td className="border-r border-black p-2 text-center">
                6
              </td>

              {/* Langkah Kegiatan */}
              <td className="border-r border-black p-2 leading-relaxed">
                Melakukan verifikasi hasil pengolahan data dan informasi Pemetaan Kompetensi
              </td>

              {/* Area 5 Kolom Pelaksana */}
              <td colSpan={5} className="border-r border-black p-0 relative h-36">
                <svg 
                  className="w-full h-full absolute inset-0 pointer-events-none" 
                  viewBox="0 0 500 144" 
                  preserveAspectRatio="none"
                >
                  {/* Kolom Garis Pembatas Vertikal:
                      Garis batas kolom X=100 adalah garis vertikal yang meneruskan alur dari Baris 5 turun ke Y=72,
                      lalu berbelok ke kanan menuju belah ketupat Kepala.
                  */}
                  <line x1="100" y1="72" x2="100" y2="144" stroke="#000000" strokeWidth="1" />
                  <line x1="200" y1="0" x2="200" y2="144" stroke="#000000" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="300" y1="0" x2="300" y2="144" stroke="#000000" strokeWidth="1" />
                  <line x1="400" y1="0" x2="400" y2="144" stroke="#000000" strokeWidth="1" />

                  {/* Garis vertikal alur yang menerus dari Baris 5 pada X=100 turun ke Y=72 */}
                  <line x1="100" y1="0" x2="100" y2="72" stroke="#000000" strokeWidth="1.2" />

                  {/* Garis horizontal dari garis batas kolom (X=100) menuju sudut kiri belah ketupat Kepala (X=322, Y=72) */}
                  <line x1="100" y1="72" x2="322" y2="72" stroke="#000000" strokeWidth="1.2" />
                  {/* Panah masuk ke sudut kiri belah ketupat */}
                  <polygon points="318,69 322,72 318,75" fill="#000000" />

                  {/* Simbol Belah Ketupat (Diamond) di kolom Kepala (pusat X=350, Y=72) */}
                  <polygon 
                    points="350,44 378,72 350,100 322,72" 
                    fill="#ffffff" 
                    stroke="#000000" 
                    strokeWidth="1.2" 
                  />

                  {/* Cabang "Tidak":
                         Teks "Tidak" tepat di atas-kiri sudut atas belah ketupat
                         Garis keluar dari sudut atas (X=350, Y=44) naik lurus ke Baris 5 (Y=0)
                  */}
                  <text x="306" y="36" fontSize="12" fontFamily="serif" fill="#000000">Tidak</text>
                  <line x1="350" y1="44" x2="350" y2="0" stroke="#000000" strokeWidth="1.2" />

                  {/* Cabang "Ya":
                         Teks "Ya" di kanan-bawah sudut bawah belah ketupat
                         Garis keluar dari sudut bawah (X=350, Y=100) turun lurus ke Baris 7 (Y=144)
                  */}
                  <text x="372" y="118" fontSize="12" fontFamily="serif" fill="#000000">Ya</text>
                  <line x1="350" y1="100" x2="350" y2="144" stroke="#000000" strokeWidth="1.2" />
                </svg>
              </td>

              {/* Mutu Baku: Kelengkapan */}
              <td className="border-r border-black p-2 leading-relaxed">
                Dashboard Data Pemetaan Kompetensi
              </td>

              {/* Mutu Baku: Waktu */}
              <td className="border-r border-black border-r-dashed p-2 text-center leading-relaxed">
                1 Jam
              </td>

              {/* Mutu Baku: Keluaran */}
              <td className="border-r border-black p-2 leading-relaxed">
                Dashboard Data Pemetaan Kompetensi yang telah diverifikasi dan siap dipublikasikan
              </td>

              {/* Keterangan */}
              <td className="p-2 leading-relaxed">
                Kepala melakukan reviu terhadap Dashboard Data Pemetaan Kompetensi untuk menentukan apakah Dashboard tersebut dapat dipublikasikan atau tidak
              </td>
            </tr>

            {/* ========================================================= */}
            {/* ROW 7 (PERSIS SEPERTI GAMBAR) */}
            {/* ========================================================= */}
            <tr className="border-b border-black align-top">
              {/* No */}
              <td className="border-r border-black p-2 text-center">
                7
              </td>

              {/* Langkah Kegiatan */}
              <td className="border-r border-black p-2 leading-relaxed">
                Mempublikasikan hasil pemetaan kompetensi Pemetaan Kompetensi
              </td>

              {/* Area 5 Kolom Pelaksana */}
              <td colSpan={5} className="border-r border-black p-0 relative h-36">
                <svg 
                  className="w-full h-full absolute inset-0 pointer-events-none" 
                  viewBox="0 0 500 144" 
                  preserveAspectRatio="none"
                >
                  {/* Kolom Garis Pembatas Vertikal */}
                  <line x1="100" y1="0" x2="100" y2="144" stroke="#000000" strokeWidth="1" />
                  <line x1="200" y1="0" x2="200" y2="144" stroke="#000000" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="300" y1="0" x2="300" y2="144" stroke="#000000" strokeWidth="1" />
                  <line x1="400" y1="0" x2="400" y2="144" stroke="#000000" strokeWidth="1" />

                  {/* Garis vertikal turun dari Baris 6 (dari cabang "Ya" Kepala) pada X=350 turun ke Y=72 */}
                  <line x1="350" y1="0" x2="350" y2="72" stroke="#000000" strokeWidth="1.2" />

                  {/* Garis horizontal berbelok ke kanan dari X=350 menuju kolom Publikasi (X=418, Y=72) */}
                  <line x1="350" y1="72" x2="418" y2="72" stroke="#000000" strokeWidth="1.2" />
                  {/* Panah masuk ke simbol terminator di Publikasi */}
                  <polygon points="414,69 418,72 414,75" fill="#000000" />

                  {/* Simbol Terminator berbentuk Kapsul Persegi Panjang Memanjang Mendatar:
                         lebar 64, tinggi 34, rx/ry = 17
                  */}
                  <rect 
                    x="418" 
                    y="55" 
                    width="64" 
                    height="34" 
                    rx="17" 
                    ry="17" 
                    fill="#ffffff" 
                    stroke="#000000" 
                    strokeWidth="1.2" 
                  />
                </svg>
              </td>

              {/* Mutu Baku: Kelengkapan */}
              <td className="border-r border-black p-2 leading-relaxed">
                Dashboard Data Pemetaan Kompetensi yang telah diverifikasi dan siap dipublikasikan
              </td>

              {/* Mutu Baku: Waktu */}
              <td className="border-r border-black border-r-dashed p-2 text-center leading-relaxed">
                30 menit
              </td>

              {/* Mutu Baku: Keluaran */}
              <td className="border-r border-black p-2 leading-relaxed">
                Dashboard Visualisasi Pemetaan Kompetensi yang siap dipublikasikan
              </td>

              {/* Keterangan */}
              <td className="p-2 leading-relaxed">
                Dashboard Visualisasi Pemetaan Kompetensi yang siap dipublikasikan
              </td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  );
};
