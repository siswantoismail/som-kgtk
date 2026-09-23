/**
 * Utilitas pembuatan aset grafis resmi (Logo Kemendikdasmen / Tut Wuri Handayani,
 * Stempel Dinas Kantor GTK Gorontalo, dan Tanda Tangan Resmi)
 * dalam format Base64 PNG beresolusi tinggi untuk disematkan dalam dokumen PDF dan UI.
 */

let cachedEmblemUrl: string | null = null;
let cachedStampUrl: string | null = null;
let cachedSignatureUrl: string | null = null;
let cachedCombinedUrl: string | null = null;

/**
 * Menghasilkan Logo Lambang Tut Wuri Handayani / Kemendikdasmen Resmi
 */
export function getKemendikbudLogoDataUrl(): string {
  if (cachedEmblemUrl) return cachedEmblemUrl;

  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  const cx = 160;
  const cy = 160;

  // Background circle
  ctx.fillStyle = '#1e3a8a'; // Deep Navy Blue
  ctx.beginPath();
  ctx.arc(cx, cy, 150, 0, Math.PI * 2);
  ctx.fill();

  // Outer golden ring
  ctx.strokeStyle = '#f59e0b'; // Amber Gold
  ctx.lineWidth = 6;
  ctx.stroke();

  // Inner border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 142, 0, Math.PI * 2);
  ctx.stroke();

  // Golden Sun Rays / Star at top
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(cx, 68, 14, 0, Math.PI * 2);
  ctx.fill();

  // Flame / Lidah Api (3 Kelopak Api)
  ctx.fillStyle = '#ef4444'; // Red
  ctx.beginPath();
  ctx.moveTo(cx, 40);
  ctx.quadraticCurveTo(cx + 24, 75, cx, 110);
  ctx.quadraticCurveTo(cx - 24, 75, cx, 40);
  ctx.fill();

  ctx.fillStyle = '#fbbf24'; // Yellow flame core
  ctx.beginPath();
  ctx.moveTo(cx, 55);
  ctx.quadraticCurveTo(cx + 12, 80, cx, 105);
  ctx.quadraticCurveTo(cx - 12, 80, cx, 55);
  ctx.fill();

  // Belanga / Cawan Emas
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.ellipse(cx, 112, 28, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sayap Garuda Tut Wuri Handayani (Kiri & Kanan)
  ctx.fillStyle = '#ffffff';
  // Sayap Kiri
  ctx.beginPath();
  ctx.moveTo(cx - 10, 115);
  ctx.bezierCurveTo(cx - 70, 90, cx - 120, 130, cx - 110, 175);
  ctx.bezierCurveTo(cx - 80, 195, cx - 40, 185, cx - 10, 195);
  ctx.closePath();
  ctx.fill();

  // Bulu-bulu sayap kiri
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 30, 135);
  ctx.lineTo(cx - 95, 150);
  ctx.moveTo(cx - 25, 155);
  ctx.lineTo(cx - 85, 175);
  ctx.stroke();

  // Sayap Kanan
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(cx + 10, 115);
  ctx.bezierCurveTo(cx + 70, 90, cx + 120, 130, cx + 110, 175);
  ctx.bezierCurveTo(cx + 80, 195, cx + 40, 185, cx + 10, 195);
  ctx.closePath();
  ctx.fill();

  // Bulu-bulu sayap kanan
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx + 30, 135);
  ctx.lineTo(cx + 95, 150);
  ctx.moveTo(cx + 25, 155);
  ctx.lineTo(cx + 85, 175);
  ctx.stroke();

  // Buku / Kitab Terbuka di tengah bawah
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.moveTo(cx, 160);
  ctx.lineTo(cx - 45, 185);
  ctx.lineTo(cx - 40, 205);
  ctx.lineTo(cx, 180);
  ctx.lineTo(cx + 40, 205);
  ctx.lineTo(cx + 45, 185);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Pita Putih Bawah
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(cx - 100, 240);
  ctx.quadraticCurveTo(cx, 255, cx + 100, 240);
  ctx.lineTo(cx + 110, 270);
  ctx.quadraticCurveTo(cx, 285, cx - 110, 270);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Tulisan TUT WURI HANDAYANI
  ctx.fillStyle = '#1e3a8a';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TUT WURI HANDAYANI', cx, 258);

  cachedEmblemUrl = canvas.toDataURL('image/png');
  return cachedEmblemUrl;
}

/**
 * Menghasilkan Stempel Basah Dinas Resmi Kemendikdasmen GTK Gorontalo
 */
