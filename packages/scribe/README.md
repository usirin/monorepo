# @usirin/scribe

A type-safe chat interface for Claude with extensible tools and spells.

[![npm version](https://img.shields.io/npm/v/@usirin/scribe.svg)](https://www.npmjs.com/package/@usirin/scribe)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Overview

Scribe provides a conversational interface to Claude (Anthropic's AI) with extensible tool support. It lets you chat with Claude while giving it access to your filesystem and custom tools through a type-safe spell system.

- **Type-Safe**: End-to-end TypeScript type safety for tools and interactions
- **Extensible**: Add custom tools (spells) with full validation
- **Thinking Support**: See Claude's internal reasoning process
- **File System Access**: Built-in tools for reading files and listing directories
- **Interactive**: Beautiful CLI interface with colored output
- **Validated**: Schema validation for all tool inputs and outputs

## Installation

```bash
npm install @usirin/scribe   # npm
yarn add @usirin/scribe      # yarn
pnpm add @usirin/scribe      # pnpm
bun add @usirin/scribe       # bun
```

## Quick Start: Chat with Claude

Here's how to create a chat interface with file system access:

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { input } from "@inquirer/prompts";
import { factory } from "@usirin/forge";
import { createSpell } from "@usirin/spellbook";
import { z } from "zod";

// 1. Create the Scribe factory
const createScribe = factory(
  "scribe",
  (client: Anthropic, getUserMessage: () => Promise<string>, spells: Record<string, Spell>) => {
    return {
      client,
      getUserMessage,
      spells,
      runInference(messages: Anthropic.Messages.MessageParam[]) {
        // Configure Claude with tools and thinking support
        const params: Anthropic.MessageCreateParams = {
          model: "claude-4-sonnet-20250514",
          max_tokens: 2048,
          messages,
          tools: Object.entries(spells).map(([name, spell]) => ({
            name,
            description: spell._spec.description,
            input_schema: spell._spec.parameters,
          })),
          thinking: {
            type: "enabled",
            budget_tokens: 1024,
          },
        };
        
        return client.messages.create(params);
      },
    };
  }
);

// 2. Define custom tools as spells
const readFileSpell = createSpell({
  description: "Read the contents of a given relative file path",
  parameters: z.object({ filePath: z.string() }),
  result: z.string(),
  context: z.object({}),
  execute: async ({ filePath }) => {
    try {
      const content = await Bun.file(filePath).text();
      return content;
    } catch (error) {
      return `Error reading file: ${error.message}`;
    }
  },
});

const listFilesSpell = createSpell({
  description: "List directory contents with optional path (defaults to current directory)",
  parameters: z.object({ directoryPath: z.string().optional() }),
  result: z.string(),
  context: z.object({}),
  execute: async ({ directoryPath = "." }) => {
    try {
      const fs = await import("node:fs/promises");
      const entries = await fs.readdir(directoryPath, { withFileTypes: true });
      
      const formatted = entries.map(entry => {
        const type = entry.isDirectory() ? "📁" : "📄";
        return `${type} ${entry.name}`;
      }).join("\n");
      
      return formatted || "Directory is empty";
    } catch (error) {
      return `Error reading directory: ${error.message}`;
    }
  },
});

// 3. Create the chat interface
async function main() {
  const anthropic = new Anthropic();
  const scribe = createScribe(
    anthropic,
    async () => input({ message: "You:" }),
    {
      read_file: readFileSpell,
      list_files: listFilesSpell,
    }
  );
  
  // Start the chat loop
  runChat(scribe);
}

function runChat(scribe) {
  console.log("Chat with Claude 4 Sonnet (use Ctrl+C to exit)\n");
  
  const messages = [];
  
  async function chat() {
    const userInput = await scribe.getUserMessage();
    if (!userInput) return;
    
    messages.push({ role: "user", content: userInput });
    
    try {
      const response = await scribe.runInference(messages);
      messages.push({ role: "assistant", content: response.content });
      
      for (const content of response.content) {
        switch (content.type) {
          case "text":
            console.log("Claude:", content.text);
            break;
          case "thinking":
            console.log("💭 Thinking:", content.thinking);
            break;
          case "tool_use":
            const tool = scribe.spells[content.name];
            const result = await tool(content.input, {});
            messages.push({ 
              role: "user", 
              content: [{ 
                type: "tool_result", 
                tool_use_id: content.id, 
                content: result 
              }] 
            });
            break;
        }
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
    
    await chat();
  }
  
  chat();
}

main();
```

## Core Concepts

### Scribe Factory

The Scribe factory creates a chat interface with Claude:

```typescript
const scribe = createScribe(
  anthropicClient,    // Anthropic SDK client
  getUserMessage,     // Function to get user input
  spells              // Available tools as spells
);
```

Key features:
- **Claude Integration**: Direct connection to Anthropic's API
- **Thinking Support**: Shows Claude's internal reasoning process
- **Tool Execution**: Automatically handles tool calls and results
- **Message Management**: Maintains conversation history

### Built-in Tools

Scribe comes with essential file system tools:

#### Read File
```typescript
// Usage in chat: "Read the contents of package.json"
const readFile = createSpell({
  description: "Read the contents of a given relative file path",
  parameters: z.object({ filePath: z.string() }),
  result: z.string(),
  // ... implementation
});
```

#### List Files
```typescript
// Usage in chat: "List files in src/" or "What's in this directory?"
const listFiles = createSpell({
  description: "List directory contents",
  parameters: z.object({ directoryPath: z.string().optional() }),
  result: z.string(),
  // ... implementation
});
```

### Custom Tools

Add your own tools using the spell system:

```typescript
const customTool = createSpell({
  description: "Your custom tool description",
  parameters: z.object({
    // Define your input schema
    query: z.string(),
    options: z.object({
      limit: z.number().optional(),
    }).optional(),
  }),
  result: z.object({
    // Define your output schema
    results: z.array(z.string()),
    count: z.number(),
  }),
  context: z.object({}),
  execute: async ({ query, options }, context) => {
    // Your implementation
    return {
      results: [`Result for: ${query}`],
      count: 1,
    };
  },
});
```

### Thinking Support

Scribe supports Claude's extended thinking feature:

```typescript
const params = {
  // ... other parameters
  thinking: {
    type: "enabled",
    budget_tokens: 1024,  // Tokens allocated for thinking
  },
};
```

This shows Claude's internal reasoning process before providing the final answer, helping you understand how it approaches problems.

### Interactive Features

- **Colored Output**: Different colors for Claude responses, thinking, and tool execution
- **Tool Debugging**: See tool calls and results in real-time
- **Error Handling**: Graceful error messages for failed operations
- **Continuous Chat**: Maintains conversation context across interactions

## Environment Setup

Set your Anthropic API key:

```bash
export ANTHROPIC_API_KEY=your_api_key_here
```

## Use Cases

- **Code Review**: Ask Claude to read and analyze your code files
- **Project Exploration**: Let Claude explore your project structure
- **Development Assistant**: Get help with coding while giving Claude access to your codebase
- **File Processing**: Process multiple files with Claude's understanding
- **Interactive Documentation**: Ask questions about your project while Claude can read the files

## Schema Validation

All tools use [Standard Schema](https://standardschema.dev/) for validation:

```typescript
// Input validation
parameters: z.object({
  filePath: z.string().min(1, "File path is required"),
  encoding: z.enum(["utf8", "utf16"]).default("utf8"),
})

// Output validation  
result: z.object({
  content: z.string(),
  size: z.number(),
  lastModified: z.string().datetime(),
})
```

Benefits:
- Runtime validation of all inputs and outputs
- Type safety throughout the application
- Clear error messages for invalid data
- Consistent API contracts

## License

[MIT](LICENSE)