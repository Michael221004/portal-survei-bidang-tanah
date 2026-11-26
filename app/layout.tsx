import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIMPATI | Survei dan Pemetaan Bidang Tanah",
  description:
    "SIMPATI merupakan portal informasi dan pendataan survei serta pemetaan bidang tanah.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
