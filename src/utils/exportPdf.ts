import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SopDocument, KinerjaPemetaanItem, BaganAlirStep } from '../types';
import { 
  getKemendikbudLogoDataUrl
} from './documentAssets';

/**
 * Ekspor Dokumen Resmi POS AP (Standar KemenPAN-RB No. 35/2012 & Kemendikdasmen)
 * Format 1 lembar Landscape A4 yang presisi sesuai naskah dokumen asli pada gambar.
 */
export function exportSopDocumentPdf(sop: SopDocument): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 8;
  const contentWidth = pageWidth - margin * 2; // 281mm
  const colWidth = contentWidth / 2; // 140.5mm
  const midX = margin + colWidth; // 148.5mm
  const tableBottom = 202; // total height = 194mm (8 to 202)

  // Outer Master Document Border (Garis Bingkai Utama Tabel)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(margin, margin, contentWidth, tableBottom - margin);

  // Garis vertikal pembagi tengah (50% kiri & 50% kanan) sepanjang seluruh tabel
  doc.line(midX, margin, midX, tableBottom);

  // -------------------------------------------------------------
  // 1. HEADER SECTION (Y: margin to headerBottomY)
  // -------------------------------------------------------------
  const labelColWidth = 38;
  const rightLabelX = midX;
  const dividerX = midX + labelColWidth; // 186.5mm

  // Hitung jumlah baris & tinggi Row 6 (Nama POS AP) agar dinamis dan tidak pernah bertabrakan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  const namaPosLines = doc.splitTextToSize(`: ${sop.namaPos}`, colWidth - labelColWidth - 4);
  const row6Height = Math.max(12, namaPosLines.length * 3.8 + 4.5);
  const row5BottomY = 53.0; // Batas bawah baris Disahkan Oleh
  const headerBottomY = row5BottomY + row6Height; // Batas bawah header resmi (sekitar 65mm)

  // Garis horizontal pembatas header (sepanjang seluruh tabel)
  doc.line(margin, headerBottomY, margin + contentWidth, headerBottomY);

  // Garis vertikal pembagi label & nilai di header kanan
  doc.line(dividerX, margin, dividerX, headerBottomY);

  // --- SISI KIRI HEADER (Logo + Wordmark + Kop Instansi + PROSEDUR OPERASIONAL STANDAR) ---
  const leftCenterX = margin + colWidth / 2;

  try {
    const logoDataUrl = getKemendikbudLogoDataUrl();
    if (logoDataUrl) {
      // Sematkan Logo Tut Wuri Handayani / Kemendikdasmen di tengah
      doc.addImage(logoDataUrl, 'PNG', leftCenterX - 7.5, margin + 2, 15, 15);
    }
  } catch (e) {
    console.error('Failed to render logo in PDF', e);
  }

  // Wordmark "Kemendikdasmen" (Kemen: biru, dikdasmen: oranye)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const kemenWidth = doc.getTextWidth('Kemen');
  const dikdasmenWidth = doc.getTextWidth('dikdasmen');
  const totalWordmarkWidth = kemenWidth + dikdasmenWidth;
  const wordmarkStartX = leftCenterX - totalWordmarkWidth / 2;

  doc.setTextColor(2, 132, 199); // #0284c7 cyan-blue
  doc.text('Kemen', wordmarkStartX, margin + 20.5);
  doc.setTextColor(234, 88, 12); // #ea580c orange
  doc.text('dikdasmen', wordmarkStartX + kemenWidth, margin + 20.5);

  // Teks Kop Kementerian & Unit Kerja
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH', leftCenterX, margin + 25.5, { align: 'center' });

  doc.setFontSize(6.8);
  doc.text('DIREKTORAT JENDERAL GURU, TENAGA KEPENDIDIKAN, DAN PENDIDIKAN GURU', leftCenterX, margin + 30.0, { align: 'center' });
  
  doc.setFontSize(7.2);
  doc.text(sop.unitKerja, leftCenterX, margin + 34.5, { align: 'center' });

  // Tulisan PROSEDUR OPERASIONAL STANDAR
  doc.setFontSize(8.5);
  doc.text('PROSEDUR OPERASIONAL STANDAR', leftCenterX, margin + 44.5, { align: 'center' });

  // --- SISI KANAN HEADER (Metadata Table 6 Baris Terstruktur) ---
  // Row 1: Nomor POS (Y: 8 to 13.2)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(0, 0, 0);
  doc.text('Nomor POS', rightLabelX + 2, 11.8);
  doc.text(`: ${sop.nomorPos}`, dividerX + 2, 11.8);
  doc.line(midX, 13.2, margin + contentWidth, 13.2);

  // Row 2: Tanggal Pembuatan (Y: 13.2 to 18.4)
  doc.text('Tanggal Pembuatan', rightLabelX + 2, 17.0);
  doc.setFont('helvetica', 'normal');
  doc.text(`: ${sop.tanggalPembuatan}`, dividerX + 2, 17.0);
  doc.line(midX, 18.4, margin + contentWidth, 18.4);

  // Row 3: Tanggal Revisi (Y: 18.4 to 23.6)
  doc.setFont('helvetica', 'bold');
  doc.text('Tanggal Revisi', rightLabelX + 2, 22.2);
  doc.setFont('helvetica', 'normal');
  doc.text(`: ${sop.tanggalRevisi || ''}`, dividerX + 2, 22.2);
  doc.line(midX, 23.6, margin + contentWidth, 23.6);

  // Row 4: Tanggal Efektif (Y: 23.6 to 28.8)
  doc.setFont('helvetica', 'bold');
  doc.text('Tanggal Efektif', rightLabelX + 2, 27.4);
  doc.setFont('helvetica', 'normal');
  doc.text(`: ${sop.tanggalEfektif}`, dividerX + 2, 27.4);
  doc.line(midX, 28.8, margin + contentWidth, 28.8);

  // Row 5: Disahkan Oleh (Y: 28.8 to 53.0)
  doc.setFont('helvetica', 'bold');
  doc.text('Disahkan Oleh', rightLabelX + 2, 32.5);
  
  // Jabatan Pengesah
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  const jabatanLines = doc.splitTextToSize(`: ${sop.disahkanOleh.jabatan}`, colWidth - labelColWidth - 4);
  doc.text(jabatanLines, dividerX + 2, 32.5);

  // Nama & NIP (Ruang tanda tangan dibiarkan bersih)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.text('Nama', dividerX + 2, 46.5);
  doc.text(`: ${sop.disahkanOleh.nama}`, dividerX + 14, 46.5);

  doc.text('NIP', dividerX + 2, 50.5);
  doc.text(`: ${sop.disahkanOleh.nip}`, dividerX + 14, 50.5);

  // Garis pemisah Row 5 & Row 6 (Tepat pada Y: 53.0)
  doc.line(midX, row5BottomY, margin + contentWidth, row5BottomY);

  // Row 6: Nama POS AP (Y: 53.0 to headerBottomY)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.text('Nama POS AP', rightLabelX + 2, 57.5);
  doc.text(namaPosLines, dividerX + 2, 57.5);

  // -------------------------------------------------------------
  // 2. BODY ROW 1: DASAR HUKUM (KIRI) & KUALIFIKASI PELAKSANA (KANAN)
  // Y: headerBottomY to row1BottomY
  // -------------------------------------------------------------
  const row1BottomY = Math.max(headerBottomY + 72, 139);
  doc.line(margin, row1BottomY, margin + contentWidth, row1BottomY);

  // Kiri: Dasar Hukum :
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Dasar Hukum :', margin + 2.5, headerBottomY + 4.5);

  let dhY = headerBottomY + 8.2;
  const dhMaxY = row1BottomY - 2;
  sop.dasarHukum.forEach((dh, idx) => {
    if (dhY > dhMaxY) return;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.6);
    const numStr = `${idx + 1}`;
    doc.text(numStr, margin + 2.5, dhY);

    const textLines = doc.splitTextToSize(dh, colWidth - 9.5);
    doc.text(textLines, margin + 6.5, dhY);
    dhY += textLines.length * 2.5 + 0.6;
  });

  // Kanan: Kualifikasi Pelaksana :
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Kualifikasi Pelaksana :', midX + 2.5, headerBottomY + 4.5);

  let kualY = headerBottomY + 8.2;
  const kualMaxY = row1BottomY - 2;
  sop.kualifikasiPelaksana.forEach((kual, idx) => {
    if (kualY > kualMaxY) return;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.3);
    const numStr = `${idx + 1}.`;
    doc.text(numStr, midX + 2.5, kualY);

    const textLines = doc.splitTextToSize(kual, colWidth - 11);
    doc.text(textLines, midX + 7, kualY);
    kualY += textLines.length * 3.0 + 1.0;
  });

  // -------------------------------------------------------------
  // 3. BODY ROW 2: KETERKAITAN (KIRI) & PERALATAN/PERLENGKAPAN (KANAN)
  // Y: row1BottomY to row2BottomY
  // -------------------------------------------------------------
  const row2BottomY = 171;
  doc.line(margin, row2BottomY, margin + contentWidth, row2BottomY);

  // Kiri: Keterkaitan :
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Keterkaitan :', margin + 2.5, row1BottomY + 4.5);

  let ketY = row1BottomY + 8.2;
  const ketMaxY = row2BottomY - 2;
  sop.keterkaitan.forEach((ket, idx) => {
    if (ketY > ketMaxY) return;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    const numStr = `${idx + 1}.`;
    doc.text(numStr, margin + 2.5, ketY);

    const textLines = doc.splitTextToSize(ket, colWidth - 11);
    doc.text(textLines, margin + 7, ketY);
    ketY += textLines.length * 2.8 + 0.8;
  });

  // Kanan: Peralatan/Perlengkapan :
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Peralatan/Perlengkapan :', midX + 2.5, row1BottomY + 4.5);

  let alatY = row1BottomY + 8.2;
  const alatMaxY = row2BottomY - 2;
  sop.peralatan.forEach((alat, idx) => {
    if (alatY > alatMaxY) return;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    const numStr = `${idx + 1}.`;
    doc.text(numStr, midX + 2.5, alatY);

    const textLines = doc.splitTextToSize(alat, colWidth - 11);
    doc.text(textLines, midX + 7, alatY);
    alatY += textLines.length * 2.8 + 0.8;
  });

  // -------------------------------------------------------------
  // 4. BODY ROW 3: PERINGATAN (KIRI) & PENCATATAN DAN PENDATAAN (KANAN)
  // Y: row2BottomY to tableBottom (202mm)
  // -------------------------------------------------------------
  // Kiri: Peringatan :
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Peringatan :', margin + 2.5, row2BottomY + 4.5);

  let perY = row2BottomY + 8.2;
  const perMaxY = tableBottom - 2;
  sop.peringatan.forEach((per, idx) => {
    if (perY > perMaxY) return;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.0);
    const numStr = `${idx + 1}.`;
    doc.text(numStr, margin + 2.5, perY);

    const textLines = doc.splitTextToSize(per, colWidth - 11);
    doc.text(textLines, margin + 7, perY);
    perY += textLines.length * 2.8 + 1.0;
  });

  // Kanan: Pencatatan dan Pendataan :
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Pencatatan dan Pendataan :', midX + 2.5, row2BottomY + 4.5);

  let catatY = row2BottomY + 8.2;
  const catatMaxY = tableBottom - 2;
  sop.pencatatan.forEach((catat, idx) => {
    if (catatY > catatMaxY) return;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.0);
    const numStr = `${idx + 1}.`;
    doc.text(numStr, midX + 2.5, catatY);

    const textLines = doc.splitTextToSize(catat, colWidth - 11);
    doc.text(textLines, midX + 7, catatY);
    catatY += textLines.length * 2.8 + 1.0;
  });

  // Simpan dokumen PDF resmi
  const cleanNomor = sop.nomorPos.replace(/[\/\\:]/g, '_');
  doc.save(`POS_AP_${cleanNomor}.pdf`);
}

