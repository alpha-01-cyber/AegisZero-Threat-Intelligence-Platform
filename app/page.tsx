// Mohid Umer, M Ahsan, M Saim
// 23i-2130, 23i-2117, 23i-2119
// page.tsx

"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Shield, Globe, Search, FileText, AlertTriangle, ArrowRight, Zap, Map, BarChart3 } from "lucide-react"
import Link from "next/link"
import useSWR from "swr"
import dynamic from "next/dynamic"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { DashboardLayout } from "@/components/layouts/DashboardLayout"
import { LiveThreatFeed } from "@/components/dashboard/LiveThreatFeed"

const DashboardMap = dynamic(() => import("@/components/dashboard/dashboard-map"), { ssr: false })

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DashboardHome() {
  const { data: threatsData } = useSWR("http://localhost:5000/api/v1/threats/active", fetcher, { refreshInterval: 10000 })
  const { data: mapData } = useSWR("http://localhost:5000/api/v1/threat-map", fetcher, { refreshInterval: 10000 })

  const activeThreatsCount = threatsData?.threats?.length || 0
  const highRiskCount = threatsData?.threats?.filter((t: any) => t.severity === 'critical' || t.severity === 'high').length || 0
  const activeNodes = mapData?.total_threats || 0

  return (
    <DashboardLayout title="Command Center">
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
          <div>
            <p className="text-muted-foreground mt-2 text-lg">
              Real-time security monitoring and threat intelligence overview.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/active-threats">
              <Button className="gap-2 shadow-lg shadow-primary/20">
                <Zap className="w-4 h-4" /> View Active Threats
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="outline" className="gap-2">
                <FileText className="w-4 h-4" /> Generate Report
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Threats Card */}
          <Link href="/active-threats" className="block group">
            <Card className="h-full bg-card/50 backdrop-blur border-primary/20 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
                <Activity className="h-4 w-4 text-red-500 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeThreatsCount}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <span className="text-red-500 font-medium">Live</span> detection stream
                </p>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Data Source:</span> AbuseIPDB, VirusTotal
                  </p>
                  <p className="text-xs text-primary/70 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to view detailed threat analysis →
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Critical Risks Card */}
          <Link href="/active-threats?filter=critical" className="block group">
            <Card className="h-full bg-card/50 backdrop-blur border-orange-500/20 transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Risks</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">{highRiskCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Requires immediate attention
                </p>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Data Source:</span> VirusTotal, MITRE ATT&CK
                  </p>
                  <p className="text-xs text-orange-500/70 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to view critical threats →
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Live Threat Feed */}
          <div className="h-full">
            <LiveThreatFeed />
          </div>

          {/* System Status Card */}
          <Link href="/analytics" className="block group">
            <Card className="h-full bg-card/50 backdrop-blur border-green-500/20 transition-all hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Shield className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">Operational</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All systems nominal
                </p>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Data Source:</span> System Health Monitors
                  </p>
                  <p className="text-xs text-green-500/70 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to view analytics dashboard →
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Global Threat Overview Map */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Global Threat Overview</h2>
            <Link href="/network-map">
              <Button variant="ghost" size="sm" className="gap-1">
                View 3D Network Map <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <Card className="bg-card/50 backdrop-blur border-border/30 p-1">
            <DashboardMap />
          </Card>
        </div>

        {/* Quick Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/network-map" className="group">
            <Card className="h-full transition-all hover:border-primary/50 hover:bg-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                  <Map className="w-5 h-5" /> Network Map
                </CardTitle>
                <CardDescription>Interactive 3D visualization of global threats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-black/40 rounded-md flex items-center justify-center border border-border/30 group-hover:border-primary/30 transition-colors">
                  <Globe className="w-12 h-12 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/analytics" className="group">
            <Card className="h-full transition-all hover:border-primary/50 hover:bg-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                  <BarChart3 className="w-5 h-5" /> Analytics
                </CardTitle>
                <CardDescription>Deep dive into threat metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-black/40 rounded-md flex items-center justify-center border border-border/30 group-hover:border-primary/30 transition-colors">
                  <Activity className="w-12 h-12 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/ioc-search" className="group">
            <Card className="h-full transition-all hover:border-primary/50 hover:bg-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                  <Search className="w-5 h-5" /> IOC Search
                </CardTitle>
                <CardDescription>Investigate IPs, domains, and hashes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-black/40 rounded-md flex items-center justify-center border border-border/30 group-hover:border-primary/30 transition-colors">
                  <Search className="w-12 h-12 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
