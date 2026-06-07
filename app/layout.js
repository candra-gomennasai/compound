import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Team Compound — Laporan Harian",
  description: "Aplikasi laporan harian untuk pekerja lapangan",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <body>
        <AuthGuard>
          <div className="app-layout">
            <Navbar />
            <main className="main-content">
              {children}
            </main>
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}
