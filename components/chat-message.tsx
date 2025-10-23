"use client"

import type { Message } from "@/lib/chat-types"
import { Source, SourceTrigger, SourceContent } from "@/components/source"
import { Reasoning, ReasoningTrigger, ReasoningContent } from "@/components/reasoning"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === "assistant"

  return (
    <div className={`flex gap-3 mb-4 ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-md px-4 py-3 rounded-lg ${
          isAssistant ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
        }`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>

        {isAssistant && (
          <>
            {message.reasoning && (
              <Reasoning className="mt-3 pt-3 border-t border-current border-opacity-20">
                <ReasoningTrigger className="text-xs">View Reasoning</ReasoningTrigger>
                <ReasoningContent className="mt-2" contentClassName="text-xs" markdown>
                  {message.reasoning}
                </ReasoningContent>
              </Reasoning>
            )}

            {message.confidence && (
              <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                <p className="text-xs opacity-75 mb-2">Confidence: {message.confidence}%</p>
                {message.sources && message.sources.length > 0 && (
                  <div className="text-xs space-y-2">
                    <p className="font-semibold opacity-75">Sources:</p>
                    <div className="flex flex-wrap gap-1">
                      {message.sources.map((source, idx) => (
                        <Source key={idx} href={source.url}>
                          <SourceTrigger label={source.title} showFavicon />
                          <SourceContent
                            title={source.title}
                            description={source.description || "Click to view source"}
                          />
                        </Source>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
