export interface ExportData {
  query: string
  findings: string
  analysis: string
  limitations: string
  reasoning: string
  sources: Array<{ title: string; url: string; description?: string }>
  confidence: number
}

export function exportAsMarkdown(data: ExportData): string {
  const markdown = `# Research Report: ${data.query}

## Confidence Score: ${data.confidence}%

## Reasoning
${data.reasoning}

## Key Findings
${data.findings}

## Analysis
${data.analysis}

## Limitations
${data.limitations}

## Sources
${data.sources.map((source, index) => `${index + 1}. [${source.title}](${source.url})\n   ${source.description || ""}`).join("\n")}

---
*Generated on ${new Date().toLocaleString()}*
`

  return markdown
}

export function exportAsText(data: ExportData): string {
  const text = `RESEARCH REPORT: ${data.query}
${"=".repeat(50)}

CONFIDENCE SCORE: ${data.confidence}%

REASONING
${"-".repeat(50)}
${data.reasoning}

KEY FINDINGS
${"-".repeat(50)}
${data.findings}

ANALYSIS
${"-".repeat(50)}
${data.analysis}

LIMITATIONS
${"-".repeat(50)}
${data.limitations}

SOURCES
${"-".repeat(50)}
${data.sources.map((source, index) => `${index + 1}. ${source.title}\n   URL: ${source.url}\n   ${source.description || ""}`).join("\n\n")}

Generated on ${new Date().toLocaleString()}
`

  return text
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
