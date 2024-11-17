# Widget Communication

## Context
Current UI frameworks force all widgets to run in the browser process. This becomes a major limitation when building AI applications that need specialized hardware or have significant resource requirements. The usual workaround is to split the application into frontend/backend services, which adds complexity and breaks the natural widget composition model.

## Proposal
Treat widgets as location-independent streams of messages. A widget should be able to run anywhere - browser, GPU server, or cloud service - while maintaining type-safe communication with other widgets.

```mermaid
graph TD
    A[Browser] --> B[GPU Server]
    A --> C[Database]
    
    note right of B["Specialized hardware
    for ML workloads"]
    note right of C["Close to data
    for efficient access"]
```

## Core Abstraction
At its simplest, a widget is just a typed stream:

```typescript
interface Widget<T> {
  id: string
  stream: Stream<T>
  schema: Schema<T>
}
```

The physical location of the widget becomes an implementation detail. The widget's interface remains the same whether it's running locally or on a remote server.

## Example Use Case
Consider a design tool:
- Canvas widget runs in the browser for direct user interaction
- Image processing widget runs on a GPU server
- Asset search widget runs next to the vector database
- Variation generation widget runs on an ML cluster

Each widget operates where it's most efficient, but they compose together into a single, cohesive application.

## Why Effect.ts
Effect.ts provides the core primitives needed:
- Type-safe streams for communication
- Resource management for cleanup
- Error handling across boundaries
- Built-in cancellation support

## The Cool Part
The cool part isn't the distributed computing (that's been done before) - it's how natural it feels to build apps this way. No more "how do I squeeze this into the browser?" or "should this be a microservice?". Just write your widget, and let it live wherever it works best.

Want to try something on your laptop first? Cool. Want to move it to a GPU cluster later? No problem. The widget doesn't care - it's just a stream of messages.