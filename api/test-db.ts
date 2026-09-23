import type { Request, Response } from "express";
import { getDbPool } from "./_db";

export default async function handler(req: Request, res: Response) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const rawUrl = process.env.MYSQL_URL || process.env.DATABASE_URL || "";
  const maskedUrl = rawUrl
    ? rawUrl.replace(/:([^:@]{3,})@/, ":****@")
    : "(kosong)";

  try {
    const pool = getDbPool();
    const conn = await pool.getConnection();
    const [rows]: any = await conn.query(
      "SELECT 1 as connected, NOW() as serverTime, VERSION() as version",
    );
    conn.release();

    return res.status(200).json({
      success: true,
      message: "Koneksi Cloud MySQL TiDB Berhasil!",
      data: rows[0],
      databaseUrlConfigured: Boolean(rawUrl),
      urlMasked: maskedUrl,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Gagal terhubung ke Cloud MySQL: " + err.message,
      errorCode: err.code || null,
      errorStack: err.stack,
      databaseUrlConfigured: Boolean(rawUrl),
      urlMasked: maskedUrl,
    });
  }
}
