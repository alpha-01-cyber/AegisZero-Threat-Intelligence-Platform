// Mohid Umer, M Ahsan, M Saim
// 23i-2130, 23i-2117, 23i-2119
// page.tsx

"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/layouts/DashboardLayout"
import { Globe as GlobeIcon, AlertTriangle, Shield } from "lucide-react"

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false })

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Major capital cities with accurate coordinates
const CAPITAL_CITIES = [
    { city: "Washington DC", country: "USA", lat: 38.9072, lng: -77.0369 },
    { city: "London", country: "UK", lat: 51.5074, lng: -0.1278 },
    { city: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
    { city: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050 },
    { city: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173 },
    { city: "Beijing", country: "China", lat: 39.9042, lng: 116.4074 },
    { city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
    { city: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.9780 },
    { city: "New Delhi", country: "India", lat: 28.6139, lng: 77.2090 },
    { city: "Brasília", country: "Brazil", lat: -15.8267, lng: -47.9218 },
    { city: "Canberra", country: "Australia", lat: -35.2809, lng: 149.1300 },
    { city: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357 },
    { city: "Nairobi", country: "Kenya", lat: -1.2864, lng: 36.8172 },
    { city: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708 },
    { city: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198 },
]

interface ThreatData {
    id: string
    name: string
    severity: string
    type: string
    indicator: string
    source: string
    timestamp: string
}

export default function NetworkMapPage() {
    const globeEl = useRef<any>(null)
    const [mounted, setMounted] = useState(false)
    const [selectedThreat, setSelectedThreat] = useState<any>(null)

    // Fetch active threats
    const { data: threatsData } = useSWR("http://localhost:5000/api/v1/threats/active", fetcher, {
        refreshInterval: 30000,
    })

    useEffect(() => {
        setMounted(true)
    }, [])

    // Auto-rotate globe
    useEffect(() => {
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true
            globeEl.current.controls().autoRotateSpeed = 0.3
        }
    }, [mounted])

    // Map threats to capital cities
    const threatNodes = (threatsData?.threats || []).slice(0, 15).map((threat: ThreatData, idx: number) => {
        const city = CAPITAL_CITIES[idx % CAPITAL_CITIES.length]
        return {
            ...city,
            threat,
            size: threat.severity === 'critical' ? 1.2 : threat.severity === 'high' ? 0.8 : 0.5,
            color: threat.severity === 'critical' ? '#ef4444' : threat.severity === 'high' ? '#f59e0b' : '#eab308'
        }
    })

    // Create arcs between related threats
    const arcsData = threatNodes.slice(0, 10).map((node, idx) => {
        const targetIdx = (idx + 1) % threatNodes.length
        const target = threatNodes[targetIdx]
        return {
            startLat: node.lat,
            startLng: node.lng,
            endLat: target.lat,
            endLng: target.lng,
            color: [node.color, target.color]
        }
    })

    if (!mounted) return <div className="flex items-center justify-center h-screen">Loading 3D Environment...</div>

    return (
        <DashboardLayout title="Global Threat Map">
            <div className="relative h-[calc(100vh-140px)] w-full overflow-hidden rounded-xl border border-border/30 bg-black/90">
                {/* Stats Card */}
                <div className="absolute top-4 left-4 z-10 space-y-4 max-w-xs">
                    <Card className="bg-black/70 backdrop-blur border-border/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <GlobeIcon className="w-5 h-5 text-primary" />
                                Live Threat Intelligence
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Active Threats</span>
                                    <span className="font-mono text-primary">{threatNodes.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Attack Vectors</span>
                                    <span className="font-mono text-red-400">{arcsData.length}</span>
                                </div>
                                <div className="pt-2 space-y-1">
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <span className="text-muted-foreground">Critical</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                        <span className="text-muted-foreground">High</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <span className="text-muted-foreground">Medium</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Selected Threat Details */}
                {selectedThreat && (
                    <div className="absolute top-4 right-4 z-10 max-w-sm">
                        <Card className="bg-black/70 backdrop-blur border-border/30">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-sm font-medium">{selectedThreat.city}</CardTitle>
                                        <p className="text-xs text-muted-foreground">{selectedThreat.country}</p>
                                    </div>
                                    <Badge variant={selectedThreat.threat.severity === 'critical' ? 'destructive' : 'secondary'}>
                                        {selectedThreat.threat.severity.toUpperCase()}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-xs">
                                    <div>
                                        <p className="text-muted-foreground">Threat Name</p>
                                        <p className="font-medium">{selectedThreat.threat.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Indicator</p>
                                        <p className="font-mono text-xs break-all">{selectedThreat.threat.indicator}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Type</p>
                                        <p className="font-medium">{selectedThreat.threat.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Source</p>
                                        <p className="font-medium">{selectedThreat.threat.source}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Globe */}
                {threatNodes.length > 0 ? (
                    <Globe
                        ref={globeEl}
                        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
                        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
                        backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"

                        // Threat nodes
                        pointsData={threatNodes}
                        pointLat="lat"
                        pointLng="lng"
                        pointColor="color"
                        pointAltitude={0.05}
                        pointRadius={(d: any) => d.size}
                        pointLabel={(d: any) => `
                            <div style="background: rgba(0,0,0,0.9); padding: 8px; border-radius: 4px; border: 1px solid #333;">
                                <div style="color: #fff; font-weight: bold; margin-bottom: 4px;">${d.city}, ${d.country}</div>
                                <div style="color: #aaa; font-size: 12px;">${d.threat.name}</div>
                                <div style="color: ${d.color}; font-size: 11px; margin-top: 4px;">Severity: ${d.threat.severity.toUpperCase()}</div>
                            </div>
                        `}
                        onPointClick={(point: any) => setSelectedThreat(point)}

                        // Attack vector arcs
                        arcsData={arcsData}
                        arcColor="color"
                        arcDashLength={0.4}
                        arcDashGap={0.2}
                        arcDashAnimateTime={2000}
                        arcStroke={0.5}
                        arcAltitude={0.2}

                        // Atmosphere
                        atmosphereColor="#3a228a"
                        atmosphereAltitude={0.15}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <AlertTriangle className="w-12 h-12 mb-4" />
                        <p>No threat data available</p>
                        <p className="text-sm">Check backend connection</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
