import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NovaSaaS AI',
  description: 'AI-powered assistant'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-claude-cream font-sans antialiased text-[#1A1A1A] h-screen w-screen overflow-hidden">
        {children}
      </body>
    </html>
  )
}
