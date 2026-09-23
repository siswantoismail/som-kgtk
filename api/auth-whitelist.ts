import type { Request, Response } from 'express';
import { getDbPool, ensureTablesCreated } from './_db';

export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const emailParam = (req.query?.email as string) || (req.url?.split('/').pop()?.split('?')[0]) || '';
  const cleanEmail = decodeURIComponent(emailParam).trim().toLowerCase();

  if (!cleanEmail) {
    return res.status(400).json({
      isAuthorized: false,
      isRegistered: false,
      message: 'Parameter email wajib disertakan.'
    });
  }

  try {
    await ensureTablesCreated();
    const pool = getDbPool();

    const [rows]: any = await pool.query(
      'SELECT `id`, `email`, `full_name` as `fullName`, `nip`, `role_title` as `roleTitle`, `is_registered` as `isRegistered` FROM `authorized_emails` WHERE LOWER(`email`) = ?',
      [cleanEmail]
    );

    if (rows.length > 0) {
      const match = rows[0];
      return res.status(200).json({
        isAuthorized: true,
        isRegistered: Boolean(match.isRegistered),
        authorizedAccount: match,
        message: match.isRegistered
          ? 'Alamat email ini terdaftar dan sudah aktif di Cloud MySQL. Silakan masuk atau ubah sandi baru.'
          : 'Alamat email terdaftar dalam sistem izin Cloud MySQL. Silakan daftarkan kata sandi Anda.'
      });
    }

    return res.status(403).json({
      isAuthorized: false,
      isRegistered: false,
      message: `Akses Ditolak: Alamat email "${cleanEmail}" belum terdaftar dalam daftar izin Cloud MySQL SIM-SOP GTK Provinsi Gorontalo.`
    });
  } catch (err: any) {
    return res.status(500).json({
      isAuthorized: false,
      isRegistered: false,
      error: 'Kesalahan server Cloud MySQL: ' + err.message
    });
  }
}
