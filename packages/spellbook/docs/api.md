# Spellbook API Reference

## Core API

### `createSpell`

Creates a new spell with typed parameters and result.

```typescript
function createSpell<TSchema extends StandardV1, TReturn>(spec: SpellSpec<TSchema, TReturn>): Spell<TSchema, TReturn>

interface SpellSpec<TSchema extends StandardV1, TReturn> {
  description: string;
  parameters: TSchema;
  execute: (parameters: StandardV1.InferOutput<TSchema>) => Promise<TReturn>;
}
```

Usage:
```typescript
const add = createSpell({
  description: "Add two numbers",
  parameters: z.object({
    a: z.number(),
    b: z.number()
  }),
  execute: async ({ a, b }) => a + b
});
```

### `createSpellbook`

Creates a spellbook from a collection of spells.

```typescript
function createSpellbook<TSpells extends Record<string, Spell>>(
  spells: TSpells
): { spells: TSpells };
```

Usage:
```typescript
const mathBook = createSpellbook({
  add,
  subtract
});
```

### `execute`

Executes a spell from a spellbook directly.

```typescript
async function execute<
  TSpellbook extends Spellbook,
  TSpellName extends keyof TSpellbook["spells"]
>(
  spellbook: TSpellbook,
  name: TSpellName,
  parameters: StandardV1.InferInput<TSpellbook["spells"][TSpellName]["parameters"]>
): Promise<ReturnType<TSpellbook["spells"][TSpellName]["execute"]>>;
```

Usage:
```typescript
const result = await execute(mathBook, "add", { a: 5, b: 3 });
```

## Client API

### `createSpellCaster`

Creates a client for casting spells through a transport.

```typescript
function createSpellCaster<TSpellbook extends Spellbook>(
  options: SpellCasterOptions
): SpellCaster<TSpellbook>;

interface SpellCasterOptions {
  transport: ClientTransport;
}

interface SpellCaster<TSpellbook extends Spellbook> {
  cast<TName extends keyof TSpellbook["spells"]>(
    name: TName,
    parameters: Parameters<TSpellbook["spells"][TName]["execute"]>[0]
  ): Promise<ReturnType<TSpellbook["spells"][TName]["execute"]>>;
  
  getTransport(): ClientTransport;
  setTransport(transport: ClientTransport): void;
}
```

Usage:
```typescript
const caster = createSpellCaster<typeof mathBook>({
  transport: clientTransport
});

const sum = await caster.cast("add", { a: 5, b: 3 });
```

### `cast`

Low-level function for casting a spell through a transport.

```typescript
async function cast<
  TSpellbook extends Spellbook,
  TSpellName extends keyof TSpellbook["spells"]
>(
  transport: ClientTransport,
  name: TSpellName,
  parameters: Parameters<TSpellbook["spells"][TSpellName]["execute"]>[0]
): Promise<ReturnType<TSpellbook["spells"][TSpellName]["execute"]>>;
```

Usage:
```typescript
const sum = await cast<typeof mathBook>(
  clientTransport,
  "add",
  { a: 5, b: 3 }
);
```

## Server API

### `createSpellbookServer`

Creates a server for handling spell execution requests.

```typescript
function createSpellbookServer<TSpellbook extends Spellbook>(
  spellbook: TSpellbook,
  options: SpellbookServerOptions
): SpellbookServer;

interface SpellbookServerOptions {
  transport: ServerTransport;
  config?: {
    validateParameters?: boolean;
  };
}

interface SpellbookServer {
  start(): void;
  stop(): void;
  isRunning(): boolean;
  getSpellbook(): Spellbook;
  getTransport(): ServerTransport;
}
```

Usage:
```typescript
const server = createSpellbookServer(mathBook, {
  transport: serverTransport
});

server.start();
```

### `serve`

Low-level function for serving a spellbook on a transport.

```typescript
function serve<TSpellbook extends Spellbook>(
  spellbook: TSpellbook,
  transport: ServerTransport
): Promise<void>;
```

Usage:
```typescript
serve(mathBook, serverTransport);
```

## Transport API

### `createRequest`

Creates a request message for transport.

```typescript
function createRequest({
  name: string,
  parameters: any
}): Request;
```

### `createResponse`

Creates a response message for transport.

```typescript
function createResponse({
  request: Request,
  result?: any,
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  }
}): Response;
```

### `createSpellbookStream`

Creates a transform stream for handling spell requests.

```typescript
function createSpellbookStream(
  spellbook: Spellbook
): TransformStream<Request, Response>;
```

## Transport Implementations

### In-Memory Transport

```typescript
// Create a transport pair for local development
function createEmitterPair(): [EventEmitter, EventEmitter];

function createServerTransport(emitter?: EventEmitter): ServerTransport;
function createClientTransport(emitter?: EventEmitter): ClientTransport;
```

Usage:
```typescript
const [clientEmitter, serverEmitter] = createEmitterPair();
const serverTransport = createServerTransport(serverEmitter);
const clientTransport = createClientTransport(clientEmitter);
```

### WebSocket Transport

```typescript
function createServerWebSocketTransport(ws: WebSocket): ServerTransport;
function createClientWebSocketTransport(ws: WebSocket): ClientTransport;
```

Usage:
```typescript
// Server
const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', (ws) => {
  const transport = createServerWebSocketTransport(ws);
  serve(spellbook, transport);
});

// Client
const ws = new WebSocket('ws://localhost:8080');
const transport = createClientWebSocketTransport(ws);
const client = createSpellCaster<typeof spellbook>({ transport });
``` 