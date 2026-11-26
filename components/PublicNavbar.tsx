"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, MapPinned, Menu, X } from "lucide-react";

const links = [
  { href: "/#tentang", label: "Tentang SIMPATI" },
  { href: "/#informasi", label: "Informasi Survei" },
  { href: "/#alur", label: "Alur Kegiatan" },
  { href: "/#statistik", label: "Statistik" },
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="public-header">
      <div className="container public-header-inner">
        <Link href="/" className="brand" aria-label="SIMPATI - Beranda" onClick={() => setOpen(false)}>
          <span className="brandmark"><MapPinned size={21} strokeWidth={2.2} /></span>
          <span className="brand-copy">
            <strong>SIMPATI</strong>
            <small>Survei &amp; Pemetaan Bidang Tanah</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Navigasi utama">
          {links.map((link) => (
            <Link href={link.href} key={link.href}>{link.label}</Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link className="btn small header-cta" href="/form">
            Isi Formulir <ArrowRight size={15} />
          </Link>
          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mobile-nav-panel">
          {links.map((link) => (
            <Link href={link.href} key={link.href} onClick={() => setOpen(false)}>{link.label}</Link>
          ))}
          <Link className="mobile-nav-cta" href="/form" onClick={() => setOpen(false)}>
            Isi Formulir <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </header>
  );
}
