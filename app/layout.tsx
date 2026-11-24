import type { Metadata } from 'next';
import { Syne, DM_Sans, Space_Mono } from 'next/font/google';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
});

export const metadata: Metadata = {
  title: 'VectorOne_DSP — Multi-Platform Search Operator & OSINT Workbench',
  description:
    'Automated multi-platform search operator workbench, full dork reference catalog, searchable findings database with CSV export, and Gmail alert notifications.',
  openGraph: {
    title: 'VectorOne_DSP — Multi-Platform Search Operator & OSINT Workbench',
    description:
      'Automated multi-platform search operator workbench, full dork reference catalog, searchable findings database with CSV export, and Gmail alert notifications.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VectorOne_DSP — Multi-Platform Search Operator & OSINT Workbench',
    description:
      'Automated multi-platform search operator workbench, full dork reference catalog, searchable findings database with CSV export, and Gmail alert notifications.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${syne.variable} ${dmSans.variable} ${spaceMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="bg-[#f4f2ee] dark:bg-[#111113] text-[#111113] dark:text-[#f2efeb] antialiased selection:bg-[#ff4d00] selection:text-[#111113]"
      >
        {children}
      </body>
    </html>
  );
}
