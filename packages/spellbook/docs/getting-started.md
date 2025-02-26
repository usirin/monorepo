# Getting Started with Spellbook

Welcome to Spellbook - a library for defining type-safe API surfaces that can work across process boundaries. This guide will help you get started with building your first Spellbook application.

## Installation

```bash
# Using npm
npm install @usirin/spellbook

# Using yarn
yarn add @usirin/spellbook

# Using pnpm
pnpm add @usirin/spellbook
```

## Basic Concepts

Spellbook consists of a few key concepts:

1. **Spells**: Individual operations with typed parameters and results
2. **Spellbook**: A collection of spells that form a complete API surface
3. **Transport**: Communication channels connecting API surfaces
4. **SpellCaster**: Client for casting spells through a transport
5. **SpellbookServer**: Server for handling spell execution requests

## Defining Your First Spellbook

Let's create a simple calculator API:

```typescript
import { z } from "zod";
import { createSpell, createSpellbook } from "@usirin/spellbook";

// Define individual spells
const add = createSpell({
  description: "Add two numbers",
  parameters: z.object({
    a: z.number(),
    b: z.number()
  }),
  execute: async ({ a, b }) => a + b
});

const subtract = createSpell({
  description: "Subtract two numbers",
  parameters: z.object({
    a: z.number(),
    b: z.number()
  }),
  execute: async ({ a, b }) => a - b
});

// Combine spells into a spellbook
const calculatorBook = createSpellbook({
  add,
  subtract
});

// Export the type for client use
export type CalculatorBook = typeof calculatorBook;
```

## Local Development

For local development, you can use the in-memory transport:

```typescript
import { createEmitterPair } from "@usirin/spellbook/transports/emitter";
import { serve } from "@usirin/spellbook/server";
import { cast } from "@usirin/spellbook/caster";

// Create a transport pair (client and server)
const [clientEmitter, serverEmitter] = createEmitterPair();
const clientTransport = createClientTransport(clientEmitter);
const serverTransport = createServerTransport(serverEmitter);

// Serve the spellbook on the server transport
serve(calculatorBook, serverTransport);

// Cast spells from the client
async function calculate() {
  // Add two numbers
  const sum = await cast<CalculatorBook>(clientTransport, "add", { a: 5, b: 3 });
  console.log("Sum:", sum); // 8
  
  // Subtract two numbers
  const difference = await cast<CalculatorBook>(clientTransport, "subtract", { a: 10, b: 4 });
  console.log("Difference:", difference); // 6
}

calculate();
```

## WebSocket Example

For network communication, you can use WebSockets:

### Server (Node.js)

```typescript
import { WebSocketServer } from 'ws';
import { createServerWebSocketTransport } from "@usirin/spellbook/transports/websocket";
import { serve } from "@usirin/spellbook/server";
import { calculatorBook } from "./calculator";

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Create a server transport for this connection
  const transport = createServerWebSocketTransport(ws);
  
  // Serve the spellbook on this transport
  serve(calculatorBook, transport);
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server listening on port 8080');
```

### Client (Browser)

```typescript
import { createClientWebSocketTransport } from "@usirin/spellbook/transports/websocket";
import { cast } from "@usirin/spellbook/caster";
import type { CalculatorBook } from "./calculator";

const ws = new WebSocket('ws://localhost:8080');

ws.addEventListener('open', async () => {
  // Create a client transport
  const transport = createClientWebSocketTransport(ws);
  
  try {
    // Add two numbers
    const sum = await cast<CalculatorBook>(transport, "add", { a: 5, b: 3 });
    console.log("Sum:", sum); // 8
    
    // Subtract two numbers
    const difference = await cast<CalculatorBook>(transport, "subtract", { a: 10, b: 4 });
    console.log("Difference:", difference); // 6
  } catch (error) {
    console.error("Error:", error);
  }
});

ws.addEventListener('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.addEventListener('close', () => {
  console.log('Connection closed');
});
```

## Next Steps

Now that you have a basic understanding of Spellbook, you can:

1. Define more complex API surfaces with your own business logic
2. Explore different transport mechanisms
3. Implement error handling and validation
4. Check out the full API documentation for advanced features

## Full Example App

For a complete example of a todo application using Spellbook, check out our [example repository](https://github.com/usirin/spellbook-examples). 