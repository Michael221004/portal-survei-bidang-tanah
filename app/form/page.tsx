
"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase, isConfigured } from "@/lib/supabase";
import {
  ArrowLeft,
  CheckCircle2,
  FileUp,
  MapPinned,
} from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";

const BUCKET = "survey-documents";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file

const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

function cleanFileName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(-100);
}

export default function FormPage() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function uploadFile(file: File, folder: string) {
    const path = `${folder}/${crypto.randomUUID()}-${cleanFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Gagal mengunggah ${file.name}: ${uploadError.message}`);
    }

    return path;
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!isConfigured) {
      setError("SIMPATI belum terhubung ke database. Silakan coba kembali setelah konfigurasi selesai.");
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);

    const certificate = data.get("certificate_file") as File;
    const geotagFiles = data.getAll("geotag_files") as File[];
    const application = data.get("application_file") as File;

    const files = [
      ...(certificate.size > 0 ? [certificate] : []),
      ...geotagFiles.filter((file) => file.size > 0),
      ...(application.size > 0 ? [application] : []),
    ];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError(`Format file ${file.name} tidak didukung. Gunakan PDF, JPG, PNG, atau WEBP.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`Ukuran file ${file.name} melebihi batas 10 MB.`);
        return;
      }
    }

    const applicationDate = String(data.get("application_date") || "");
    const respondentName = String(data.get("respondent_name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const certificateNumber = String(data.get("certificate_number") || "").trim();
    const district = String(data.get("district") || "").trim();
    const village = String(data.get("village") || "").trim();
    const purpose = String(data.get("purpose") || "");
    const notes = String(data.get("notes") || "").trim();

    if (!applicationDate || !respondentName || !phone || !district || !village || !purpose) {
      setError("Mohon lengkapi seluruh kolom yang wajib diisi.");
      return;
    }

    setBusy(true);

    const uploadedPaths: string[] = [];

    try {
      const folder = `submissions/${crypto.randomUUID()}`;

      let certificatePath: string | null = null;
      let applicationPath: string | null = null;
      const geotagPaths: string[] = [];

      if (certificate.size > 0) {
        certificatePath = await uploadFile(certificate, folder);
        uploadedPaths.push(certificatePath);
      }

      for (const file of geotagFiles.filter((item) => item.size > 0)) {
        const path = await uploadFile(file, folder);
        geotagPaths.push(path);
        uploadedPaths.push(path);
      }

      if (application.size > 0) {
        applicationPath = await uploadFile(application, folder);
        uploadedPaths.push(applicationPath);
      }

      const payload = {
        respondent_name: respondentName,
        phone,
        address: "",
        land_address: `${village}, ${district}`,
        application_date: applicationDate,
        certificate_number: certificateNumber || null,
        district,
        village,
        certificate_file_url: certificatePath,
        geotag_file_url: geotagPaths.length ? JSON.stringify(geotagPaths) : null,
        application_file_url: applicationPath,
        purpose,
        notes: notes || null,
      };

      const { error: submitError } = await supabase
        .from("survey_submissions")
        .insert(payload);

      if (submitError) {
        throw new Error(submitError.message);
      }

      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      // Hapus file yang sudah terunggah jika penyimpanan data gagal.
      if (uploadedPaths.length > 0) {
        await supabase.storage.from(BUCKET).remove(uploadedPaths);
      }

      console.error("Form submission error:", err);
      setError(
        err instanceof Error
          ? `Pengiriman belum berhasil: ${err.message}`
          : "Pengiriman belum berhasil. Silakan coba kembali."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PublicNavbar />

      <main className="formwrap">
        <div className="container form-page-container">
          <div className="form-intro">
            <span className="section-kicker">FORMULIR PARTISIPASI</span>
            <h1>Formulir Permohonan Survei</h1>
            <p>
              Lengkapi data permohonan dan unggah dokumen yang diperlukan.
              Kolom bertanda * wajib diisi.
            </p>
          </div>

          <div className="formbox">
            {done ? (
              <div className="success-state">
                <CheckCircle2 size={58} color="#16a36a" />
                <h2>Terima kasih!</h2>
                <p className="muted">
                  Permohonan berhasil dikirim. Data dan dokumen akan diterima
                  administrator untuk diperiksa.
                </p>
                <Link href="/" className="btn">
                  Kembali ke Beranda
                </Link>
              </div>
            ) : (
              <>
                <div className="form-heading">
                  <span className="form-heading-icon">
                    <MapPinned size={21} />
                  </span>
                  <div>
                    <h2>Data permohonan</h2>
                    <p>Isi data sesuai informasi yang sebenarnya.</p>
                  </div>
                </div>

                <div className="alert">
                  Data dan dokumen yang dikirim digunakan untuk keperluan
                  pendataan survei dan pemetaan bidang tanah.
                </div>

                <form onSubmit={submit}>
                  <div className="form-section-title">
                    <span>01</span>
                    <div>
                      <h3>Identitas pemohon</h3>
                      <p>Informasi orang yang mengajukan permohonan.</p>
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="application_date">
                      Tanggal Permohonan <b>*</b>
                    </label>
                    <input
                      id="application_date"
                      name="application_date"
                      type="date"
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="respondent_name">
                      Nama Pemohon <b>*</b>
                    </label>
                    <input
                      id="respondent_name"
                      name="respondent_name"
                      required
                      maxLength={120}
                      placeholder="Masukkan nama lengkap pemohon"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="phone">
                      Nomor Telepon/WA <b>*</b>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      maxLength={30}
                      placeholder="Contoh: 081234567890"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="certificate_number">
                      Nomor Sertipikat
                      <span className="optional">Opsional</span>
                    </label>
                    <input
                      id="certificate_number"
                      name="certificate_number"
                      maxLength={100}
                      placeholder="Masukkan nomor sertipikat"
                    />
                  </div>

                  <div className="form-section-title section-spaced">
                    <span>02</span>
                    <div>
                      <h3>Lokasi bidang tanah</h3>
                      <p>Masukkan kecamatan dan kelurahan letak tanah.</p>
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="district">
                      Kecamatan (Letak Tanah) <b>*</b>
                    </label>
                    <input
                      id="district"
                      name="district"
                      required
                      maxLength={120}
                      placeholder="Masukkan nama kecamatan"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="village">
                      Kelurahan (Letak Tanah) <b>*</b>
                    </label>
                    <input
                      id="village"
                      name="village"
                      required
                      maxLength={120}
                      placeholder="Masukkan nama kelurahan"
                    />
                  </div>

                  <div className="form-section-title section-spaced">
                    <span>03</span>
                    <div>
                      <h3>Dokumen pendukung</h3>
                      <p>
                        Format PDF, JPG, PNG, atau WEBP. Maksimal 10 MB per
                        file.
                      </p>
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="certificate_file">
                      Upload Sertipikat
                      <span className="optional">Opsional</span>
                    </label>
                    <input
                      id="certificate_file"
                      name="certificate_file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="geotag_files">
                      Upload Geotag
                      <span className="optional">Opsional, bisa beberapa file</span>
                    </label>
                    <input
                      id="geotag_files"
                      name="geotag_files"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      multiple
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="application_file">
                      Upload Permohonan
                      <span className="optional">Opsional</span>
                    </label>
                    <input
                      id="application_file"
                      name="application_file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                    />
                  </div>

                  <div className="form-section-title section-spaced">
                    <span>04</span>
                    <div>
                      <h3>Keperluan permohonan</h3>
                      <p>Pilih tujuan pengajuan survei atau pemetaan.</p>
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="purpose">
                      Untuk Kepentingan <b>*</b>
                    </label>
                    <select
                      id="purpose"
                      name="purpose"
                      defaultValue=""
                      required
                    >
                      <option value="">Pilih kepentingan</option>
                      <option value="Tidak ada (Hanya Ploting)">
                        Tidak ada (Hanya Ploting)
                      </option>
                      <option value="Hak Tanggungan">Hak Tanggungan</option>
                      <option value="Roya">Roya</option>
                      <option value="Balik Nama (Jual Beli, Waris, Hibah)">
                        Balik Nama (Jual Beli, Waris, Hibah)
                      </option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="notes">
                      Keterangan
                      <span className="optional">Opsional</span>
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={4}
                      maxLength={1500}
                      placeholder="Tuliskan keterangan tambahan jika ada"
                    />
                  </div>

                  {error && (
                    <div className="alert alert-error" role="alert">
                      {error}
                    </div>
                  )}

                  <button
                    className="btn submit-button"
                    type="submit"
                    disabled={busy}
                  >
                    {busy ? (
                      "Mengirim data dan dokumen..."
                    ) : (
                      <>
                        <FileUp size={17} />
                        Kirim Permohonan
                      </>
                    )}
                  </button>

                  <p className="form-privacy-note">
                    Dengan mengirim formulir, pemohon menyatakan bahwa
                    informasi yang diberikan benar sejauh pengetahuannya.
                  </p>
                </form>
              </>
            )}
          </div>

          <Link href="/" className="back-home">
            <ArrowLeft size={15} /> Kembali ke halaman SIMPATI
          </Link>
        </div>
      </main>
    </>
  );
}
