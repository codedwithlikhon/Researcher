import { generateResearchResponse, searchWeb, assessConfidence } from "@/lib/research"
import { processAndStoreDocument, queryVectorStore } from "@/lib/rag-pipeline"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, useResearch, fileUrl } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Valid message is required" }, { status: 400 })
    }

    if (fileUrl) {
      await processAndStoreDocument(fileUrl);
    }

    const researchContext: {
      query: string
      sources: Array<{ title: string; url: string; snippet: string; description?: string }>
      confidence: number
      documentChunks?: any[]
    } = {
      query: message,
      sources: [],
      confidence: 50,
    }

    if (useResearch) {
      researchContext.sources = await searchWeb(message)
      researchContext.confidence = assessConfidence(researchContext.sources)
    }

    const documentChunks = await queryVectorStore(message);
    if (documentChunks) {
      researchContext.documentChunks = documentChunks;
    }

    const responseData = await generateResearchResponse(message, researchContext)

    const formattedSources = responseData.sources.map((source) => ({
      title: source.title,
      url: source.url,
      description: source.description || "Click to view source",
    }))

    const content = `${responseData.findings}\n\n${responseData.analysis}`

    return NextResponse.json({
      content,
      query: message,
      findings: responseData.findings,
      analysis: responseData.analysis,
      limitations: responseData.limitations,
      reasoning: responseData.reasoning,
      sources: formattedSources,
      confidence: responseData.overallConfidence,
      documentChunks: responseData.documentChunks,
      flagForReview: responseData.overallConfidence < 70,
    })
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    if (error instanceof Error && error.message.includes('relation "documents" does not exist')) {
        return NextResponse.json({ error: "No document has been uploaded yet. Please upload a file to begin." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
