const cron = require("node-cron");
const { pool } = require("../db");
const fs = require("fs");
const path = require("path");

async function archiveExpiredOpportunities() {
  console.log("[Archiver] Starting daily archiving job...");

  try {
    // 1. UPDATE STATUS: Active -> Archived (Expired Deadline)
    const result = await pool.query(`
        UPDATE opportunities 
        SET status = 'archived' 
        WHERE deadline < CURRENT_DATE AND status = 'active'
      `);
    console.log(`[Archiver] Archived ${result.rowCount} expired opportunities.`);

    // 2. COLD STORAGE: Move files for items archived > 30 days ago
    // We assume they were archived roughly when deadline passed.
    // So fetch items where deadline < NOW - 30 days AND status = 'archived'
    const { rows: coldItems } = await pool.query(`
        SELECT id, banner_image, promo_video, video_variants 
        FROM opportunities 
        WHERE status = 'archived' 
          AND deadline < CURRENT_DATE - INTERVAL '30 days'
          -- Basic check to see if main video isn't already archived
          AND (promo_video IS NULL OR promo_video NOT LIKE '/archive/%')
      `);

    const archiveDir = path.join(__dirname, "../archive");
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }

    for (const item of coldItems) {
      let updated = false;

      // Process Banner
      if (item.banner_image && item.banner_image.startsWith('/uploads/')) {
        const filename = item.banner_image.split('/').pop();
        const oldPath = path.join(__dirname, "../uploads", filename);
        const newPath = path.join(archiveDir, filename);

        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath);
          // Update DB immediately or collect updates? simpler to update immediately for robustness
          await pool.query("UPDATE opportunities SET banner_image = $1 WHERE id = $2",
            [`/archive/${filename}`, item.id]);
          console.log(`[ColdStorage] Moved banner for opp ${item.id}`);
        }
      }

      // Process Original Video
      if (item.promo_video && item.promo_video.startsWith('/uploads/')) {
        const filename = item.promo_video.split('/').pop();
        const oldPath = path.join(__dirname, "../uploads", filename);
        const newPath = path.join(archiveDir, filename);

        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath);
          await pool.query("UPDATE opportunities SET promo_video = $1 WHERE id = $2",
            [`/archive/${filename}`, item.id]);
          updated = true;
          console.log(`[ColdStorage] Moved raw video for opp ${item.id}`);
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

            if (fs.existsSync(oldPath)) {
              fs.renameSync(oldPath, newPath);
              newVariants[key] = `/archive/${filename}`;
              variantsUpdated = true;
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
