import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cosmedic Clinic Management",
  description: "Sistema gestione clinica intelligente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <div style={{ display: "flex" }}>
          <Sidebar />
          <main style={{ 
            flex: 1, 
            marginLeft: "260px", 
            minHeight: "100vh",
            background: "var(--content-bg)"
          }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
