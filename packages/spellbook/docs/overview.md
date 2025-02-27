# Spellbook: Type-Safe API Surfaces

## What is Spellbook?

Spellbook is a system for defining and connecting type-safe API surfaces. It lets you define complete APIs as spellbooks and connect them through various transports, enabling seamless transitions from local to distributed systems.

```typescript
// Define your API surface
const userBook = createSpellbook({
  getProfile: createSpell({
    parameters: z.object({ userID: z.string() }),
    execute: async ({userID}) => {
      return { id: userID, name: "User" };
    }
  })
});

// Use it locally
serve(userBook, createLocalTransport());

// Use it over network
serve(userBook, createWebSocketTransport());

// Same API surface, different boundaries
```

## Key Concepts

### 1. API Surfaces

A spellbook defines a complete API surface:

```typescript
const windowBook = createSpellbook({
  // Window Management API
  resize: createSpell(...),
  move: createSpell(...),
  focus: createSpell(...),
  
  // Window State API
  getState: createSpell(...),
  setState: createSpell(...),
  
  // Window Events API
  onFocus: createSpell(...),
  onBlur: createSpell(...)
});

// The entire API is the contract
type WindowAPI = typeof windowBook;
```

### 2. Natural Boundaries

Spellbooks create natural system boundaries:

```typescript
// Studio System
const studio = {
  // Each window is its own API surface
  windows: new Map<WindowID, {
    book: WindowBook,
    transport: Transport
  }>(),
  
  // Layout is its own API surface
  layout: {
    book: LayoutBook,
    transport: Transport
  }
};
```

### 3. Progressive Enhancement

Start local, scale naturally:

```typescript
// Day 1: Local Development
const [client, server] = createEmitterPair();
serve(windowBook, createServerTransport(server));
const window = createClient(createClientTransport(client));

// Month 3: Network Development
const ws = new WebSocket("wss://api.example.com");
serve(windowBook, createWebSocketTransport(ws));
const window = createClient(createWebSocketTransport(ws));

// Same code, different boundaries
```

## Real World Example: Studio

The studio system demonstrates how spellbooks create natural boundaries:

```typescript
// 1. Window Management
const windowBook = createSpellbook({
  resize: createSpell(...),
  move: createSpell(...)
});

// 2. Layout Management
const layoutBook = createSpellbook({
  tile: createSpell(...),
  split: createSpell(...)
});

// 3. Command System
const commandBook = createSpellbook({
  execute: createSpell(...),
  search: createSpell(...)
});

// Each boundary is a complete API surface
const studio = {
  windows: new Map<WindowID, {
    book: windowBook,
    transport: createWindowTransport()
  }>(),
  layout: {
    book: layoutBook,
    transport: createLocalTransport()
  },
  commands: {
    book: commandBook,
    transport: createLocalTransport()
  }
};
```

## Benefits

### 1. Clear System Boundaries
- Each spellbook is a complete API surface
- Natural separation of concerns
- Type-safe contracts

### 2. Location Transparency
- Same code works everywhere
- Seamless local to network transition
- No rewriting needed

### 3. Progressive Enhancement
- Start with everything local
- Move boundaries as needed
- Scale naturally

## Development Flow

1. Define API Surfaces
```typescript
const myBook = createSpellbook({
  // Define your API
});
```

2. Develop Locally
```typescript
// Everything in one process
serve(myBook, createLocalTransport());
```

3. Add Boundaries
```typescript
// Move to separate processes
serve(myBook, createWindowTransport());
```

4. Scale Out
```typescript
// Move to network
serve(myBook, createWebSocketTransport());
```

## Future Directions

1. API Surface Composition
```typescript
// Combine API surfaces
const system = composeSpellbooks({
  windows: windowBook,
  layout: layoutBook
});
```

2. Surface Middleware
```typescript
// Add behavior to API surfaces
const secureBook = withAuth(myBook);
const metricBook = withMetrics(myBook);
```

3. Surface Versioning
```typescript
// Version API surfaces
const v2Book = versionSpellbook(myBook, {
  version: "2.0.0",
  changes: {
    // API changes
  }
});
```

## Philosophy

Spellbook believes:
1. API surfaces are the primitive unit
2. Boundaries should be natural
3. Location should be transparent
4. Enhancement should be progressive

Start with API surfaces, let the boundaries emerge naturally, and scale when needed. 