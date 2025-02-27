# API Reference

This document provides a comprehensive reference for the Spellbook API.

## Core API

### `createSpell`

Creates a new spell with typed parameters and result.

```typescript
function createSpell<
  TParamsSchema extends StandardV1, 
  TResultSchema extends StandardV1
>(spec: SpellSpec<TParamsSchema, TResultSchema>): Spell<TParamsSchema, TResultSchema>

interface SpellSpec<
  TParamsSchema extends StandardV1 = StandardV1<any, any>,
  TResultSchema extends StandardV1 = StandardV1<any, any>,
> {
  description: string;
  parameters: TParamsSchema;
  result: TResultSchema;
  execute: (
    parameters: StandardV1.InferOutput<TParamsSchema>,
  ) => Promise<StandardV1.InferOutput<TResultSchema>>;
}
```

**Example:**
```typescript
import { z } from "zod";
import { createSpell } from "@usirin/spellbook";

const addTodo = createSpell({
  description: "Add a new todo",
  parameters: z.object({
    text: z.string(),
    completed: z.boolean().default(false)
  }),
  result: z.object({
    id: z.string(),
    text: z.string(),
    completed: z.boolean()
  }),
  execute: async ({ text, completed }) => {
    // Implementation...
    return { id: "123", text, completed };
  }
});
```

### `createSpellbook`

Creates a spellbook from a collection of spells.

```typescript
function createSpellbook<TSpells extends Record<string, Spell>>(
  spells: TSpells
): { spells: TSpells };
```

**Example:**
```typescript
import { createSpellbook } from "@usirin/spellbook";

const todoBook = createSpellbook({
  add: addTodo,
  toggle: toggleTodo,
  delete: deleteTodo
});
```

### `execute`

Executes a spell from a spellbook with validation.

```typescript
async function execute<
  TSpellbook extends Spellbook = Spellbook,
  TSpellName extends keyof TSpellbook["spells"] = keyof TSpellbook["spells"]
>(
  spellbook: TSpellbook,
  name: TSpellName,
  parameters: StandardV1.InferInput<TSpellbook["spells"][TSpellName]["parameters"]>
): Promise<StandardV1.InferOutput<TSpellbook["spells"][TSpellName]["result"]>>
```

**Example:**
```typescript
import { execute } from "@usirin/spellbook";

const result = await execute(todoBook, "add", { text: "Buy milk" });
```

## Transport API

### `createRequest`

Creates a request object to be sent over a transport.

```typescript
function createRequest<TName extends keyof Spellbook["spells"]>({
  name, 
  parameters
}: {
  name: TName;
  parameters: StandardV1.InferInput<Spellbook["spells"][TName]["parameters"]>;
}): Request
```

### `createResponse`

Creates a response object to be sent back over a transport.

```typescript
function createResponse<TName extends keyof Spellbook["spells"]>({
  request, 
  result, 
  error
}: {
  request: Request;
  result?: ReturnType<Spellbook["spells"][TName]["execute"]>;
  error?: {message: string; code?: string; details?: unknown};
}): Response
```

### `createServerTransport`

Creates a transport for the server side.

```typescript
function createServerTransport({
  incoming, 
  outgoing
}: {
  incoming: ReadableStream<Request>;
  outgoing: WritableStream<Response>;
}): ServerTransport
```

### `createClientTransport`

Creates a transport for the client side.

```typescript
function createClientTransport({
  incoming, 
  outgoing
}: {
  incoming: ReadableStream<Response>;
  outgoing: WritableStream<Request>;
}): ClientTransport
```

### `createSpellbookStream`

Creates a transform stream that processes requests and produces responses.

```typescript
function createSpellbookStream(
  spellbook: Spellbook
): TransformStream<Request, Response>
```

## Server API

### `serve`

Simple function to serve a spellbook on a transport.

```typescript
function serve<TSpellbook extends Spellbook>(
  spellbook: TSpellbook,
  transport: ServerTransport
): Promise<void>
```

**Example:**
```typescript
import { serve } from "@usirin/spellbook/server";

serve(todoBook, serverTransport);
```

