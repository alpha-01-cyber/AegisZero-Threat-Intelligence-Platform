// Mohid Umer, M Ahsan, M Saim
// 23i-2130, 23i-2117, 23i-2119
// LiveThreatFeed.tsx

"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, ShieldAlert, Globe, Clock } from "lucide-react"
import useSWR from "swr"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function LiveThreatFeed() {
    const { data } = useSWR("http://localhost:5000/api/v1/threats/active", fetcher, { refreshInterval: 5000 })
    const threats = data?.threats || []

    return (
        <Card className="h-full bg-card/50 backdrop-blur border-blue-500/20 transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
                        Live Threat Feed
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Real-time detection stream
                    </CardDescription>
                </div>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    {threats.length} Active
                </Badge>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[180px] px-6 pb-4">
                    <div className="space-y-4 pt-2">
                        {threats.length === 0 ? (
                            <div className="text-center text-muted-foreground text-xs py-8">
                                No active threats detected in real-time stream.
                            </div>
                        ) : (
                            threats.slice(0, 10).map((threat: any, i: number) => (
                                <Link href={`/reports?ioc=${threat.id}`} key={i} className="block group">
                                    <div className="flex items-start justify-between gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                                        <div className="flex items-start gap-2 overflow-hidden">
                                            <ShieldAlert className={`w-3 h-3 mt-1 flex-shrink-0 ${threat.severity === 'critical' ? 'text-red-500' :
                                                    threat.severity === 'high' ? 'text-orange-500' : 'text-yellow-500'
                                                }`} />
                                            <div className="truncate">
                                                <p className="text-xs font-medium truncate font-mono group-hover:text-primary transition-colors">
                                                    {threat.id}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Globe className="w-2 h-2" /> {threat.location?.city || 'Unknown'}, {threat.location?.country || 'Global'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <Badge variant="secondary" className="text-[10px] h-4 px-1">
                                                {threat.type}
                                            </Badge>
                                            <p className="text-[10px] text-muted-foreground mt-1 flex items-center justify-end gap-1">
                                                <Clock className="w-2 h-2" /> {new Date(threat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </ScrollArea>
                <div className="p-3 border-t border-border/50 bg-muted/20">
                    <p className="text-[10px] text-muted-foreground text-center">
                        Streaming data from OTX, AbuseIPDB & VirusTotal
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
