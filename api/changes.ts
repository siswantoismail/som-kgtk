import type { Request, Response } from "express";
import { getDbPool, ensureTablesCreated } from "./_db";
import { parseBody } from "./_parseBody";

export default async function handler(req: Request, res: Response) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    await ensureTablesCreated();
    const pool = getDbPool();

    if (req.method === "POST") {
      const body = await parseBody(req);
      const {
        entityType,
        entityId,
        actionType,
        userEmail,
        description,
        changesJson,
      } = body || {};
      await pool.query(
        "INSERT INTO `data_changes` (`entity_type`, `entity_id`, `action_type`, `user_email`, `description`, `changes_json`) VALUES (?, ?, ?, ?, ?, ?)",
        [
          entityType || "SYSTEM",
          entityId || "SYS-01",
          actionType || "LOG",
          userEmail || "operator@kemdikbud.go.id",
          description || "Perubahan data sistem",
          changesJson ? JSON.stringify(changesJson) : null,
        ],
      );
      return res
        .status(200)
        .json({ success: true, message: "Log tersimpan di Cloud MySQL" });
    }

    const [rows]: any = await pool.query(
      "SELECT * FROM `data_changes` ORDER BY `id` DESC LIMIT 100",
    );
    const logs = rows.map((r: any) => ({
      id: r.id,
      entityType: r.entity_type,
      entityId: r.entity_id,
      actionType: r.action_type,
      userEmail: r.user_email,
      description: r.description,
      changesJson:
        typeof r.changes_json === "string"
          ? JSON.parse(r.changes_json)
          : r.changes_json,
      createdAt: r.created_at,
    }));

    return res.status(200).json(logs);
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: "Gagal memproses riwayat Cloud MySQL: " + err.message });
  }
}
