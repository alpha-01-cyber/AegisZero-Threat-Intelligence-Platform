"use client"

import { useEffect, useRef } from "react"

interface ThreatLocation {
  country: string
  lat: number
  lon: number
  severity: string
  count: number
  ioc_types: string[]
}

interface ThreatGlobeProps {
  threats: ThreatLocation[]
  onThreatClick?: (threat: ThreatLocation) => void
}

export default function ThreatGlobe({ threats, onThreatClick }: ThreatGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return

    // Dynamically import Globe.gl to avoid SSR issues
    import("globe.gl").then((GlobeGl) => {
      const Globe = GlobeGl.default

      const globe = Globe()(containerRef.current!)
        .globeImageUrl("//unpkg.com/three-globe/example/img/earth-dark.jpg")
        .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
        .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
        .pointsData(threats)
        .pointAltitude("count")
        .pointColor((d: any) => {
          const colors: Record<string, string> = {
            critical: "#ef4444",
            high: "#f97316",
            medium: "#eab308",
            low: "#22c55e",
          }
          return colors[d.severity] || "#6366f1"
        })
        .pointRadius(0.5)
        .pointLat("lat")
        .pointLng("lon")
        .pointLabel(
          (d: any) => `
          <div style="background: rgba(0,0,0,0.8); padding: 8px; border-radius: 4px; color: white;">
            <strong>${d.country}</strong><br/>
            Severity: ${d.severity}<br/>
            Threats: ${d.count}
          </div>
        `,
        )
        .onPointClick((point: any) => {
          if (onThreatClick) {
            onThreatClick(point as ThreatLocation)
          }
        })

      globeRef.current = globe

      // Auto-rotate
      globe.controls().autoRotate = true
      globe.controls().autoRotateSpeed = 0.5

      // Set initial camera position
      globe.pointOfView({ altitude: 2.5 })
    })

    return () => {
      // Cleanup
      if (globeRef.current) {
        globeRef.current._destructor()
      }
    }
  }, [threats, onThreatClick])

  return <div ref={containerRef} className="h-[600px] w-full" />
}
