// Mohid Umer, M Ahsan, M Saim
// 23i-2130, 23i-2117, 23i-2119
// page.tsx

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { DashboardLayout } from "@/components/layouts/DashboardLayout"
import { PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts"

export default function IOCSearchPage() {
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<any[]>([])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        setLoading(true)
        setResults([])

        try {
            const iocs = query.split(/[\s,]+/).filter(Boolean)

            const response = await fetch("http://localhost:5000/api/v1/enrich", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ iocs }),
            })

            const data = await response.json()

            if (response.ok) {
                setResults(data.results)
                if (data.results.length === 0) {
                    toast.info("No results found for the provided IOCs.")
                }
            } else {
                toast.error(data.message || "Failed to enrich IOCs")
            }
        } catch (error) {
            toast.error("Network error. Ensure backend is running.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout title="IOC Search">
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                        <Search className="w-8 h-8" />
                        IOC Search & Analysis
                    </h1>
                    <p className="text-muted-foreground">
                        Enter IP addresses, domains, or file hashes to check against real-time threat intelligence feeds.
                    </p>
                </div>

                <Card className="border-primary/20 shadow-lg shadow-primary/5">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <Input
                                placeholder="Enter IOCs (e.g., 8.8.8.8, example.com, d41d8cd98f00b204e9800998ecf8427e)"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-1 font-mono"
                            />
                            <Button type="submit" disabled={loading} className="w-32">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="grid gap-4">
                    {results.map((result, index) => (
                        <Card key={index} className="overflow-hidden border-l-4 border-l-primary">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="font-mono text-xl">{result.value}</CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline">{result.type.toUpperCase()}</Badge>
                                            {result.geolocation && (
                                                <span className="text-xs text-muted-foreground">
                                                    {result.geolocation.city}, {result.geolocation.country}
                                                </span>
                                            )}
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        {result.impact_analysis?.severity === 'critical' || result.impact_analysis?.severity === 'high' ? (
                                            <Badge variant="destructive" className="animate-pulse">
                                                {result.impact_analysis.severity.toUpperCase()} RISK
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                {result.impact_analysis?.severity?.toUpperCase() || 'UNKNOWN'}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-2">
                                        <p className="font-medium text-muted-foreground">Threat Intelligence Sources</p>
                                        <div className="flex flex-col gap-2">
                                            {Object.entries(result.sources || {}).map(([source, details]: [string, any]) => (
                                                <div key={source} className="flex items-center justify-between text-xs bg-muted/50 p-2 rounded border border-border/50">
                                                    <span className="capitalize font-medium">{source}</span>
                                                    <Badge variant={details.threat_count > 0 ? "destructive" : "outline"} className="h-5 px-2">
                                                        {details.threat_count > 0 ? "Malicious" : "Clean"}
                                                    </Badge>
                                                </div>
                                            ))}
                                            {Object.keys(result.sources || {}).length === 0 && (
                                                <span className="text-muted-foreground italic">No matches found in connected feeds</span>
                                            )}
                                        </div>

                                        {/* TLD Risk Warning for domains */}
                                        {result.type === 'domain' && result.sources?.tld_risk?.warning && (
                                            <div className={`mt-2 p-2 rounded border text-xs ${result.sources.tld_risk.risk_level === 'critical'
                                                    ? 'bg-red-500/10 border-red-500/50 text-red-400'
                                                    : result.sources.tld_risk.risk_level === 'high'
                                                        ? 'bg-orange-500/10 border-orange-500/50 text-orange-400'
                                                        : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400'
                                                }`}>
                                                <strong>⚠️ TLD Risk ({result.sources.tld_risk.risk_score}/100):</strong> {result.sources.tld_risk.warning}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <p className="font-medium text-muted-foreground">Impact Analysis</p>

                                        {/* Vendor Detection Pie Chart - ALWAYS SHOW */}
                                        <div className="space-y-2">
                                            <p className="text-xs text-muted-foreground">Vendor Detection Breakdown</p>
                                            <ResponsiveContainer width="100%" height={180}>
                                                <PieChart>
                                                    <Pie
                                                        data={result.impact_analysis?.chart_data?.vendor_analysis || [{ name: 'No Data', value: 1, fill: '#6b7280' }]}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                        outerRadius={60}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        {(result.impact_analysis?.chart_data?.vendor_analysis || []).map((entry: any, idx: number) => (
                                                            <Cell key={`cell-${idx}`} fill={entry.fill} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* Threat Confidence Gauge - ALWAYS SHOW */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-muted-foreground">Threat Confidence</p>
                                                <span className="text-lg font-bold">
                                                    {result.impact_analysis?.chart_data?.confidence_score || 0}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2.5">
                                                <div
                                                    className="h-2.5 rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${result.impact_analysis?.chart_data?.confidence_score || 0}%`,
                                                        background: (result.impact_analysis?.chart_data?.confidence_score || 0) > 70
                                                            ? 'linear-gradient(to right, #ef4444, #dc2626)'
                                                            : (result.impact_analysis?.chart_data?.confidence_score || 0) > 40
                                                                ? 'linear-gradient(to right, #f59e0b, #d97706)'
                                                                : 'linear-gradient(to right, #10b981, #059669)'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Source Comparison Radar - ALWAYS SHOW */}
                                        {result.impact_analysis?.chart_data?.source_comparison?.length >= 3 && (
                                            <div className="space-y-2">
                                                <p className="text-xs text-muted-foreground">Multi-Source Analysis</p>
                                                <ResponsiveContainer width="100%" height={180}>
                                                    <RadarChart data={result.impact_analysis.chart_data.source_comparison}>
                                                        <PolarGrid stroke="#374151" />
                                                        <PolarAngleAxis dataKey="source" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                                        <Radar name="Threat Score" dataKey="score" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                                                        <Tooltip />
                                                    </RadarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/20 flex justify-end py-3">
                                <Link href={`/reports?ioc=${encodeURIComponent(result.value)}`}>
                                    <Button variant="ghost" size="sm" className="gap-2 hover:text-primary">
                                        View Detailed Report <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    )
}
