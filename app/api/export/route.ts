import { exportAsMarkdown, exportAsText, type ExportData } from "@/lib/export"
import { type NextRequest, NextResponse } from "next/server"
import jsPDF from "jspdf"

export async function POST(request: NextRequest) {
  try {
    const { data, format } = await request.json()

    if (!data || !format) {
      return NextResponse.json({ error: "Data and format are required" }, { status: 400 })
    }

    const exportData: ExportData = data

    switch (format) {
      case "markdown": {
        const markdown = exportAsMarkdown(exportData)
        return new NextResponse(markdown, {
          headers: {
            "Content-Type": "text/markdown",
            "Content-Disposition": `attachment; filename="research-${Date.now()}.md"`,
          },
        })
      }

      case "txt": {
        const text = exportAsText(exportData)
        return new NextResponse(text, {
          headers: {
            "Content-Type": "text/plain",
            "Content-Disposition": `attachment; filename="research-${Date.now()}.txt"`,
          },
        })
      }

      case "pdf": {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()
        const margin = 20
        const maxWidth = pageWidth - margin * 2
        let yPosition = margin

        doc.setFontSize(18)
        doc.text(`Research Report: ${exportData.query}`, margin, yPosition)
        yPosition += 10

        doc.setFontSize(12)
        doc.text(`Confidence: ${exportData.confidence}%`, margin, yPosition)
        yPosition += 15

        const sections = [
          { title: "Reasoning", content: exportData.reasoning },
          { title: "Key Findings", content: exportData.findings },
          { title: "Analysis", content: exportData.analysis },
          { title: "Limitations", content: exportData.limitations },
        ]

        sections.forEach((section) => {
          doc.setFontSize(14)
          doc.text(section.title, margin, yPosition)
          yPosition += 7

          doc.setFontSize(10)
          const lines = doc.splitTextToSize(section.content, maxWidth)
          doc.text(lines, margin, yPosition)
          yPosition += lines.length * 5 + 5

          if (yPosition > 270) {
            doc.addPage()
            yPosition = margin
          }
        })

        doc.setFontSize(14)
        doc.text("Sources", margin, yPosition)
        yPosition += 7

        doc.setFontSize(10)
        exportData.sources.forEach((source, index) => {
          const sourceText = `${index + 1}. ${source.title}\n   ${source.url}`
          const lines = doc.splitTextToSize(sourceText, maxWidth)
          doc.text(lines, margin, yPosition)
          yPosition += lines.length * 5 + 3

          if (yPosition > 270) {
            doc.addPage()
            yPosition = margin
          }
        })

        const pdfBuffer = doc.output("arraybuffer")
        return new NextResponse(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="research-${Date.now()}.pdf"`,
          },
        })
      }

      default:
        return NextResponse.json({ error: "Invalid format" }, { status: 400 })
    }
  } catch (error) {
    console.error("[Export] Error:", error)
    return NextResponse.json({ error: "Failed to export" }, { status: 500 })
  }
}
