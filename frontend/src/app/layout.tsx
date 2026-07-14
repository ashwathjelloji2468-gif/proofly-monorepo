import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalBackground } from "@/components/GlobalBackground";
import { SupportChatbot } from "@/components/SupportChatbot";
import { CookieConsent } from "@/components/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_CLIENT_URL || 'https://useproofly.vercel.app'),
  title: {
    default: "Proofly - Premium AI Social Proof",
    template: "%s | Proofly"
  },
  description: "AI-powered social proof, testimonial collections, and interactive displays.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Proofly - Premium AI Social Proof",
    description: "AI-powered social proof, testimonial collections, and interactive displays.",
    url: "https://useproofly.vercel.app",
    siteName: "Proofly",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Proofly - Premium AI Social Proof",
    description: "AI-powered social proof, testimonial collections, and interactive displays."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        <GlobalBackground />
        {children}
        <SupportChatbot />
        <CookieConsent />
      </body>
    </html>
  );
}


