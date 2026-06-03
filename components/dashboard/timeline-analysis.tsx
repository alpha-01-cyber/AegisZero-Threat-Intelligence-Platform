"use client"

import { useState, useEffect } from "react"

interface TimelineEvent {
  id: string
  time: string
  event: string
  severity: "critical" | "high" | "medium" | "low"
  details: string
}

interface TimelineAnalysisProps {
  refreshTrigger: number
}

export default function TimelineAnalysis({ refreshTrigger }: TimelineAnalysisProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([])

  useEffect(() => {
    const now = new Date()
    const mockEvents: TimelineEvent[] = [
      {
        id: "1",
        time: new Date(now.getTime() - 2 * 60000).toLocaleTimeString(),
        event: "Surge Detection",
        severity: "critical",
        details: "Port scanning surge detected (+245%)",
      },
      {
        id: "2",
        time: new Date(now.getTime() - 8 * 60000).toLocaleTimeString(),
        event: "IOC Match",
        severity: "high",
        details: "Malicious domain flagged in 4 phishing campaigns",
      },
      {
        id: "3",
        time: new Date(now.getTime() - 15 * 60000).toLocaleTimeString(),
        event: "Hash Analysis",
        severity: "high",
        details: "Ransomware variant trending in 12 countries",
      },
      {
        id: "4",
        time: new Date(now.getTime() - 25 * 60000).toLocaleTimeString(),
        event: "API Quality Check",
        severity: "medium",
        details: "Partial enrichment from VirusTotal",
      },
      {
        id: "5",
        time: new Date(now.getTime() - 35 * 60000).toLocaleTimeString(),
        event: "Graph Update",
        severity: "low",
        details: "Network topology updated with new connections",
      },
    ]
    setEvents(mockEvents)
  }, [refreshTrigger])

  const severityConfig = {
    critical: { color: "bg-danger", textColor: "text-danger" },
    high: { color: "bg-warning", textColor: "text-warning" },
    medium: { color: "bg-info", textColor: "text-info" },
    low: { color: "bg-primary", textColor: "text-primary" },
  }

  return (
    <div className="bg-card/80 backdrop-blur-md rounded-lg border border-border/30 hover:bg-card/90 transition-colors">
      <div className="p-4 border-b border-border/30">
        <h2 className="text-lg font-bold text-primary">Event Timeline</h2>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary to-transparent" />

        {/* Events */}
        <div className="space-y-1">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="px-4 py-3 border-b border-border/30 hover:bg-card/50 transition-colors pl-24"
            >
              {/* Timeline dot */}
              <div
                className={`absolute left-4 top-6 w-4 h-4 rounded-full border-2 border-card ${severityConfig[event.severity].color}`}
              />

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold ${severityConfig[event.severity].textColor}`}>
                      {event.event}
                    </span>
                    <span className="text-xs text-muted-foreground">{event.time}</span>
                  </div>
                  <p className="text-sm text-foreground">{event.details}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
