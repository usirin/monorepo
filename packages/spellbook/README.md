# Spellbook

Type-safe API surfaces that work across process boundaries.

[![npm version](https://img.shields.io/npm/v/@usirin/spellbook.svg)](https://www.npmjs.com/package/@usirin/spellbook)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Overview

Spellbook allows you to define complete type-safe API surfaces and connect them through various transports, enabling seamless transitions from local to distributed systems. Define once, run anywhere.

```typescript
// Define your API surface
const todoBook = createSpellbook({
  // Add a new todo
  add: createSpell({
    description: "Add a new todo",
    parameters: z.object({
      text: z.string()
    }),
    execute: async ({ text }) => {
      // Implementation details...
      return { id: "123", text, completed: false };
    }
  }),
  
  // Toggle todo completion
  toggle: createSpell({
    description: "Toggle todo completion",
    parameters: z.object({
      id: z.string()
    }),
    execute: async ({ id }) => {
      // Implementation details...
      return { id, completed: true };
    }
  })
});

// The type of your API surface
type TodoAPI = typeof todoBook;
```

## Features

- **Type-Safe API Surfaces**: Define your complete API with full TypeScript support
- **Transport Agnostic**: Run the same API locally or remotely without changing code
- **Progressive Enhancement**: Start with everything in-process, then scale as needed
- **Flexible Implementation**: Use any serializable schema library (Zod, Valibot)
- **Modern Architecture**: Built on Web Streams for efficient data flow

## Installation

```bash
# Using npm
npm install @usirin/spellbook

# Using yarn
yarn add @usirin/spellbook

# Using pnpm
pnpm add @usirin/spellbook
```

## Quick Start

### 1. Define your API surface

```typescript
import { z } from "zod";
import { createSpell, createSpellbook } from "@usirin/spellbook";

const counterBook = createSpellbook({
  increment: createSpell({
    description: "Increment the counter",
    parameters: z.object({
      amount: z.number().default(1)
    }),
    execute: async ({ amount }) => {
      return { newValue: amount }; // Simplified example
    }
  }),
  
  decrement: createSpell({
    description: "Decrement the counter",
    parameters: z.object({
      amount: z.number().default(1)
    }),
    execute: async ({ amount }) => {
      return { newValue: -amount }; // Simplified example
    }
  })
});

// Export the type for client use
export type CounterBook = typeof counterBook;
```

### 2. Local Development

```typescript
import { createEmitterPair } from "@usirin/spellbook/transports/emitter";
import { serve } from "@usirin/spellbook/server";
import { createSpellCaster } from "@usirin/spellbook/caster";
import { counterBook } from "./counter";

// Create transport pair
const [clientEmitter, serverEmitter] = createEmitterPair();
const clientTransport = createClientTransport(clientEmitter);
const serverTransport = createServerTransport(serverEmitter);

// Create server
serve(counterBook, serverTransport);

// Create client
const counter = createSpellCaster<typeof counterBook>({
  transport: clientTransport
});

// Use the API
async function demo() {
  const { newValue } = await counter.cast("increment", { amount: 5 });
  console.log("New value:", newValue);
}

demo();
```

### 3. WebSocket Server

```typescript
import { WebSocketServer } from 'ws';
import { createServerWebSocketTransport } from "@usirin/spellbook/transports/websocket";
import { serve } from "@usirin/spellbook/server";

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  const transport = createServerWebSocketTransport(ws);
  serve(counterBook, transport);
});
```

### 4. WebSocket Client

```typescript
import { createClientWebSocketTransport } from "@usirin/spellbook/transports/websocket";
import { createSpellCaster } from "@usirin/spellbook/caster";

const ws = new WebSocket('ws://localhost:8080');

ws.addEventListener('open', () => {
  const transport = createClientWebSocketTransport(ws);
  const counter = createSpellCaster<CounterBook>({ 
    transport 
  });
  
  // Use the remote API with the same type safety
  counter.cast("increment", { amount: 5 })
    .then(({ newValue }) => console.log("New value:", newValue));
});
```

## Documentation

For more detailed documentation, please see:

- [Getting Started Guide](./docs/getting-started.md)
- [API Reference](./docs/api.md)
- [Transport Protocol](./docs/transport-protocol.md)
- [SpellCaster Documentation](./docs/spellcaster.md)
- [SpellbookServer Documentation](./docs/spellbook-server.md)

## Examples

Check out the [examples directory](./examples) for complete working examples.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
