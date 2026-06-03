// Mohid Umer, M Ahsan, M Saim
// 23i-2130, 23i-2117, 23i-2119
// dashboard-map.tsx

"use client"

import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useState } from "react"
import L from "leaflet"
import { Activity, AlertTriangle, Shield, MapPin, Globe2 } from "lucide-react"

// 20 Major World Capitals with Accurate Coordinates
const WORLD_CAPITALS = [
    { city: "Washington D.C.", country: "United States", lat: 38.9072, lon: -77.0369 },
    { city: "Beijing", country: "China", lat: 39.9042, lon: 116.4074 },
    { city: "Moscow", country: "Russia", lat: 55.7558, lon: 37.6173 },
    { city: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
    { city: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278 },
    { city: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
    { city: "Berlin", country: "Germany", lat: 52.5200, lon: 13.4050 },
    { city: "New Delhi", country: "India", lat: 28.6139, lon: 77.2090 },
    { city: "Brasília", country: "Brazil", lat: -15.8267, lon: -47.9218 },
    { city: "Canberra", country: "Australia", lat: -35.2809, lon: 149.1300 },
    { city: "Ottawa", country: "Canada", lat: 45.4215, lon: -75.6972 },
    { city: "Seoul", country: "South Korea", lat: 37.5665, lon: 126.9780 },
    { city: "Mexico City", country: "Mexico", lat: 19.4326, lon: -99.1332 },
    { city: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357 },
    { city: "Ankara", country: "Turkey", lat: 39.9334, lon: 32.8597 },
    { city: "Jakarta", country: "Indonesia", lat: -6.2088, lon: 106.8456 },
    { city: "Buenos Aires", country: "Argentina", lat: -34.6037, lon: -58.3816 },
    { city: "Riyadh", country: "Saudi Arabia", lat: 24.7136, lon: 46.6753 },
    { city: "Pretoria", country: "South Africa", lat: -25.7479, lon: 28.2293 },
    { city: "Rome", country: "Italy", lat: 41.9028, lon: 12.4964 },
]

interface ThreatData {
    country: string
    severity: string
    count: number
    threat_type?: string
    ioc?: string
    description?: string
}

interface CapitalWithThreat {
    city: string
    country: string
    lat: number
    lon: number
    threat?: ThreatData
    hasThreat: boolean
}

function MapController() {
    const map = useMap()

    useEffect(() => {
        // Lock zoom completely
        map.setMinZoom(2)
        map.setMaxZoom(2)
        map.setZoom(2)

        // Prevent zooming
        map.on('zoomstart', () => map.setZoom(2))

        // Set bounds to prevent repetition
        const bounds = L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180))
        map.setMaxBounds(bounds)
        map.on('drag', () => map.panInsideBounds(bounds, { animate: false }))
    }, [map])

    return null
}

function getSeverityColor(severity?: string): string {
    if (!severity) return '#6b7280' // Gray for no threat

    switch (severity.toLowerCase()) {
        case 'critical': return '#ef4444'
        case 'high': return '#f97316'
        case 'medium': return '#eab308'
        case 'low': return '#3b82f6'
        default: return '#6b7280'
    }
}

function getSeverityIcon(severity?: string) {
    if (!severity) return <Shield className="w-5 h-5 text-gray-400" />

    switch (severity.toLowerCase()) {
        case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />
        case 'high': return <Activity className="w-5 h-5 text-orange-500" />
        case 'medium': return <Activity className="w-5 h-5 text-yellow-500" />
        default: return <Shield className="w-5 h-5 text-blue-500" />
    }
}

