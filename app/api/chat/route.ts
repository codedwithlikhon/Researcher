import { generateResearchResponse, searchWeb, assessConfidence } from "@/lib/research"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, useResearch } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Valid message is required" }, { status: 400 })
    }

    const researchContext = {
      query: message,
      sources: [],
      confidence: 50,
    }

    if (useResearch) {
      researchContext.sources = await searchWeb(message)
      researchContext.confidence = assessConfidence(researchContext.sources)
      console.log("[v0] Search completed:", researchContext.sources.length, "sources found")
    }

    const response = await generateResearchResponse(message, researchContext)

    const formattedSources = response.sources.map((source) => ({
      title: source.title,
      url: source.url,
      description: source.description || "Click to view source",
    }))

    return NextResponse.json({
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
