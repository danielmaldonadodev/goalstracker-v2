import type { Metadata } from 'next'
import { Outfit, Space_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const outfit = Outfit({ 
  subsets: ['latin'], 
  variable: '--font-outfit' 
})

const spaceMono = Space_Mono({ 
  weight: ['400', '700'], 
  subsets: ['latin'], 
  variable: '--font-space-mono' 
})

export const metadata: Metadata = {
  title: 'GoalsTracker',
  description: 'Seguimiento profesional de hábitos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${outfit.variable} ${spaceMono.variable}`}>
      <body className="font-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
