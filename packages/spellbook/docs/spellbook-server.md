# SpellbookServer: Type-Safe API Server

## Overview

SpellbookServer is the server-side component of the Spellbook system, responsible for serving spell executions across various transport mechanisms. It handles incoming spell requests, executes them against a spellbook, and sends responses back through the appropriate transport.

```typescript
// Create a SpellbookServer
const server = createSpellbookServer(mySpellbook, {
  transport: createWebSocketServerTransport(ws),
  storage: createDatabaseStorage(db)
});

// Start handling requests
server.start();
```

## Core Concepts

### 1. Request Handling

SpellbookServer manages the complete lifecycle of spell requests:

- **Receiving**: Listens for incoming requests through transport
- **Validation**: Ensures requests contain valid spell names and parameters
- **Execution**: Runs spell logic with validated parameters
- **Response**: Returns results or errors through transport

### 2. Transport Integration

A SpellbookServer abstracts transport details, allowing the same API to be served through different mechanisms:

- **Local**: In-memory event emitters for local development
- **Cross-Context**: PostMessage for iframes, workers, and electron contexts
- **Network**: WebSockets, HTTP, and other network protocols
- **Custom**: Custom transport implementations for specialized needs

### 3. Storage Support

SpellbookServer integrates with storage implementations to:

- **Persist State**: Maintain state between requests
- **Back Spells**: Provide data storage for spell implementations
- **Enable Transactions**: Perform atomic operations

## API Reference

### Creating a SpellbookServer

```typescript
function createSpellbookServer<TSpellbook extends Spellbook>(
  spellbook: TSpellbook,
  options: SpellbookServerOptions
): SpellbookServer;

interface SpellbookServerOptions {
  // Transport to use for communication
  transport: ServerTransport;
  
  // Optional storage for persistence
  storage?: Storage;
  
  // Configuration options
  config?: {
    // Whether to validate parameters (default: true)
    validateParameters?: boolean;
  };
}
```

### SpellbookServer Interface

```typescript
interface SpellbookServer {
  // Start processing requests
  start(): void;
  
  // Stop processing requests
  stop(): void;
  
  // Check if server is running
  isRunning(): boolean;
  
  // Access the underlying spellbook
  getSpellbook(): Spellbook;
  
  // Access the underlying transport
  getTransport(): ServerTransport;
  
  // Access the underlying storage (if provided)
  getStorage(): Storage | null;
}
```

## Usage Examples

### Basic Server

```typescript
// Define your spellbook
const todoBook = createSpellbook({
  // Get all todos
  list: createSpell({
    description: "List all todos",
    parameters: z.void(),
    execute: async (_, { storage }) => {
      return await storage.get("todos") || [];
    }
  }),
  
  // Add a new todo
  add: createSpell({
    description: "Add a new todo",
    parameters: z.object({
      text: z.string()
    }),
    execute: async ({ text }, { storage }) => {
      const todos = await storage.get("todos") || [];
      const newTodo = { id: Date.now().toString(), text, completed: false };
      todos.push(newTodo);
      await storage.set("todos", todos);
      return newTodo;
    }
  }),
  
  // Toggle todo completion
  toggle: createSpell({
    description: "Toggle todo completion",
    parameters: z.object({
      id: z.string()
    }),
    execute: async ({ id }, { storage }) => {
      const todos = await storage.get("todos") || [];
      const todo = todos.find(t => t.id === id);
      if (!todo) throw new Error(`Todo ${id} not found`);
      todo.completed = !todo.completed;
      await storage.set("todos", todos);
      return todo;
    }
  })
});

// In-process server for local development
const [clientTransport, serverTransport] = createTransportPair();
const server = createSpellbookServer(todoBook, {
  transport: serverTransport,
  storage: createMemoryStorage()
});

// Start the server
server.start();

// Create a client to use the API
const client = createSpellCaster<typeof todoBook>({
  transport: clientTransport
});

// Now you can use the API
await client.cast("add", { text: "Learn Spellbook" });
const todos = await client.cast("list", undefined);
```

### WebSocket Server

```typescript
// Server-side (Node.js)
import { WebSocketServer } from 'ws';
import { createSpellbookServer, createWebSocketServerTransport } from '@usirin/spellbook';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  // Create a server transport for this connection
  const transport = createWebSocketServerTransport(ws);
  
  // Create a server for this connection
  const server = createSpellbookServer(todoBook, {
    transport,
    storage: createDatabaseStorage(db)
  });
  
  // Start processing requests
  server.start();
  
  // Stop when connection closes
  ws.on('close', () => server.stop());
});

// Client-side (Browser)
import { createSpellCaster, createWebSocketClientTransport } from '@usirin/spellbook';

const ws = new WebSocket('ws://localhost:8080');

ws.addEventListener('open', () => {
  // Create a client transport
  const transport = createWebSocketClientTransport(ws);
  
  // Create a client
  const client = createSpellCaster<typeof todoBook>({
    transport
  });
  
  // Now you can use the API
  client.cast("list", undefined).then(console.log);
});
```

### Simple Storage Integration

```typescript
// Memory storage for development
const memoryStorage = createMemoryStorage();

// Use the storage with a server
const server = createSpellbookServer(todoBook, {
  transport: serverTransport,
  storage: memoryStorage
});

// Start the server
server.start();
```

## Conclusion

SpellbookServer provides the server-side component for executing spells and managing state. It pairs with SpellCaster clients to create a complete API system with strong type safety, flexible transport options, and optional state persistence.

By moving storage responsibilities to the server side, the system maintains a clean separation of concerns - clients focus on requesting operations while servers handle execution and state management. 