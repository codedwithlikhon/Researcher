import { generateResearchResponse, searchWeb, assessConfidence } from "@/lib/research"
import { type NextRequest, NextResponse } from "next/server"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/huggingface"
import { MemoryVectorStore } from "langchain/vectorstores/memory"
import pdf from "pdf-parse"

let vectorStore: MemoryVectorStore | null = null

export async function POST(request: NextRequest) {
  try {
    const { message, useResearch, fileUrl } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Valid message is required" }, { status: 400 })
    }

    if (fileUrl) {
      const response = await fetch(fileUrl)
      const fileBuffer = await response.arrayBuffer()
      const pdfData = await pdf(fileBuffer)

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      })
      const splits = await textSplitter.createDocuments([pdfData.text])

      const embeddings = new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HUGGINGFACE_API_KEY,
      })
      vectorStore = await MemoryVectorStore.fromDocuments(splits, embeddings)
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
      console.log("[v0] Search completed:", researchContext.sources.length, "sources found")
    }

    if (vectorStore) {
      const queryEmbedding = await new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HUGGINGFACE_API_KEY,
      }).embedQuery(message)
      const searchResults = await vectorStore.similaritySearchVectorWithScore(queryEmbedding, 5)
      researchContext.documentChunks = searchResults.map(([doc, score]) => ({
        content: doc.pageContent,
        score,
      }))
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
