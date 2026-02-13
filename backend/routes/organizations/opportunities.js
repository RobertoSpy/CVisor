const express = require("express");
const { pool } = require("../../db");
const verifyToken = require("../../middleware/verifyToken");
const verifyOrg = require("../../middleware/verifyOrg"); // middleware pentru rol organizație

const router = express.Router();
const { notificationQueue, videoQueue } = require("../../lib/queue");
const path = require("path");
const fs = require("fs");


function toPgArray(arr) {
  if (Array.isArray(arr)) {
    return '{' + arr.map(e => `"${String(e).replace(/"/g, '\\"')}"`).join(',') + '}';
  }
  // dacă e null/undefined, returnăm null astfel încât să fie tratat corect de PG
  if (arr == null) return null;
  return String(arr);
}

function toJson(val) {
  if (val == null) return null;
  if (typeof val === 'object') {
    return JSON.stringify(val);
  }
  return val;
}

// Creează oportunitate (POST /api/organization/opportunities)
router.post("/", verifyToken, verifyOrg, async (req, res) => {
  const userId = req.user.id;
  const {
    title,
    type,
    skills,
    deadline,
    available_spots,
    price,
    banner_image,
    promo_video,
    gallery,
    participants,
    location,
    tags,
    agenda,
    faq,
    reviews,
    description,
    cta_url
  } = req.body;

  if (!title || !type || !deadline || !description) {
    return res.status(400).json({ message: "Lipsesc câmpuri obligatorii" });
  }

  // VALIDARE: Deadline nu poate fi în trecut
  const deadlineDate = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset la miezul nopții pentru comparație corectă

  if (deadlineDate < today) {
    return res.status(400).json({
      message: "Deadline-ul nu poate fi în trecut! Te rugăm să alegi o dată din viitor."
    });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO opportunities 
        (title, type, skills, deadline, user_id, available_spots, price, banner_image, promo_video, participants, location, tags, agenda, faq, description, cta_url)
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [
        title,
        type,
        toPgArray(skills),
        deadline,
        userId,
        available_spots,
        price,
        banner_image,
        promo_video,
        toJson(participants),
        location,
        toPgArray(tags),
        toJson(agenda),
        toJson(faq),
        description,
        cta_url
      ]
    );
    // Adaugă 5 puncte pentru crearea oportunității
    await pool.query(
      "INSERT INTO user_points (user_id, points, updated_at) VALUES ($1, 5, NOW()) " +
      "ON CONFLICT (user_id) DO UPDATE SET points = user_points.points + 5, updated_at = NOW()",
      [userId]
    );
    await pool.query(
      "INSERT INTO user_point_events (user_id, points_delta, reason) VALUES ($1, 5, 'create_opportunity')",
      [userId]
    );

    // Notify user about points
    notificationQueue.add("user-notification", {
      userId,
      title: "Ai primit 5 puncte! 💎",
      body: "Felicitări! Ai publicat o nouă oportunitate.",
      icon: '/albastru.svg',
      url: '/organization'
    }, { removeOnComplete: true }).catch(console.error);

    // --- VIDEO PROCESSING QUEUE ---
    if (promo_video && promo_video.startsWith('/uploads/')) {
      // Extract filename from URL (e.g. /uploads/123.mp4 -> 123.mp4)
      const filename = promo_video.split('/').pop();
      // Construct absolute path
      const filePath = path.join(__dirname, '../../uploads', filename);

      // Add to queue
      videoQueue.add('process-video', {
        filePath,
        filename,
        userId,
        opportunityId: rows[0].id
      }).catch(err => console.error("Video Queue Error:", err));
    }
    // -----------------------------

    // --- PUSH NOTIFICATIONS ---
    // Trimite notificare asincron la toți abonații (nu blochează răspunsul HTTP)
    // --- PUSH NOTIFICATIONS (ASYNC VIA QUEUE) ---
    const orgName = req.user.full_name || "O organizație";
    const shortDesc = description && description.length > 50 ? description.substring(0, 50) + "..." : (description || "Vezi detalii în aplicație!");

    // Adaugă job în coadă
    notificationQueue.add("opportunity-push", {
      title: `${orgName}: ${title}`,
      body: shortDesc,
      icon: '/albastru.svg',
      data: { url: `/student/opportunities/${rows[0].id}` }
    }, {
      removeOnComplete: true, // Șterge jobul după ce e gata
      attempts: 3 // Încearcă de 3 ori dacă eșuează
    }).catch(err => console.error("Queue error:", err));
    // --------------------------
    // --------------------------

    res.json({ ...rows[0], pointsAdded: 5, reason: "create_opportunity" });
  } catch (e) {
    console.error("DB error (create opportunity):", e);
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

// Editează oportunitate (PUT /api/organization/opportunities/:id)
router.put("/:id", verifyToken, verifyOrg, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const {
    title,
    type,
    skills,
    deadline,
    available_spots,
    price,
    banner_image,
    promo_video,
    gallery,
    participants,
    location,
    tags,
    agenda,
    faq,
    description
  } = req.body;

  if (!title || !type || !deadline || !description) {
    return res.status(400).json({ message: "Lipsesc câmpuri obligatorii" });
  }

  // VALIDARE: Deadline nu poate fi în trecut
  const deadlineDate = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset la miezul nopții pentru comparație corectă

  if (deadlineDate < today) {
    return res.status(400).json({
      message: "Deadline-ul nu poate fi în trecut! Te rugăm să alegi o dată din viitor."
    });
  }

  try {
    // Fetch current opportunity to check for old video
    const { rows: currentOpp } = await pool.query(
      `SELECT promo_video FROM opportunities WHERE id = $1`,
      [id]
    );

    if (currentOpp.length > 0) {
      const oldVideo = currentOpp[0].promo_video;
      // Dacă se schimbă video-ul și exista unul vechi
      if (promo_video && oldVideo && promo_video !== oldVideo) {
        try {
          // Construiește calea absolută către fișierul vechi
          // Presupunem că oldVideo începe cu "/uploads/"
          // __dirname este .../backend/routes/organizations
          // Trebuie să ajungem la .../backend/uploads/...
          const fs = require('fs');
          const path = require('path');

          // Elimină slash-ul de la început dacă există pentru path.join corect
          const relativePath = oldVideo.startsWith('/') ? oldVideo.substring(1) : oldVideo;
          const oldFilePath = path.join(__dirname, '../../', relativePath);

          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
            console.log(`[Update Opportunity] Deleted old video: ${oldFilePath}`);
          }
        } catch (err) {
          console.error("[Update Opportunity] Error deleting old video:", err);
          // Nu blocăm update-ul dacă ștergerea eșuează, doar logăm
        }
      }
    }

    const { rows } = await pool.query(
      `UPDATE opportunities SET
        title=$1, type=$2, skills=$3, deadline=$4, available_spots=$5,
        price=$6, banner_image=$7, promo_video=$8, participants=$9,
        location=$10, tags=$11, agenda=$12, faq=$13, description=$14
       WHERE id=$15 AND user_id=$16
       RETURNING *`,
      [
        title,
        type,
        toPgArray(skills),
        deadline,
        available_spots,
        price,
        banner_image,
        promo_video,
        toJson(participants),
        location,
        toPgArray(tags),
        toJson(agenda),
        toJson(faq),
        description,
        id,
        userId
      ]
    );
    if (!rows.length) return res.status(404).json({ message: "Not found" });

    // --- VIDEO PROCESSING QUEUE (Update) ---
    // Trigger only if video changed and is local upload
    // We already checked oldVideo logic above, but let's re-verify logic
    if (promo_video && promo_video.startsWith('/uploads/')) {
      // Check if it's different from potentially old one or just a safeguard
      // Simply add to queue, if it's already processed, maybe we should have a flag?
      // For now, simple re-process is safer.
      const filename = promo_video.split('/').pop();
      const filePath = path.join(__dirname, '../../uploads', filename);

      videoQueue.add('process-video', {
        filePath,
        filename,
        userId,
        opportunityId: id
      }).catch(err => console.error("Video Queue Error (Update):", err));
    }

    res.json(rows[0]);
  } catch (e) {
    console.error("DB error (update opportunity):", e);
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

// Șterge oportunitate (DELETE /api/organization/opportunities/:id)
router.delete("/:id", verifyToken, verifyOrg, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    // folosim RETURNING * ca să putem returna rândul șters dacă e nevoie
    const { rows } = await pool.query(
      `DELETE FROM opportunities WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );
    if (!rows.length) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    console.error("DB error (delete opportunity):", e);
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

// Vezi detalii oportunitate explorată (GET /api/organization/opportunities/explore/:id)
router.get("/explore/:id", verifyToken, verifyOrg, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT o.*, u.full_name as organization_name 
      FROM opportunities o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    console.error("DB error (get explore opportunity):", e);
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

// Vezi oportunitățile altor organizații (GET /api/organization/opportunities/explore)
router.get("/explore", verifyToken, verifyOrg, async (req, res) => {
  const userId = req.user.id;
  try {
    const { rows } = await pool.query(`
      SELECT o.*, u.full_name as organization_name 
      FROM opportunities o
      JOIN users u ON o.user_id = u.id
      WHERE o.user_id != $1 
      ORDER BY o.id DESC
    `, [userId]);
    res.json(rows);
  } catch (e) {
    console.error("DB error (explore opportunities):", e);
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

// Vezi toate oportunitățile tale (GET /api/organization/opportunities?status=active|archived)
router.get("/", verifyToken, verifyOrg, async (req, res) => {
  const userId = req.user.id;
  const status = req.query.status || 'active'; // Default to active if not provided

  try {
    const { rows } = await pool.query(`
      SELECT * FROM opportunities 
      WHERE user_id = $1 AND status = $2
      ORDER BY id DESC
    `, [userId, status]);
    res.json(rows);
  } catch (e) {
    console.error("DB error (list opportunities):", e);
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

// Public: Get opportunities for a specific organization (GET /api/organization/opportunities/public/:userId)
router.get("/public/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await pool.query(`
      SELECT * FROM opportunities 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `, [userId]);
    res.json(rows);
  } catch (e) {
    console.error("DB error (get org opportunities):", e);
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

router.get("/:id", verifyToken, verifyOrg, async (req, res) => {
  const userId = req.user.id;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM opportunities WHERE id = $1 AND user_id = $2`,
      [req.params.id, userId]
    );
    if (!rows.length) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    console.error("DB error (get opportunity):", e);
    res.status(500).json({ message: "DB error", error: e.message });
  }
});

module.exports = router;