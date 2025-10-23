"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip } from "lucide-react"

interface ChatInputProps {
  onSubmit: (message: string, useResearch: boolean, file?: File) => void
  isLoading: boolean
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("")
  const [useResearch, setUseResearch] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() || selectedFile) {
      onSubmit(input, useResearch, selectedFile || undefined)
      setInput("")
      setSelectedFile(null)
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
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="px-3"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <Button type="submit" disabled={isLoading || (!input.trim() && !selectedFile)}>
          {isLoading ? "Thinking..." : "Send"}
        </Button>
      </div>

      <div className="flex justify-between items-center">
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
        {selectedFile && <span className="text-sm text-muted-foreground">{selectedFile.name}</span>}
      </div>
    </form>
  )
}
