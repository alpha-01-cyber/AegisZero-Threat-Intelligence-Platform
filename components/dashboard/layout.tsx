"use client"

import { type ReactNode, useState } from "react"
import Header from "./header"
import { Sidebar } from "./sidebar"

interface DashboardLayoutProps {
  children: ReactNode
  onRefresh: () => void
}

export default function DashboardLayout({ children, onRefresh }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <Sidebar className="hidden md:block" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
