import type { Request, Response } from 'express';
import { getDbPool, ensureTablesCreated } from './_db';

export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    await ensureTablesCreated();
    const pool = getDbPool();

    const [rows]: any = await pool.query(
      'SELECT `id`, `email`, `full_name` as `fullName`, `nip`, `role_title` as `roleTitle` FROM `users` ORDER BY `id` ASC'
    );

    return res.status(200).json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal memuat pengguna Cloud MySQL: ' + err.message });
  }
}
