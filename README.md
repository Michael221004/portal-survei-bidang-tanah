# Portal Survei & Pemetaan Bidang Tanah

Aplikasi Next.js untuk portal informasi publik, formulir survei tanpa login, statistik, dashboard admin, dan ekspor Excel.

## Fitur
- Beranda informasi survei dan pemetaan bidang tanah.
- Alur kegiatan survei.
- Statistik publik: kunjungan dan formulir masuk.
- Formulir publik tanpa akun.
- Dashboard admin dengan autentikasi Supabase.
- Pencarian data dan ekspor Excel (.xlsx).
- Koordinat lintang/bujur divalidasi dalam rentang geografis.

## 1. Persiapan Supabase
1. Buat proyek gratis di https://supabase.com.
2. Buka SQL Editor, jalankan seluruh isi `supabase/schema.sql`.
3. Buka Project Settings → API, salin Project URL dan `anon`/publishable key.
4. Buat file `.env.local` di folder proyek berdasarkan `.env.example`.
5. Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 2. Buat akun admin
1. Di Supabase, buka Authentication → Users → Add user.
2. Buat pengguna admin dengan email dan kata sandi yang kuat.
3. Salin UUID pengguna tersebut.
4. Jalankan SQL berikut di SQL Editor, ganti UUID:
   ```sql
   insert into public.user_roles (user_id, role)
   values ('UUID-USER-ADMIN', 'admin');
   ```
5. Buka `/admin` untuk login.

Jangan pernah menaruh `service_role` key di browser, GitHub, atau variabel `NEXT_PUBLIC_*`.

## 3. Jalankan di komputer (Windows)
Install Node.js versi LTS dari https://nodejs.org.
Buka folder proyek melalui terminal:
```bash
npm install
npm run dev
```
Buka http://localhost:3000

## 4. Deploy gratis ke Vercel
1. Upload folder proyek ke repository GitHub (jangan upload `.env.local`).
2. Masuk ke https://vercel.com dan import repository tersebut.
3. Pada Project Settings → Environment Variables, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Framework akan terdeteksi sebagai Next.js.

## Catatan penting sebelum dipakai sungguhan
- Statistik pengunjung adalah hitungan pemanggilan halaman, bukan orang unik. Browser yang sama dihitung maksimal sekali per hari per sesi penyimpanan browser; penghapusan data browser dapat menyebabkan hitungan ulang.
- Statistik ini bukan analitik anti-bot dan dapat terpengaruh refresh, bot, atau perangkat berbeda.
- Formulir awal ini belum meminta unggahan sertifikat/foto dan belum memverifikasi kepemilikan tanah.
- Data bidang tanah dan identitas responden bisa bersifat pribadi. Berikan pemberitahuan privasi, batasi akses admin, gunakan HTTPS, kata sandi kuat, dan tetapkan masa retensi data.
- Jangan meminta NIK, nomor sertifikat, atau dokumen sensitif kecuali benar-benar diperlukan, memiliki dasar dan persetujuan yang sesuai.
- Sebelum digunakan untuk survei resmi, sesuaikan pertanyaan, dasar pengumpulan data, persetujuan responden, dan kebijakan privasi dengan instansi/penanggung jawab survei.
- Form ini menyimpan data teks/angka ke Supabase. Penambahan peta interaktif, unggah foto, beberapa admin, status verifikasi, atau formulir dinamis dapat dibuat pada tahap berikutnya.
