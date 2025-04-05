"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, CheckSquare, MessageSquare, Settings, Mic } from "lucide-react"

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Assistant",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Voice Assistant",
    href: "/voice-assistant",
    icon: Mic,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href ? "text-primary" : "text-muted-foreground",
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          <span className="hidden md:inline-block">{item.title}</span>
        </Link>
      ))}
    </nav>
  )
}

