const { Worker } = require("bullmq");
const redisConnection = require("../queues/connection");
const webpush = require("web-push");
const { pool } = require("../db");

const worker = new Worker(
  "notifications",
  async (job) => {
    console.log(`[Queue] Processing job ${job.id}: ${job.name}`);

    // Logica de trimitere notificare
    if (job.name === "opportunity-push") {
      const { title, body, url, icon } = job.data;

      try {
        if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
          console.error("Missing VAPID keys!");
          return;
        }

        webpush.setVapidDetails(
          process.env.VAPID_SUBJECT || 'mailto:admin@cvisor.com',
          process.env.VAPID_PUBLIC_KEY,
          process.env.VAPID_PRIVATE_KEY
        );

        const { rows: subs } = await pool.query("SELECT * FROM push_subscriptions");

        if (subs.length > 0) {
          const payload = JSON.stringify({
            title,
            body,
            icon: icon || '/albastru.svg',
            data: { url }
          });

          await Promise.all(subs.map(sub => {
            return webpush.sendNotification({
              endpoint: sub.endpoint,
              keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth }
            }, payload)
              .catch(err => {
                if (err.statusCode === 410 || err.statusCode === 404) {
                  pool.query("DELETE FROM push_subscriptions WHERE id = $1", [sub.id]);
                }
              });
          }));
        }
      } catch (err) {
        console.error("[Queue] Failed to process notification:", err);
        throw err;
      }
    } else if (job.name === "user-notification") {
      // Notificare către un singur user (targetat by userId)
      const { userId, title, body, url, icon } = job.data;

      try {
        if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
          console.error("Missing VAPID keys!");
          return;
        }

        webpush.setVapidDetails(
          process.env.VAPID_SUBJECT || 'mailto:cvisor.contact@gmail.com',
          process.env.VAPID_PUBLIC_KEY,
          process.env.VAPID_PRIVATE_KEY
        );

        const { rows: subs } = await pool.query(
          "SELECT * FROM push_subscriptions WHERE user_id = $1",
          [userId]
        );

        if (subs.length > 0) {
          const payload = JSON.stringify({
            title,
            body,
            icon: icon || '/albastru.svg',
            data: { url }
          });

          await Promise.all(subs.map(sub => {
            return webpush.sendNotification({
              endpoint: sub.endpoint,
              keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth }
            }, payload)
              .catch(err => {
                console.error(`[Queue] Failed to send to sub ${sub.id}:`, err.statusCode);
                if (err.statusCode === 410 || err.statusCode === 404) {
                  pool.query("DELETE FROM push_subscriptions WHERE id = $1", [sub.id]);
                }
              });
          }));
          console.log(`[Queue] Sent notification to user ${userId} (${subs.length} devices)`);
        } else {
          console.log(`[Queue] No subscriptions found for user ${userId}`);
        }
      } catch (err) {
        console.error("[Queue] Failed to process user-notification:", err);
        throw err;
      }
    }
  },
  { connection: redisConnection }
);

worker.on("completed", (job) => {
  console.log(`[Queue] Job ${job.id} completed!`);
});

worker.on("failed", (job, err) => {
  console.error(`[Queue] Job ${job.id} failed with ${err.message}`);
});

module.exports = worker;