### `createSpellbookServer`

Creates a more advanced server with additional control.

```typescript
function createSpellbookServer<TSpellbook extends Spellbook>(
  spellbook: TSpellbook, 
  options: SpellbookServerOptions
): SpellbookServer<TSpellbook>

interface SpellbookServerOptions {
  transport: ServerTransport;
  config?: {
    validateParameters?: boolean;
  };
}

interface SpellbookServer<TSpellbook extends Spellbook> {
  start(): void;
  stop(): void;
  isRunning(): boolean;
  getSpellbook(): TSpellbook;
  getTransport(): ServerTransport;
}
```

**Example:**
```typescript
import { createSpellbookServer } from "@usirin/spellbook/server";

const server = createSpellbookServer(todoBook, {
  transport: serverTransport
});

server.start();
// Later...
server.stop();
```

## Client API

### `createSpellCaster`

Creates a client for casting spells through a transport.

```typescript
function createSpellCaster<TSpellbook extends Spellbook>(
  options: SpellCasterOptions
): SpellCasterSpec<TSpellbook>

interface SpellCasterOptions {
  transport: ClientTransport;
}

interface SpellCasterSpec<TSpellbook extends Spellbook> {
  cast<TName extends keyof TSpellbook["spells"]>(
    name: TName,
    parameters: Parameters<TSpellbook["spells"][TName]["execute"]>[0],
  ): Promise<ReturnType<TSpellbook["spells"][TName]["execute"]>>;
  
  getTransport(): ClientTransport;
}
```

**Example:**
```typescript
import { createSpellCaster } from "@usirin/spellbook/caster";
import type { TodoAPI } from "./todoBook";

const todos = createSpellCaster<TodoAPI>({
  transport: clientTransport
});

const todo = await todos.cast("add", { text: "Buy milk" });
```

### `cast`

Lower-level function for casting a spell through a transport.

```typescript
async function cast<
  TSpellbook extends Spellbook,
  TSpellName extends keyof TSpellbook["spells"] = keyof TSpellbook["spells"],
>(
  transport: ClientTransport,
  name: TSpellName,
  parameters: Parameters<TSpellbook["spells"][TSpellName]["execute"]>[0],
): Promise<ReturnType<TSpellbook["spells"][TSpellName]["execute"]>>
```

## Transport Implementations

### WebSocket Transport

```typescript
// Server
function createServerWebSocketTransport(ws: WebSocket): ServerTransport

// Client
function createClientWebSocketTransport(ws: WebSocket): ClientTransport
```

### EventEmitter Transport

```typescript
// Create a connected pair of emitters
function createEmitterPair(): [EventEmitter, EventEmitter]

// Server
function createServerTransport(emitter: EventEmitter): ServerTransport

// Client
function createClientTransport(emitter: EventEmitter): ClientTransport
```

## Type Definitions

### `Spell`

```typescript
type Spell<
  TParamsSchema extends StandardV1 = StandardV1<any, any>,
  TResultSchema extends StandardV1 = StandardV1<any, any>,
> = ReturnType<typeof createSpell<TParamsSchema, TResultSchema>>;
```

### `Spellbook`

```typescript
type Spellbook = ReturnType<typeof createSpellbook>;
```

### `Request`

```typescript
type Request = ReturnType<typeof createRequest>;
```

### `Response`

```typescript
type Response = ReturnType<typeof createResponse>;
```

### `ServerTransport`

```typescript
type ServerTransport = ReturnType<typeof createServerTransport>;
```

### `ClientTransport`

```typescript
type ClientTransport = ReturnType<typeof createClientTransport>;
```

### `SpellbookServer`

```typescript
type SpellbookServer<TSpellbook extends Spellbook = Spellbook> = ReturnType<
  typeof createSpellbookServer<TSpellbook>
>;
```

### `SpellCaster`

```typescript
type SpellCaster<TSpellbook extends Spellbook = Spellbook> = ReturnType<
  typeof createSpellCaster<TSpellbook>
>;
``` 