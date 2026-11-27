const { redis, PREFIX } = require('../_redis');
const INITIAL = require('../_products');
const isAdmin = require('./_auth');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (!isAdmin(req)) {
    return res.status(401).json({ error: 'Login admin diperlukan' });
  }

  try {
    const key = PREFIX + 'stock';

    if (req.method === 'GET') {
      for (const [name, value] of Object.entries(INITIAL)) {
        await redis(['HSETNX', key, name, String(value)]);
      }

      const raw = await redis(['HGETALL', key]);
      const stock = {};

      for (let i = 0; i < (raw || []).length; i += 2) {
        stock[raw[i]] = Number(raw[i + 1]);
      }

      return res.status(200).json({ stock });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const product = String(body.product || '');
      const quantity = Number(body.stock);

      if (!Object.prototype.hasOwnProperty.call(INITIAL, product)) {
        return res.status(400).json({ error: 'Produk tidak ditemukan' });
      }

      if (!Number.isInteger(quantity) || quantity < 0 || quantity > 100000) {
        return res.status(400).json({
          error: 'Stok harus bilangan bulat 0 sampai 100000'
        });
      }

      await redis(['HSET', key, product, String(quantity)]);

      return res.status(200).json({
        success: true,
        product,
        stock: quantity
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
