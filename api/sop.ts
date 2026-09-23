import type { Request, Response } from "express";
import { getDbPool, ensureTablesCreated } from "./_db";
import { parseBody } from "./_parseBody";

export default async function handler(req: Request, res: Response) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-user-email");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    await ensureTablesCreated();
    const pool = getDbPool();

    // GET /api/sop - Ambil semua dokumen POS AP
    if (req.method === "GET") {
      const [rows]: any = await pool.query(
        "SELECT * FROM `sop_documents` ORDER BY `created_at` DESC",
      );
      const docs = rows.map((r: any) => ({
        id: r.id,
        nomorPos: r.nomor_pos,
        instansi: r.instansi,
        unitKerja: r.unit_kerja,
        tanggalPembuatan: r.tanggal_pembuatan,
        tanggalRevisi: r.tanggal_revisi || "",
        tanggalEfektif: r.tanggal_efektif,
        namaPos: r.nama_pos,
        disahkanOleh: {
          nama: r.disahkan_nama,
          nip: r.disahkan_nip,
          jabatan: r.disahkan_jabatan,
        },
        dasarHukum:
          typeof r.dasar_hukum === "string"
            ? JSON.parse(r.dasar_hukum)
            : r.dasar_hukum,
        kualifikasiPelaksana:
          typeof r.kualifikasi_pelaksana === "string"
            ? JSON.parse(r.kualifikasi_pelaksana)
            : r.kualifikasi_pelaksana,
        keterkaitan:
          typeof r.keterkaitan === "string"
            ? JSON.parse(r.keterkaitan)
            : r.keterkaitan,
        peralatan:
          typeof r.peralatan === "string"
            ? JSON.parse(r.peralatan)
            : r.peralatan,
        peringatan:
          typeof r.peringatan === "string"
            ? JSON.parse(r.peringatan)
            : r.peringatan,
        pencatatan:
          typeof r.pencatatan === "string"
            ? JSON.parse(r.pencatatan)
            : r.pencatatan,
        status: "Aktif",
      }));
      return res.status(200).json(docs);
    }

    // POST / PUT /api/sop - Simpan atau perbarui dokumen POS AP di Cloud MySQL
    if (req.method === "POST" || req.method === "PUT") {
      const doc = await parseBody(req);
      const userEmail =
        (req.headers["x-user-email"] as string) || "operator@kemdikbud.go.id";

      if (!doc || !doc.id || !doc.nomorPos) {
        return res
          .status(400)
          .json({ error: "Data naskah POS AP tidak lengkap." });
      }

      await pool.query(
        `
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
      `,
        [
          doc.id,
          doc.nomorPos,
          doc.instansi || "",
          doc.unitKerja || "",
          doc.tanggalPembuatan || "",
          doc.tanggalRevisi || "",
          doc.tanggalEfektif || "",
          doc.namaPos || "",
          doc.disahkanOleh?.nama || "",
          doc.disahkanOleh?.nip || "",
          doc.disahkanOleh?.jabatan || "",
          JSON.stringify(doc.dasarHukum || []),
          JSON.stringify(doc.kualifikasiPelaksana || []),
          JSON.stringify(doc.keterkaitan || []),
          JSON.stringify(doc.peralatan || []),
          JSON.stringify(doc.peringatan || []),
          JSON.stringify(doc.pencatatan || []),
        ],
      );

      // Catat ke log perubahan Cloud MySQL
      await pool.query(
        "INSERT INTO \`data_changes\` (\`entity_type\`, \`entity_id\`, \`action_type\`, \`user_email\`, \`description\`, \`changes_json\`) VALUES (?, ?, ?, ?, ?, ?)",
        [
          "SOP_DOCUMENT",
          doc.id,
          "UPDATE_SOP",
          userEmail,
          `Pembaruan naskah POS AP ${doc.nomorPos} tersimpan di Cloud MySQL.`,
          JSON.stringify({ nomorPos: doc.nomorPos, namaPos: doc.namaPos }),
        ],
      );

      return res.status(200).json({
        success: true,
        message: "Naskah POS AP berhasil disimpan di Cloud MySQL.",
        doc,
      });
    }

    return res.status(405).json({ error: "Metode tidak didukung." });
  } catch (err: any) {
    console.error("SOP Cloud MySQL error:", err);
    return res.status(500).json({
      error: "Gagal memproses dokumen di Cloud MySQL: " + err.message,
    });
  }
}
