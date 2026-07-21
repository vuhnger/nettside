import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Analytics } from "@vercel/analytics/next";

const themeScript = `document.documentElement.dataset.colorScheme=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Victor Uhnger - Portfolio",
  description: "Masterstudent i Informatikk: programmering og nettverk ved Universitetet i Oslo. Utvikler, løper, og teknologientusiast.",
};

export default function RootLayout({
  children,}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          color: 'var(--ds-color-neutral-text-default)'
        }}
      >
        <Navbar />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
