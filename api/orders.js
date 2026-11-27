const { redis, PREFIX } = require('./_redis');
const INITIAL = require('./_products');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const b = req.body || {};
    const product = String(b.product || '');
    const qty = Number(b.quantity);

    if (
      !Object.prototype.hasOwnProperty.call(INITIAL, product) ||
      !Number.isInteger(qty) ||
      qty < 1 ||
      qty > 99
    ) {
      return res.status(400).json({ error: 'Data pesanan tidak valid' });
    }

    const current = Number(
      await redis(['HGET', PREFIX + 'stock', product]) || INITIAL[product]
    );

    if (qty > current) {
      return res.status(409).json({ error: 'Stok tersisa ' + current });
    }

    const id =
      'MF' +
      Date.now().toString(36).toUpperCase() +
      Math.random().toString(36).slice(2, 6).toUpperCase();

    const order = {
      id,
      product,
      item: String(b.item || ''),
      quantity: qty,
      payment: String(b.payment || ''),
      total: Number(b.total) || 0,
      name: String(b.name || '-').slice(0, 100),
      whatsapp: String(b.whatsapp || '-').slice(0, 30),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await redis(['HSET', PREFIX + 'orders', id, JSON.stringify(order)]);
    await redis(['LPUSH', PREFIX + 'order_ids', id]);

    return res.status(201).json({ id, status: 'pending' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
