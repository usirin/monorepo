# RFC 011: Codex Effect Integration

## Summary
Integrate Effect.ts into @usirin/codex to leverage its built-in service pattern, error handling, and resource management capabilities.

## Background and Motivation

### Current State
- Basic plugin system with async initialization
- Manual error handling and resource cleanup
- No standardized dependency management

### Why Effect?
Effect provides all the primitives we need out of the box:
- Service pattern for dependency injection
- Resource management via Scope
- Built-in error handling
- Cancellation support
- Testing utilities

## Technical Architecture

### Core Types

```typescript
import { Effect, Context, Data } from "effect"

// Plugin Definition
export class Plugin extends Effect.Service<Plugin>()("Plugin") {
  static create<T extends Record<string, unknown>>(config: {
    name: string
    version: string
    setup: Effect.Effect<T>
  }) {
    return class extends Plugin {
      readonly name = config.name
      readonly version = config.version
      
      static readonly live = Effect.gen(function*(_) {
        const instance = yield* config.setup
        return new this(instance)
      }).pipe(Effect.scoped)
    }
  }
}

// Plugin Manager Service
export class PluginManager extends Effect.Service<PluginManager>()("PluginManager", {
  effect: Effect.gen(function*(_) {
    const plugins = new Map<string, Plugin>()
    
    return {
      register: (plugin: Plugin) => Effect.sync(() => {
        plugins.set(plugin.name, plugin)
      }),
      get: (name: string) => Effect.sync(() => plugins.get(name)),
      getAll: () => Effect.sync(() => plugins.values())
    } as const
  })
})
```

### Example Usage

```typescript
// Define a database plugin
class DatabasePlugin extends Plugin.create({
  name: "database",
  version: "1.0.0",
  setup: Effect.gen(function*(_) {
    const connection = yield* Effect.acquireRelease(
      Effect.promise(() => createConnection()),
      conn => Effect.promise(() => conn.close())
    )
    
    return {
      query: <T>(sql: string) => Effect.promise(() => 
        connection.query<T>(sql)
      )
    }
  })
}) {}

// Use in application
const program = Effect.gen(function*(_) {
  const manager = yield* PluginManager
  const db = yield* DatabasePlugin
  
  yield* manager.register(db)
  
  // Use database
  const users = yield* db.query("SELECT * FROM users")
  return users
})

// Run with dependencies
Effect.runPromise(
  program.pipe(
    Effect.provide(DatabasePlugin.live),
    Effect.provide(PluginManager.live)
  )
)
```

## Implementation Strategy

### Phase 1: Core Integration (1 week)
1. Add Effect as dependency
2. Create base Plugin service
3. Create PluginManager service
4. Add basic examples

### Phase 2: Migration Support (1 week)
1. Create migration guide
2. Update documentation
3. Add compatibility utilities
4. Convert existing plugins

## Benefits

1. **Simplified Architecture**
   - Leverages Effect's built-in service pattern
   - No custom resource management needed
   - Built-in error handling and cancellation

2. **Type Safety**
   - Full type inference
   - Service-based dependency injection
   - Compile-time dependency validation

3. **Testing**
   - Effect's testing utilities
   - Easy service mocking
   - Resource cleanup guarantees

4. **Developer Experience**
   - Familiar Effect patterns
   - Less boilerplate
   - Better error handling

## Migration Path

1. Install Effect as dependency
2. Convert existing plugins to Effect services
3. Update plugin loading to use Effect
4. Keep compatibility layer for legacy plugins

## Open Questions
1. Should we support both Effect and legacy plugins during transition?
2. How to handle plugin state persistence?
3. Should we expose Effect's lower-level APIs to plugins?

## Notes
- Effect's service pattern provides most of what we need out of the box
- No need for custom dependency resolution - Effect handles it
- Resource management via Scope eliminates cleanup complexity
- Testing becomes much simpler with Effect's utilities