import React from "react"
import type { Metadata } from 'next'

import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'FITLOOP — AI Resume Analysis',
  description: 'Systems that analyze, not screens that display. AI-powered resume matching.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <div className="noise-overlay" />
        <div className="grid-bg fixed inset-0 opacity-30 pointer-events-none" />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <div className="relative z-10">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
