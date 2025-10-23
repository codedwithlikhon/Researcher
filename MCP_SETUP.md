# MCP Servers Configuration Guide

This guide shows you how to set up the Model Context Protocol (MCP) servers that power the research chatbot's advanced capabilities.

## Prerequisites

- Python 3.11+ (for DuckDuckGo and Fetch MCP servers)
- Node.js 20+ (for Playwright, Puppeteer, Sequential Thinking MCP servers)
- `uv` or `uvx` Python package installer

## MCP Servers Integration

### 1. DuckDuckGo Search MCP Server ✅ (Active)

**Installation:**
```bash
uv pip install duckduckgo-mcp-server
# OR
npx -y @smithery/cli install @nickclyde/duckduckgo-mcp-server --client claude
```

**Configuration (Claude Desktop / Cursor):**

Add to your MCP configuration file:
- **Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
- **Cursor**: `.cursor/mcp.json`

```json
{
  "mcpServers": {
    "ddg-search": {
      "command": "uvx",
      "args": ["duckduckgo-mcp-server"]
    }
  }
}
```

**Features:**
- Web search with rate limiting
- Content fetching from URLs
- LLM-friendly output formatting

### 2. Playwright MCP Server (Planned)

**Installation:**
```bash
npm install -g @playwright/mcp
```

**Configuration:**
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

**Features:**
- Browser navigation
- Screenshot capture
- PDF generation
- Click, type, and interact with pages
- File upload handling

### 3. Sequential Thinking MCP Server (Planned)

**Installation:**
```bash
npm install -g @modelcontextprotocol/server-sequential-thinking
```

**Configuration:**
```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

**Features:**
- Enhanced multi-step reasoning
- Logical deduction chains
- Problem decomposition

### 4. Fetch MCP Server (Planned)

**Installation:**
```bash
uv pip install mcp-server-fetch
```

**Configuration:**
```json
{
  "mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    }
  }
}
```

**Features:**
- HTTP content fetching
- Header customization
- Response caching

### 5. Puppeteer MCP Server (Alternative to Playwright)

**Installation:**
```bash
npm install -g @modelcontextprotocol/server-puppeteer
```

**Configuration:**
```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

## Complete Configuration Example

Here's a complete configuration with all MCP servers:

```json
{
  "mcpServers": {
    "ddg-search": {
      "command": "uvx",
      "args": ["duckduckgo-mcp-server"]
    },
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

## Testing MCP Servers

### Test DuckDuckGo Search
```bash
# Start the MCP inspector
mcp dev duckduckgo-mcp-server

# Test search
{
  "method": "tools/call",
  "params": {
    "name": "search",
    "arguments": {
      "query": "artificial intelligence",
      "max_results": 5
    }
  }
}
```

### Test Content Fetching
```bash
{
  "method": "tools/call",
  "params": {
    "name": "fetch_content",
    "arguments": {
      "url": "https://example.com"
    }
  }
}
```

## Usage in the Research Chatbot

The chatbot automatically uses the DuckDuckGo MCP server when you enable research mode. Here's how it works:

1. **User submits a query** with research enabled
2. **DuckDuckGo MCP searches** for relevant sources
3. **Content is fetched** from top results
4. **AI analyzes** the information using Hugging Face models
5. **Structured response** is generated with confidence scores

## Troubleshooting

### MCP Server Not Starting

**Issue**: Server fails to start or times out

**Solutions**:
- Ensure Python 3.11+ or Node.js 20+ is installed
- Check that `uvx` or `npx` is in your PATH
- Verify the server package is installed: `uv pip list | grep duckduckgo-mcp-server`

### Import Errors

**Issue**: `ModuleNotFoundError` or similar

**Solution**:
```bash
# Reinstall dependencies
uv pip install --upgrade duckduckgo-mcp-server
```

### Port Already in Use

**Issue**: MCP server can't bind to port

**Solution**:
- MCP servers use stdio by default, not ports
- If using HTTP transport, ensure port is available

### No Search Results

**Issue**: Search returns empty results

**Solutions**:
- Check internet connection
- Verify DuckDuckGo is accessible
- Rate limiting may be active (wait 1-2 seconds between requests)

## Security Notes

- ✅ **No API keys required** for DuckDuckGo
- ✅ **Privacy-first** search (no tracking)
- ✅ **Local execution** via stdio transport
- ⚠️ Always review fetched content before using
- ⚠️ Rate limits prevent abuse

## Performance Tips

1. **Cache results** when possible
2. **Batch requests** for efficiency
3. **Set appropriate timeouts** (30s recommended)
4. **Use rate limiting** to avoid blocks
5. **Monitor memory usage** with browser automation

## Next Steps

- [ ] Install all MCP servers listed above
- [ ] Test each server individually
- [ ] Configure in Claude Desktop or Cursor
- [ ] Enable research mode in the chatbot
- [ ] Export your first research report!

## Additional Resources

- [MCP Official Documentation](https://modelcontextprotocol.io)
- [DuckDuckGo MCP Server GitHub](https://github.com/nickclyde/duckduckgo-mcp-server)
- [Playwright MCP Documentation](https://github.com/playwright/mcp)
- [MCP Servers Registry](https://github.com/modelcontextprotocol/servers)
