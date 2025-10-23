"use client"

import { useState, useRef, useEffect } from "react"
import { ChatMessageEnhanced } from "./chat-message-enhanced"
import { ChatInput } from "./chat-input"
import type { Message } from "@/lib/chat-types"

const fetcher = async (url: string, options: any) => {
  const res = await fetch(url, options)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (
    content: string,
    useResearch: boolean,
    fileUrl?: string,
  ) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content || (fileUrl ? `File: ${fileUrl}` : ""),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, useResearch, fileUrl }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        query: data.query || content,
        sources: data.sources,
        confidence: data.confidence,
        reasoning: data.reasoning,
        findings: data.findings,
        analysis: data.analysis,
        limitations: data.limitations,
        documentChunks: data.documentChunks,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("[v0] Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header - Mobile Responsive */}
      <div className="border-b border-border p-3 sm:p-4 bg-card/50 backdrop-blur-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">🔬 AI Research Assistant</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Powered by MCP • Hugging Face AI • DuckDuckGo Search
        </p>
      </div>

      {/* Messages - Mobile Optimized */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center px-4">
            <div className="max-w-md">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                Welcome to AI Research Assistant
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Ask questions and get research-backed answers with:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-left">
                <div className="p-2 bg-muted rounded">✅ Real-time web search</div>
                <div className="p-2 bg-muted rounded">📊 Confidence scores</div>
                <div className="p-2 bg-muted rounded">🔗 Source citations</div>
                <div className="p-2 bg-muted rounded">📄 Export to PDF/MD</div>
              </div>
            </div>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessageEnhanced key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Mobile Fixed Bottom */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm">
        <ChatInput onSubmit={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
