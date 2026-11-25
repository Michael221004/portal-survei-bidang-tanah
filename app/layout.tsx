import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Portal Survei & Pemetaan Bidang Tanah",
  description: "Portal informasi dan pendataan survei bidang tanah."
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="id"><body>{children}</body></html>;
}