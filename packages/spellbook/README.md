# Spellbook

Type-safe API surfaces that work across process boundaries.

[![npm version](https://img.shields.io/npm/v/@usirin/spellbook.svg)](https://www.npmjs.com/package/@usirin/spellbook)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Define once, run anywhere. Spellbook lets you create type-safe APIs that work seamlessly across different execution environments with full validation and error handling.

## Quick Example: Chat API

```typescript
// Define your API with any Standard Schema library (Zod shown here)
import { z } from "zod";
import { createSpell, createSpellbook } from "@usirin/spellbook";

const chatBook = createSpellbook({
  sendMessage: createSpell({
    description: "Send a message to a channel",
    parameters: z.object({
      channelID: z.string().uuid(),
      content: z.string().min(1).max(2000),
      mentions: z.array(z.string().uuid()).optional(),
      attachments: z.array(z.object({
        type: z.enum(["image", "file"]),
        url: z.string().url(),
        name: z.string(),
      })).optional(),
    }),
    result: z.object({
      messageID: z.string().uuid(),
      timestamp: z.string().datetime(),
      status: z.enum(["sent", "delivered", "read"]),
    }),
    execute: async ({ channelID, content, mentions, attachments }) => {
      // Implementation would send the message...
      return {
        messageID: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        status: "sent"
      };
    }
  }),
  
  getMessages: createSpell({
    description: "Get messages from a channel",
    parameters: z.object({
      channelID: z.string().uuid(),
      limit: z.number().int().min(1).max(100).default(50),
      before: z.string().uuid().optional(),
    }),
    result: z.object({
      messages: z.array(z.object({
        messageID: z.string().uuid(),
        content: z.string(),
        authorID: z.string().uuid(),
        timestamp: z.string().datetime(),
        edited: z.boolean(),
      })),
      hasMore: z.boolean(),
    }),
    execute: async ({ channelID, limit, before }) => {
      // Implementation would fetch messages...
      return {
        messages: [{
          messageID: crypto.randomUUID(),
          content: "Hello world!",
          authorID: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          edited: false,
        }],
        hasMore: false
      };
    }
  })
});

export type ChatAPI = typeof chatBook;
```

### Use Directly (Same Process)

```typescript
// Execute in the same process
import { execute } from "@usirin/spellbook";

const result = await execute(chatBook, "sendMessage", {
  channelID: "123e4567-e89b-12d3-a456-426614174000",
  content: "Hello, world!"
});
```

### Use Remotely (WebSocket)

```typescript
// Server
const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', (ws) => {
  serve(chatBook, createServerWebSocketTransport(ws));
});

// Client
const ws = new WebSocket('ws://localhost:8080');
ws.addEventListener('open', () => {
  const chat = createSpellCaster<ChatAPI>({ 
    transport: createClientWebSocketTransport(ws) 
  });
  
  chat.cast("sendMessage", {
    channelID: "123e4567-e89b-12d3-a456-426614174000",
    content: "Hello from the client!"
  }).then(console.log);
});
```

## Installation

```bash
npm install @usirin/spellbook
# or: yarn add @usirin/spellbook
# or: pnpm add @usirin/spellbook
```

## Key Concepts

- **Spells**: Individual operations with typed parameters and results
- **Spellbooks**: Collections of spells that form a complete API surface
- **Transports**: Communication channels (WebSocket, EventEmitter, etc.)
- **SpellCaster**: Client for casting spells through a transport

## Features

- **Type Safety**: End-to-end TypeScript type safety across process boundaries
- **Schema Validation**: [Standard Schema](https://standardschema.dev/) support for Zod, Valibot, ArkType, etc.
- **Transport Agnostic**: Works with any transport (WebSocket, EventEmitter, or custom)
- **Progressive Scaling**: Start with everything in-process, scale out as needed

## Documentation

See the [docs directory](./docs) for detailed documentation:
- [Core Concepts](./docs/core-concepts.md)
- [API Reference](./docs/api-reference.md)
- [Transports](./docs/transports.md)
- [Schema Validation](./docs/schema-validation.md)

## License

[MIT](LICENSE)
