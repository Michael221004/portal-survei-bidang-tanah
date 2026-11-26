"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase, isConfigured } from "@/lib/supabase";
import { ArrowLeft, CheckCircle2, MapPinned } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";

export default function FormPage() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!isConfigured) {
      setError("SIMPATI belum terhubung ke database. Silakan coba kembali setelah konfigurasi selesai.");
      return;
    }

    const f = new FormData(e.currentTarget);
    const payload = {
      respondent_name: String(f.get("respondent_name") || ""),
      phone: String(f.get("phone") || ""),
      address: String(f.get("address") || ""),
      land_address: String(f.get("land_address") || ""),
      land_use: String(f.get("land_use") || ""),
      latitude: f.get("latitude") ? Number(f.get("latitude")) : null,
      longitude: f.get("longitude") ? Number(f.get("longitude")) : null,
      land_area: f.get("land_area") ? Number(f.get("land_area")) : null,
      notes: String(f.get("notes") || ""),
    };

    if (payload.latitude !== null && (payload.latitude < -90 || payload.latitude > 90)) {
      setError("Nilai lintang harus berada di antara -90 sampai 90.");
      return;
    }
    if (payload.longitude !== null && (payload.longitude < -180 || payload.longitude > 180)) {
      setError("Nilai bujur harus berada di antara -180 sampai 180.");
      return;
    }

    setBusy(true);
    const { error: submitError } = await supabase.from("survey_submissions").insert(payload);
    setBusy(false);
    if (submitError) {
      setError("Pengiriman belum berhasil. Periksa koneksi internet atau coba beberapa saat lagi.");
      return;
    }
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <PublicNavbar />
      <main className="formwrap">
        <div className="container form-page-container">
          <div className="form-intro"><span className="section-kicker">FORMULIR PARTISIPASI</span><h1>Formulir Survei Bidang Tanah</h1><p>Lengkapi informasi berikut sesuai keadaan sebenarnya. Kolom bertanda * wajib diisi.</p></div>
          <div className="formbox">
            {done ? (
              <div className="success-state"><CheckCircle2 size={58} color="#16a36a" /><h2>Terima kasih telah berpartisipasi!</h2><p className="muted">Formulir berhasil dikirim. Data akan diterima oleh administrator untuk ditinjau.</p><Link href="/" className="btn">Kembali ke Beranda</Link></div>
            ) : (
              <>
                <div className="form-heading"><span className="form-heading-icon"><MapPinned size={21} /></span><div><h2>Data responden dan bidang tanah</h2><p>Pastikan informasi yang diberikan sudah sesuai.</p></div></div>
                <div className="alert">Informasi yang dikirim digunakan untuk keperluan pendataan survei dan pemetaan. Jangan mengirimkan data yang bukan hak atau kewenangan Anda.</div>
                <form onSubmit={submit}>
                  <div className="form-section-title"><span>01</span><div><h3>Identitas responden</h3><p>Informasi dasar responden survei.</p></div></div>
                  <div className="field"><label htmlFor="respondent_name">Nama responden <b>*</b></label><input id="respondent_name" name="respondent_name" required maxLength={120} placeholder="Masukkan nama lengkap" /></div>
                  <div className="field"><label htmlFor="phone">Nomor telepon <span className="optional">Opsional</span></label><input id="phone" name="phone" maxLength={30} placeholder="Nomor yang dapat dihubungi" /></div>
                  <div className="field"><label htmlFor="address">Alamat domisili <b>*</b></label><textarea id="address" name="address" required rows={2} maxLength={500} placeholder="Masukkan alamat tempat tinggal" /></div>

                  <div className="form-section-title section-spaced"><span>02</span><div><h3>Informasi bidang tanah</h3><p>Lokasi dan gambaran umum bidang tanah.</p></div></div>
                  <div className="field"><label htmlFor="land_address">Alamat atau lokasi bidang tanah <b>*</b></label><textarea id="land_address" name="land_address" required rows={3} maxLength={700} placeholder="Jalan/lorong, RT/RW, desa/kelurahan, kecamatan" /></div>
                  <div className="field"><label htmlFor="land_use">Peruntukan atau penggunaan tanah</label><select id="land_use" name="land_use" defaultValue=""><option value="">Pilih jika diketahui</option><option>Permukiman</option><option>Pertanian/perkebunan</option><option>Perdagangan/jasa</option><option>Fasilitas umum</option><option>Lahan kosong</option><option>Lainnya</option></select></div>
                  <div className="field"><label htmlFor="land_area">Perkiraan luas bidang tanah (m²)</label><input id="land_area" name="land_area" type="number" min="0" step="0.01" placeholder="Contoh: 120" /></div>

                  <div className="form-section-title section-spaced"><span>03</span><div><h3>Koordinat lokasi</h3><p>Bagian ini boleh dikosongkan jika koordinat belum diketahui.</p></div></div>
                  <div className="coordinate-grid">
                    <div className="field"><label htmlFor="latitude">Lintang / Latitude</label><input id="latitude" name="latitude" type="number" step="any" min="-90" max="90" placeholder="Contoh: -6.200000" /></div>
                    <div className="field"><label htmlFor="longitude">Bujur / Longitude</label><input id="longitude" name="longitude" type="number" step="any" min="-180" max="180" placeholder="Contoh: 106.816666" /></div>
                  </div>
                  <p className="hint coordinate-hint">Gunakan format derajat desimal. Latitude berkisar -90 sampai 90 dan longitude -180 sampai 180.</p>
                  <div className="field"><label htmlFor="notes">Keterangan tambahan <span className="optional">Opsional</span></label><textarea id="notes" name="notes" rows={3} maxLength={1500} placeholder="Informasi tambahan terkait bidang tanah" /></div>
                  {error && <div className="alert alert-error" role="alert">{error}</div>}
                  <button className="btn submit-button" type="submit" disabled={busy}>{busy ? "Mengirim formulir..." : "Kirim Formulir"}</button>
                  <p className="form-privacy-note">Dengan mengirim formulir, Anda menyatakan bahwa informasi yang diberikan benar sejauh pengetahuan Anda.</p>
                </form>
              </>
            )}
          </div>
          <Link href="/" className="back-home"><ArrowLeft size={15} /> Kembali ke halaman SIMPATI</Link>
        </div>
      </main>
    </>
  );
}
