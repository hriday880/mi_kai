import type { Metadata } from 'next';
import { Cormorant_Garamond, Outfit, Shippori_Mincho, Noto_Serif_SC } from 'next/font/google';
import { LanguageProvider } from '@/lib/LanguageContext';
import LightSwitch from '@/components/LightSwitch';
import Navigation from '@/components/Navigation';
import './globals.css';

/* ── Font Configuration ───────────────────────────────────── */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-outfit',
  display: 'swap',
});

const shippori = Shippori_Mincho({
  weight: ['400', '500', '700'],
  variable: '--font-shippori',
  display: 'swap',
  preload: false,
});

const noto = Noto_Serif_SC({
  weight: ['400', '500', '700'],
  variable: '--font-noto',
  display: 'swap',
  preload: false,
});

/* ── Metadata & SEO ───────────────────────────────────────── */
export const metadata: Metadata = {
  title: 'Mi-KAI Tokyo | Light, Perfected.',
  description:
    'Mi-KAI Tokyo — Premium LED lighting born from Japanese craftsmanship. CRI>90 illumination, circadian harmony, and timeless design for extraordinary interiors.',
  keywords: [
    'Mi-KAI',
    'Tokyo',
    'LED',
    'premium lighting',
    'luxury LED',
    'Japanese design',
    'CRI>90',
    'interior lighting',
    'Monozukuri',
    'circadian lighting',
  ],
  authors: [{ name: 'Mi-KAI Tokyo' }],
  creator: 'Mi-KAI Tokyo',
  publisher: 'Mi-KAI Tokyo',
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
  openGraph: {
    title: 'Mi-KAI Tokyo | Light, Perfected.',
    description:
      'Premium LED lighting born from Japanese craftsmanship. CRI>90 illumination for extraordinary interiors.',
    siteName: 'Mi-KAI Tokyo',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mi-KAI Tokyo | Light, Perfected.',
    description:
      'Premium LED lighting born from Japanese craftsmanship. CRI>90 illumination for extraordinary interiors.',
  },
};

/* ── Root Layout ──────────────────────────────────────────── */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${outfit.variable} ${shippori.variable} ${noto.variable}`} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        style={{
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        <LanguageProvider>
          <Navigation />
          <LightSwitch />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