/**
 * Render Header Judul Sub-bagian Tabel POS AP
 */
function renderSectionHeader(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  title: string
) {
  doc.setFillColor(241, 245, 249);
  doc.rect(x, y, width, 5.2, 'F');
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.line(x, y + 5.2, x + width, y + 5.2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(0, 0, 0);
  doc.text(title, x + 2.5, y + 3.8);
}

/**
 * Ekspor Laporan Rekapitulasi Kinerja Pemetaan GTK ke PDF
 * Lengkap dengan Kop Resmi Kemendikdasmen, Logo Tut Wuri Handayani,
 * Tabel Capaian, Ringkasan Mutu Baku, dan Tanda Tangan Resmi + Stempel.
 */
export function exportKinerjaReportPdf(items: KinerjaPemetaanItem[], sop: SopDocument): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 12;
  let currentY = 12;

  // --- KOP SURAT RESMI KEMENDIKDASMEN ---
  try {
    const logoDataUrl = getKemendikbudLogoDataUrl();
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', margin + 2, currentY, 20, 20);
    }
  } catch (e) {
    console.error('Failed to render logo in Kinerja PDF', e);
  }

  // Teks Kop Tengah
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH', pageWidth / 2, currentY + 4, { align: 'center' });

  doc.setFontSize(8.5);
  doc.text('DIREKTORAT JENDERAL GURU, TENAGA KEPENDIDIKAN, DAN PENDIDIKAN GURU', pageWidth / 2, currentY + 9, { align: 'center' });

  doc.setFontSize(9);
  doc.text(sop.unitKerja, pageWidth / 2, currentY + 14, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Sistem Informasi Manajemen Standar Operasional Prosedur (SIM-SOP GTK)', pageWidth / 2, currentY + 18, { align: 'center' });

  // Garis Ganda Kop Surat
  currentY += 22;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.6);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  doc.setLineWidth(0.2);
  doc.line(margin, currentY + 1, pageWidth - margin, currentY + 1);

  currentY += 6;

  // Judul Laporan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 58, 138);
  doc.text('LAPORAN HASIL MONITORING CAPAIAN KINERJA PEMETAAN KOMPETENSI GTK', pageWidth / 2, currentY, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Standar Acuan: POS AP No. ${sop.nomorPos} | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`, pageWidth / 2, currentY + 4.5, { align: 'center' });

  currentY += 9;

  // Ringkasan Agregat
  const totalTarget = items.reduce((acc, i) => acc + i.sasaranTarget, 0);
  const totalRealisasi = items.reduce((acc, i) => acc + i.realisasi, 0);
  const avgPercent = totalTarget > 0 ? ((totalRealisasi / totalTarget) * 100).toFixed(1) : '0';
  const countTercapai = items.filter((i) => i.statusKinerja === 'Tercapai').length;
  const countDiBawah = items.filter((i) => i.statusKinerja === 'Di Bawah Target' || i.statusKinerja === 'Perhatian').length;

  const cardWidth = (pageWidth - margin * 2 - 9) / 4;
  
  // Card 1
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, currentY, cardWidth, 12, 1, 1, 'F');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('TOTAL SASARAN TARGET:', margin + 3, currentY + 4);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${totalTarget.toLocaleString('id-ID')} GTK`, margin + 3, currentY + 9.5);

  // Card 2
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin + cardWidth + 3, currentY, cardWidth, 12, 1, 1, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('REALISASI TERPETAKAN:', margin + cardWidth + 6, currentY + 4);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 58, 138);
  doc.text(`${totalRealisasi.toLocaleString('id-ID')} (${avgPercent}%)`, margin + cardWidth + 6, currentY + 9.5);

  // Card 3
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin + (cardWidth + 3) * 2, currentY, cardWidth, 12, 1, 1, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('STATUS TARGET TERCAPAI:', margin + (cardWidth + 3) * 2 + 3, currentY + 4);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(22, 101, 52);
  doc.text(`${countTercapai} Kegiatan`, margin + (cardWidth + 3) * 2 + 3, currentY + 9.5);

  // Card 4
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin + (cardWidth + 3) * 3, currentY, cardWidth, 12, 1, 1, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('DI BAWAH TARGET / PERHATIAN:', margin + (cardWidth + 3) * 3 + 3, currentY + 4);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(185, 28, 28);
  doc.text(`${countDiBawah} Kegiatan`, margin + (cardWidth + 3) * 3 + 3, currentY + 9.5);

  currentY += 15;

  // Tabel Rekapitulasi Data
  const tableData = items.map((i, idx) => {
    const pct = ((i.realisasi / i.sasaranTarget) * 100).toFixed(1) + '%';
    return [
      (idx + 1).toString(),
      i.kodeKegiatan,
      i.namaKegiatan,
      i.wilayah,
      i.jenjang,
      i.sasaranTarget.toLocaleString('id-ID'),
      i.realisasi.toLocaleString('id-ID'),
      pct,
      i.waktuBaku,
      i.batasWaktu,
      i.statusKinerja
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['No', 'Kode', 'Kegiatan Pemetaan', 'Wilayah', 'Jenjang', 'Target', 'Realisasi', 'Capaian', 'Waktu Baku', 'Batas Waktu', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 1.5
    },
    bodyStyles: {
      fontSize: 7,
      cellPadding: 1.4,
      textColor: [15, 23, 42]
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 22 },
      2: { cellWidth: 54 },
      3: { cellWidth: 28 },
      4: { cellWidth: 20 },
      5: { cellWidth: 16, halign: 'right' },
      6: { cellWidth: 16, halign: 'right' },
      7: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      8: { cellWidth: 24 },
      9: { cellWidth: 22, halign: 'center' },
      10: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
    }
  });

  const finalTableY = (doc as any).lastAutoTable?.finalY || currentY + 50;

  // Box Pengesahan dengan Stempel & Tanda Tangan Resmi
  let signY = finalTableY + 8;
  if (signY + 35 > pageHeight) {
    doc.addPage();
    signY = 15;
  }

  const signX = pageWidth - margin - 85;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Gorontalo, ${sop.tanggalEfektif}`, signX, signY);
  doc.setFont('helvetica', 'bold');
  doc.text(sop.disahkanOleh.jabatan, signX, signY + 4);

  // Spasi tanda tangan manual
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(sop.disahkanOleh.nama, signX, signY + 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`NIP. ${sop.disahkanOleh.nip}`, signX, signY + 26);

  doc.save(`Laporan_Kinerja_Pemetaan_GTK_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Ekspor Bagan Alir POS AP (Standar KemenPAN-RB No. 35/2012)
 * Format Landscape A4 persis seperti 2 gambar yang disertakan pengguna.
 */