export function getOfficialStampDataUrl(): string {
  if (cachedStampUrl) return cachedStampUrl;

  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  const cx = 150;
  const cy = 150;
  const stampColor = 'rgba(29, 78, 216, 0.88)'; // Authentic ink blue

  ctx.save();
  // Sedikit rotasi autentik seperti stempel manual basah (-4 derajat)
  ctx.translate(cx, cy);
  ctx.rotate(-0.07);
  ctx.translate(-cx, -cy);

  // Lingkaran Luar Tebal
  ctx.strokeStyle = stampColor;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, 130, 0, Math.PI * 2);
  ctx.stroke();

  // Lingkaran Dalam Tipis
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 122, 0, Math.PI * 2);
  ctx.stroke();

  // Lingkaran Inti
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 80, 0, Math.PI * 2);
  ctx.stroke();

  // Bintang di samping kiri & kanan
  ctx.fillStyle = stampColor;
  ctx.font = '16px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', 38, 150);
  ctx.fillText('★', 262, 150);

  // Teks Lengkung Atas: KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH
  const topText = 'KEMENTERIAN PENDIDIKAN DASAR & MENENGAH';
  drawCurvedText(ctx, topText, cx, cy, 102, -Math.PI * 0.85, Math.PI * 0.85, false, stampColor);

  // Teks Lengkung Bawah: PROVINSI GORONTALO
  const bottomText = 'PROVINSI GORONTALO';
  drawCurvedText(ctx, bottomText, cx, cy, 102, Math.PI * 0.72, Math.PI * 0.28, true, stampColor);

  // Garis horizontal pemisah tengah
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(70, 130);
  ctx.lineTo(230, 130);
  ctx.moveTo(70, 170);
  ctx.lineTo(230, 170);
  ctx.stroke();

  // Teks Pusat: KANTOR GTK
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = stampColor;
  ctx.fillText('KANTOR GTK', cx, 150);

  // Lambang Bintang di tengah atas & bawah
  ctx.font = '11px sans-serif';
  ctx.fillText('★ ★ ★', cx, 112);
  ctx.fillText('RESMI', cx, 188);

  ctx.restore();

  cachedStampUrl = canvas.toDataURL('image/png');
  return cachedStampUrl;
}

/**
 * Menghasilkan Tanda Tangan Resmi Kepala Kantor GTK Gorontalo
 */
export function getOfficialSignatureDataUrl(): string {
  if (cachedSignatureUrl) return cachedSignatureUrl;

  const canvas = document.createElement('canvas');
  canvas.width = 280;
  canvas.height = 140;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  ctx.strokeStyle = '#0f172a'; // Tinta pena hitam kebiruan
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  // Tarikan huruf E dan aksen kepemimpinan
  ctx.moveTo(25, 80);
  ctx.bezierCurveTo(40, 20, 70, 30, 65, 85);
  ctx.bezierCurveTo(60, 110, 35, 100, 50, 75);
  ctx.bezierCurveTo(70, 45, 95, 60, 100, 90);
  
  // Sambungan Aristanto
  ctx.lineTo(120, 65);
  ctx.bezierCurveTo(130, 55, 140, 80, 155, 70);
  ctx.bezierCurveTo(170, 60, 180, 95, 195, 65);
  ctx.lineTo(215, 80);

  // Coretan akhir meliuk panjang & tegas
  ctx.bezierCurveTo(170, 120, 80, 125, 30, 105);
  ctx.bezierCurveTo(50, 95, 160, 90, 250, 75);
  ctx.stroke();

  // Titik pengesahan
  ctx.beginPath();
  ctx.arc(245, 95, 2.5, 0, Math.PI * 2);
  ctx.fill();

  cachedSignatureUrl = canvas.toDataURL('image/png');
  return cachedSignatureUrl;
}

/**
 * Menghasilkan Gambar Gabungan Tanda Tangan + Stempel Basah Bertindih Alami
 */
export function getCombinedSignatureAndStampDataUrl(): string {
  if (cachedCombinedUrl) return cachedCombinedUrl;

  const canvas = document.createElement('canvas');
  canvas.width = 360;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  const stampImg = new Image();
  stampImg.src = getOfficialStampDataUrl();

  const sigImg = new Image();
  sigImg.src = getOfficialSignatureDataUrl();

  // Stempel di posisi kiri-tengah tanda tangan
  ctx.globalAlpha = 0.85;
  ctx.drawImage(stampImg, 10, 10, 175, 175);

  // Tanda tangan di atas stempel
  ctx.globalAlpha = 1.0;
  ctx.drawImage(sigImg, 65, 35, 260, 130);

  cachedCombinedUrl = canvas.toDataURL('image/png');
  return cachedCombinedUrl;
}

/**
 * Helper untuk menggambar teks melingkar pada stempel
 */
function drawCurvedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  isClockwise: boolean,
  color: string
) {
  ctx.save();
  ctx.font = 'bold 10.5px sans-serif';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const len = text.length;
  const angleStep = (endAngle - startAngle) / (len - 1);

  for (let i = 0; i < len; i++) {
    const angle = startAngle + i * angleStep;
    ctx.save();
    ctx.translate(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
    ctx.rotate(angle + (isClockwise ? -Math.PI / 2 : Math.PI / 2));
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }
  ctx.restore();
}
