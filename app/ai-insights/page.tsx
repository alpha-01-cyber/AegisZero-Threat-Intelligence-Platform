// Mohid Umer, M Ahsan, M Saim
// 23i-2130, 23i-2117, 23i-2119
// page.tsx

"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layouts/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Sparkles, Send, StopCircle, RefreshCw, ShieldCheck, AlertTriangle } from "lucide-react"
import ReactMarkdown from "react-markdown"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AIInsightsPage() {
    const searchParams = useSearchParams()
    const ioc = searchParams.get("ioc")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisChunks, setAnalysisChunks] = useState<string[]>([])
    const [statusMessage, setStatusMessage] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)

    // Fetch report data if IOC is present
    const { data: reportData } = useSWR(
        ioc ? `http://localhost:5000/api/v1/threats/reports?ioc=${encodeURIComponent(ioc)}` : null,
        fetcher
    )

    useEffect(() => {
        if (reportData?.report && !isAnalyzing && analysisChunks.length === 0) {
            startAnalysis(reportData.report)
        }
    }, [reportData])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [analysisChunks, statusMessage])

    const startAnalysis = async (report: any) => {
        setIsAnalyzing(true)
        setAnalysisChunks([])
        setStatusMessage("Initializing AI Analyst...")

        try {
            const response = await fetch("http://localhost:5000/api/v1/ai/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ report })
            })

            if (!response.body) throw new Error("No response body")

            const reader = response.body.getReader()
            const decoder = new TextDecoder()

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                const lines = chunk.split("\n")

                for (const line of lines) {
                    if (!line.trim()) continue
                    try {
                        const data = JSON.parse(line)
                        if (data.status === "thinking") {
                            setStatusMessage(data.message)
                        } else if (data.status === "streaming") {
                            setAnalysisChunks(prev => [...prev, data.chunk])
                            setStatusMessage("Generating insights...")
                        } else if (data.status === "done") {
                            setIsAnalyzing(false)
                            setStatusMessage("Analysis Complete")
                        }
                    } catch (e) {
                        console.error("Error parsing chunk:", e)
                    }
                }
            }
        } catch (error) {
            console.error("Analysis failed:", error)
            setStatusMessage("Analysis failed due to connection error.")
            setIsAnalyzing(false)
        }
    }

    return (
        <DashboardLayout title="AI Security Analyst">
            <div className="flex flex-col h-[calc(100vh-140px)] gap-4 animate-in fade-in duration-500">
                {/* Header Section */}
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <Bot className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                Aegis AI Analyst
                                <Badge variant="secondary" className="text-xs font-normal">PRO MODEL</Badge>
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Advanced threat correlation and strategic response generation
                            </p>
                        </div>
                    </div>
                    {ioc && (
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">{ioc}</Badge>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => reportData?.report && startAnalysis(reportData.report)}
                                disabled={isAnalyzing}
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                                Regenerate
                            </Button>
                        </div>
                    )}
                </div>

                {/* Main Chat Area */}
                <Card className="flex-1 overflow-hidden flex flex-col bg-card/50 backdrop-blur border-primary/10">
                    <ScrollArea className="h-full">
                        <div className="p-6 space-y-6 max-w-4xl mx-auto min-h-full">
                            {/* Initial Prompt */}
                            {ioc && (
                                <div className="flex justify-end">
                                    <div className="bg-primary/10 text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                                        <p className="text-sm font-medium text-foreground">
                                            Analyze the threat report for <span className="font-mono bg-background/20 px-1 rounded">{ioc}</span>.
                                            Provide a verdict, technical breakdown, and remediation steps.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* AI Response */}
                            {(analysisChunks.length > 0 || isAnalyzing) && (
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-blue-500/20">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        {/* Thinking Indicator */}
                                        {isAnalyzing && statusMessage !== "Generating insights..." && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                                                <div className="flex gap-1">
                                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                                                </div>
                                                {statusMessage}
                                            </div>
                                        )}

                                        {/* Content */}
                                        {analysisChunks.length > 0 && (
                                            <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 rounded-lg p-6 border border-border/50">
                                                <ReactMarkdown>
                                                    {analysisChunks.join("")}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                        <div ref={scrollRef} />
                                    </div>
                                </div>
                            )}

                            {/* Empty State */}
                            {!ioc && !isAnalyzing && (
                                <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4 opacity-50">
                                    <Bot className="w-16 h-16 text-muted-foreground" />
                                    <h3 className="text-xl font-medium">Ready to Assist</h3>
                                    <p className="text-muted-foreground max-w-md">
                                        Select a report from the dashboard to start an AI-powered deep dive analysis.
                                    </p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Input Area (Visual only for now) */}
                    <div className="p-4 border-t border-border/40 bg-background/50 backdrop-blur">
                        <div className="max-w-4xl mx-auto relative">
                            <input
                                type="text"
                                placeholder="Ask follow-up questions... (Coming Soon)"
                                disabled
                                className="w-full bg-muted/50 border border-border/50 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <Button size="icon" className="absolute right-1 top-1 rounded-full w-8 h-8" disabled>
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-[10px] text-center text-muted-foreground mt-2">
                            AI can make mistakes. Please verify important information.
                        </p>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    )
}
