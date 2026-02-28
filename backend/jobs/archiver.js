const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const cron = require("node-cron");
const { pool } = require("../db");

async function archiveExpiredOpportunities() {
  console.log("[Archiver] Starting daily archiving job...");

  try {
    // ═══════════════════════════════════════════════════════════
    // PASUL 1: active → expired  (deadline trecut)
    // Rămâne vizibil 2 zile cu badge "Expirat"
    // ═══════════════════════════════════════════════════════════
    const expiredResult = await pool.query(`
        UPDATE opportunities 
        SET status = 'expired' 
        WHERE deadline < CURRENT_DATE AND status = 'active'
      `);
    if (expiredResult.rowCount > 0) {
      console.log(`[Archiver] Marked ${expiredResult.rowCount} opportunities as EXPIRED.`);
    }

    // ═══════════════════════════════════════════════════════════
    // PASUL 2: expired → archived  (2 zile după deadline)
    // Fișierele se mută imediat în /archive/
    // ═══════════════════════════════════════════════════════════
    const archivedResult = await pool.query(`
        UPDATE opportunities 
        SET status = 'archived' 
        WHERE status = 'expired' 
          AND deadline < CURRENT_DATE - INTERVAL '2 days'
        RETURNING id
      `);
    if (archivedResult.rowCount > 0) {
      console.log(`[Archiver] Archived ${archivedResult.rowCount} expired opportunities.`);
    }

    // ═══════════════════════════════════════════════════════════
    // PASUL 3: Cold Storage — mută fișierele pentru cele tocmai arhivate
    // ═══════════════════════════════════════════════════════════
    const archivedIds = archivedResult.rows.map(r => r.id);
    if (archivedIds.length > 0) {
      const { rows: coldItems } = await pool.query(`
          SELECT id, banner_image, promo_video, video_variants 
          FROM opportunities 
          WHERE id = ANY($1)
            AND (banner_image IS NOT NULL OR promo_video IS NOT NULL)
        `, [archivedIds]);

      const archiveDir = path.join(__dirname, "../archive");
      if (!fsSync.existsSync(archiveDir)) {
        fsSync.mkdirSync(archiveDir, { recursive: true });
      }

      for (const item of coldItems) {
        // Process Banner
        if (item.banner_image && item.banner_image.startsWith('/uploads/')) {
          const filename = item.banner_image.split('/').pop();
          const oldPath = path.join(__dirname, "../uploads", filename);
          const newPath = path.join(archiveDir, filename);

          try {
            await fs.rename(oldPath, newPath);
            await pool.query("UPDATE opportunities SET banner_image = $1 WHERE id = $2",
              [`/archive/${filename}`, item.id]);
            console.log(`[ColdStorage] Moved banner for opp ${item.id}`);
          } catch (e) {
            if (e.code !== 'ENOENT') console.error(`[ColdStorage] Failed to move banner for opp ${item.id}:`, e.message);
          }
        }

        // Process Original Video
        if (item.promo_video && item.promo_video.startsWith('/uploads/')) {
          const filename = item.promo_video.split('/').pop();
          const oldPath = path.join(__dirname, "../uploads", filename);
          const newPath = path.join(archiveDir, filename);

          try {
            await fs.rename(oldPath, newPath);
            await pool.query("UPDATE opportunities SET promo_video = $1 WHERE id = $2",
              [`/archive/${filename}`, item.id]);
            console.log(`[ColdStorage] Moved raw video for opp ${item.id}`);
          } catch (e) {
            if (e.code !== 'ENOENT') console.error(`[ColdStorage] Failed to move video for opp ${item.id}:`, e.message);
          }
        }

        // Process Video Variants
        if (item.video_variants && Object.keys(item.video_variants).length > 0) {
          const newVariants = { ...item.video_variants };
          let variantsUpdated = false;

          for (const [key, pathUrl] of Object.entries(item.video_variants)) {
            if (typeof pathUrl === 'string' && pathUrl.startsWith('/uploads/')) {
              const filename = pathUrl.split('/').pop();
              const oldPath = path.join(__dirname, "../uploads", filename);
              const newPath = path.join(archiveDir, filename);

              try {
                await fs.rename(oldPath, newPath);
                newVariants[key] = `/archive/${filename}`;
                variantsUpdated = true;
              } catch (e) {
                if (e.code !== 'ENOENT') console.error(`[ColdStorage] Failed to move variant ${key} for opp ${item.id}:`, e.message);
              }
            }
          }

          if (variantsUpdated) {
            await pool.query("UPDATE opportunities SET video_variants = $1 WHERE id = $2",
              [JSON.stringify(newVariants), item.id]);
            console.log(`[ColdStorage] Moved video variants for opp ${item.id}`);
          }
        }
      }
    }

  } catch (err) {
    console.error("[Archiver] Job failed:", err);
    throw err;
  }
}

function startArchiver() {
  // Rulează zilnic la ora 22:00 UTC = 00:00 România (Miezul Nopții)
  cron.schedule("0 22 * * *", archiveExpiredOpportunities);
  console.log("[Scheduler] Archiver job scheduled (Daily 22:00 UTC = 00:00 Romania Time - Midnight).");
}

module.exports = { startArchiver, archiveExpiredOpportunities };
