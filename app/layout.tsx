import type { Metadata } from "next";
import { Geist, Geist_Mono, Tajawal } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://chefhub-kw.vercel.app'),
  title: {
    default: 'ChefHub - منصة الشيفات في الكويت 🇰🇼',
    template: '%s | ChefHub',
  },
  description: 'احصل على أشهى الأطباق من الشيفات المميزين في الكويت. توصيل لجميع المحافظات. أكل بيتي أصيل من مطابخ كويتية مميزة.',
  keywords: [
    'شيفات الكويت',
    'طعام منزلي',
    'أكل بيتي',
    'توصيل طعام الكويت',
    'طلبات أكل',
    'مطبخ كويتي',
    'وجبات منزلية',
    'ChefHub',
    'Kuwait chefs',
    'homemade food Kuwait',
  ],
  authors: [{ name: 'ChefHub Kuwait' }],
  creator: 'ChefHub Kuwait',
  publisher: 'ChefHub Kuwait',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ar_KW',
    url: '/',
    title: 'ChefHub - منصة الشيفات في الكويت',
    description: 'احصل على أشهى الأطباق من الشيفات المميزين في الكويت',
    siteName: 'ChefHub',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ChefHub Kuwait',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChefHub - منصة الشيفات في الكويت',
    description: 'احصل على أشهى الأطباق من الشيفات المميزين في الكويت',
    images: ['/og-image.jpg'],
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
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${tajawal.variable} antialiased font-sans`}
      >
        <AuthProvider>
          <CartProvider>
            <Header />
            {children}
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
