# AI Research Chatbot with MCP Integration

## Overview
A powerful Next.js-based research chatbot that leverages Model Context Protocol (MCP) servers to provide comprehensive research capabilities with real-time web search, content fetching, and AI-powered analysis.

## Features
- 🔍 **Real-time Web Search** via DuckDuckGo MCP server
- 📄 **Content Fetching** from web pages
- 🤖 **AI-Powered Analysis** using Hugging Face models (DeepSeek-V3)
- 📊 **Confidence Scoring** for research quality
- 📝 **Structured Responses** with reasoning, findings, analysis, and limitations
- 💾 **Export Functionality** (PDF, Markdown, TXT)
- 🎨 **Modern UI** built with Next.js and shadcn/ui

## Technology Stack
- **Framework**: Next.js 16 with TypeScript
- **AI SDK**: Vercel AI SDK with Hugging Face integration
- **MCP Servers**: 
  - DuckDuckGo Search MCP
  - Fetch MCP (planned)
  - Playwright MCP (planned)
  - Sequential Thinking MCP (planned)
- **UI**: shadcn/ui with Radix UI components
- **Styling**: Tailwind CSS

## MCP Servers Integration

### Active Integrations
1. **DuckDuckGo MCP** (`@nickclyde/duckduckgo-mcp-server`)
   - Web search capabilities
   - Content fetching from URLs
   - Rate limiting and error handling

### Planned Integrations
2. **Playwright MCP** - Browser automation for screenshots and PDFs
3. **Sequential Thinking MCP** - Enhanced reasoning capabilities
4. **Fetch MCP** - Additional content fetching features
5. **Puppeteer MCP** - Alternative browser automation

## Project Structure
```
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Chat API endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Main chat interface
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── chat-container.tsx
│   ├── chat-input.tsx
│   ├── chat-message.tsx
│   ├── markdown.tsx
│   ├── reasoning.tsx
│   └── source.tsx
├── lib/
│   ├── mcp-client.ts            # MCP client integration
│   ├── research.ts              # Research logic and AI
│   ├── export.ts                # Export functionality
│   ├── chat-types.ts
│   └── utils.ts
└── public/                       # Static assets
```

## Setup

### Prerequisites
- Node.js 20+
- Hugging Face API key
- Python 3.11+ (for MCP servers)

### Environment Variables
Create a `.env` file:
```bash
HUGGINGFACE_API_KEY=your_api_key_here
```

### Installation
```bash
npm install --legacy-peer-deps
```

### Running the Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` (or the Replit preview URL)

## How It Works

### Research Flow
1. **User Query** → Submitted via chat interface
2. **Web Search** → DuckDuckGo MCP searches for relevant sources
3. **Confidence Assessment** → Sources are scored for quality
4. **AI Analysis** → Hugging Face model analyzes findings
5. **Structured Response** → Results formatted with reasoning, findings, analysis, limitations
6. **Export** → Users can download results in multiple formats

### Confidence Scoring
- **High (80-95%)**: Multiple corroborating sources
- **Medium (50-80%)**: Limited sources or emerging research
- **Low (<50%)**: Speculative or contradictory information

## Recent Changes
- **October 23, 2025**: Initial setup with MCP integration
  - Integrated DuckDuckGo MCP server for real web search
  - Replaced mock search with actual MCP client
  - Added export functionality (Markdown, TXT)
  - Set up project structure and dependencies

## User Preferences
- Privacy-focused search (DuckDuckGo)
- Transparent AI reasoning with confidence scores
- Structured, academic-style research outputs
- Multiple export formats for research reports

## Development Notes
- Uses `--legacy-peer-deps` for React 19 compatibility
- MCP servers run as separate processes via stdio transport
- Fallback to mock results if MCP servers are unavailable
- All responses include reasoning transparency

## Future Enhancements
- [ ] Browser automation with Playwright MCP
- [ ] Enhanced reasoning with Sequential Thinking MCP
- [ ] PDF export with proper formatting
- [ ] Multi-step research loops for deeper investigation
- [ ] Source credibility scoring
- [ ] Citation management
