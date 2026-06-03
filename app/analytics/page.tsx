// Mohid Umer, M Ahsan, M Saim
// 23i-2130, 23i-2117, 23i-2119
// page.tsx

"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts"
import { Activity, TrendingUp, ShieldAlert, Globe, Database } from "lucide-react"
import { DashboardLayout } from "@/components/layouts/DashboardLayout"
import { CenteredLoading } from "@/components/ui/CenteredLoading"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AnalyticsPage() {
    const { data, error, isLoading } = useSWR("http://localhost:5000/api/v1/analytics", fetcher, {
        refreshInterval: 30000,
    })

    if (error) return <DashboardLayout title="Security Analytics"><CenteredLoading message="Failed to load analytics. Ensure backend is running." /></DashboardLayout>
    if (isLoading) return <DashboardLayout title="Security Analytics"><CenteredLoading message="Loading analytics data..." /></DashboardLayout>

    const { threat_distribution, severity_breakdown, ioc_types, source_distribution } = data

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black border border-border/50 p-3 rounded-lg shadow-xl">
                    <p className="text-white font-bold mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm">
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            )
        }
        return null
    }

    const IOCTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const total = ioc_types.reduce((acc: number, curr: any) => acc + curr.count, 0);
            const percentage = ((data.count / total) * 100).toFixed(1);

            return (
                <div className="bg-black border border-border/50 p-3 rounded-lg shadow-xl">
                    <p className="text-white font-bold mb-1">{data.type}</p>
                    <div className="space-y-1 text-sm">
                        <p className="text-gray-300">Count: <span className="text-white font-mono">{data.count}</span></p>
                        <p className="text-gray-300">Share: <span className="text-white font-mono">{percentage}%</span></p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {data.type === 'IP' && "Malicious IP addresses from botnets/scanners"}
                            {data.type === 'Domain' && "Phishing & malware distribution domains"}
                            {data.type === 'Hash' && "Known malware file signatures"}
                            {data.type === 'URL' && "Specific malicious web pages"}
                        </p>
                    </div>
                </div>
            )
        }
        return null
    }

    return (
        <DashboardLayout title="Security Analytics">
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                            <TrendingUp className="w-8 h-8" />
                            Security Analytics
                        </h1>
                        <p className="text-muted-foreground">Comprehensive threat intelligence metrics and trends</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Threat Distribution Trend */}
                    <Card className="bg-card/50 backdrop-blur border-border/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                Threat Distribution (24h)
                            </CardTitle>
                            <CardDescription>
                                Real-time detection volume.
                                <span className="block text-xs text-primary mt-1">Data Source: AlienVault OTX & Active Feeds</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={threat_distribution}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ff4757" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#ff4757" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="time" stroke="#888888" fontSize={12} />
                                        <YAxis stroke="#888888" fontSize={12} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="count" stroke="#ff4757" fillOpacity={1} fill="url(#colorCount)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Severity Breakdown */}
                    <Card className="bg-card/50 backdrop-blur border-border/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-primary" />
                                Severity Breakdown
                            </CardTitle>
                            <CardDescription>Distribution of threats by severity level</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={severity_breakdown} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                                        <XAxis type="number" stroke="#888888" fontSize={12} />
                                        <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} width={80} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                                            {severity_breakdown.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* IOC Types */}
                    <Card className="bg-card/50 backdrop-blur border-border/30">
                        <CardHeader>
                            <CardTitle>IOC Type Distribution</CardTitle>
                            <CardDescription>Breakdown of indicators of compromise</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={ioc_types}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="count"
                                        >
                                            {ioc_types.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<IOCTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Threats by Capital City (Matches Network Map) */}
                    <Card className="bg-card/50 backdrop-blur border-border/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="w-5 h-5 text-primary" />
                                Threats by Capital City
                            </CardTitle>
                            <CardDescription>Volume of active threats monitored in major capitals</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.capital_threats || []} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                                        <XAxis type="number" stroke="#888888" fontSize={12} />
                                        <YAxis dataKey="city" type="category" stroke="#888888" fontSize={12} width={100} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="threats" fill="#f59e0b" radius={[0, 4, 4, 0]}>
                                            {(data.capital_threats || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
