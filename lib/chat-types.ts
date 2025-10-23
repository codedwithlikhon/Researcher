export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: Array<{
    title: string
    url: string
    description?: string
  }>
  confidence?: number
  reasoning?: string
  timestamp: Date
}

export interface ChatState {
  messages: Message[]
  isLoading: boolean
  error?: string
}
