# @usirin/spellcaster

Remote execution of spells defined in spellbooks.

[![npm version](https://img.shields.io/npm/v/@usirin/spellcaster.svg)](https://www.npmjs.com/package/@usirin/spellcaster)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Overview

SpellCaster allows you to remotely execute spells defined in a spellbook, across process boundaries, with full type safety and validation.

- Execute spells defined with `@usirin/spellbook` across process boundaries
- Maintain full type safety and validation between client and server
- Built-in transports for WebSockets and EventEmitters

## Installation

```bash
npm install @usirin/spellcaster @usirin/spellbook
```

## Quick Start

### Server

```typescript
import { createSpellbook, createSpell } from '@usirin/spellbook';
import { createSpellbookServer, createServerWebSocketTransport } from '@usirin/spellcaster';
import { WebSocketServer } from 'ws';
import { z } from 'zod';

// Define your API with spellbook
const myAPI = createSpellbook({
  "hello:world": createSpell({
    description: "Say hello",
    parameters: z.object({ name: z.string() }),
    result: z.object({ message: z.string() }),
    execute: async ({ name }) => ({ message: `Hello, ${name}!` })
  })
});

// Create a WebSocket server
const wss = new WebSocketServer({ port: 8080 });

// Handle connections
wss.on('connection', (ws) => {
  const server = createSpellbookServer(myAPI, {
    transport: createServerWebSocketTransport(ws)
  });
  server.start();
});
```

### Client

```typescript
import { createSpellCaster, createClientWebSocketTransport } from '@usirin/spellcaster';
import WebSocket from 'ws';

// Connect to the spell server
const ws = new WebSocket('ws://localhost:8080');

ws.addEventListener('open', async () => {
  const api = createSpellCaster<typeof myAPI>({
    transport: createClientWebSocketTransport(ws)
  });
  
  // Call a remote spell with full type safety
  const result = await api.cast('hello:world', { name: 'SpellCaster' });
  console.log(result.message); // "Hello, SpellCaster!"
});
```

## Alternatives

For simpler use cases without explicit server management:

```typescript
import { serve, createServerWebSocketTransport } from '@usirin/spellcaster';

wss.on('connection', (ws) => {
  serve(myAPI, createServerWebSocketTransport(ws));
});
```

## EventEmitter Transport

For in-process communication:

```typescript
import { createEmitterPair, createClientTransport, createServerTransport, serve } from '@usirin/spellcaster';

const [clientEmitter, serverEmitter] = createEmitterPair();
const clientTransport = createClientTransport(clientEmitter);
const serverTransport = createServerTransport(serverEmitter);

// Server
serve(myAPI, serverTransport);

// Client
const api = createSpellCaster<typeof myAPI>({ transport: clientTransport });
const result = await api.cast('hello:world', { name: 'SpellCaster' });
```

## License

[MIT](LICENSE)