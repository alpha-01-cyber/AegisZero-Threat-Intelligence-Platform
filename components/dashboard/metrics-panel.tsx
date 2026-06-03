"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface MetricsPanelProps {
  refreshTrigger: number
}

export default function MetricsPanel({ refreshTrigger }: MetricsPanelProps) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    // Generate mock data
    const chartData = Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      requests: Math.floor(Math.random() * 500) + 100,
      threats: Math.floor(Math.random() * 50) + 5,
      apiCalls: Math.floor(Math.random() * 1000) + 200,
    }))
    setData(chartData)
  }, [refreshTrigger])

  return (
    <div className="space-y-6">
      {/* Request Volume Chart */}
      <div className="bg-card/80 backdrop-blur-md rounded-lg border border-border/30 hover:bg-card/90 transition-colors">
        <div className="p-4 border-b border-border/30">
          <h3 className="text-lg font-bold text-primary">Request Volume (24h)</h3>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="time" stroke="rgba(255, 255, 255, 0.3)" />
              <YAxis stroke="rgba(255, 255, 255, 0.3)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid rgba(0, 255, 136, 0.3)",
                  borderRadius: "8px",
                }}
              />
              <Line type="monotone" dataKey="requests" stroke="#8bffcc" strokeWidth={2} dot={false} isAnimationActive />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Threat Detection Chart */}
      <div className="bg-card/80 backdrop-blur-md rounded-lg border border-border/30 hover:bg-card/90 transition-colors">
        <div className="p-4 border-b border-border/30">
          <h3 className="text-lg font-bold text-primary">Threat Detection Timeline</h3>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="time" stroke="rgba(255, 255, 255, 0.3)" />
              <YAxis stroke="rgba(255, 255, 255, 0.3)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid rgba(0, 255, 136, 0.3)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="threats" fill="#ff4757" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
