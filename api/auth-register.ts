import type { Request, Response } from "express";
import { getDbPool, ensureTablesCreated } from "./_db";
import { parseBody } from "./_parseBody";

export default async function handler(req: Request, res: Response) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "Metode tidak diizinkan. Gunakan POST." });
  }

  const body = await parseBody(req);
  const { email, password } = body || {};
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPassword = password || "";

  if (!cleanEmail || !cleanPassword) {
    return res
      .status(400)
      .json({ success: false, error: "Email dan kata sandi wajib diisi." });
  }

  if (cleanPassword.length < 6) {
    return res
      .status(400)
      .json({ success: false, error: "Kata sandi minimal 6 karakter." });
  }

  try {
    await ensureTablesCreated();
    const pool = getDbPool();

    // 1. Verifikasi izin di whitelist
    const [authRows]: any = await pool.query(
      "SELECT * FROM `authorized_emails` WHERE LOWER(`email`) = ?",
      [cleanEmail],
    );

    if (authRows.length === 0) {
      await pool.query(
        "INSERT INTO `data_changes` (`entity_type`, `entity_id`, `action_type`, `user_email`, `description`) VALUES (?, ?, ?, ?, ?)",
        [
          "AUTH",
          cleanEmail,
          "REGISTER_DENIED",
          cleanEmail,
          `Pendaftaran ditolak untuk "${cleanEmail}" (tidak ada di whitelist).`,
        ],
      );
      return res.status(403).json({
        success: false,
        error: `Akses Ditolak: Email "${cleanEmail}" tidak terdaftar dalam daftar izin SIM-SOP GTK Provinsi Gorontalo.`,
      });
    }

    const authorized = authRows[0];
    const fullName = authorized.full_name || "Pegawai GTK Terdaftar";
    const nip = authorized.nip || "-";
    const roleTitle = authorized.role_title || "Pelaksana / Pengelola SOP AP";

    // 2. Tulis/Update langsung ke tabel `users` di Cloud MySQL
    await pool.query(
      `
      INSERT INTO \`users\` (\`email\`, \`password\`, \`full_name\`, \`nip\`, \`role_title\`)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        \`password\` = VALUES(\`password\`),
        \`full_name\` = VALUES(\`full_name\`),
        \`nip\` = VALUES(\`nip\`),
        \`role_title\` = VALUES(\`role_title\`),
        \`updated_at\` = NOW()
    `,
      [cleanEmail, cleanPassword, fullName, nip, roleTitle],
    );

    // 3. Update status registrasi di whitelist
    await pool.query(
      "UPDATE `authorized_emails` SET `is_registered` = 1, `registered_at` = NOW() WHERE LOWER(`email`) = ?",
      [cleanEmail],
    );

    // 4. Catat riwayat perubahan ke tabel `data_changes` dan `login_logs`
    await pool.query(
      "INSERT INTO `data_changes` (`entity_type`, `entity_id`, `action_type`, `user_email`, `description`) VALUES (?, ?, ?, ?, ?)",
      [
        "AUTH",
        cleanEmail,
        "REGISTER_PASSWORD",
        cleanEmail,
        `Pengguna ${fullName} (${cleanEmail}) berhasil mengubah/mendaftarkan kata sandi di Cloud MySQL.`,
      ],
    );

    await pool.query(
      "INSERT INTO `login_logs` (`user_email`, `status`, `message`) VALUES (?, ?, ?)",
      [
        cleanEmail,
        "REGISTER_PASSWORD",
        `Pengguna ${fullName} berhasil menyimpan kata sandi ke Cloud MySQL.`,
      ],
    );

    return res.status(200).json({
      success: true,
      message: `Kata sandi untuk ${fullName} (${cleanEmail}) berhasil diperbarui dan tersimpan permanen di Cloud MySQL!`,
    });
  } catch (err: any) {
    console.error("Register password Cloud MySQL error:", err);
    return res.status(500).json({
      success: false,
      error: "Gagal menyimpan kata sandi ke Cloud MySQL: " + err.message,
    });
  }
}
