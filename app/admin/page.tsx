"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase, isConfigured } from "@/lib/supabase";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  FileSpreadsheet,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  MapPinned,
  Menu,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import ExcelJS from "exceljs";

type Submission = {
  id: string;
  created_at: string;
  respondent_name: string;
  phone: string | null;
  address: string;
  land_address: string;
  land_use: string | null;
  latitude: number | null;
  longitude: number | null;
  land_area: number | null;
  notes: string | null;
};

const upcoming = [
  { label: "Verifikasi Data", icon: ShieldCheck },
  { label: "Peta Bidang Tanah", icon: MapPinned },
  { label: "Pengaturan", icon: Settings },
];

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState<Submission[]>([]);
  const [stats, setStats] = useState({ visitors: 0, submissions: 0 });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  async function load() {
    setLoading(true);
    setMessage("");
    const [{ data, error }, { data: statData }] = await Promise.all([
      supabase.from("survey_submissions").select("*").order("created_at", { ascending: false }),
      supabase.rpc("admin_survey_stats"),
    ]);
    if (error) setMessage("Gagal memuat data. Pastikan akun sudah diberi role admin dan kebijakan database sudah benar.");
    else setRows((data || []) as Submission[]);
    if (statData?.[0]) {
      setStats({ visitors: Number(statData[0].visitor_count || 0), submissions: Number(statData[0].submission_count || 0) });
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!isConfigured) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) load();
  }, [session]);

  const filtered = useMemo(
    () => rows.filter((row) => [row.respondent_name, row.address, row.land_address, row.phone || ""].join(" ").toLowerCase().includes(query.toLowerCase())),
    [rows, query]
  );

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage("Login gagal. Periksa email, kata sandi, dan akun administrator.");
    else setSession(data.session);
  }

  async function logout() {
    await supabase.auth.signOut();
    setSession(null);
    setRows([]);
    setMenuOpen(false);
  }

  async function exportExcel() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Data Survei");
    sheet.columns = [
      { header: "ID", key: "id", width: 38 },
      { header: "Tanggal Pengiriman", key: "created_at", width: 22 },
      { header: "Nama Responden", key: "respondent_name", width: 25 },
      { header: "Telepon", key: "phone", width: 18 },
      { header: "Alamat Domisili", key: "address", width: 35 },
      { header: "Lokasi Bidang Tanah", key: "land_address", width: 40 },
      { header: "Penggunaan Tanah", key: "land_use", width: 22 },
      { header: "Luas (m²)", key: "land_area", width: 15 },
      { header: "Lintang", key: "latitude", width: 16 },
      { header: "Bujur", key: "longitude", width: 16 },
      { header: "Keterangan", key: "notes", width: 35 },
    ];
    filtered.forEach((row) => sheet.addRow({ ...row, created_at: new Date(row.created_at).toLocaleString("id-ID") }));
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF173B68" } };
    sheet.views = [{ state: "frozen", ySplit: 1 }];
    sheet.autoFilter = { from: "A1", to: "K1" };
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "SIMPATI-data-survei-bidang-tanah.xlsx";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (!isConfigured) {
    return <main className="admin-login-page"><div className="loginbox"><div className="login-brand"><span className="brandmark"><MapPinned size={21} /></span><strong>SIMPATI</strong></div><h1>Konfigurasi database diperlukan</h1><p className="muted">Tambahkan Project URL dan Publishable Key Supabase pada Environment Variables sebelum menggunakan dashboard admin.</p></div></main>;
  }

  if (!session) {
    return (
      <main className="admin-login-page">
        <div className="loginbox">
          <Link href="/" className="login-brand"><span className="brandmark"><MapPinned size={21} /></span><strong>SIMPATI</strong></Link>
          <div className="login-icon"><LockKeyhole size={23} /></div>
          <h1>Masuk administrator</h1>
          <p className="muted">Gunakan akun administrator untuk mengelola data survei bidang tanah.</p>
          <form onSubmit={login}>
            <div className="field"><label htmlFor="admin-email">Email administrator</label><input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@email.com" /></div>
            <div className="field"><label htmlFor="admin-password">Kata sandi</label><input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan kata sandi" /></div>
            {message && <div className="alert alert-error">{message}</div>}
            <button className="btn login-submit" type="submit">Masuk ke Dashboard <ChevronRight size={17} /></button>
          </form>
          <Link href="/" className="back-home"><ChevronRight size={14} className="back-arrow" /> Kembali ke halaman publik</Link>
        </div>
      </main>
    );
  }

  return (
    <div className="admin-shell">
      {menuOpen && <button className="sidebar-backdrop" aria-label="Tutup menu navigasi" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand-row">
          <Link href="/" className="sidebar-brand"><span className="brandmark"><MapPinned size={20} /></span><span><strong>SIMPATI</strong><small>ADMINISTRATOR</small></span></Link>
          <button className="sidebar-close" aria-label="Tutup menu" onClick={() => setMenuOpen(false)}><X size={20} /></button>
        </div>
        <div className="sidebar-caption">MENU UTAMA</div>
        <nav className="sidebar-nav" aria-label="Navigasi administrator">
          <a href="#dashboard" className="side-link active" onClick={() => setMenuOpen(false)}><LayoutDashboard size={18} /><span>Dashboard</span></a>
          <a href="#data" className="side-link" onClick={() => setMenuOpen(false)}><ClipboardList size={18} /><span>Data Survei</span><span className="side-count">{rows.length}</span></a>
          <a href="#statistik-admin" className="side-link" onClick={() => setMenuOpen(false)}><BarChart3 size={18} /><span>Statistik</span></a>
          {upcoming.map(({ label, icon: Icon }) => <div className="side-link side-link-disabled" key={label} title="Fitur dalam tahap pengembangan"><Icon size={18} /><span>{label}</span><span className="soon-label">Segera</span></div>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="admin-profile"><span className="avatar-circle">{String(session.user.email || "A").slice(0, 1).toUpperCase()}</span><span><strong>Administrator</strong><small>{session.user.email}</small></span></div>
          <button className="logout-button" onClick={logout}><LogOut size={17} /> Keluar</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-top">
          <div className="admin-heading-group">
            <button className="admin-menu-toggle" aria-label="Buka menu navigasi" onClick={() => setMenuOpen(true)}><Menu size={21} /></button>
            <div><p className="admin-eyebrow">PANEL ADMINISTRATOR</p><h1>Dashboard</h1><p className="muted admin-subtitle">Ringkasan data survei dan aktivitas portal SIMPATI.</p></div>
          </div>
          <button className="btn secondary small refresh-button" onClick={load} disabled={loading}><RefreshCw size={15} className={loading ? "spin" : ""} /> Perbarui data</button>
        </header>

        <section className="admin-grid" id="dashboard">
          <div className="admin-stat"><span><Activity size={16} /> Total pengunjung</span><strong>{stats.visitors.toLocaleString("id-ID")}</strong><small>Aktivitas kunjungan yang tercatat</small></div>
          <div className="admin-stat"><span><ClipboardCheck size={16} /> Formulir masuk</span><strong>{rows.length.toLocaleString("id-ID")}</strong><small>Total data survei diterima</small></div>
          <div className="admin-stat"><span><Search size={16} /> Hasil pencarian</span><strong>{filtered.length.toLocaleString("id-ID")}</strong><small>Data sesuai kata kunci</small></div>
          <div className="admin-stat"><span><CheckCircle2 size={16} /> Status sistem</span><strong className="status-active">Aktif</strong><small>Koneksi dashboard tersedia</small></div>
        </section>

        <section className="panel admin-data-panel" id="data">
          <div className="panel-heading-row"><div><h2>Data survei masuk</h2><p>Data terbaru ditampilkan lebih dahulu.</p></div><button className="btn small" onClick={exportExcel} disabled={!filtered.length}><Download size={15} /> Export Excel <span className="export-count">({filtered.length})</span></button></div>
          <div className="table-toolbar"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, alamat, atau lokasi bidang..." /></label><span className="result-count">{filtered.length} data</span></div>
          {message && <div className="alert alert-error"><AlertCircle size={16} /> {message}</div>}
          {loading ? <div className="empty"><RefreshCw size={19} className="spin" /> Memuat data survei...</div> : filtered.length === 0 ? <div className="empty"><ClipboardList size={26} /><strong>Belum ada data survei</strong><span>Data yang dikirim masyarakat akan muncul di bagian ini.</span></div> : (
            <div className="tablewrap"><table><thead><tr><th>Tanggal</th><th>Nama responden</th><th>Lokasi bidang tanah</th><th>Penggunaan</th><th>Luas (m²)</th><th>Koordinat</th></tr></thead><tbody>{filtered.map((row) => <tr key={row.id}><td>{new Date(row.created_at).toLocaleDateString("id-ID")}</td><td><strong>{row.respondent_name}</strong><small className="table-subtext">{row.phone || "Nomor tidak dicantumkan"}</small></td><td>{row.land_address}</td><td>{row.land_use || "-"}</td><td>{row.land_area ?? "-"}</td><td className="coordinate-cell">{row.latitude ?? "-"}, {row.longitude ?? "-"}</td></tr>)}</tbody></table></div>
          )}
        </section>

        <section className="admin-bottom-grid" id="statistik-admin">
          <div className="panel mini-panel"><div className="mini-panel-icon"><BarChart3 size={19} /></div><div><h3>Statistik portal</h3><p>{stats.visitors.toLocaleString("id-ID")} kunjungan dan {rows.length.toLocaleString("id-ID")} formulir tercatat.</p></div></div>
          <div className="panel mini-panel"><div className="mini-panel-icon green"><FileSpreadsheet size={19} /></div><div><h3>Ekspor data</h3><p>Unduh hasil pencarian dalam format Excel (.xlsx) melalui tombol Export Excel.</p></div></div>
        </section>
        <p className="admin-footnote">Data pribadi responden bersifat terbatas. Pastikan file hasil ekspor hanya dibagikan kepada pihak berwenang.</p>
      </main>
    </div>
  );
}
