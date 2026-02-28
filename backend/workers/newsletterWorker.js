const { Worker } = require("bullmq");
const redisConnection = require("../queues/connection");
const nodemailer = require("nodemailer");

// Configurare Transporter Email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const worker = new Worker(
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

module.exports = worker;
