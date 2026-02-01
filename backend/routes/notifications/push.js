const express = require('express');
const router = express.Router();
const { pool } = require('../../db');
const webpush = require('web-push');

// Configurare web-push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:cvisor.contact@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn("VAPID keys not found in environment!");
}

// POST /subscribe - Salvează subscripția
router.post('/subscribe', async (req, res) => {
  const { subscription } = req.body;
  // req.user este populat dacă folosim middleware verifyToken pe ruta principală, 
  // dar pentru PWA generic poate fi anonim. 
  // Totuși, vrem să trimitem la studenți.
  const userId = req.user ? req.user.id : null;

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }

  try {
    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, keys_p256dh, keys_auth)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (endpoint) DO UPDATE 
             SET user_id = EXCLUDED.user_id, created_at = CURRENT_TIMESTAMP`,
      [userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
    );
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    console.error('Error saving subscription:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /unsubscribe - Șterge subscripția
router.post('/unsubscribe', async (req, res) => {
  const { endpoint } = req.body;
  try {
    await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
    res.json({ message: 'Unsubscribed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
