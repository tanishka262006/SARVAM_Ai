import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sarkari Sahayak | सरकारी सहायक - AI Government Scheme Assistant',
  description: 'Multilingual AI Assistant for Indian citizens powered by Sarvam AI (Saaras, Sarvam-105B, Bulbul, Sarvam Vision). Discover, verify and apply for government schemes naturally in your voice.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full font-sans antialiased text-slate-900 bg-[#FBFBFA] selection:bg-forest-100 selection:text-forest-900">
        {children}
      </body>
    </html>
  );
}
