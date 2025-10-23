"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ChatInputProps {
  onSubmit: (message: string, useResearch: boolean) => void
  isLoading: boolean
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("")
  const [useResearch, setUseResearch] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSubmit(input, useResearch)
      setInput("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 border-t border-border">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? "Thinking..." : "Send"}
        </Button>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={useResearch}
          onChange={(e) => setUseResearch(e.target.checked)}
          disabled={isLoading}
          className="rounded"
        />
        <span className="text-muted-foreground">Enable web research</span>
      </label>
    </form>
  )
}
