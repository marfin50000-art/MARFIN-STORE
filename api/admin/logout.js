module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Set-Cookie',
    'marfin_admin=; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=0'
  );

  return res.status(200).json({ success: true });
};
