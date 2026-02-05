const { Queue, Worker } = require("bullmq");
const IORedis = require("ioredis");
const webpush = require("web-push");
const { pool } = require("../db");
const nodemailer = require("nodemailer");

// Configurare Transporter Email (pentru Worker)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Configurare Redis
const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

// 1. Definiția Cozii (Producer)
const notificationQueue = new Queue("notifications", {
  connection: redisConnection,
});

const newsletterQueue = new Queue("newsletter", {
  connection: redisConnection,
});

const videoQueue = new Queue("video-processing", {
  connection: redisConnection,
});

// 2. Worker (Consumer) - Procesează job-urile din fundal
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
        throw err; // Aruncă eroarea ca să știe BullMQ că a eșuat (și poate să facă retry)
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

        // Fetch subscriptions specifically for this user
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

// 3. Worker Newsletter (Consumer)
// 3. Worker Newsletter (Consumer)
const newsletterWorker = new Worker(
  "newsletter",
  async (job) => {
    console.log(`[Queue] Processing email job ${job.id} for ${job.data.to}`);
    const { to, subject, html } = job.data;

    try {
      await transporter.sendMail({
        from: `"Roberto de la CVISOR" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      });
    } catch (err) {
      console.error(`[Queue] Failed to send email to ${to}:`, err);
      throw err;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000
    }
  } // Trimite max 10 emailuri pe secundă (rate limited)
);

// 4. Worker Video Processing (Consumer)
const videoWorker = new Worker(
  "video-processing",
  async (job) => {
    console.log(`[Queue] Processing video job ${job.id} for file: ${job.data.filename}`);
    const { filePath, filename, userId, opportunityId } = job.data;

    // Require here to ensure dependencies are loaded only when needed
    const ffmpeg = require('fluent-ffmpeg');
    const ffmpegPath = require('ffmpeg-static');
    const fs = require('fs');
    const path = require('path');

    ffmpeg.setFfmpegPath(ffmpegPath);

    const variants = [
      { name: '480p', size: '854x480' },
      { name: '720p', size: '1280x720' },
      { name: '1080p', size: '1920x1080' }
    ];

    const outputDir = path.dirname(filePath);
    const baseName = path.parse(filename).name;
    const results = {};

    try {
      // Process variants
      const promises = variants.map(variant => {
        return new Promise((resolve, reject) => {
          const outName = `${baseName}-${variant.name}.mp4`;
          const outPath = path.join(outputDir, outName);

          ffmpeg(filePath)
            .output(outPath)
            .videoCodec('libx264')
            .size(variant.size) // Scale
            .outputOptions([
              '-crf 28', // Constant Rate Factor
              '-preset fast', // Encoding speed/compression ratio balance
              '-movflags +faststart' // Optimize for web streaming
            ])
            .on('end', () => {
              console.log(`[VideoWorker] Finished ${variant.name} for ${filename}`);
              resolve({ [variant.name]: `/uploads/${outName}` });
            })
            .on('error', (err) => {
              console.error(`[VideoWorker] Error processing ${variant.name}:`, err);
              reject(err);
            })
            .run();
        });
      });

      const processedVariants = await Promise.all(promises);

      // Combine results into single object
      processedVariants.forEach(v => Object.assign(results, v));

      // Update Database
      // We need to determine if we update 'opportunities' or 'organization_profiles' based on job data or logic
      // Assuming opportunity for now based on context, or profile video.
      if (opportunityId) {
        await pool.query(
          `UPDATE opportunities SET video_variants = $1 WHERE id = $2`,
          [JSON.stringify(results), opportunityId]
        );
      }
      // Note: If logic requires updating profiles, we can add that logic here.

      // Optional: Delete original raw file to save space?
      // fs.unlinkSync(filePath); 

      console.log(`[VideoWorker] Job ${job.id} complete. Variants:`, results);

    } catch (err) {
      console.error(`[VideoWorker] Failed to process video ${filename}:`, err);
      throw err;
    }
  },
  { connection: redisConnection, concurrency: 1 } // Process videos one by one (CPU heavy)
);

worker.on("completed", (job) => {
  console.log(`[Queue] Job ${job.id} completed!`);
});

worker.on("failed", (job, err) => {
  console.error(`[Queue] Job ${job.id} failed with ${err.message}`);
});

module.exports = {
  notificationQueue,
  newsletterQueue,
  videoQueue
};
