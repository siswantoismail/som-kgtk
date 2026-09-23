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
    return res.status(400).json({ error: "Email dan kata sandi wajib diisi." });
  }

  try {
    await ensureTablesCreated();
    const pool = getDbPool();

    // 1. Verifikasi whitelist
    const [authRows]: any = await pool.query(
      "SELECT `is_registered`, `full_name`, `nip`, `role_title` FROM `authorized_emails` WHERE LOWER(`email`) = ?",
      [cleanEmail],
    );

    if (authRows.length === 0) {
      await pool.query(
        "INSERT INTO `login_logs` (`user_email`, `status`, `message`) VALUES (?, ?, ?)",
        [
          cleanEmail,
          "FAILED_UNAUTHORIZED",
          "Login ditolak: Email tidak terdaftar dalam whitelist Cloud MySQL.",
        ],
      );
      return res.status(403).json({
        success: false,
        isUnauthorizedEmail: true,
        message: `Akses Ditolak: Alamat email "${cleanEmail}" tidak terdaftar dalam daftar izin SIM-SOP GTK Provinsi Gorontalo.`,
      });
    }

    const authData = authRows[0];
    if (!Boolean(authData.is_registered)) {
      return res.status(400).json({
        success: false,
        isPendingRegistration: true,
        message: `Email Anda (${cleanEmail}) telah terdaftar, namun Anda belum mendaftarkan kata sandi di Cloud MySQL. Silakan daftarkan kata sandi di tab Aktivasi Sandi.`,
      });
    }

    // 2. Cek email dan password di tabel users
    const [userRows]: any = await pool.query(
      "SELECT `id`, `email`, `full_name` as `fullName`, `nip`, `role_title` as `roleTitle` FROM `users` WHERE LOWER(`email`) = ? AND `password` = ?",
      [cleanEmail, cleanPassword],
    );

    if (userRows.length === 0) {
      await pool.query(
        "INSERT INTO `login_logs` (`user_email`, `status`, `message`) VALUES (?, ?, ?)",
        [
          cleanEmail,
          "FAILED_PASSWORD",
          "Kata sandi tidak sesuai dengan data di Cloud MySQL.",
        ],
      );
      return res.status(401).json({
        success: false,
        message: "Kata sandi tidak cocok dengan data akun di Cloud MySQL.",
      });
    }

    const user = userRows[0];

    // 3. Catat login sukses di Cloud MySQL
    await pool.query(
      "INSERT INTO `login_logs` (`user_email`, `status`, `message`) VALUES (?, ?, ?)",
      [
        cleanEmail,
        "SUCCESS",
        `Pengguna ${user.fullName} berhasil masuk ke SIM-SOP GTK via Cloud MySQL.`,
      ],
    );

    return res.status(200).json({
      success: true,
      message: "Login berhasil.",
      user,
    });
  } catch (err: any) {
    console.error("Login Cloud MySQL error:", err);
    return res.status(500).json({
      success: false,
      error: "Terjadi kegagalan komunikasi ke Cloud MySQL: " + err.message,
    });
  }
}
