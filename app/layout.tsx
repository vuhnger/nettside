import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VisitTracker from "@/components/layout/VisitTracker";
import { Analytics } from "@vercel/analytics/next";
import ReactQueryProvider from "@/providers/ReactQueryProvider";

const themeScript = `(()=>{let s;try{s=localStorage.getItem('color-scheme')}catch{}if(s!=='light'&&s!=='dark'){const h=new Date().getHours();s=(h>=8&&h<20)?'light':'dark'}document.documentElement.dataset.colorScheme=s;document.documentElement.style.colorScheme=s})()`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_DESCRIPTION =
  "Masterstudent i Informatikk: programmering og nettverk ved Universitetet i Oslo. Utvikler, løper, og teknologientusiast.";

export const metadata: Metadata = {
  metadataBase: new URL("https://vuhnger.dev"),
  title: {
    default: "Victor Uhnger - Portfolio",
    template: "%s · Victor Uhnger",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "Victor Uhnger - Portfolio",
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: "Victor Uhnger",
    locale: "no_NO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Victor Uhnger - Portfolio",
    description: SITE_DESCRIPTION,
  },
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
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          color: 'var(--ds-color-neutral-text-default)'
        }}
      >
        <ReactQueryProvider>
          <Navbar />
          {children}
          <Footer />
        </ReactQueryProvider>
        <VisitTracker />
        <Analytics />
      </body>
    </html>
  );
}
