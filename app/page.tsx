import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChartNoAxesColumn,
  ClipboardCheck,
  ClipboardList,
  FileSpreadsheet,
  MapPinned,
  ShieldCheck,
  Target,
} from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import VisitorTracker from "@/components/VisitorTracker";
import { isConfigured, supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function getStats() {
  if (!isConfigured) return { visitors: 0, submissions: 0 };
  const { data, error } = await supabase.rpc("public_survey_stats");
  if (error || !data?.[0]) return { visitors: 0, submissions: 0 };
  return {
    visitors: Number(data[0].visitor_count || 0),
    submissions: Number(data[0].submission_count || 0),
  };
}

export default async function Home() {
  const stats = await getStats();

  return (
    <>
      <VisitorTracker />
      <PublicNavbar />
      <main>
        <section className="hero" id="beranda">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow"><MapPinned size={14} /> PORTAL SURVEI &amp; PEMETAAN BIDANG TANAH</span>
              <h1>Mengenali bidang tanah melalui data yang <span>tertata dan terarah.</span></h1>
              <p>
                SIMPATI menjadi portal informasi dan pendataan survei bidang tanah.
                Partisipasi Anda membantu pengumpulan informasi lokasi dan kondisi
                bidang tanah secara lebih terstruktur.
              </p>
              <div className="hero-actions">
                <Link className="btn" href="/form">Mulai Isi Formulir <ArrowRight size={17} /></Link>
                <a className="btn secondary" href="#tentang">Pelajari SIMPATI</a>
              </div>
              <div className="hero-note"><ShieldCheck size={16} /> Pengisian formulir tidak memerlukan akun masyarakat.</div>
            </div>

            <div className="hero-visual-wrap" aria-label="Ilustrasi pembagian bidang tanah">
              <div className="map-card">
                <div className="map-card-top"><span><span className="live-dot" /> Ilustrasi pemetaan</span><span className="map-card-tag">BIDANG TANAH</span></div>
                <div className="map-art">
                  <div className="map-road road-one" />
                  <div className="map-road road-two" />
                  <div className="parcel parcel-one"><small>01</small></div>
                  <div className="parcel parcel-two"><small>02</small></div>
                  <div className="parcel parcel-three"><small>03</small></div>
                  <div className="parcel parcel-four"><small>04</small></div>
                  <div className="map-marker"><MapPinned size={17} /></div>
                </div>
                <div className="map-card-bottom"><span>Data lokasi</span><strong>Informasi untuk pemetaan</strong></div>
              </div>
              <div className="floating-info"><span className="floating-icon"><BadgeCheck size={18} /></span><span><strong>Data terstruktur</strong><small>Lebih mudah ditinjau dan diolah</small></span></div>
            </div>
          </div>
        </section>

        <section className="section" id="tentang">
          <div className="container">
            <div className="section-head">
              <span className="section-kicker">TENTANG SIMPATI</span>
              <h2>Kenapa pendataan bidang tanah penting?</h2>
              <p>Informasi yang dikumpulkan melalui survei dapat menjadi bahan pendukung inventarisasi, analisis, dan kegiatan pemetaan bidang tanah.</p>
            </div>
            <div className="cards">
              <article className="card"><div className="iconbox"><MapPinned /></div><h3>Informasi lokasi</h3><p>Menghimpun alamat dan koordinat lokasi bidang tanah sebagai informasi pendukung pemetaan.</p></article>
              <article className="card"><div className="iconbox"><ClipboardList /></div><h3>Data lebih terstruktur</h3><p>Menyajikan informasi dalam susunan yang seragam agar lebih mudah diperiksa dan diolah.</p></article>
              <article className="card"><div className="iconbox"><Target /></div><h3>Mendukung perencanaan</h3><p>Membantu menyediakan gambaran awal kondisi dan penggunaan bidang tanah di wilayah survei.</p></article>
            </div>
          </div>
        </section>

        <section className="section section-soft" id="informasi">
          <div className="container information-grid">
            <div>
              <span className="section-kicker">INFORMASI SURVEI</span>
              <h2>Apa yang perlu disiapkan sebelum mengisi?</h2>
              <p className="section-description">Siapkan informasi yang Anda ketahui mengenai bidang tanah. Isilah dengan teliti dan jangan mengirimkan informasi yang tidak Anda ketahui atau tidak berwenang untuk diberikan.</p>
            </div>
            <div className="prep-list">
              <div><span className="prep-number">01</span><span><strong>Identitas responden</strong><small>Nama dan alamat yang dapat digunakan untuk keperluan pendataan.</small></span></div>
              <div><span className="prep-number">02</span><span><strong>Informasi bidang tanah</strong><small>Alamat, penggunaan, dan perkiraan luas jika diketahui.</small></span></div>
              <div><span className="prep-number">03</span><span><strong>Lokasi atau koordinat</strong><small>Lintang dan bujur jika tersedia. Koordinat dapat dikosongkan jika belum diketahui.</small></span></div>
            </div>
          </div>
        </section>

        <section className="section" id="alur">
          <div className="container">
            <div className="section-head">
              <span className="section-kicker">ALUR KEGIATAN</span>
              <h2>Bagaimana proses survei berlangsung?</h2>
              <p>Alur umum pendataan melalui SIMPATI dari pengisian hingga pengolahan data.</p>
            </div>
            <div className="steps">
              <div className="step"><div className="stepnum">01</div><h3>Baca informasi</h3><p>Pahami tujuan dan informasi yang dibutuhkan dalam survei.</p></div>
              <div className="step"><div className="stepnum">02</div><h3>Isi formulir</h3><p>Masukkan informasi responden dan bidang tanah secara teliti.</p></div>
              <div className="step"><div className="stepnum">03</div><h3>Pemeriksaan data</h3><p>Admin meninjau kelengkapan dan konsistensi data yang masuk.</p></div>
              <div className="step"><div className="stepnum">04</div><h3>Pengolahan data</h3><p>Data yang terkumpul dapat diekspor untuk analisis dan pemetaan.</p></div>
            </div>
          </div>
        </section>

        <section className="section section-soft" id="statistik">
          <div className="container">
            <div className="section-head">
              <span className="section-kicker">STATISTIK PARTISIPASI</span>
              <h2>Aktivitas pada portal SIMPATI</h2>
              <p>Ringkasan kunjungan dan formulir yang telah dikirimkan melalui portal.</p>
            </div>
            <div className="stats">
              <div className="stat"><div className="stat-icon blue"><ChartNoAxesColumn size={20} /></div><strong>{stats.visitors.toLocaleString("id-ID")}</strong><span>Pengunjung tercatat</span></div>
              <div className="stat"><div className="stat-icon green"><ClipboardCheck size={20} /></div><strong>{stats.submissions.toLocaleString("id-ID")}</strong><span>Formulir terkirim</span></div>
              <div className="stat"><div className="stat-icon amber"><FileSpreadsheet size={20} /></div><strong>{stats.submissions.toLocaleString("id-ID")}</strong><span>Data masuk untuk ditinjau</span></div>
            </div>
            <p className="stats-note">Statistik ditampilkan berdasarkan data yang tercatat pada sistem.</p>
          </div>
        </section>

        <section className="section">
          <div className="container"><div className="cta">
            <div><span className="cta-kicker">PARTISIPASI ANDA BERARTI</span><h2>Mari lengkapi informasi bidang tanah bersama SIMPATI.</h2><p>Isi formulir sesuai informasi yang Anda ketahui untuk mendukung kegiatan survei dan pemetaan.</p></div>
            <Link className="btn cta-button" href="/form">Isi Formulir <ArrowRight size={17} /></Link>
          </div></div>
        </section>
      </main>
      <footer className="footer"><div className="container footer-inner"><div className="footer-brand"><span className="brandmark"><MapPinned size={19} /></span><span><strong>SIMPATI</strong><small>Survei &amp; Pemetaan Bidang Tanah</small></span></div><span>© {new Date().getFullYear()} SIMPATI. Portal Survei dan Pemetaan Bidang Tanah.</span><Link href="/admin">Akses Administrator</Link></div></footer>
    </>
  );
}
