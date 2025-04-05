"use client"

import { MainNav } from "@/components/layout/main-nav"

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center space-x-2">
          <span className="font-bold text-xl">PM Assistant</span>
        </div>
        <MainNav />
      </div>
    </header>
  )
}

