import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SOSNU - Dating App на основі геолокації',
  description:
    'Знайди людей зі схожими інтересами поруч з тобою. Сучасний додаток для знайомств на карті України.',
  keywords: 'знайомства, дейтинг, геолокація, карта, соціальна мережа',
  authors: [{ name: 'SOSNU Team' }],
  openGraph: {
    title: 'SOSNU - Find Love Near You 💙❤️',
    description: 'Додаток для знайомств на основі геолокації',
    url: 'https://sos-love.vercel.app',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:image" content="https://via.placeholder.com/1200x630?text=SOSNU" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
