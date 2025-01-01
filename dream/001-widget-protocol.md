# Widget Protocol RFC

## Abstract
This RFC proposes a standardized protocol for UI component state management and communication across network boundaries. The protocol builds on established web standards (HTTP and WebSocket) while introducing a specialized `widget://` scheme for addressing. Key contributions include unified state management, real-time synchronization, and type-safe communication patterns.

## Introduction

### Problem Statement
Current UI component architectures lack standardized methods for state sharing and communication across system boundaries. This limitation leads to:
- Inconsistent state management patterns
- Complex cross-component communication
- Difficult cross-origin integration
- Limited real-time capabilities

### Proposed Solution
The Widget Protocol provides a unified communication layer based on familiar web standards:
- HTTP-based state management
- WebSocket-powered real-time updates
- Versioned state transitions
- Standardized addressing scheme

## Technical Design

### Core Protocol Interface
```typescript
interface Widget {
  handle(request: Request): Promise<Response>
}
```

This interface enables three primary interaction patterns:

1. **State Retrieval**
   ```typescript
   GET widget://chat/state
   Accept: application/json
   ```

2. **State Mutation**
   ```typescript
   POST widget://chat/state
   Content-Type: application/json
   If-Match: "v1-abc123"
   ```

3. **Real-time Synchronization**
   ```typescript
   GET widget://chat/state
   Connection: Upgrade
   Upgrade: websocket
   ```

### State Management Architecture

#### Version Control System
```typescript
interface StateResponse {
  data: any;
  version: string;  // State version identifier
  timestamp: number;  // State modification time
}
```

#### Conflict Resolution
```typescript
async function updateState(request: Request): Promise<Response> {
  const version = request.headers.get('If-Match');
  const currentState = await getState();
  
  if (currentState.version !== version) {
    return new Response('Version mismatch', { status: 409 });
  }
  
  // Process state update
}
```

### Security Architecture
```typescript
interface WidgetPermissions {
  read: boolean;    // State read access
  write: boolean;   // State mutation access
  subscribe: boolean;  // Real-time update access
}
```

## Alternative Approaches

### DOM Event System
**Analysis:**
- **Benefits:** Native browser support, low latency, simple implementation
- **Limitations:** Same-origin constraints, no network transport, limited scalability

### Redux Architecture
**Analysis:**
- **Benefits:** Established patterns, developer tooling, predictable updates
- **Limitations:** Complex remote synchronization, prescriptive architecture

## Implementation Strategy

### Phase 1: Protocol Foundation (Week 1-2)
- [ ] Request/Response engine implementation
- [ ] Version control system
- [ ] WebSocket infrastructure

### Phase 2: Security & Performance (Week 3-4)
- [ ] Security validation layer
- [ ] Caching infrastructure
- [ ] Rate limiting system

### Phase 3: Developer Tooling (Week 5-6)
- [ ] Protocol debugging tools
- [ ] State inspection interface
- [ ] Technical documentation

## Open Questions

### Security Considerations
- Cross-origin widget validation methodology
- Required security header specifications
- Permission model granularity

### State Management
- Default persistence behavior
- Storage quota management
- Large state object handling

### Performance Optimization
- State update batching strategies
- Binary protocol transition criteria
- Caching strategy optimization

## Client-Only Implementation

### Local Widget Communication
The protocol maintains consistency by using Request/Response even for same-browser communication:

```typescript
interface Widget {
  handle(request: Request): Promise<Response>
}
```

### ServiceWorker Implementation
```typescript
// Intercept all widget:// requests
self.addEventListener('fetch', (event) => {
  if (new URL(event.request.url).protocol === 'widget:') {
    event.respondWith(handleWidgetRequest(event.request))
  }
})

async function handleWidgetRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const widget = await registry.get(url.toString())
  
  if (!widget) {
    return new Response('Widget not found', { status: 404 })
  }
  
  return widget.handle(request)
}
```

