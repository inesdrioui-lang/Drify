import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Drify — L\'immobilier simplifié',
  description: 'La plateforme qui simplifie toute l\'expérience locative.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
