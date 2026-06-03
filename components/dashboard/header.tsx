"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/components/user-context"
import { MobileSidebar } from "./sidebar"

export default function Header() {
  const { username } = useUser()
  const [time, setTime] = useState<string>("")

  useEffect(() => {
    setTime(new Date().toLocaleTimeString())
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="border-b border-border/30 bg-card/80 backdrop-blur-md sticky top-0 z-40">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MobileSidebar />
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse hidden md:block" />
          <div>
            <h1 className="text-xl font-bold">AegisZero Security Dashboard</h1>
            <p className="text-xs text-muted-foreground">Real-time Threat Intelligence & Monitoring</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-foreground font-medium">Welcome, {username}</p>
            <p className="text-xs text-muted-foreground">{time} UTC</p>
          </div>
        </div>
      </div>
    </header>
  )
}
