"use client"

import { useState, useEffect } from "react"

interface HotThreat {
  id: string
  rank: number
  threat: string
  surge: number
  regions: number
  indicator: string
  type: string
}

interface HotThreatsPanelProps {
  refreshTrigger: number
}

export default function HotThreatsPanel({ refreshTrigger }: HotThreatsPanelProps) {
  const [threats, setThreats] = useState<HotThreat[]>([])

  useEffect(() => {
    const mockThreats: HotThreat[] = [
      {
        id: "1",
        rank: 1,
        threat: "Port Scanning Campaign",
        surge: 245,
        regions: 8,
        indicator: "192.168.1.100",
        type: "IP",
      },
      {
        id: "2",
        rank: 2,
        threat: "Phishing Campaign",
        surge: 189,
        regions: 4,
        indicator: "badmalware.com",
        type: "Domain",
      },
      {
        id: "3",
        rank: 3,
        threat: "Ransomware Outbreak",
        surge: 156,
        regions: 12,
        indicator: "e3fad923...",
        type: "Hash",
      },
      { id: "4", rank: 4, threat: "Botnet Activity", surge: 134, regions: 6, indicator: "10.0.0.50", type: "IP" },
      {
        id: "5",
        rank: 5,
        threat: "Credential Stuffing",
        surge: 98,
        regions: 3,
        indicator: "attack@phish.com",
        type: "Email",
      },
    ]
    setThreats(mockThreats)
  }, [refreshTrigger])

  return (
    <div
      className="bg-card/80 backdrop-blur-md rounded-lg p-4 border border-primary/30 shadow-lg shadow-primary/10"
      style={{ animation: "glow 2s ease-in-out infinite" }}
    >
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🔥</span>
          <h2 className="text-lg font-bold drop-shadow-[0_0_8px_rgba(139,255,204,0.3)]">Hot Threats Now</h2>
        </div>
        <p className="text-xs text-muted-foreground">Last 24 hours • Global IOC Monitoring</p>
      </div>

      <div className="divide-y divide-border/30">
        {threats.map((threat) => (
          <div key={threat.id} className="px-4 py-3 border-b border-border/30 hover:bg-card/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  {threat.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{threat.threat}</p>
                  <p className="text-xs text-primary font-mono mt-1">{threat.indicator}</p>
                  <div className="flex gap-3 mt-2">
                    <span className="text-xs text-destructive font-bold">+{threat.surge}% surge</span>
                    <span className="text-xs text-orange-500">{threat.regions} regions affected</span>
                  </div>
                </div>
              </div>
              <span className="px-2 py-1 bg-destructive/20 text-destructive rounded text-xs font-bold whitespace-nowrap ml-2">
                {threat.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
