# Transports

In Spellbook, **transports** are the communication channels that connect SpellCasters (clients) to Spellbooks (servers). They abstract away the details of how messages are sent and received, allowing your Spellbook API to work across different environments and process boundaries.

## Understanding Transports

At their core, transports in Spellbook are built on the [Web Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API), providing a consistent interface for different communication mechanisms:

```typescript
interface ClientTransport {
  incoming: ReadableStream<Response>;
  outgoing: WritableStream<Request>;
}

interface ServerTransport {
  incoming: ReadableStream<Request>;
  outgoing: WritableStream<Response>;
}
```

This abstraction allows Spellbook to work with various communication methods while maintaining the same API surface.

## Built-in Transports

Spellbook comes with several built-in transport implementations:

### Same-Process Transport

The simplest transport operates within the same JavaScript process, useful for testing or when client and server run in the same environment.

```typescript
import { createSpellbook, execute } from "@usirin/spellbook";

// Create a spellbook with spells
const myBook = createSpellbook({...});

// Use it directly in the same process
const result = await execute(myBook, "mySpell", { param1: "value" });
```

### EventEmitter Transport

For communication between different parts of a Node.js application, the EventEmitter transport uses Node.js's built-in event system.

```typescript
import { createEmitterPair } from "@usirin/spellbook/transports/emitter";
import { createSpellCaster } from "@usirin/spellbook/caster";
import { serve } from "@usirin/spellbook/server";

// Create a pair of connected emitters
const [serverEmitter, clientEmitter] = createEmitterPair();

// Create transports
const serverTransport = createServerTransport(serverEmitter);
const clientTransport = createClientTransport(clientEmitter);

// Serve the spellbook on the server transport
serve(myBook, serverTransport);

// Create a spell caster with the client transport
const caster = createSpellCaster({ transport: clientTransport });

// Cast spells through the transport
const result = await caster.cast("mySpell", { param1: "value" });
```

### WebSocket Transport

For communication across network boundaries, the WebSocket transport enables Spellbook to work across different machines.

```typescript
// Server side (example using ws library)
import { WebSocket, WebSocketServer } from "ws";
import { createServerWebSocketTransport } from "@usirin/spellbook/transports/websocket";
import { serve } from "@usirin/spellbook/server";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  const transport = createServerWebSocketTransport(ws);
  serve(myBook, transport);
});

// Client side
import { createClientWebSocketTransport } from "@usirin/spellbook/transports/websocket";
import { createSpellCaster } from "@usirin/spellbook/caster";

const ws = new WebSocket("ws://localhost:8080");

ws.onopen = () => {
  const transport = createClientWebSocketTransport(ws);
  const caster = createSpellCaster({ transport });
  
  caster.cast("mySpell", { param1: "value" })
    .then(result => console.log(result));
};
```

## Creating Custom Transports

Spellbook's transport system is extensible. You can create custom transports for any communication mechanism by implementing the transport interface:

```typescript
import { createClientTransport, createServerTransport } from "@usirin/spellbook/transport";

// Example creating a custom transport using some hypothetical message channel
function createMyCustomServerTransport(channel) {
  // Create streams for incoming requests and outgoing responses
  const requestController = new TransformStream();
  const responseController = new TransformStream();
  
  // Hook up the channel to the streams
  channel.onMessage = (message) => {
    const writer = requestController.writable.getWriter();
    writer.write(JSON.parse(message));
    writer.releaseLock();
  };
  
  const responseWriter = responseController.readable.getReader();
  responseWriter.read().then(function process({ done, value }) {
    if (!done) {
      channel.send(JSON.stringify(value));
      return responseWriter.read().then(process);
    }
  });
  
  // Create and return the transport
  return createServerTransport({
    incoming: requestController.readable,
    outgoing: responseController.writable
  });
}
```

## Transport Serialization

Transports handle serialization and deserialization of requests and responses. By default, Spellbook transports convert complex objects to and from JSON when sending data across process boundaries.

If you need custom serialization logic, you can implement it in your custom transport.

## Cross-Environment Considerations

When using transports across different environments, consider these factors:

### Browser to Server

For browser to server communication, the WebSocket transport is ideal. Ensure your server handles CORS properly if necessary.

### Server to Server

For server-to-server communication, you can use WebSockets or implement a custom HTTP-based transport.

### Microservices

In a microservices architecture, each service can expose its functionality as a Spellbook, with various transports connecting them based on deployment needs.

## Error Handling

Transports propagate errors from the server to the client. When a spell execution fails on the server, the error is serialized, sent through the transport, and rethrown on the client side, maintaining the original error message and stack trace where possible.

```typescript
try {
  await caster.cast("riskySpell", { param1: "value" });
} catch (error) {
  console.error("Spell failed:", error.message);
}
```

## Performance Considerations

- **WebSockets** provide low-latency, bi-directional communication but may require handling reconnection logic.
- **EventEmitter** is efficient for same-process communication but doesn't work across network boundaries.
- Consider batching multiple spell casts in performance-critical applications.

## Security Considerations

- Always validate input parameters on the server side, even if clients perform validation.
- Use secure WebSocket connections (wss://) for production.
- Consider implementing authentication and authorization in your transport layer or spell execution.

## Transport Protocol

Under the hood, transports in Spellbook use a simple request-response protocol:

```typescript
interface Request {
  id: string;
  name: string;
  parameters: unknown;
}

interface Response {
  id: string;
  result?: unknown;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}
```

This protocol ensures that responses can be correctly matched to their originating requests, even in asynchronous environments. 