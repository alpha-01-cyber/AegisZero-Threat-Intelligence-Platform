// Mohid Umer, M Ahsan, M Saim
// 23i-2130, 23i-2117, 23i-2119
// ReportExportModal.tsx

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Table, FileType, Download, Check } from "lucide-react"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table as DocxTable, TableRow, TableCell, WidthType, BorderStyle } from "docx"
import { saveAs } from "file-saver"

interface ReportExportModalProps {
    isOpen: boolean
    onClose: () => void
    report: any
}

export function ReportExportModal({ isOpen, onClose, report }: ReportExportModalProps) {
    const [fileName, setFileName] = useState(`Threat_Report_${report?.ioc || 'IOC'}`)
    const [format, setFormat] = useState<"xlsx" | "pdf" | "docx">("xlsx")
    const [isExporting, setIsExporting] = useState(false)

    if (!report) return null

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const finalFileName = `${fileName}.${format}`

            if (format === "xlsx") {
                exportXLSX(finalFileName)
            } else if (format === "pdf") {
                exportPDF(finalFileName)
            } else if (format === "docx") {
                await exportDOCX(finalFileName)
            }
            onClose()
        } catch (error) {
            console.error("Export failed:", error)
        } finally {
            setIsExporting(false)
        }
    }

    const exportXLSX = (fileName: string) => {
        const wb = XLSX.utils.book_new()

        // Sheet 1: Summary
        const summaryData = [
            ["Threat Intelligence Report"],
            ["Generated At", new Date().toLocaleString()],
            [""],
            ["Indicator", report.ioc],
            ["Type", report.type.toUpperCase()],
            ["Severity", report.severity.toUpperCase()],
            ["Description", report.description],
            ["Verdict", report.severity === 'critical' || report.severity === 'high' ? "MALICIOUS" : "SUSPICIOUS/CLEAN"]
        ]
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
        XLSX.utils.book_append_sheet(wb, wsSummary, "Summary")

        // Sheet 2: Technical Analysis
        const sourceData = [["Source", "Status", "Verdict", "Threat Count", "Tags"]]
        Object.entries(report.sources || {}).forEach(([source, details]: [string, any]) => {
            sourceData.push([
                source.toUpperCase(),
                details.status || "N/A",
                details.verdict || "N/A",
                details.threat_count || 0,
                (details.tags || []).join(", ")
            ])
        })
        const wsAnalysis = XLSX.utils.aoa_to_sheet(sourceData)
        XLSX.utils.book_append_sheet(wb, wsAnalysis, "Analysis")

        // Sheet 3: MITRE
        const mitreData = [["Tactic", "ID", "Name", "Description"]]
        report.mitreTactics?.forEach((tactic: any) => {
            mitreData.push([tactic.tactic, tactic.id, tactic.name, tactic.description])
        })
        const wsMitre = XLSX.utils.aoa_to_sheet(mitreData)
        XLSX.utils.book_append_sheet(wb, wsMitre, "MITRE")

        // Sheet 4: Remediation
        const remData = [["Recommended Actions"]]
        report.recommendations?.forEach((rec: string) => remData.push([rec]))
        const wsRem = XLSX.utils.aoa_to_sheet(remData)
        XLSX.utils.book_append_sheet(wb, wsRem, "Remediation")

        XLSX.writeFile(wb, fileName)
    }

    const exportPDF = (fileName: string) => {
        const doc = new jsPDF()

        // Header
        doc.setFontSize(20)
        doc.setTextColor(220, 38, 38) // Red
        doc.text("Threat Intelligence Report", 14, 20)

        doc.setFontSize(10)
        doc.setTextColor(100)
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28)

        // Summary Table
        autoTable(doc, {
            startY: 35,
            head: [['Attribute', 'Value']],
            body: [
                ['Indicator', report.ioc],
                ['Type', report.type.toUpperCase()],
                ['Severity', report.severity.toUpperCase()],
                ['Verdict', report.severity === 'critical' || report.severity === 'high' ? "MALICIOUS" : "SUSPICIOUS/CLEAN"],
            ],
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] }
        })

        // Description
        doc.setFontSize(12)
        doc.setTextColor(0)
        doc.text("Description:", 14, (doc as any).lastAutoTable.finalY + 10)
        doc.setFontSize(10)
        const splitDesc = doc.splitTextToSize(report.description, 180)
        doc.text(splitDesc, 14, (doc as any).lastAutoTable.finalY + 16)

        // Sources Table
        doc.setFontSize(12)
        doc.text("Technical Analysis:", 14, (doc as any).lastAutoTable.finalY + 30)

        const sourceRows = Object.entries(report.sources || {}).map(([source, details]: [string, any]) => [
            source.toUpperCase(),
            details.verdict || "N/A",
            details.threat_count || 0,
            (details.tags || []).slice(0, 3).join(", ")
        ])

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 35,
            head: [['Source', 'Verdict', 'Count', 'Tags']],
            body: sourceRows,
            theme: 'grid'
        })

        // MITRE Table
        if (report.mitreTactics?.length > 0) {
            doc.addPage()
            doc.text("MITRE ATT&CK Matrix:", 14, 20)

            const mitreRows = report.mitreTactics.map((t: any) => [
                t.tactic,
                t.id,
                t.name
            ])

            autoTable(doc, {
                startY: 25,
                head: [['Tactic', 'ID', 'Technique']],
                body: mitreRows,
                theme: 'grid',
                headStyles: { fillColor: [192, 57, 43] }
            })
        }

        doc.save(fileName)
    }

    const exportDOCX = async (fileName: string) => {
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: "Threat Intelligence Report",
                        heading: HeadingLevel.TITLE,
                    }),
                    new Paragraph({
                        text: `Generated: ${new Date().toLocaleString()}`,
                        spacing: { after: 200 },
                    }),
                    new Paragraph({
                        text: `Indicator: ${report.ioc}`,
                        heading: HeadingLevel.HEADING_2,
                    }),
                    new Paragraph({
                        text: `Severity: ${report.severity.toUpperCase()}`,
                        heading: HeadingLevel.HEADING_3,
                    }),
                    new Paragraph({
                        text: report.description,
                        spacing: { after: 400 },
                    }),
                    new Paragraph({
                        text: "Technical Analysis",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    // Simple text list for sources (Tables are complex in docx-js without loops)
                    ...Object.entries(report.sources || {}).map(([source, details]: [string, any]) =>
                        new Paragraph({
                            children: [
                                new TextRun({ text: `• ${source.toUpperCase()}: `, bold: true }),
                                new TextRun({ text: `${details.verdict || 'N/A'} (Count: ${details.threat_count || 0})` })
                            ]
                        })
                    ),
                    new Paragraph({
                        text: "Remediation",
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 400 },
                    }),
                    ...(report.recommendations || []).map((rec: string) =>
                        new Paragraph({
                            text: `• ${rec}`,
                        })
                    )
                ],
            }],
        })

        const blob = await Packer.toBlob(doc)
        saveAs(blob, fileName)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Export Report</DialogTitle>
                    <DialogDescription>
                        Customize your report format and filename.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="filename">Filename</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="filename"
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                                className="flex-1"
                            />
                            <span className="text-muted-foreground">.{format}</span>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Format</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant={format === "xlsx" ? "default" : "outline"}
                                onClick={() => setFormat("xlsx")}
                                className="flex flex-col h-20 gap-2"
                            >
                                <Table className="w-6 h-6" />
                                <span className="text-xs">Excel</span>
                            </Button>
                            <Button
                                variant={format === "pdf" ? "default" : "outline"}
                                onClick={() => setFormat("pdf")}
                                className="flex flex-col h-20 gap-2"
                            >
                                <FileText className="w-6 h-6" />
                                <span className="text-xs">PDF</span>
                            </Button>
                            <Button
                                variant={format === "docx" ? "default" : "outline"}
                                onClick={() => setFormat("docx")}
                                className="flex flex-col h-20 gap-2"
                            >
                                <FileType className="w-6 h-6" />
                                <span className="text-xs">Word</span>
                            </Button>
                        </div>
                    </div>

                    <div className="bg-muted p-4 rounded-md text-sm">
                        <p className="font-medium mb-2">Preview:</p>
                        <div className="space-y-1 text-muted-foreground">
                            <p>• {report.ioc} ({report.type})</p>
                            <p>• {Object.keys(report.sources || {}).length} Data Sources</p>
                            <p>• {report.mitreTactics?.length || 0} MITRE Techniques</p>
                            <p>• {report.recommendations?.length || 0} Remediation Steps</p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleExport} disabled={isExporting}>
                        {isExporting ? (
                            <>Exporting...</>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Export Report
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
