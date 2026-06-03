"use client"

import { useState, useEffect } from "react"
import ThreatCard from "./threat-card"

interface Threat {
  id: string
  type: "critical" | "high" | "medium" | "low"
  indicator: string
  source: string
  timestamp: string
  description: string
}

interface ThreatOverviewProps {
  refreshTrigger: number
}

export default function ThreatOverview({ refreshTrigger }: ThreatOverviewProps) {
  const [threats, setThreats] = useState<Threat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setLoading(true)
    const timer = setTimeout(() => {
      const mockThreats: Threat[] = [
        {
          id: "1",
          type: "critical",
          indicator: "192.168.1.100",
          source: "AbuseIPDB",
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          description: "Massive port-scanning campaign detected",
        },
        {
          id: "2",
          type: "high",
          indicator: "malicious.domain.com",
          source: "PhishTank",
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          description: "Phishing campaign across 4 regions",
        },
        {
          id: "3",
          type: "high",
          indicator: "e3fad923a8c2b4d...",
          source: "MalwareBazaar",
          timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
          description: "Ransomware variant trending in 12 countries",
        },
        {
          id: "4",
          type: "medium",
          indicator: "10.0.0.50",
          source: "SpamHaus",
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
          description: "Spam relay activity detected",
        },
      ]
      setThreats(mockThreats)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [refreshTrigger])

  const stats = {
    critical: threats.filter((t) => t.type === "critical").length,
    high: threats.filter((t) => t.type === "high").length,
    medium: threats.filter((t) => t.type === "medium").length,
    low: threats.filter((t) => t.type === "low").length,
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card/80 backdrop-blur-md rounded-lg p-4 border border-primary/30 shadow-lg shadow-primary/10 hover:bg-card/90 transition-colors">
          <p className="text-xs text-muted-foreground mb-1">Critical</p>
          <p className="text-3xl font-bold text-destructive">{stats.critical}</p>
        </div>
        <div className="bg-card/80 backdrop-blur-md rounded-lg p-4 border border-primary/30 shadow-lg shadow-primary/10 hover:bg-card/90 transition-colors">
          <p className="text-xs text-muted-foreground mb-1">High</p>
          <p className="text-3xl font-bold text-orange-500">{stats.high}</p>
        </div>
        <div className="bg-card/80 backdrop-blur-md rounded-lg p-4 border border-primary/30 shadow-lg shadow-primary/10 hover:bg-card/90 transition-colors">
          <p className="text-xs text-muted-foreground mb-1">Medium</p>
          <p className="text-3xl font-bold text-blue-500">{stats.medium}</p>
        </div>
        <div className="bg-card/80 backdrop-blur-md rounded-lg p-4 border border-primary/30 shadow-lg shadow-primary/10 hover:bg-card/90 transition-colors">
          <p className="text-xs text-muted-foreground mb-1">Low</p>
          <p className="text-3xl font-bold text-muted-foreground">{stats.low}</p>
        </div>
      </div>

      {/* Threats List */}
      <div className="bg-card/80 backdrop-blur-md rounded-lg border border-border/30 hover:bg-card/90 transition-colors">
        <div className="p-4 border-b border-border/30">
          <h2 className="text-lg font-bold text-primary">Active Threats</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {threats.map((threat) => (
              <ThreatCard key={threat.id} threat={threat} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
