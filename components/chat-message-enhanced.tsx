"use client"

import type { Message } from "@/lib/chat-types"
import { Source, SourcesTrigger, SourcesContent } from "@/components/ai-elements/sources"
import { Reasoning } from "@/components/ai-elements/reasoning"
import {
  CollapsibleSection,
  CollapsibleSectionTrigger,
  CollapsibleSectionContent,
} from "@/components/collapsible-section"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, FileText, FileCode, BookOpen } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"
import { exportAsMarkdown, exportAsText } from "@/lib/export"

interface ChatMessageProps {
  message: Message
}

export function ChatMessageEnhanced({ message }: ChatMessageProps) {
  const isAssistant = message.role === "assistant"
  const [showExport, setShowExport] = useState(false)

  const handleExport = async (format: "pdf" | "markdown" | "txt") => {
    if (!message.query) {
      console.error("Cannot export: message.query is missing")
      return
    }
    
    const exportData = {
      query: message.query,
      findings: message.findings || "",
      analysis: message.analysis || "",
      limitations: message.limitations || "",
      reasoning: message.reasoning || "",
      sources: message.sources || [],
      confidence: message.confidence || 0,
    }

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: exportData, format }),
      })

      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `research-${Date.now()}.${format === "markdown" ? "md" : format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Export error:", error)
    }
  }

  if (!isAssistant) {
    return (
      <div className="flex justify-end mb-4 px-2 sm:px-4">
        <div className="max-w-[85%] sm:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-primary text-primary-foreground">
          <p className="text-sm leading-relaxed break-words">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 px-2 sm:px-4">
      <Card className="p-4 sm:p-6 bg-card border-border">
        {/* Confidence Badge */}
        {message.confidence !== undefined && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge
              variant={
                message.confidence >= 80 ? "default" : message.confidence >= 50 ? "secondary" : "outline"
              }
              className="text-xs sm:text-sm"
            >
              Confidence: {message.confidence}%
            </Badge>
            {message.confidence < 70 && (
              <Badge variant="outline" className="text-xs">
                ⚠️ Review Recommended
              </Badge>
            )}
            <div className="ml-auto">
              <Collapsible open={showExport} onOpenChange={setShowExport}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <Download className="w-3 h-3 mr-1" />
                    Export
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport("pdf")}
                      className="h-7 text-xs"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport("markdown")}
                      className="h-7 text-xs"
                    >
                      <FileCode className="w-3 h-3 mr-1" />
                      Markdown
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport("txt")}
                      className="h-7 text-xs"
                    >
                      <BookOpen className="w-3 h-3 mr-1" />
                      Text
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        )}

        {/* Reasoning Section */}
        {message.reasoning && (
          <Reasoning>
            <ReasoningTrigger />
            <ReasoningContent>{message.reasoning}</ReasoningContent>
          </Reasoning>
        )}

        {/* Document Chunks */}
        {message.documentChunks && message.documentChunks.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="text-primary">📄</span> Relevant Document Sections
            </h3>
            <div className="flex flex-col gap-2">
              {message.documentChunks.map((chunk, idx) => (
                <div key={idx} className="p-3 bg-muted/50 rounded-lg border border-border">
                  <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {chunk.content}
                  </p>
                  <Badge variant="outline" className="text-xs mt-2">
                    Score: {chunk.score.toFixed(2)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content - Findings */}
        {message.findings && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="text-primary">🔍</span> Key Findings
            </h3>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {message.findings}
              </p>
            </div>
          </div>
        )}

        {/* Analysis Section */}
        {message.analysis && (
          <CollapsibleSection className="mb-4">
            <CollapsibleSectionTrigger contentToCopy={message.analysis}>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="text-primary">💡</span> Analysis
              </h3>
            </CollapsibleSectionTrigger>
            <CollapsibleSectionContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {message.analysis}
                </p>
              </div>
            </CollapsibleSectionContent>
          </CollapsibleSection>
        )}

        {/* Limitations Section */}
        {message.limitations && (
          <CollapsibleSection className="mb-4">
            <CollapsibleSectionTrigger contentToCopy={message.limitations}>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="text-orange-500">⚠️</span> Limitations
              </h3>
            </CollapsibleSectionTrigger>
            <CollapsibleSectionContent>
              <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {message.limitations}
              </p>
            </CollapsibleSectionContent>
          </CollapsibleSection>
        )}

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="pt-4 border-t border-border">
            <SourcesTrigger count={message.sources.length} />
            <SourcesContent>
              <div className="flex flex-wrap gap-2">
                {message.sources.map((source, idx) => (
                  <Source
                    key={idx}
                    href={source.url}
                    title={`${idx + 1}. ${source.title}`}
                  />
                ))}
              </div>
            </SourcesContent>
          </div>
        )}
      </Card>
    </div>
  )
}