export function exportBaganAlirPdf(steps: BaganAlirStep[], sop: SopDocument): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 8;
  const contentWidth = pageWidth - margin * 2; // 281mm

  // Outer Border
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(margin, margin, contentWidth, 194);

  // Top Header Section (H: 26mm)
  const headerHeight = 24;
  doc.line(margin, margin + headerHeight, margin + contentWidth, margin + headerHeight);

  // Logo Kemendikdasmen
  try {
    const logoDataUrl = getKemendikbudLogoDataUrl();
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', margin + 4, margin + 2, 20, 20);
    }
  } catch (e) {
    console.error('Failed to render logo in Bagan Alir PDF', e);
  }

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text('KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH', margin + 30, margin + 6);
  doc.setFontSize(7.5);
  doc.text('DIREKTORAT JENDERAL GURU, TENAGA KEPENDIDIKAN, DAN PENDIDIKAN GURU', margin + 30, margin + 10);
  doc.text(sop.unitKerja, margin + 30, margin + 14);

  doc.setFontSize(9);
  doc.text('BAGAN ALIR PROSEDUR OPERASIONAL STANDAR (POS AP)', margin + 30, margin + 20);

  // Meta POS Info on top right
  const metaX = margin + contentWidth - 85;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Nomor POS : ${sop.nomorPos}`, metaX, margin + 7);
  doc.text(`Tgl Efektif : ${sop.tanggalEfektif}`, metaX, margin + 12);
  doc.text(`Status : Resmi Terverifikasi`, metaX, margin + 17);

  // Sub-header bar: Nama POS
  const titleY = margin + headerHeight + 1.5;
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, titleY, contentWidth, 6.5, 'F');
  doc.line(margin, titleY + 6.5, margin + contentWidth, titleY + 6.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`POS Pemetaan Kompetensi Guru, Kepala Sekolah, Pendidik Lainnya dan Tenaga Kependidikan`, margin + 4, titleY + 4.5);

  // AutoTable for 7 Steps
  const tableStartY = titleY + 7;

  const tableBody = steps.map((s) => {
    const colPengolah = s.pelaksana.pengolahData ? 'Aktif' : '-';
    const colWiPtp = s.pelaksana.fungsionalWiPtp ? 'Aktif' : '-';
    const colPtk = s.pelaksana.ptkBidangPendidikan ? 'Aktif' : '-';
    const colKepala = s.pelaksana.kepala 
      ? (s.pelaksana.kepalaOpsi ? `Aktif\n[${s.pelaksana.kepalaOpsi}]` : 'Aktif\n[Ya/Tidak]') 
      : '-';
    const colPublikasi = s.pelaksana.publikasi ? 'Aktif' : '-';

    return [
      s.no.toString(),
      s.langkahKegiatan,
      colPengolah,
      colWiPtp,
      colPtk,
      colKepala,
      colPublikasi,
      s.mutuBaku.kelengkapan,
      s.mutuBaku.waktu,
      s.mutuBaku.output,
      s.keterangan
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: margin, right: margin },
    tableWidth: contentWidth,
    head: [
      [
        { content: 'No.', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Langkah Kegiatan', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Pelaksana', colSpan: 5, styles: { halign: 'center' } },
        { content: 'Mutu Baku', colSpan: 3, styles: { halign: 'center' } },
        { content: 'Keterangan', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }
      ],
      [
        { content: 'Pengolah Data\n& Informasi', styles: { halign: 'center' } },
        { content: 'Fungsional\nWI & PTP', styles: { halign: 'center' } },
        { content: 'PTK (Bidang\nPendidikan)', styles: { halign: 'center' } },
        { content: 'Kepala\n(Opsi Ya/Tidak)', styles: { halign: 'center' } },
        { content: 'Publikasi', styles: { halign: 'center' } },
        { content: 'Kelengkapan', styles: { halign: 'center' } },
        { content: 'Waktu', styles: { halign: 'center' } },
        { content: 'Keluaran (Output)', styles: { halign: 'center' } }
      ]
    ],
    body: tableBody,
    theme: 'grid',
    styles: {
      fontSize: 6.2,
      cellPadding: 1.5,
      lineColor: [0, 0, 0],
      lineWidth: 0.18,
      textColor: [0, 0, 0],
      valign: 'middle'
    },
    headStyles: {
      fillColor: [240, 243, 246],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineColor: [0, 0, 0],
      lineWidth: 0.25,
      fontSize: 6.5
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 50, fontStyle: 'bold' },
      2: { cellWidth: 20, halign: 'center', fontStyle: 'bold', fontSize: 5.5 },
      3: { cellWidth: 18, halign: 'center', fontStyle: 'bold', fontSize: 5.5 },
      4: { cellWidth: 20, halign: 'center', fontStyle: 'bold', fontSize: 5.5 },
      5: { cellWidth: 20, halign: 'center', fontStyle: 'bold', fontSize: 5.5 },
      6: { cellWidth: 18, halign: 'center', fontStyle: 'bold', fontSize: 5.5 },
      7: { cellWidth: 32 },
      8: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
      9: { cellWidth: 38 },
      10: { cellWidth: 42 }
    }
  });

  const finalTableY = (doc as any).lastAutoTable?.finalY || 160;

  // Bottom Signature Block
  const signY = finalTableY + 4;
  const signX = pageWidth - margin - 75;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.text(`Gorontalo, ${sop.tanggalEfektif}`, signX, signY);
  doc.setFont('helvetica', 'bold');
  doc.text(sop.disahkanOleh.jabatan, signX, signY + 3.5);

  // Spasi kosong untuk penandatanganan manual
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(sop.disahkanOleh.nama, signX, signY + 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(`NIP. ${sop.disahkanOleh.nip}`, signX, signY + 22.5);

  doc.save(`Bagan_Alir_POS_AP_Pemetaan_GTK_${new Date().toISOString().slice(0, 10)}.pdf`);
}

