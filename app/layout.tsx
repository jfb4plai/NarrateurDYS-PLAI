import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Narration DYS — PLAI',
  description: 'Transforme n\'importe quel texte en audio adapté pour les élèves dyslexiques',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-jfb-subtil min-h-screen">
        <header className="bg-white border-b border-jfb-bordure px-6 py-3 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/plai-logo.jpg" alt="PLAI" style={{ height: '48px', width: 'auto' }} />
        </header>
        {children}
      </body>
    </html>
  )
}
