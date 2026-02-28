const notificationWorker = require("./notificationWorker");
const newsletterWorker = require("./newsletterWorker");
const videoWorker = require("./videoWorker");

function startWorkers() {
  console.log("[Workers] Starting background workers...");
  // Workers auto-start upon creation, but we import them here to ensure they are active.

  notificationWorker.on('ready', () => console.log("[Workers] Notification Worker ready"));
  newsletterWorker.on('ready', () => console.log("[Workers] Newsletter Worker ready"));
  videoWorker.on('ready', () => console.log("[Workers] Video Worker ready"));
}

module.exports = { startWorkers };
