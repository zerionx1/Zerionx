import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'ZerionX1 — AI-Powered Trading Platform',
    template: '%s | ZerionX1',
  },
  description:
    'Trade smarter with AI. Paper trade, live trade, build algos, and eliminate FOMO — all in one platform. Powered by Upstox & Claude AI.',
  keywords: [
    'AI trading',
    'algo trading India',
    'paper trading',
    'Upstox',
    'NSE',
    'BSE',
    'stock market AI',
    'trading platform India',
    'FOMO shield',
    'ZerionX1',
  ],
  authors: [{ name: 'ZerionX1' }],
  creator: 'ZerionX1',
  metadataBase: new URL('https://zerionx1.com'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://zerionx1.com',
    title: 'ZerionX1 — AI-Powered Trading Platform',
    description:
      'Trade smarter with AI. Paper trade, live trade, build algos, and eliminate FOMO.',
    siteName: 'ZerionX1',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ZerionX1 — AI-Powered Trading Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZerionX1 — AI-Powered Trading Platform',
    description:
      'Trade smarter with AI. Paper trade, live trade, build algos, and eliminate FOMO.',
    images: ['/og-image.png'],
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
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#090e1a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} bg-dark-500 text-slate-100 antialiased`}>
        {/* Global background gradient */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          aria-hidden="true"
        >
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/4 rounded-full blur-3xl" />
        </div>

        {/* Page content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e2538',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
              maxWidth: '380px',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#1e2538',
              },
              style: {
                borderColor: 'rgba(34, 197, 94, 0.2)',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#1e2538',
              },
              style: {
                borderColor: 'rgba(239, 68, 68, 0.2)',
              },
            },
            loading: {
              iconTheme: {
                primary: '#14b8a6',
                secondary: '#1e2538',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
