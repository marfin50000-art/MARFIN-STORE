const { redis, PREFIX } = require('../_redis');
const INITIAL = require('../_products');
const isAdmin = require('./_auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAdmin(req)) {
    return res.status(401).json({ error: 'Login admin diperlukan' });
  }

  try {
    const { id, action } = req.body || {};

    if (!id || !['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Data keputusan tidak valid' });
    }

    const raw = await redis(['HGET', PREFIX + 'orders', String(id)]);
    if (!raw) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });

    const order = JSON.parse(raw);

    if (order.status !== 'pending') {
      return res.status(409).json({ error: 'Pesanan sudah diproses' });
    }

    if (action === 'accept') {
      const script = `
        local raw = redis.call('HGET', KEYS[1], ARGV[1])
        if not raw then return -1 end
        local order = cjson.decode(raw)
        if order.status ~= 'pending' then return -2 end
        local stock = tonumber(redis.call('HGET', KEYS[2], order.product) or ARGV[2])
        local qty = tonumber(order.quantity)
        if not stock or not qty or qty < 1 or stock < qty then return -3 end
        order.status = 'accepted'
        redis.call('HSET', KEYS[1], ARGV[1], cjson.encode(order))
        redis.call('HSET', KEYS[2], order.product, stock - qty)
        return stock - qty
      `;
      const result = await redis([
        'EVAL', script, '2',
        PREFIX + 'orders', PREFIX + 'stock',
        String(id), String(INITIAL[order.product] || 0)
      ]);

      if (result === -1) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
      if (result === -2) return res.status(409).json({ error: 'Pesanan sudah diproses' });
      if (result === -3) return res.status(409).json({ error: 'Stok tidak mencukupi' });
    } else {
      order.status = 'rejected';
      await redis(['HSET', PREFIX + 'orders', String(id), JSON.stringify(order)]);
    }

    return res.status(200).json({ success: true, status: action === 'accept' ? 'accepted' : 'rejected' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
