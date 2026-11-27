const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return res.status(500).json({ error: 'ADMIN_PASSWORD belum diatur di Vercel' });
    }

    const password = String((req.body || {}).password || '');

    if (password.length !== adminPassword.length ||
        !crypto.timingSafeEqual(
          Buffer.from(password),
          Buffer.from(adminPassword)
        )) {
      return res.status(401).json({ error: 'Password admin salah' });
    }

    const timestamp = Date.now().toString();
    const signature = crypto
      .createHmac('sha256', adminPassword)
      .update(timestamp)
      .digest('hex');

    res.setHeader(
      'Set-Cookie',
      `marfin_admin=${timestamp}.${signature}; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=86400`
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Login gagal di server' });
  }
};
