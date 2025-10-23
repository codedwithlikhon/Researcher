import { generateResearchResponse, searchWeb, assessConfidence } from "@/lib/research"
import { type NextRequest, NextResponse } from "next/server"
import formidable from "formidable"
import fs from "fs/promises"
import type { IncomingMessage } from "http"

// Helper to disable Next.js body parsing
export const config = {
  api: {
    bodyParser: false,
  },
}

// Helper to parse the form data
const parseForm = async (
  req: IncomingMessage,
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const form = formidable()
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      resolve({ fields, files })
    })
  })
}

export async function POST(request: NextRequest) {
  try {
    const { fields, files } = await parseForm(request as unknown as IncomingMessage)
    const message = fields.message?.[0] || ""
    const useResearch = fields.useResearch?.[0] === "true"

    if (!message && !files.file) {
      return NextResponse.json({ error: "Valid message or file is required" }, { status: 400 })
    }

    let fileContent: string | undefined
    if (files.file) {
      const file = files.file[0]
      fileContent = await fs.readFile(file.filepath, "utf-8")
    }

    const query = message || "Analyze the attached file."

    const researchContext: {
      query: string
      sources: Array<{ title: string; url: string; snippet: string; description?: string }>
      confidence: number
      fileContent?: string
    } = {
      query: query,
      sources: [],
      confidence: 50,
      fileContent,
    }

    if (useResearch) {
      researchContext.sources = await searchWeb(query)
      researchContext.confidence = assessConfidence(researchContext.sources)
      console.log("[v0] Search completed:", researchContext.sources.length, "sources found")
    }

    const response = await generateResearchResponse(message, researchContext)

    const formattedSources = response.sources.map((source) => ({
      title: source.title,
      url: source.url,
      description: source.description || "Click to view source",
    }))

    const content = `${response.findings}\n\n${response.analysis}`
    
    return NextResponse.json({
      content,
      query: message,
      findings: response.findings,
      analysis: response.analysis,
      limitations: response.limitations,
      reasoning: response.reasoning,
      sources: formattedSources,
      confidence: response.overallConfidence,
      flagForReview: response.overallConfidence < 70,
    })
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
