const { redis, PREFIX } = require('./_redis');
const DOWNLOADS = require('./_downloads');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const id = String(req.query.id || '').trim();

    if (!id) {
      return res.status(400).json({ error: 'ID pesanan wajib diisi' });
    }

    const raw = await redis([
      'HGET',
      PREFIX + 'orders',
      id
    ]);

    if (!raw) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
    }

    const order = JSON.parse(raw);

    if (order.status !== 'accepted') {
      return res.status(403).json({
        error: 'Pembayaran belum diverifikasi admin'
      });
    }

    const downloads = DOWNLOADS[order.product];

    if (!Array.isArray(downloads) || downloads.length === 0) {
      return res.status(404).json({
        error: 'Link download produk belum tersedia'
      });
    }

    return res.status(200).json({
      success: true,
      product: order.product,
      downloads
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Terjadi kesalahan server'
    });
  }
};
