# Spellbook Transport Protocol Specification
Version: 1.1.0

## 1. Introduction

The Spellbook Transport Protocol (STP) enables type-safe communication between API surfaces defined as spellbooks. It provides location transparency allowing the same API surface to work across process boundaries.

### 1.1 Core Concepts

| Term      | Definition |
|-----------|------------|
| Spellbook | A complete API surface containing a collection of spells |
| Spell     | An individual operation within a spellbook |
| Transport | A connection between spellbook instances |
| Surface   | The type-safe contract defined by a spellbook |

### 1.2 Design Principles

1. **API Surface First**: Spellbooks define complete API surfaces
2. **Location Transparency**: Same API surface works anywhere
3. **Transport Agnostic**: Surfaces connect through any transport
4. **Progressive Enhancement**: Start local, scale to network

## 2. API Surface Protocol

### 2.1 Spellbook Definition

A spellbook MUST define its complete API surface:

```typescript
const spellbook = createSpellbook({
  // Each spell is an operation in the API
  operation: createSpell({
    description: string,
    parameters: Schema,
    execute: (params) => Promise<Result>
  })
});

// The type of the API surface
type Surface = typeof spellbook;
```

### 2.2 Surface Connection

Spellbooks connect through transports:

```typescript
// Server side
serve(spellbook, transport);

// Client side
const client = createClient<Surface>(transport);
```

## 3. Message Protocol

Messages are an implementation detail of how surfaces communicate:

### 3.1 Request Message

A request message MUST be a JSON object with the following properties:

| Property   | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| tag       | string | Yes      | MUST be "req"                  |
| id        | string | Yes      | MUST follow format "req_<id>"  |
| name      | string | Yes      | MUST be valid spell name       |
| parameters | object | Yes      | MUST validate via spell schema |

Example:
```typescript
const request = createRequest({
  name: "frostbolt",
  parameters: { target: "enemy" }
});
// Produces:
{
  tag: "req",
  id: "req_8fKxM3z7yXbC",
  name: "frostbolt",
  parameters: { target: "enemy" }
}
```

### 3.2 Response Message

A response message MUST be a JSON object with the following properties:

| Property | Type   | Required | Description                     |
|----------|--------|----------|---------------------------------|
| tag      | string | Yes      | MUST be "resp"                 |
| id       | string | Yes      | MUST follow format "resp_<id>" |
| request  | object | Yes      | Original request object        |
| result   | any    | No       | Present on successful execution |
| error    | object | No       | Present on execution failure   |

Error object when present MUST contain:

| Property | Type   | Required | Description              |
|----------|--------|----------|--------------------------|
| message  | string | Yes      | Human readable message   |
| code     | string | No       | Error classification     |
| details  | any    | No       | Additional error context |

Example Success:
```typescript
{
  tag: "resp",
  id: "resp_9gLyN4w8zWdD",
  request: {
    tag: "req",
    id: "req_8fKxM3z7yXbC",
    name: "frostbolt",
    parameters: { target: "enemy" }
  },
  result: { damage: 10, target: "enemy" }
}
```

Example Error:
```typescript
{
  tag: "resp",
  id: "resp_2hJpQ5v9aReF",
  request: {
    tag: "req",
    id: "req_7kMwL6u4tYsG",
    name: "frostbolt",
    parameters: { target: 123 }
  },
  error: {
    message: "Invalid parameters",
    details: { target: "Expected string, got number" }
  }
}
```

## 4. Transport Protocol

### 4.1 Transport Interface

All transports MUST implement the following interfaces:

```typescript
interface ServerTransport {
  incoming: ReadableStream<Request>;
  outgoing: WritableStream<Response>;
}

interface ClientTransport {
  incoming: ReadableStream<Response>;
  outgoing: WritableStream<Request>;
}
```

### 4.2 Stream Requirements

1. All streams MUST use the Web Streams API
2. Streams MUST support backpressure
3. Messages MUST be processed in order
4. Error handling MUST use stream error mechanisms

### 4.3 Transport Processing

The server MUST process messages through a transform stream:

```typescript
function serve(spellbook: Spellbook, transport: ServerTransport) {
  return transport.incoming
    .pipeThrough(createSpellbookStream(spellbook))
    .pipeTo(transport.outgoing);
}
```

## 5. Validation Protocol

### 5.1 Schema Validation

All spells MUST define their parameters using StandardSchema:

```typescript
interface SpellSpec<TSchema extends StandardSchemaV1> {
  description: string;
  parameters: TSchema;
  execute: (params: StandardSchemaV1.InferInput<TSchema>) =>
    Promise<unknown>;
}
```

### 5.2 Validation Requirements

1. Parameter validation MUST occur before execution
2. Validation errors MUST be returned as error responses
3. Schema types MUST be preserved through transport

## 6. Implementation Patterns

### 6.1 Contract Definition

Spells SHOULD be defined using the following pattern:

```typescript
const spellbook = createSpellbook({
  spell: createSpell({
    description: string,
    parameters: StandardSchema,
    execute: async (params) => result
  })
});
```

### 6.2 Transport Implementation

Transports MUST be implemented following these patterns:

#### In-Process Transport
```typescript
const [client, server] = createEmitterPair();
const serverTransport = createServerTransport(server);
const clientTransport = createClientTransport(client);
```

#### Network Transport
```typescript
// Server
const transport = createServerWebSocketTransport(ws);
serve(spellbook, transport);

// Client
const transport = createClientWebSocketTransport(ws);
const result = await cast(transport, "spell", params);
```

### 6.3 Progressive Enhancement

Implementations SHOULD follow this development pattern:

1. Define contract using spells
2. Implement and test using in-process transport
3. Move to network transport when needed
4. Scale out as required

No changes to spell definitions or client code SHOULD be required when changing transports.

## 7. Security Considerations

### 7.1 Message Security

1. IDs MUST be generated using the forge factory
2. Parameters MUST be validated before processing
3. Error messages SHOULD NOT expose internal details

### 7.2 Transport Security

Network transports SHOULD:
1. Use secure connections (e.g., WSS for WebSocket)
2. Implement appropriate authentication
3. Handle connection errors gracefully