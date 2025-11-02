"use client"

import Link from "next/link"
import { ChefHat } from "lucide-react"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center space-x-2 mr-8">
          <ChefHat className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Pastrycciando
          </span>
        </Link>
        <div className="flex-1" />
        <div className="text-sm text-muted-foreground">
          Pasticceria con AI
        </div>
      </div>
    </nav>
  )
}
