# SpellCaster: Type-Safe Spell Execution

## Overview

SpellCaster is the client-side gateway to spellbooks, providing a type-safe interface for executing spells across various transport mechanisms. It abstracts away the details of communication, allowing developers to focus on their API without worrying about the underlying transport mechanism.

```typescript
// Create a SpellCaster for a specific spellbook type
const caster = createSpellCaster<typeof mySpellbook>({
  transport: createWebSocketTransport(ws)
});

// Cast spells with full type safety
const result = await caster.cast("spellName", { param1: "value" });
```

## Core Concepts

### 1. Transport Abstraction

SpellCaster creates a clean separation between your API (the spellbook) and how it's transported. This enables:

- **Location Transparency**: Run your API locally or remotely without changing code
- **Transport Swapping**: Change transport mechanisms without modifying your business logic
- **Progressive Enhancement**: Start with in-process communication and scale to distributed

### 2. Type Safety

SpellCaster maintains complete type safety throughout the execution pipeline:

- **Spell Names**: Only valid spell names from your spellbook are accepted
- **Parameters**: Parameters are validated against your spell's schema
- **Results**: Return types match your spell's implementation
- **Errors**: Properly typed error handling

### 3. Lifecycle Management

SpellCaster handles the transport lifecycle, including:

- **Transport State**: Monitors transport readiness and availability
- **Connection Management**: Exposes transport status
- **Resource Cleanup**: Provides methods for releasing resources

## API Reference

### Creating a SpellCaster

```typescript
function createSpellCaster<TSpellbook extends Spellbook>({
  transport: Transport
}): SpellCaster<TSpellbook>
```

Creates a new SpellCaster instance for the specified spellbook type, using the provided transport.

### SpellCaster Interface

```typescript
interface SpellCaster<TSpellbook extends Spellbook> {
  // Cast a spell using the current transport
  cast<TName extends keyof TSpellbook>(
    name: TName,
    parameters: Parameters<TSpellbook[TName]>
  ): Promise<ReturnType<TSpellbook[TName]>>;
  
  // Replace the current transport
  setTransport(transport: Transport): void;
  
  // Get the current transport
  getTransport(): Transport | null;
}
```

### Functional API Alternative

For those preferring a more functional approach, the library also provides standalone functions:

```typescript
// Cast a spell directly
function cast<TSpellbook extends Spellbook>(
  transport: Transport,
  name: keyof TSpellbook,
  parameters: any
): Promise<any>;
```

## Usage Examples

### Basic Usage

```typescript
// Define your spellbook
const mathBook = createSpellbook({
  add: createSpell({
    description: "Add two numbers",
    parameters: z.object({
      a: z.number(),
      b: z.number()
    }),
    execute: async ({ a, b }) => a + b
  })
});

// Create a transport pair for local development
const [clientTransport, serverTransport] = createEmitterPair();

// Serve the spellbook on the server transport
serve(mathBook, serverTransport);

// Create a SpellCaster with the client transport
const caster = createSpellCaster<typeof mathBook>({
  transport: clientTransport
});

// Cast spells with full type safety
const result = await caster.cast("add", { a: 5, b: 3 });
console.log(result); // 8
```

### WebSocket Transport

```typescript
// Server-side
const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', (ws) => {
  serve(mathBook, createWebSocketServerTransport(ws));
});

// Client-side
const ws = new WebSocket('ws://localhost:8080');
ws.onopen = () => {
  const caster = createSpellCaster<typeof mathBook>({
    transport: createWebSocketClientTransport(ws)
  });
  
  // Now you can cast spells over the network
  caster.cast("add", { a: 5, b: 3 }).then(console.log);
};
```

### BroadcastChannel for Cross-Tab Communication

```typescript
// In the main tab (server)
const serverTransport = createBroadcastChannelServerTransport("math-api");
serve(mathBook, serverTransport);

// In any tab (client)
const clientTransport = createBroadcastChannelClientTransport("math-api");
const caster = createSpellCaster<typeof mathBook>({
  transport: clientTransport
});

// Cast spells across browser tabs
caster.cast("add", { a: 5, b: 3 }).then(console.log);
```

### Error Handling

```typescript
try {
  // Attempt to cast a spell
  const result = await caster.cast("add", { a: "not a number", b: 3 });
} catch (error) {
  if (error instanceof SpellValidationError) {
    // Handle parameter validation errors
    console.error("Invalid parameters:", error.details);
  } else if (error instanceof SpellExecutionError) {
    // Handle errors from spell execution
    console.error("Execution failed:", error.message);
  } else if (error instanceof TransportError) {
    // Handle transport-related errors
    console.error("Transport issue:", error.message);
  }
}
```

## Best Practices

### Transport Lifecycle Management

Always ensure your transport is properly initialized before casting spells:

```typescript
// Check if transport is ready
if (caster.getTransport()) {
  await caster.cast("spellName", params);
} else {
  console.error("Transport not available");
}
```

### React Integration

SpellCaster works seamlessly with React using hooks:

```typescript
function useSpellCaster<TSpellbook extends Spellbook>(
  transport: Transport
) {
  const casterRef = useRef<SpellCaster<TSpellbook> | null>(null);
  
  useEffect(() => {
    // Create SpellCaster when transport changes
    casterRef.current = createSpellCaster<TSpellbook>({ transport });
    
    // Cleanup on unmount
    return () => {
      // Any cleanup code
    };
  }, [transport]);
  
  return casterRef.current;
}

// In your component
const caster = useSpellCaster<typeof mathBook>(transport);
```

### Isolating API Domains

For larger applications, create separate SpellCasters for different API domains:

```typescript
// User management API
const userCaster = createSpellCaster<typeof userBook>({
  transport: createWebSocketTransport(userWs)
});

// Content management API
const contentCaster = createSpellCaster<typeof contentBook>({
  transport: createWebSocketTransport(contentWs)
});
```

## Advanced Topics

### Custom Transport Implementation

You can implement custom transports to integrate with any communication mechanism:

```typescript
// Custom Firebase transport example
function createFirebaseTransport(ref: DatabaseReference): Transport {
  return {
    // Implementation details...
  };
}

const caster = createSpellCaster<typeof myBook>({
  transport: createFirebaseTransport(myDbRef)
});
```

### Multiple Transport Fallbacks

Implement fallback strategies when a transport fails:

```typescript
function createResilientCaster<TSpellbook extends Spellbook>(
  primaryTransport: Transport,
  fallbackTransport: Transport
): SpellCaster<TSpellbook> {
  const caster = createSpellCaster<TSpellbook>({
    transport: primaryTransport
  });
  
  // Add fallback logic
  const originalCast = caster.cast;
  caster.cast = async (name, params) => {
    try {
      // Try primary transport
      return await originalCast(name, params);
    } catch (error) {
      if (error instanceof TransportError) {
        // Switch to fallback transport
        caster.setTransport(fallbackTransport);
        // Retry with fallback
        return await originalCast(name, params);
      }
      throw error;
    }
  };
  
  return caster;
}
```

## Conclusion

SpellCaster provides a clean, type-safe interface to your API surfaces, regardless of where they're actually running. By separating the concerns of API definition from transport implementation, it enables a flexible, progressive approach to building and scaling your application. 