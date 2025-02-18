# RFC 013: Spellbook Stream Mechanics

## Summary
This RFC describes how Spellbook uses streams to connect different components for RPC communication. The stream-based approach provides natural queueing, backpressure handling, and order preservation for remote procedure calls.

## Background
Remote Procedure Calls (RPC) traditionally use request-response patterns that can be hard to manage when dealing with multiple concurrent calls, ordering requirements, and backpressure. Web Streams provide a natural solution to these challenges by offering built-in queueing and flow control.

## Design

### Core Components

```ascii
┌──────────┐    ┌─────────────────┐    ┌──────────┐
│  Client  │    │    Transport    │    │  Server  │
│          │    │                 │    │          │
│   req ───┼───>│ input          │    │          │
│          │    │     transform   │    │  spell   │
│   res <──┼────│ output         │    │          │
└──────────┘    └─────────────────┘    └──────────┘
```

1. **Transport Interface**
```typescript
type Transport<TSpells> = {
  input: WritableStream<SpellbookRequest>;
  output: ReadableStream<SpellbookResponse>;
}
```

2. **Request/Response Types**
```typescript
type SpellbookRequest = {
  id: string;
  spell: string;
  parameters: unknown;
}

type SpellbookResponse = {
  id: string;
  result?: unknown;
  error?: {
    message: string;
    details?: unknown;
  }
}
```

### Stream Flow

1. **Request Initiation**
   - Client creates request with unique ID
   - Request written to transport.input
   - WritableStream handles backpressure

2. **Transport Processing**
   - TransformStream connects input/output
   - Requests queued naturally
   - Order preserved through transform

3. **Response Handling**
   - Responses written to output stream
   - Client reads responses
   - IDs match requests/responses

### Implementation Example

```typescript
function createMemoryTransport(spellbook) {
  const {readable, writable} = new TransformStream({
    async transform(request, controller) {
      try {
        const result = await spellbook.execute(
          request.spell,
          request.parameters
        );
        controller.enqueue({
          id: request.id,
          result
        });
      } catch (error) {
        controller.enqueue({
          id: request.id,
          error: {
            message: error.message,
            details: error
          }
        });
      }
    }
  });

  return {
    input: writable,
    output: readable
  };
}
```

### Benefits

1. **Natural Queueing**
   - Requests automatically queued
   - No manual queue management
   - Built-in backpressure handling

2. **Order Preservation**
   - Requests processed in order
   - Responses matched to requests
   - No manual ordering logic

3. **Resource Management**
   - Automatic cleanup
   - Stream closing handles cleanup
   - Memory efficient

4. **Extensibility**
   - Custom transports easy to add
   - Stream primitives well supported
   - Cross-platform compatible

## Drawbacks

1. **Learning Curve**
   - Stream concepts need understanding
   - Different from traditional RPC
   - More complex initial setup

2. **Debug Complexity**
   - Stream state can be opaque
   - Need specialized tooling
   - Error handling more complex

## Alternatives

1. **Traditional Request/Response**
   - Simpler but less powerful
   - Manual queue management
   - No built-in backpressure

2. **Event Emitters**
   - Familiar pattern
   - Less structured
   - Manual ordering

3. **Message Queues**
   - External dependency
   - More infrastructure
   - Higher complexity

## Adoption Strategy

1. Start with memory transport
2. Add network transport later
3. Provide migration guides
4. Create testing utilities

## Future Possibilities

1. **Bidirectional Streaming**
   - Server initiated calls
   - Continuous updates
   - Event streaming

2. **Multiplexing**
   - Multiple spellbooks
   - Shared transports
   - Resource optimization

3. **Monitoring**
   - Stream metrics
   - Performance tracking
   - Debug tooling 