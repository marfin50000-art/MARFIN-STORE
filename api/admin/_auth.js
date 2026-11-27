const crypto = require('crypto');

module.exports = function isAdmin(req) {
  try {
    const cookie = req.headers.cookie || '';
    const match = cookie.match(/(?:^|;\s*)marfin_admin=([^;]+)/);

    if (!match) return false;

    const parts = match[1].split('.');
    if (parts.length !== 2) return false;

    const [timestamp, signature] = parts;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || !/^\d+$/.test(timestamp)) return false;
    if (Date.now() - Number(timestamp) > 86400000) return false;

    const expected = crypto
      .createHmac('sha256', adminPassword)
      .update(timestamp)
      .digest('hex');

    const a = Buffer.from(signature);
    const b = Buffer.from(expected);

    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
};
