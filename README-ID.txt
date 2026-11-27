MARFIN STORE — PAKET UPGRADE STOK BERSAMA

Isi paket mempertahankan halaman lama sebagai index.html dan menambahkan API Redis serta halaman admin /admin.

WAJIB SET ENVIRONMENT VARIABLES di Vercel (Production, Preview, Development):
UPSTASH_REDIS_REST_URL = URL REST Upstash (https://...upstash.io)
UPSTASH_REDIS_REST_TOKEN = REST token baru setelah reset credentials
ADMIN_PASSWORD = buat password admin kuat milik sendiri

PENTING: API ini membutuhkan deployment Vercel berbasis project Git (bukan Vercel Drop statis). Import repository GitHub MARFIN-STORE ke Vercel setelah file diunggah. Setelah mengubah Environment Variables, redeploy.

Stok awal di-seed ke Redis dengan HSETNX, jadi nilai stok yang sudah ada di Redis tidak ditimpa. Konfirmasi admin menggunakan Redis Lua script agar dua admin tidak bisa menerima pesanan yang menyebabkan stok negatif.
