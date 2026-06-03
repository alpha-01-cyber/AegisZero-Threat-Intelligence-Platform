"use client"

interface Threat {
  id: string
  type: "critical" | "high" | "medium" | "low"
  indicator: string
  source: string
  timestamp: string
  description: string
}

const typeConfig = {
  critical: { color: "text-danger", bg: "bg-danger/10", label: "Critical" },
  high: { color: "text-warning", bg: "bg-warning/10", label: "High" },
  medium: { color: "text-info", bg: "bg-info/10", label: "Medium" },
  low: { color: "text-text-secondary", bg: "bg-text-muted/10", label: "Low" },
}

export default function ThreatCard({ threat }: { threat: Threat }) {
  const config = typeConfig[threat.type]
  const timeAgo = getTimeAgo(new Date(threat.timestamp))

  return (
    <div className="px-4 py-3 border-b border-border/30 hover:bg-card/50 transition-colors flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-2 py-1 rounded text-xs font-bold ${config.bg} ${config.color}`}>{config.label}</span>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        <p className="font-mono text-sm text-primary font-semibold truncate">{threat.indicator}</p>
        <p className="text-xs text-muted-foreground mt-1">{threat.description}</p>
      </div>
      <div className="text-right ml-4">
        <p className="text-xs font-medium text-muted-foreground">{threat.source}</p>
      </div>
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
