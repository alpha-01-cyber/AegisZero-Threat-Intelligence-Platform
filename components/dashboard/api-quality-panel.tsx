"use client"

import { useState, useEffect } from "react"

interface APIScore {
  name: string
  coverage: number
  accuracy: number
  freshness: number
  overall: number
  status: "healthy" | "degraded" | "down"
}

interface APIQualityPanelProps {
  refreshTrigger: number
}

export default function APIQualityPanel({ refreshTrigger }: APIQualityPanelProps) {
  const [apis, setAPIs] = useState<APIScore[]>([])

  useEffect(() => {
    const mockAPIs: APIScore[] = [
      { name: "VirusTotal", coverage: 95, accuracy: 98, freshness: 92, overall: 95, status: "healthy" },
      { name: "AbuseIPDB", coverage: 88, accuracy: 94, freshness: 96, overall: 93, status: "healthy" },
      { name: "AlienVault OTX", coverage: 82, accuracy: 89, freshness: 85, overall: 85, status: "healthy" },
      { name: "PhishTank", coverage: 91, accuracy: 96, freshness: 94, overall: 94, status: "healthy" },
      { name: "MalwareBazaar", coverage: 85, accuracy: 92, freshness: 88, overall: 88, status: "degraded" },
    ]
    setAPIs(mockAPIs)
  }, [refreshTrigger])

  return (
    <div className="bg-card/80 backdrop-blur-md rounded-lg border border-border/30 hover:bg-card/90 transition-colors">
      <div className="p-4 border-b border-border/30">
        <h2 className="text-lg font-bold text-primary">API Quality Scores</h2>
      </div>

      <div className="divide-y divide-border/30 max-h-96 overflow-y-auto">
        {apis.map((api) => (
          <div key={api.name} className="px-4 py-3 border-b border-border/30 hover:bg-card/50 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground text-sm">{api.name}</p>
                  <div
                    className={`w-2 h-2 rounded-full ${api.status === "healthy" ? "bg-green-500 animate-pulse" : "bg-orange-500"}`}
                  />
                </div>
                <p className="text-sm font-bold text-primary">{api.overall}%</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground mb-1">Coverage</p>
                  <div className="w-full h-2 bg-card/50 rounded overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${api.coverage}%` }} />
                  </div>
                  <p className="text-foreground mt-1">{api.coverage}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Accuracy</p>
                  <div className="w-full h-2 bg-card/50 rounded overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${api.accuracy}%` }} />
                  </div>
                  <p className="text-foreground mt-1">{api.accuracy}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Freshness</p>
                  <div className="w-full h-2 bg-card/50 rounded overflow-hidden">
                    <div className="h-full bg-orange-500" style={{ width: `${api.freshness}%` }} />
                  </div>
                  <p className="text-foreground mt-1">{api.freshness}%</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
