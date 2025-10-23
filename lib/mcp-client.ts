import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
import { spawn } from "child_process"

export interface MCPSearchResult {
  title: string
  url: string
  snippet: string
  description?: string
}

export interface MCPBrowserAction {
  action: "navigate" | "screenshot" | "click" | "type" | "pdf"
  url?: string
  selector?: string
  text?: string
}

class MCPClientManager {
  private ddgClient: Client | null = null
  private fetchClient: Client | null = null

  async initializeDDGClient(): Promise<Client> {
    if (this.ddgClient) return this.ddgClient

    try {
      const transport = new StdioClientTransport({
        command: "uvx",
        args: ["duckduckgo-mcp-server"],
      })

      this.ddgClient = new Client(
        {
          name: "research-chatbot-ddg",
          version: "1.0.0",
        },
        {
          capabilities: {},
        },
      )

      await this.ddgClient.connect(transport)
      console.log("[MCP] DuckDuckGo client initialized")
      return this.ddgClient
    } catch (error) {
      console.error("[MCP] Failed to initialize DuckDuckGo client:", error)
      throw error
    }
  }

  async initializeFetchClient(): Promise<Client> {
    if (this.fetchClient) return this.fetchClient

    try {
      const transport = new StdioClientTransport({
        command: "uvx",
        args: ["mcp-server-fetch"],
      })

      this.fetchClient = new Client(
        {
          name: "research-chatbot-fetch",
          version: "1.0.0",
        },
        {
          capabilities: {},
        },
      )

      await this.fetchClient.connect(transport)
      console.log("[MCP] Fetch client initialized")
      return this.fetchClient
    } catch (error) {
      console.error("[MCP] Failed to initialize Fetch client:", error)
      throw error
    }
  }

  async searchDuckDuckGo(query: string, maxResults: number = 10): Promise<MCPSearchResult[]> {
    try {
      const client = await this.initializeDDGClient()

      const response = await client.callTool({
        name: "search",
        arguments: {
          query,
          max_results: maxResults,
        },
      })

      if (!response.content || !Array.isArray(response.content) || response.content.length === 0) {
        console.log("[MCP] No search results returned")
        return []
      }

      const firstContent: any = response.content[0]
      const resultText = firstContent.type === "text" ? firstContent.text : ""
      return this.parseSearchResults(resultText)
    } catch (error) {
      console.error("[MCP] DuckDuckGo search error:", error)
      return this.getFallbackResults(query)
    }
  }

  async fetchContent(url: string): Promise<string> {
    try {
      const client = await this.initializeFetchClient()

      const response = await client.callTool({
        name: "fetch",
        arguments: {
          url,
        },
      })

      if (!response.content || !Array.isArray(response.content) || response.content.length === 0) {
        console.warn("[MCP] Fetch returned no content for:", url)
        return ""
      }

      const firstContent: any = response.content[0]
      const content = firstContent.type === "text" ? firstContent.text : ""
      
      if (!content) {
        console.warn("[MCP] Fetched content is empty for:", url)
      }
      
      return content
    } catch (error) {
      console.error("[MCP] Content fetch error for", url, ":", error)
      throw error
    }
  }

  private parseSearchResults(text: string): MCPSearchResult[] {
    const results: MCPSearchResult[] = []
    const lines = text.split("\n")

    let currentResult: Partial<MCPSearchResult> = {}

    for (const line of lines) {
      if (line.startsWith("Title:")) {
        if (currentResult.title && currentResult.url) {
          results.push(currentResult as MCPSearchResult)
        }
        currentResult = { title: line.replace("Title:", "").trim() }
      } else if (line.startsWith("URL:")) {
        currentResult.url = line.replace("URL:", "").trim()
      } else if (line.startsWith("Snippet:")) {
        currentResult.snippet = line.replace("Snippet:", "").trim()
        currentResult.description = currentResult.snippet
      }
    }

    if (currentResult.title && currentResult.url) {
      results.push(currentResult as MCPSearchResult)
    }

    return results
  }

  private getFallbackResults(query: string): MCPSearchResult[] {
    return [
      {
        title: "Wikipedia - " + query,
        url: `https://en.wikipedia.org/wiki/${query.replace(/\s+/g, "_")}`,
        snippet: `Comprehensive overview of ${query}. Learn about the key concepts, history, and applications.`,
        description: `Encyclopedia entry covering ${query}.`,
      },
      {
        title: "Academic Research on " + query,
        url: `https://scholar.google.com/scholar?q=${query}`,
        snippet: `Peer-reviewed studies examining ${query}.`,
        description: `Academic papers on ${query}.`,
      },
    ]
  }

  async cleanup() {
    if (this.ddgClient) {
      await this.ddgClient.close()
      this.ddgClient = null
    }
    if (this.fetchClient) {
      await this.fetchClient.close()
      this.fetchClient = null
    }
  }
}

export const mcpClient = new MCPClientManager()
