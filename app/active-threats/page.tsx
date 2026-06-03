// Mohid Umer, M Ahsan, M Saim
// 23i-2130, 23i-2117, 23i-2119
// page.tsx

"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Shield, ExternalLink, Activity, Server, Globe } from "lucide-react"
import { DashboardLayout } from "@/components/layouts/DashboardLayout"
import { CenteredLoading } from "@/components/ui/CenteredLoading"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Threat {
    id: string
    name: string
    severity: "critical" | "high" | "medium" | "low"
    type: string
    timestamp: string
    description: string
    indicator: string
    source: string
}

export default function ActiveThreatsPage() {
    const { data, error, isLoading } = useSWR("http://localhost:5000/api/v1/threats/active", fetcher, {
        refreshInterval: 30000,
    })

    const { data: historyData } = useSWR("http://localhost:5000/api/v1/threats/history", fetcher, {
        refreshInterval: 60000,
    })

    const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null)

    if (error) return <DashboardLayout title="Active Threats"><CenteredLoading message="Failed to load. Ensure backend is running." /></DashboardLayout>
    if (isLoading) return <DashboardLayout title="Active Threats"><CenteredLoading message="Loading threats..." /></DashboardLayout>

    const threats: Threat[] = data?.threats || []
    const history: Threat[] = historyData?.history || []

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "critical": return "bg-red-500/20 text-red-500 border-red-500/50"
            case "high": return "bg-orange-500/20 text-orange-500 border-orange-500/50"
            case "medium": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
            case "low": return "bg-blue-500/20 text-blue-500 border-blue-500/50"
            default: return "bg-gray-500/20 text-gray-500 border-gray-500/50"
        }
    }

    const getSourceUrl = (source: string, indicator: string) => {
        const isIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(indicator)
        const isHash = /^[a-fA-F0-9]{32,64}$/.test(indicator)
        const isPulseID = /^[a-fA-F0-9]{24}$/.test(indicator)
        const isDomain = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(indicator)
        const isURL = indicator.startsWith('http://') || indicator.startsWith('https://')

        if (source.toLowerCase().includes('threatfox')) {
            return `https://threatfox.abuse.ch/browse.php?search=ioc%3A${encodeURIComponent(indicator)}`
        } else if (source.toLowerCase().includes('otx') || source.toLowerCase().includes('alienvault')) {
            if (isPulseID) return `https://otx.alienvault.com/pulse/${indicator}`
            if (isIP) return `https://otx.alienvault.com/indicator/ip/${indicator}`
            if (isHash) return `https://otx.alienvault.com/indicator/file/${indicator}`
            if (isDomain) return `https://otx.alienvault.com/indicator/domain/${indicator}`
            if (isURL) return `https://otx.alienvault.com/indicator/url/${encodeURIComponent(indicator)}`
            return `https://otx.alienvault.com/browse/global/pulses?q=${encodeURIComponent(indicator)}`
        } else if (source.toLowerCase().includes('abuseipdb')) {
            return isIP ? `https://www.abuseipdb.com/check/${indicator}` : 'https://www.abuseipdb.com/'
        } else if (source.toLowerCase().includes('virustotal')) {
            if (isIP) return `https://www.virustotal.com/gui/ip-address/${indicator}`
            if (isHash) return `https://www.virustotal.com/gui/file/${indicator}`
            if (isDomain) return `https://www.virustotal.com/gui/domain/${indicator}`
            if (isURL) return `https://www.virustotal.com/gui/url/${encodeURIComponent(indicator)}`
            return `https://www.virustotal.com/gui/search/${encodeURIComponent(indicator)}`
        }
        return `https://www.google.com/search?q=${encodeURIComponent(source + " " + indicator)}`
    }

    const isRealTime = (timestamp: string) => {
        const threatTime = new Date(timestamp).getTime()
        const now = new Date().getTime()
        return (now - threatTime) < 1000 * 60 * 60
    }

    const ThreatCard = ({ threat }: { threat: Threat }) => (
        <Dialog key={threat.id}>
            <DialogTrigger asChild>
                <Card className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 group h-full" onClick={() => setSelectedThreat(threat)}>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-2">
                                <Badge className={getSeverityColor(threat.severity)} variant="outline">
                                    {threat.severity.toUpperCase()}
                                </Badge>
                                {isRealTime(threat.timestamp) && (
                                    <Badge variant="default" className="bg-red-500 hover:bg-red-600 animate-pulse">LIVE</Badge>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-muted-foreground font-mono">
                                    {new Date(threat.timestamp).toLocaleTimeString()}
                                </div>
                                <div className="text-xs text-muted-foreground/70">
                                    {new Date(threat.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>
                        </div>
                        <CardTitle className="text-lg mt-2 group-hover:text-primary transition-colors truncate">{threat.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{threat.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Server className="w-4 h-4" />
                            <span className="font-mono truncate">{threat.indicator}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Globe className="w-4 h-4" />
                            <span>{threat.source}</span>
                        </div>
                    </CardContent>
                </Card>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <Shield className="w-6 h-6 text-primary" />
                        {threat.name}
                    </DialogTitle>
                    <DialogDescription>Detailed threat analysis and context</DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto flex-1 pr-2">
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Severity</p>
                                <Badge className={getSeverityColor(threat.severity)} variant="outline">{threat.severity.toUpperCase()}</Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Type</p>
                                <p className="text-foreground">{threat.type}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Source</p>
                                <p className="text-foreground">{threat.source}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Detected At</p>
                                <p className="text-foreground">{new Date(threat.timestamp).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Indicator (IOC)</p>
                            <div className="p-3 bg-muted/50 rounded-md font-mono text-sm break-all border border-border/50">{threat.indicator}</div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Description</p>
                            <p className="text-sm text-foreground leading-relaxed">{threat.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end pt-4 border-t border-border/30">
                            <a href={getSourceUrl(threat.source, threat.indicator)} target="_blank" rel="noopener noreferrer" className="inline-flex">
                                <Button variant="outline" className="gap-2 flex-1">
                                    <Globe className="w-4 h-4" />
                                    Visit Source
                                    <ExternalLink className="w-3 h-3" />
                                </Button>
                            </a>

                            <a href={`https://www.google.com/search?q=${encodeURIComponent(threat.indicator + " threat intelligence")}`} target="_blank" rel="noopener noreferrer" className="inline-flex">
                                <Button variant="outline" className="gap-2 flex-1">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Search Google
                                    <ExternalLink className="w-3 h-3" />
                                </Button>
                            </a>

                            <Link href={`/reports?ioc=${encodeURIComponent(threat.indicator)}`}>
                                <Button className="gap-2 flex-1">
                                    <Shield className="w-4 h-4" />
                                    View Report
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )

    return (
        <DashboardLayout title="Active Threats">
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                            <Activity className="w-8 h-8" />
                            Active Threats
                        </h1>
                        <p className="text-muted-foreground">Real-time threat monitoring from ThreatFox & Global Sensors</p>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="bg-background/50 backdrop-blur">{threats.length} Active Detected</Badge>
                    </div>
                </div>

                <Tabs defaultValue="live" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="live">Live Feed</TabsTrigger>
                        <TabsTrigger value="history">Threat History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="live" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {threats.map((threat) => (
                                <ThreatCard key={threat.id} threat={threat} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Historical Threat Log</CardTitle>
                                <CardDescription>Archive of detected threats from this session.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {history.slice().reverse().map((threat) => (
                                        <ThreatCard key={`hist-${threat.id}`} threat={threat} />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}
