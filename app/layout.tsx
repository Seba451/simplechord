import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NotationProvider } from "./context/notation";
import UserMenu from "./user/page";
import { AuthProvider } from "./context/authContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.simple-chord.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "SimpleChord",
  description: "Componé progresiones de acordes y obtené recomendaciones.",
  icons: {
    icon: "/favicon.ico", // favicon por defecto
    shortcut: "/favicon.ico",
    apple: "/simplechordlogo1.png",
  },
  applicationName: "SimpleChord",
  openGraph: {
    title: "SimpleChord",
    description: "Componé progresiones de acordes y obtené recomendaciones.",
    siteName: "SimpleChord",
    images: ["/simplechordlogo1.png"],
  },
  twitter: {
    card: "summary",
    title: "SimpleChord",
    description: "Componé progresiones de acordes y obtené recomendaciones.",
    images: ["/simplechordlogo1.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      
      <body className="bg-gradient-to-br from-green-50 via-white to-green-100 min-h-screen">
        <NotationProvider>
            
            {children}
            <UserMenu />
         
        </NotationProvider>
      </body>
    </html>
  );
}
