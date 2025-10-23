import { generateText } from "ai"
import { createHuggingFace } from "@ai-sdk/huggingface"
import { mcpClient } from "./mcp-client"

interface SearchResult {
  title: string
  url: string
  snippet: string
  description?: string
}

interface ResearchContext {
  query: string
  sources: SearchResult[]
  confidence: number
  documentChunks?: { content: string; score: number }[]
}

interface StructuredResponse {
  findings: string
  analysis: string
  limitations: string
  reasoning: string
  sources: Array<{ title: string; url: string; description?: string; confidence: number }>
  overallConfidence: number
}

const huggingface = createHuggingFace({
  apiKey: process.env.HUGGINGFACE_API_KEY ?? "",
  baseURL: "https://router.huggingface.co/v1",
})

export async function searchWeb(query: string): Promise<SearchResult[]> {
  try {
    console.log("[Research] Searching DuckDuckGo via MCP:", query)
    const results = await mcpClient.searchDuckDuckGo(query, 10)
    console.log("[Research] Found", results.length, "results")
    return results
  } catch (error) {
    console.error("[Research] Search error:", error)
    return []
  }
}

export async function fetchContent(url: string): Promise<string> {
  try {
    console.log("[Research] Fetching content from:", url)
    const content = await mcpClient.fetchContent(url)
    
    if (!content) {
      console.warn("[Research] No content fetched from:", url)
      return `Unable to fetch content from ${url}`
    }
    
    console.log("[Research] Successfully fetched", content.length, "characters from:", url)
    return content
  } catch (error) {
    console.error("[Research] Content fetch failed for", url, ":", error)
    return `Error fetching content from ${url}: ${error instanceof Error ? error.message : "Unknown error"}`
  }
}

export async function generateResearchResponse(
  userQuery: string,
  researchContext: ResearchContext,
): Promise<StructuredResponse> {
  const sourcesList = researchContext.sources.map((s) => `- ${s.title}: ${s.url}`).join("\n")

  const systemPrompt = `You are a research-aware AI assistant that prioritizes accuracy and transparency.

CORE PRINCIPLES:
1. Acknowledge statistical confidence: Your conclusions are probabilistic, not certain
2. Ground responses in sources: Always cite where information comes from
3. Address limitations: Acknowledge what you don't know or where uncertainty exists
4. Use logical reasoning: Distinguish between deductive (theory→prediction) and inductive (observation→generalization) reasoning
5. Anticipate counterarguments: Show you've considered alternative perspectives

CONFIDENCE FRAMEWORK:
- High confidence (80-95%): Multiple corroborating sources, established research
- Medium confidence (50-80%): Limited sources or emerging research
- Low confidence (<50%): Speculative or contradictory information

RESPONSE STRUCTURE:
Provide your response in this exact format:

REASONING:
[Your step-by-step thinking process: how you evaluated sources, what patterns you identified, what assumptions you made]

FINDINGS:
[Key facts and discoveries from research, with source citations]

ANALYSIS:
[Interpretation and connections between findings, logical reasoning]

LIMITATIONS:
[What cannot be determined, uncertainties, areas needing further research]`

  const documentContext = researchContext.documentChunks
    ?.map((chunk) => chunk.content)
    .join("\n\n")

  const userPrompt = `User Query: ${userQuery}

${documentContext ? `Relevant Document Sections:\n${documentContext}\n\n` : ""}
Available Research Sources:
${sourcesList}

Research Confidence Level: ${researchContext.confidence}%

Provide a structured response following the format above. Be concise but thorough.`

  try {
    const { text } = await generateText({
      model: huggingface("deepseek-ai/DeepSeek-V3-0324"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
    })

    // Parse structured response
    const sections = parseStructuredResponse(text)

    return {
      reasoning: sections.reasoning,
      findings: sections.findings,
      analysis: sections.analysis,
      limitations: sections.limitations,
      sources: researchContext.sources.map((s) => ({
        title: s.title,
        url: s.url,
        description: s.description,
        confidence: researchContext.confidence,
      })),
      overallConfidence: researchContext.confidence,
      documentChunks: researchContext.documentChunks,
    }
  } catch (error) {
    console.error("[v0] Generation error:", error)
    return {
      reasoning: "Unable to generate reasoning.",
      findings: "Unable to generate findings.",
      analysis: "Please try again.",
      limitations: "Error occurred during processing.",
      sources: [],
      overallConfidence: 0,
    }
  }
}

function parseStructuredResponse(text: string): {
  reasoning: string
  findings: string
  analysis: string
  limitations: string
} {
  const reasoningMatch = text.match(/REASONING:\s*([\s\S]*?)(?=FINDINGS:|$)/)
  const findingsMatch = text.match(/FINDINGS:\s*([\s\S]*?)(?=ANALYSIS:|$)/)
  const analysisMatch = text.match(/ANALYSIS:\s*([\s\S]*?)(?=LIMITATIONS:|$)/)
  const limitationsMatch = text.match(/LIMITATIONS:\s*([\s\S]*?)$/)

  return {
    reasoning: reasoningMatch ? reasoningMatch[1].trim() : "",
    findings: findingsMatch ? findingsMatch[1].trim() : text,
    analysis: analysisMatch ? analysisMatch[1].trim() : "",
    limitations: limitationsMatch ? limitationsMatch[1].trim() : "",
  }
}

export function assessConfidence(sources: SearchResult[]): number {
  if (sources.length === 0) return 30

  let confidence = 50
  let qualityScore = 0

  // Heuristic scoring based on source types
  sources.forEach((source) => {
    if (source.url.includes("wikipedia")) qualityScore += 15
    if (source.url.includes("scholar.google")) qualityScore += 20
    if (source.url.includes("example.com")) qualityScore += 10
  })

  confidence = Math.min(50 + qualityScore / sources.length, 90)

  // Flag low confidence
  if (confidence < 70) {
    console.log("[v0] Low confidence detected:", confidence)
  }

  return Math.round(confidence)
}

// Extract key facts from sources for context
export function extractKeyFacts(sources: SearchResult[]): string[] {
  return sources.map((s) => s.snippet).filter((snippet) => snippet.length > 0)
}
