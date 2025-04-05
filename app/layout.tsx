import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/layout/header"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Project Management Assistant",
  description: "AI-powered project management assistant",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <div className="relative min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container py-6">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'