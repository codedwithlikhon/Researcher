export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  query?: string
  sources?: Array<{
    title: string
    url: string
    description?: string
  }>
  confidence?: number
  reasoning?: string
  findings?: string
  analysis?: string
  limitations?: string
  timestamp: Date
}

export interface ChatState {
  messages: Message[]
  isLoading: boolean
  error?: string
}
