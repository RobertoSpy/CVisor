const { Worker } = require("bullmq");
const redisConnection = require("../queues/connection");
const { pool } = require("../db");
const path = require("path");

const worker = new Worker(
  "video-processing",
  async (job) => {
    console.log(`[Queue] Processing video job ${job.id} for file: ${job.data.filename}`);
    const { filePath, filename, userId, opportunityId } = job.data;

    // Require here to ensure dependencies are loaded only when needed
    const ffmpeg = require('fluent-ffmpeg');
    const ffmpegPath = require('ffmpeg-static');
    const fs = require('fs');

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
      if (opportunityId) {
        await pool.query(
          `UPDATE opportunities SET video_variants = $1 WHERE id = $2`,
          [JSON.stringify(results), opportunityId]
        );
      }

      console.log(`[VideoWorker] Job ${job.id} complete. Variants:`, results);

    } catch (err) {
      console.error(`[VideoWorker] Failed to process video ${filename}:`, err);
      throw err;
    }
  },
  { connection: redisConnection, concurrency: 1 } // Process videos one by one (CPU heavy)
);

module.exports = worker;