### Example: Local Chat Widget
```typescript
class ChatWidget implements Widget {
  async handle(request: Request): Promise<Response> {
    const url = new URL(request.url)
    
    switch(request.method) {
      case 'GET':
        // Retrieve state from IndexedDB
        const state = await db.get('chat-state')
        return new Response(JSON.stringify(state), {
          headers: {
            'Content-Type': 'application/json',
            'ETag': state.version
          }
        })
        
      case 'POST':
        // Update local state
        const update = await request.json()
        const newState = await updateState(update)
        
        // Notify other tabs
        broadcast(new Request(url, {
          method: 'POST',
          body: JSON.stringify(newState)
        }))
        
        return new Response(JSON.stringify(newState), {
          headers: { 'ETag': newState.version }
        })
        
      case 'GET':
        if (request.headers.get('Upgrade') === 'websocket') {
          // Handle WebSocket upgrade for real-time updates
          return createWebSocketResponse(url)
        }
    }
  }
}
```

### Cross-Tab Communication
```typescript
// Use BroadcastChannel wrapped in Request/Response
const broadcast = new BroadcastChannel('widgets')

broadcast.onmessage = async (event) => {
  const request: Request = event.data
  const widget = await registry.get(request.url)
  
  if (widget) {
    await widget.handle(request)
  }
}
```

### Local Storage Operations
```typescript
// IndexedDB operations as Request/Response
async function getState(request: Request): Promise<Response> {
  const state = await db.get(request.url)
  
  if (!state) {
    return new Response('Not Found', { status: 404 })
  }
  
  return new Response(JSON.stringify(state), {
    headers: {
      'Content-Type': 'application/json',
      'ETag': state.version
    }
  })
}

async function setState(request: Request): Promise<Response> {
  const state = await request.json()
  const version = Date.now().toString()
  
  await db.put(request.url, {
    ...state,
    version
  })
  
  return new Response(JSON.stringify(state), {
    headers: { 'ETag': version }
  })
}
```

### Benefits of Local Implementation
1. **Protocol Consistency**: Same interface for local and remote widgets
2. **Future Compatibility**: Easy to add remote sync later
3. **Familiar Patterns**: Uses standard web Request/Response
4. **Built-in Features**: Leverages browser caching and streaming
5. **Type Safety**: Full TypeScript support across boundaries

### Usage Example
```typescript
// Get widget state
const response = await fetch('widget://local/chat/state')
const state = await response.json()

// Update state
await fetch('widget://local/chat/state', {
  method: 'POST',
  body: JSON.stringify({ message: 'Hello' })
})

// Real-time updates
const ws = new WebSocket('widget://local/chat/state')
ws.onmessage = (event) => {
  const update = JSON.parse(event.data)
  // Handle update
}
```

## Cloudflare Workers Similarity

### Architectural Parallels
The Widget Protocol's design mirrors Cloudflare Workers in several key ways:

```typescript
// Cloudflare Worker
addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request))
})

// Widget Protocol
addEventListener('fetch', (event) => {
  if (new URL(event.request.url).protocol === 'widget:') {
    event.respondWith(handleWidgetRequest(event.request))
  }
})
```

Key similarities:
1. Request/Response as the core primitive
2. ServiceWorker-like runtime environment
3. Middleware-style request handling
4. Built-in streaming support

Key differences:
1. **Execution Environment**
   - Workers: Edge runtime
   - Widgets: Browser runtime

2. **Storage Access**
   - Workers: KV, Durable Objects
   - Widgets: IndexedDB, LocalStorage

3. **Communication Patterns**
   - Workers: Cross-datacenter
   - Widgets: Cross-tab, Cross-frame

### Browser-Specific Features
```typescript
class BrowserWidget implements Widget {
  async handle(request: Request): Promise<Response> {
    // Browser-specific APIs available
    const broadcast = new BroadcastChannel('widgets');
    const storage = await navigator.storage.estimate();
    
    // IndexedDB for durability
    const db = await openDB('widgets', 1);
    
    // ServiceWorker for offline support
    const registration = await navigator.serviceWorker.ready;
    
    // Handle request...
  }
}
```

### Storage Patterns
Similar to Durable Objects, but using browser storage:

```typescript
class WidgetStorage {
  constructor(private name: string) {}
  
  async transaction<T>(callback: (store: IDBObjectStore) => Promise<T>): Promise<T> {
    const db = await openDB('widgets', 1);
    const tx = db.transaction(this.name, 'readwrite');
    const store = tx.objectStore(this.name);
    
    try {
      return await callback(store);
    } finally {
      await tx.done;
    }
  }
}
```

## Conclusion
The Widget Protocol establishes a foundation for standardized component communication in modern web applications. By leveraging established web standards while introducing specialized protocols, we enable robust, type-safe state management across system boundaries.