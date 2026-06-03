// Mohid Umer, M Ahsan, M Saim
// 23i-2130, 23i-2117, 23i-2119
// page.tsx

"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import useSWR from "swr"
import { useNotifications } from "@/contexts/NotificationContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Shield, FileText, Link as LinkIcon, ExternalLink, Activity, Lock, Search, Download, Sparkles } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layouts/DashboardLayout"
import { ReportExportModal } from "@/components/reports/ReportExportModal"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function ReportsContent() {
    const searchParams = useSearchParams()
    const ioc = searchParams.get("ioc")
    const [isExportModalOpen, setIsExportModalOpen] = useState(false)

    const { data, error, isLoading } = useSWR(
        ioc ? `http://localhost:5000/api/v1/threats/reports?ioc=${encodeURIComponent(ioc)}` : null,
        fetcher
    )

    const { addNotification } = useNotifications()
    const report = data?.report

    useEffect(() => {
        if (report) {
            addNotification({
                title: `Report Ready: ${report.ioc}`,
                message: `Threat report for ${report.ioc} (${report.type}) has been generated successfully.`,
                type: 'report',
                link: `/reports?ioc=${report.ioc}`
            })
        }
    }, [report?.ioc, addNotification])

    if (!ioc) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center">
                <FileText className="w-16 h-16 text-muted-foreground" />
                <h1 className="text-2xl font-bold">No Report Selected</h1>
                <p className="text-muted-foreground max-w-md">
                    Please select a threat from the Active Threats page or search for an IOC to view its detailed report.
                </p>
                <div className="flex gap-4">
                    <Link href="/active-threats">
                        <Button variant="outline">Go to Active Threats</Button>
                    </Link>
                    <Link href="/ioc-search">
                        <Button>Go to IOC Search</Button>
                    </Link>
                </div>
            </div>
        )
    }

    if (error) return <div className="p-6 text-red-500">Failed to load report.</div>
    if (isLoading) return <div className="p-6 text-primary">Loading detailed threat report...</div>

    if (!report) return <div className="p-6">Report not found.</div>

    return (
        <DashboardLayout title="Threat Reports">
            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="font-mono">{report.type.toUpperCase()}</Badge>
                            <span className="text-xs text-muted-foreground">Generated: {new Date(report.enriched_at).toLocaleString()}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-primary flex items-center gap-2 font-mono">
                            {report.ioc}
                        </h1>
                        <p className="text-muted-foreground mt-1">{report.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/ai-insights?ioc=${report.ioc}`}>
                            <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20">
                                <Sparkles className="w-4 h-4" />
                                Analyze with AI
                            </Button>
                        </Link>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(true)} className="gap-2">
                            <Download className="w-4 h-4" />
                            Export Report
                        </Button>
                        {report.severity === 'critical' || report.severity === 'high' ? (
                            <Badge variant="destructive" className="text-lg px-4 py-1">
                                {report.severity.toUpperCase()} SEVERITY
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="text-lg px-4 py-1">
                                {report.severity.toUpperCase()} SEVERITY
                            </Badge>
                        )}
                    </div>
                </div>

                <ReportExportModal
                    isOpen={isExportModalOpen}
                    onClose={() => setIsExportModalOpen(false)}
                    report={report}
                />

                {/* Main Content */}
                <Tabs defaultValue="mitre" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="mitre">MITRE ATT&CK Matrix</TabsTrigger>
                        <TabsTrigger value="analysis">Technical Analysis</TabsTrigger>
                        <TabsTrigger value="remediation">Remediation</TabsTrigger>
                    </TabsList>

                    <TabsContent value="mitre" className="space-y-4">
                        <Card className="border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary" />
                                    MITRE ATT&CK Mapping
                                </CardTitle>
                                <CardDescription>
                                    Observed tactics and techniques associated with this threat
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {report.mitreTactics?.map((tactic: any) => (
                                        <Card key={tactic.id} className="bg-muted/30 border-border/50">
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <Badge variant="outline" className="bg-background">{tactic.id}</Badge>
                                                    <span className="text-xs font-medium text-primary">{tactic.tactic}</span>
                                                </div>
                                                <CardTitle className="text-base mt-2">{tactic.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-sm text-muted-foreground">
                                                <p className="mb-3">{tactic.description}</p>
                                                <a
                                                    href={tactic.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline flex items-center gap-1 text-xs"
                                                >
                                                    View on MITRE <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analysis" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Search className="w-5 h-5 text-primary" />
                                        Real-time API Analysis
                                    </CardTitle>
                                    <CardDescription>
                                        Cross-referenced results from multiple intelligence feeds
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {Object.entries(report.sources || {}).map(([source, details]: [string, any]) => (
                                            <div key={source} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-background p-2 rounded-full">
                                                        <Shield className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium capitalize">{source.replace('_', ' ')}</p>
                                                        <p className="text-xs text-muted-foreground">Source Reliability: High</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Badge variant={details.threat_count > 0 ? "destructive" : "outline"} className="mb-1">
                                                        {details.threat_count > 0 ? "MALICIOUS" : "CLEAN"}
                                                    </Badge>
                                                    <p className="text-xs text-muted-foreground">
                                                        {details.threat_count > 0 ? "Threat Detected" : "No matches found"}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {Object.keys(report.sources || {}).length === 0 && (
                                            <div className="text-center p-4 text-muted-foreground">
                                                No external intelligence sources available.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Indicators</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {report.indicators?.map((indicator: string) => (
                                            <Badge key={indicator} variant="secondary" className="font-mono">
                                                {indicator}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="remediation" className="space-y-4">
                        <Card className="border-green-500/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-green-500" />
                                    Recommended Actions
                                </CardTitle>
                                <CardDescription>Steps to mitigate this threat</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {report.recommendations?.map((rec: string, index: number) => (
                                        <li key={index} className="flex items-start gap-3 p-3 bg-green-500/5 rounded-lg border border-green-500/10">
                                            <div className="mt-0.5 bg-green-500/20 p-1 rounded-full">
                                                <Shield className="w-3 h-3 text-green-500" />
                                            </div>
                                            <span className="text-sm">{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}

export default function ReportsPage() {
    return (
        <Suspense fallback={<div className="p-6 text-primary">Loading reports...</div>}>
            <ReportsContent />
        </Suspense>
    )
}
