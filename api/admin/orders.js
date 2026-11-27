const { redis, PREFIX } = require('../_redis');
const isAdmin = require('./_auth');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAdmin(req)) {
    return res.status(401).json({ error: 'Silakan login admin kembali' });
  }

  try {
    const ids = await redis(['LRANGE', PREFIX + 'order_ids', '0', '-1']);
    const orders = [];

    for (const id of (ids || [])) {
      const data = await redis(['HGET', PREFIX + 'orders', id]);
      if (data) orders.push(JSON.parse(data));
    }

    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ error: 'Gagal mengambil pesanan: ' + error.message });
  }
};
