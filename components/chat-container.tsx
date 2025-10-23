"use client"

import { useState, useRef, useEffect } from "react"
import { ChatMessage } from "./chat-message"
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

  const handleSendMessage = async (content: string, useResearch: boolean) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, useResearch }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        sources: data.sources,
        confidence: data.confidence,
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
      {/* Header */}
      <div className="border-b border-border p-4">
        <h1 className="text-2xl font-bold text-foreground">Research Chatbot</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ask questions with confidence levels and source attribution
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to Research Chatbot</h2>
              <p className="text-muted-foreground max-w-md">
                Ask questions and get research-backed answers with confidence levels and source citations.
              </p>
            </div>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSubmit={handleSendMessage} isLoading={isLoading} />
    </div>
  )
}
