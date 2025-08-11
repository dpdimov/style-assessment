import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Style Assessment App',
  description: 'Kinetic Style Assessment Tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}