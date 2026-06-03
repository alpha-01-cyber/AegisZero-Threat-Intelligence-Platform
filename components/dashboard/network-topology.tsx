"use client"

import { useEffect, useRef } from "react"

interface NetworkTopologyProps {
  refreshTrigger: number
}

export default function NetworkTopology({ refreshTrigger }: NetworkTopologyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Define nodes (threat sources and targets)
    const nodes = [
      { x: 100, y: 100, label: "Cloud", type: "cloud", size: 40 },
      { x: 300, y: 50, label: "Server 1", type: "server", size: 30 },
      { x: 500, y: 80, label: "Server 2", type: "server", size: 30 },
      { x: 700, y: 100, label: "Datacenter", type: "datacenter", size: 40 },
      { x: 300, y: 200, label: "Network", type: "network", size: 35 },
      { x: 500, y: 250, label: "Database", type: "database", size: 30 },
      { x: 150, y: 300, label: "Firewall", type: "firewall", size: 30 },
      { x: 700, y: 300, label: "Cache", type: "cache", size: 30 },
    ]

    const connections = [
      [0, 1],
      [0, 2],
      [1, 4],
      [2, 5],
      [4, 6],
      [5, 7],
      [1, 3],
      [2, 3],
    ]

    // Animation loop
    let animationFrame = 0
    const animate = () => {
      // Clear canvas
      ctx.fillStyle = "#0a0e27"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw connections with glow
      connections.forEach(([from, to]) => {
        const n1 = nodes[from]
        const n2 = nodes[to]

        // Animated line
        const gradient = ctx.createLinearGradient(n1.x, n1.y, n2.x, n2.y)
        gradient.addColorStop(0, "rgba(0, 255, 136, 0.3)")
        gradient.addColorStop(0.5, `rgba(0, 255, 136, ${0.5 + Math.sin(animationFrame * 0.05) * 0.2})`)
        gradient.addColorStop(1, "rgba(0, 255, 136, 0.1)")

        ctx.strokeStyle = gradient
        ctx.lineWidth = 2
        ctx.globalShadow = 10
        ctx.shadowColor = "rgba(0, 255, 136, 0.5)"
        ctx.beginPath()
        ctx.moveTo(n1.x, n1.y)
        ctx.lineTo(n2.x, n2.y)
        ctx.stroke()
      })

      // Draw nodes
      nodes.forEach((node, index) => {
        const pulse = 1 + Math.sin(animationFrame * 0.03 + index) * 0.2

        // Glow circle
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size * 1.5 * pulse)
        gradient.addColorStop(0, "rgba(0, 255, 136, 0.4)")
        gradient.addColorStop(1, "rgba(0, 255, 136, 0)")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.size * 1.5 * pulse, 0, Math.PI * 2)
        ctx.fill()

        // Node circle
        ctx.fillStyle = "#00ff88"
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2)
        ctx.fill()

        // Node border
        ctx.strokeStyle = "#00cc6f"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2)
        ctx.stroke()

        // Label
        ctx.fillStyle = "#0a0e27"
        ctx.font = "bold 12px monospace"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(node.label.split(" ")[0], node.x, node.y)
      })

      animationFrame++
      requestAnimationFrame(animate)
    }

    animate()
  }, [refreshTrigger])

  return (
    <div className="bg-card/80 backdrop-blur-md rounded-lg border border-border/30 hover:bg-card/90 transition-colors space-y-4">
      <div className="p-4 border-b border-border/30">
        <h2 className="text-lg font-bold text-primary">Network Topology</h2>
        <p className="text-xs text-muted-foreground mt-1">Live infrastructure visualization with threat paths</p>
      </div>

      <canvas ref={canvasRef} className="w-full bg-card/50 rounded-lg" style={{ minHeight: "500px" }} />

      <div className="px-4 pb-4 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Active Connection</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-destructive animate-pulse" />
          <span className="text-muted-foreground">Threat Path</span>
        </div>
      </div>
    </div>
  )
}