export default function DashboardMap() {
    const [capitals, setCapitals] = useState<CapitalWithThreat[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchThreats = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/v1/world-map-threats")
                const data = await response.json()

                // Create a map of country -> threat data
                const threatMap = new Map<string, ThreatData>()
                    ; (data.threats || []).forEach((threat: any) => {
                        threatMap.set(threat.country, threat)
                    })

                // Match capitals with threat data
                const capitalsWithThreats: CapitalWithThreat[] = WORLD_CAPITALS.map(capital => {
                    const threat = threatMap.get(capital.country)
                    return {
                        ...capital,
                        threat: threat,
                        hasThreat: !!threat
                    }
                })

                console.log("🗺️ Capitals loaded:", capitalsWithThreats)
                setCapitals(capitalsWithThreats)
                setLoading(false)
            } catch (err) {
                console.error("❌ Failed to fetch threats:", err)
                // Load capitals without threat data
                const capitalsWithoutThreats = WORLD_CAPITALS.map(capital => ({
                    ...capital,
                    hasThreat: false
                }))
                setCapitals(capitalsWithoutThreats)
                setLoading(false)
            }
        }

        fetchThreats()
        const interval = setInterval(fetchThreats, 30000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="h-[600px] w-full rounded-lg overflow-hidden border border-border/20 relative">
            <MapContainer
                center={[20, 0]}
                zoom={2}
                zoomControl={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                touchZoom={false}
                dragging={true}
                keyboard={false}
                boxZoom={false}
                style={{
                    height: "100%",
                    width: "100%",
                    background: "transparent"
                }}
                className="z-0"
                worldCopyJump={false}
                maxBounds={[[-90, -180], [90, 180]]}
                maxBoundsViscosity={1.0}
            >
                <MapController />

                {/* Map tiles - fills entire container */}
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    noWrap={true}
                    bounds={[[-85, -180], [85, 180]]}
                    minZoom={2}
                    maxZoom={2}
                />

                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-[1000] backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe2 className="w-4 h-4 animate-spin" />
                            <span>Loading global threat map...</span>
                        </div>
                    </div>
                )}

                {/* Render capital city markers */}
                {capitals.map((capital, idx) => {
                    const color = getSeverityColor(capital.threat?.severity)
                    const isActive = capital.hasThreat

                    return (
                        <CircleMarker
                            key={`${capital.city}-${idx}`}
                            center={[capital.lat, capital.lon]}
                            radius={isActive ? 8 : 5}
                            pathOptions={{
                                color: color,
                                fillColor: color,
                                fillOpacity: isActive ? 0.8 : 0.3,
                                weight: isActive ? 2 : 1,
                                opacity: isActive ? 1 : 0.4
                            }}
                            eventHandlers={{
                                mouseover: (e) => {
                                    e.target.setStyle({
                                        fillOpacity: 1,
                                        weight: 3,
                                        radius: isActive ? 10 : 7
                                    })
                                },
                                mouseout: (e) => {
                                    e.target.setStyle({
                                        fillOpacity: isActive ? 0.8 : 0.3,
                                        weight: isActive ? 2 : 1,
                                        radius: isActive ? 8 : 5
                                    })
                                }
                            }}
                        >
                            <Popup className="custom-popup" maxWidth={300}>
                                <div className="p-4 min-w-[280px] bg-gradient-to-br from-background via-background to-background/95 backdrop-blur-xl rounded-xl border border-border/50 shadow-2xl">
                                    {/* Header with gradient */}
                                    <div className="mb-3 pb-3 border-b border-border/40">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                <div>
                                                    <h3 className="font-bold text-base text-foreground">{capital.city}</h3>
                                                    <p className="text-xs text-muted-foreground">{capital.country}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getSeverityIcon(capital.threat?.severity)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Threat Status */}
                                    <div className="space-y-2.5">
                                        {capital.hasThreat ? (
                                            <>
                                                {/* Severity Badge */}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-muted-foreground">Threat Level</span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${capital.threat?.severity === 'critical' ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30' :
                                                            capital.threat?.severity === 'high' ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/30' :
                                                                capital.threat?.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/30' :
                                                                    'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30'
                                                        }`}>
                                                        {capital.threat?.severity || 'N/A'}
                                                    </span>
                                                </div>

                                                {/* Threat Count */}
                                                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-accent/30">
                                                    <span className="text-sm text-muted-foreground">Active Threats</span>
                                                    <span className="text-lg font-bold text-foreground">{capital.threat?.count || 0}</span>
                                                </div>

                                                {/* Threat Type */}
                                                {capital.threat?.threat_type && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Type</span>
                                                        <span className="text-sm font-medium text-foreground capitalize">{capital.threat.threat_type}</span>
                                                    </div>
                                                )}

                                                {/* IOC */}
                                                {capital.threat?.ioc && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">IOC</span>
                                                        <code className="text-xs font-mono text-foreground bg-accent/30 px-2 py-1 rounded">
                                                            {capital.threat.ioc}
                                                        </code>
                                                    </div>
                                                )}

                                                {/* Description */}
                                                {capital.threat?.description && (
                                                    <div className="mt-3 pt-3 border-t border-border/30">
                                                        <p className="text-xs text-muted-foreground italic leading-relaxed">
                                                            {capital.threat.description}
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="py-4 text-center">
                                                <Shield className="w-8 h-8 mx-auto mb-2 text-green-500/50" />
                                                <p className="text-sm font-medium text-green-500/80">No Active Threats</p>
                                                <p className="text-xs text-muted-foreground mt-1">This region is currently secure</p>
                                            </div>
                                        )}

                                        {/* Coordinates */}
                                        <div className="mt-3 pt-3 border-t border-border/30">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">Coordinates</span>
                                                <span className="font-mono text-muted-foreground">
                                                    {capital.lat.toFixed(4)}°, {capital.lon.toFixed(4)}°
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-3 pt-3 border-t border-border/30">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Data Source</span>
                                            <span className="font-medium">AbuseIPDB | VirusTotal</span>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    )
                })}
            </MapContainer>

            {/* Enhanced Legend */}
            <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl p-4 z-[1000] shadow-2xl min-w-[180px]">
                <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-primary" />
                    <h4 className="font-bold text-sm">Threat Levels</h4>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-red-500 ring-2 ring-red-500/30"></div>
                        <span className="text-xs font-medium">Critical</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-orange-500 ring-2 ring-orange-500/30"></div>
                        <span className="text-xs font-medium">High</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-yellow-500 ring-2 ring-yellow-500/30"></div>
                        <span className="text-xs font-medium">Medium</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-blue-500 ring-2 ring-blue-500/30"></div>
                        <span className="text-xs font-medium">Low</span>
                    </div>
                    <div className="flex items-center gap-3 opacity-50">
                        <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                        <span className="text-xs font-medium">No Threat</span>
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border/30">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Capitals</span>
                        <span className="font-bold text-foreground">{capitals.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                        <span>Active</span>
                        <span className="font-bold text-primary">{capitals.filter(c => c.hasThreat).length}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
