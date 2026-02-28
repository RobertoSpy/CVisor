const { Queue } = require("bullmq");
const redisConnection = require("./connection");

const notificationQueue = new Queue("notifications", {
  connection: redisConnection,
});

const newsletterQueue = new Queue("newsletter", {
  connection: redisConnection,
});

const videoQueue = new Queue("video-processing", {
  connection: redisConnection,
});

module.exports = {
  notificationQueue,
  newsletterQueue,
  videoQueue,
};
