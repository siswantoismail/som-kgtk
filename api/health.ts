import type { Request, Response } from 'express';
import { getDbPool, ensureTablesCreated } from './_db';

export default async function handler(req: Request, res: Response) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const pool = getDbPool();
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();

    await ensureTablesCreated();

    return res.status(200).json({
      status: 'ok',
      database: 'connected',
      cloud: true,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: error.message || 'Gagal terhubung ke Cloud MySQL'
    });
  }
}
