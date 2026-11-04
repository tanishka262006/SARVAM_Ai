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
    <html lang="hi" className="h-full">
      <body className="min-h-full font-sans antialiased text-slate-800 bg-slate-50 selection:bg-orange-100 selection:text-orange-900">
        {children}
      </body>
    </html>
  );
}
