# SIMPATI — Sistem Informasi Survei dan Pemetaan Bidang Tanah

Portal publik untuk informasi dan pendataan survei bidang tanah, dengan dashboard administrator, statistik, dan ekspor Excel.

## Teknologi
- Next.js 15 / React
- Supabase (database dan autentikasi admin)
- ExcelJS (ekspor `.xlsx`)
- Lucide React (ikon)
- CSS responsif (desktop, tablet, dan HP)
- Vercel (deployment)

## Halaman
- `/` — halaman publik SIMPATI
- `/form` — formulir survei bidang tanah tanpa login masyarakat
- `/admin` — login dan dashboard administrator

## Persiapan lokal
1. Instal Node.js LTS.
2. Salin `.env.example` menjadi `.env.local`.
3. Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` milik proyek Supabase.
4. Jalankan `npm install`.
5. Jalankan `npm run dev`.
6. Buka `http://localhost:3000`.

## Supabase
Jalankan `supabase/schema.sql` melalui SQL Editor Supabase. Buat akun admin pada Authentication → Users, lalu masukkan UUID pengguna ke `public.user_roles` dengan role `admin`.

## Deployment Vercel
Tambahkan environment variables berikut pada Project Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Jangan pernah memasukkan Supabase Secret key atau service-role key ke variabel `NEXT_PUBLIC_*` atau repository publik.

## Catatan fitur
- Navigasi publik responsif dengan menu hamburger pada perangkat kecil.
- Sidebar admin menjadi drawer pada layar HP.
- Halaman admin saat ini menyediakan dashboard, data survei, pencarian, dan ekspor Excel.
- Menu verifikasi, peta bidang tanah, dan pengaturan admin ditandai sebagai fitur tahap berikutnya; belum aktif.
- Statistik pengunjung adalah hitungan pemanggilan yang dicatat oleh fungsi database, bukan pengukuran orang unik atau analitik anti-bot.
- Formulir awal mengumpulkan informasi dasar dan koordinat opsional. Sesuaikan pemberitahuan privasi, kebutuhan data, serta retensi data sebelum dipakai untuk survei resmi.
