# SimpleFin MCP Server

A Model Context Protocol (MCP) server that exposes SimpleFin financial data to AI agents.

## Setup

1. **Install dependencies:**
   ```bash
   cd services/armut
   bun install
   ```

2. **Set environment variables:**
   ```bash
   export SIMPLEFIN_TOKEN="your_base64_token"
   # OR
   export SIMPLEFIN_ACCESS_URL="your_direct_access_url"
   ```

3. **Run the MCP server:**
   ```bash
   bun run mcp
   ```

## Usage with Claude Desktop

Add this to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "simplefin": {
      "command": "bun",
      "args": ["run", "mcp"],
      "cwd": "/path/to/your/monorepo/services/armut"
    }
  }
}
```

## Available Resources

### `simplefin://accounts`
Lists all your SimpleFin accounts with basic information:
- Account ID, name, currency
- Current balance and available balance
- Organization information

## Available Tools

### `getTransactions`
Query transactions with optional filtering:

**Parameters:**
- `accountId` (string, optional): Specific account to query
- `startDate` (number, optional): Unix timestamp for start date
- `endDate` (number, optional): Unix timestamp for end date  
- `pending` (boolean, optional): Include pending transactions

**Example AI interactions:**
- "Show me all my accounts"
- "Get transactions from my checking account for last month"
- "Find all transactions over $100 in the past week"
- "Show me pending transactions"

## Architecture

```
AI Agent (Claude) → MCP Client → stdio → MCP Server → SimpleFin Service → SimpleFin API
```

The server uses Effect-TS for type safety and composable error handling, integrating directly with your existing SimpleFin service.

## Future Enhancements

- HTTP transport for web-based AI agents
- Transaction categorization and analysis tools
- Spending insights and budget monitoring
- Account-specific resources with URI templates
- Custom prompts for financial summaries
