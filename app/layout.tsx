import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'https://oagym.com'),
  title: 'OA GYM - Centro de Entrenamiento Integral',
  description: 'Plataforma integral para OA GYM: planes de entrenamiento personalizados, acceso biométrico y QR para clientes, portal personal, monitoreo antropométrico y panel de control administrativo.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'OA GYM - Centro de Entrenamiento Integral',
    description: 'Plataforma integral para OA GYM: planes de entrenamiento personalizados, acceso biométrico y QR para clientes, portal personal, monitoreo antropométrico y panel de control administrativo.',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 717,
        height: 355,
        alt: 'OA GYM Logo Oficial',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OA GYM - Centro de Entrenamiento Integral',
    description: 'Plataforma integral para OA GYM: planes de entrenamiento personalizados, acceso biométrico y QR para clientes, portal personal, monitoreo antropométrico y panel de control administrativo.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`dark scroll-smooth ${inter.variable}`} suppressHydrationWarning>
      <body className="bg-black text-[#E5E7EB] font-sans antialiased min-h-screen selection:bg-blue-600 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
