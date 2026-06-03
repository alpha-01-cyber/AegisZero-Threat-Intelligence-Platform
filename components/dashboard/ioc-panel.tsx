"use client"

import { useState, useEffect } from "react"

interface IOC {
  id: string
  type: string
  value: string
  source: string
  confidence: number
  firstSeen: string
}

interface IOCPanelProps {
  refreshTrigger: number
}

export default function IOCPanel({ refreshTrigger }: IOCPanelProps) {
  const [iocs, setIOCs] = useState<IOC[]>([])
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const mockIOCs: IOC[] = [
      { id: "1", type: "IP", value: "192.168.1.100", source: "AbuseIPDB", confidence: 98, firstSeen: "2m ago" },
      {
        id: "2",
        type: "Domain",
        value: "malicious.domain.com",
        source: "PhishTank",
        confidence: 95,
        firstSeen: "15m ago",
      },
      {
        id: "3",
        type: "Hash",
        value: "e3fad923a8c2b4d...",
        source: "MalwareBazaar",
        confidence: 99,
        firstSeen: "25m ago",
      },
      {
        id: "4",
        type: "Email",
        value: "attacker@phish.com",
        source: "Custom Feed",
        confidence: 85,
        firstSeen: "1h ago",
      },
      {
        id: "5",
        type: "URL",
        value: "http://malware.click/payload",
        source: "URLhaus",
        confidence: 92,
        firstSeen: "2h ago",
      },
    ]
    setIOCs(mockIOCs)
  }, [refreshTrigger])

  const filtered = filter === "all" ? iocs : iocs.filter((i) => i.type === filter)

  return (
    <div className="bg-card/80 backdrop-blur-md rounded-lg border border-border/30 hover:bg-card/90 transition-colors">
      <div className="p-4 border-b border-border/30 flex items-center justify-between">
        <h2 className="text-lg font-bold text-primary">Indicators of Compromise</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-card border border-border rounded px-2 py-1 text-xs text-foreground"
        >
          <option value="all">All Types</option>
          <option value="IP">IP Addresses</option>
          <option value="Domain">Domains</option>
          <option value="Hash">Hashes</option>
          <option value="Email">Emails</option>
          <option value="URL">URLs</option>
        </select>
      </div>

      <div className="divide-y divide-border/30 max-h-96 overflow-y-auto">
        {filtered.map((ioc) => (
          <div key={ioc.id} className="px-4 py-3 border-b border-border/30 hover:bg-card/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs font-bold">{ioc.type}</span>
                  <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-primary"
                      style={{ width: `${ioc.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{ioc.confidence}%</span>
                </div>
                <p className="font-mono text-xs text-primary truncate">{ioc.value}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {ioc.source} • {ioc.firstSeen}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
