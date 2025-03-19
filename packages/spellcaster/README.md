# @usirin/spellcaster

Remote execution of spells defined in spellbooks.

## Installation

```bash
npm install @usirin/spellcaster @usirin/spellbook
```

## Overview

SpellCaster allows you to remotely execute spells defined in a spellbook, across process boundaries, with full type safety and validation. It provides a clean separation between:

1. **Defining operations** (handled by `@usirin/spellbook`)
2. **Executing operations remotely** (handled by `@usirin/spellcaster`)

## Usage

### Server

```typescript
import { createSpellbook, createSpell } from '@usirin/spellbook';
import { createSpellServer, createWebSocketTransport } from '@usirin/spellcaster';
import { WebSocketServer } from 'ws';
import { z } from 'zod';

// Define your spellbook
const userApi = createSpellbook({
  getUser: createSpell({
    description: 'Get user by ID',
    parameters: z.object({ id: z.string() }),
    result: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email()
    }),
    execute: async ({ id }) => {
      // Implementation
      return database.users.findById(id);
    }
  })
});

// Create a WebSocket server
const wss = new WebSocketServer({ port: 8080 });

// Handle connections
wss.on('connection', (ws) => {
  // Create a spell server that handles incoming casts
  createSpellServer({
    spellbook: userApi,
    transport: createWebSocketTransport(ws)
  });
});
```

### Client

```typescript
import { createSpellCaster, createWebSocketTransport } from '@usirin/spellcaster';
import WebSocket from 'ws';

// Create a connection to the spell server
const ws = new WebSocket('ws://localhost:8080');

ws.addEventListener('open', () => {
  // Create a spellcaster with full type safety
  const api = createSpellCaster<typeof userApi>({
    transport: createWebSocketTransport(ws)
  });
  
  // Cast spells remotely with full type checking
  api.cast('getUser', { id: '123' })
    .then(user => console.log(`User: ${user.name}`))
    .catch(error => console.error('Error:', error.message));
});
```

## Error Handling

SpellCaster provides detailed error types for different failure scenarios:

```typescript
try {
  const result = await api.cast('getUser', { id: 'invalid' });
} catch (error) {
  if (error.code === 'SPELL_FAILED') {
    // The spell was executed but failed
    console.error('Spell execution failed:', error.message);
  } else if (error.code === 'TRANSPORT_ERROR') {
    // Communication problem
    console.error('Transport error:', error.message);
  } else if (error.code === 'TIMEOUT') {
    // Cast took too long
    console.error('Spell timed out after', error.timeout, 'ms');
  }
}
```

## Batch Casting

SpellCaster supports casting multiple spells in a single batch:

```typescript
const [user, posts] = await api.castMany([
  { spell: 'getUser', params: { id: '123' } },
  { spell: 'getUserPosts', params: { userId: '123' } }
]);
```

## Advanced Configuration

```typescript
// Configure timeouts and retries
const api = createSpellCaster<typeof userApi>({
  transport: createWebSocketTransport(ws),
  timeout: 5000 // 5 seconds default timeout
});

// Per-cast options
const result = await api.cast('slowOperation', params, {
  timeout: 10000, // 10 seconds for this specific call
  retry: {
    maxRetries: 3,
    delay: 1000 // 1 second between retries
  }
});
```

## License

MIT