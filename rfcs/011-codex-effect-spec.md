# Technical Specification: Codex Effect Integration

## Overview
This document details the technical implementation of integrating Effect.ts into the @usirin/codex package.

## Core Types

### Plugin Error Types
```typescript
type PluginErrorTag = 
  | 'CircularDependency'
  | 'PluginNotFound'
  | 'RegistrationFailed'
  | 'InvalidDependency'
  | 'InitializationFailed'

interface BasePluginError {
  _tag: PluginErrorTag
  message: string
  cause?: unknown
}

interface CircularDependencyError extends BasePluginError {
  _tag: 'CircularDependency'
  chain: string[]
}

interface PluginNotFoundError extends BasePluginError {
  _tag: 'PluginNotFound'
  name: string
}

interface RegistrationFailedError extends BasePluginError {
  _tag: 'RegistrationFailed'
  name: string
  cause: unknown
}

type PluginError = 
  | CircularDependencyError
  | PluginNotFoundError
  | RegistrationFailedError
```

### Plugin Context Types
```typescript
// Base plugin context that can be extended
export interface CodexContext {}

// Plugin definition
interface Plugin<
  TDeps extends (keyof CodexContext)[] = (keyof CodexContext)[],
  TResult = CodexContext[keyof CodexContext]
> {
  name: string
  version: string
  dependencies?: TDeps
  register: (deps: {
    [K in TDeps[number]]: CodexContext[K]
  }) => Effect.Effect<never, PluginError, TResult>
  cleanup?: () => Effect.Effect<never, never, void>
}

// Plugin service interface
interface PluginService {
  register: <T extends Plugin>(
    plugin: T
  ) => Effect.Effect<never, PluginError, void>
  
  init: () => Effect.Effect<never, PluginError, CodexContext>
  
  cleanup: () => Effect.Effect<never, never, void>
}
```

## Implementation Details

### Plugin Registration
```typescript
class PluginServiceLive implements PluginService {
  private plugins = new Map<string, Plugin>()
  private results = new Map<string, CodexContext[keyof CodexContext]>()
  private cleanupTasks = new Map<string, Effect.Effect<never, never, void>>()

  register<T extends Plugin>(plugin: T) {
    return Effect.gen(function* (_) {
      // Validate plugin
      yield* validatePlugin(plugin)
      
      // Store plugin
      yield* Effect.sync(() => {
        this.plugins.set(plugin.name, plugin)
      })
      
      // Store cleanup if provided
      if (plugin.cleanup) {
        yield* Effect.sync(() => {
          this.cleanupTasks.set(plugin.name, plugin.cleanup())
        })
      }
    })
  }

  private validatePlugin(plugin: Plugin) {
    return Effect.gen(function* (_) {
      // Check name uniqueness
      if (this.plugins.has(plugin.name)) {
        yield* Effect.fail({
          _tag: 'RegistrationFailed',
          name: plugin.name,
          message: 'Plugin already registered',
        } as PluginError)
      }

      // Validate dependencies
      if (plugin.dependencies) {
        for (const dep of plugin.dependencies) {
          if (!this.plugins.has(dep)) {
            yield* Effect.fail({
              _tag: 'InvalidDependency',
              name: plugin.name,
              dependency: dep,
              message: `Dependency ${dep} not found`,
            } as PluginError)
          }
        }
      }
    })
  }
}
```

### Plugin Initialization
```typescript
class PluginServiceLive implements PluginService {
  init() {
    return Effect.gen(function* (_) {
      const context = {} as CodexContext
      const initOrder = yield* this.calculateInitOrder()

      for (const name of initOrder) {
        const result = yield* this.initPlugin(name)
        context[name] = result
      }

      return context
    })
  }

  private calculateInitOrder() {
    return Effect.gen(function* (_) {
      const visited = new Set<string>()
      const order: string[] = []

      const visit = (name: string, path: string[] = []) => 
        Effect.gen(function* (_) {
          if (path.includes(name)) {
            yield* Effect.fail({
              _tag: 'CircularDependency',
              chain: [...path, name],
              message: 'Circular dependency detected',
            } as PluginError)
          }

          if (!visited.has(name)) {
            visited.add(name)
            const plugin = this.plugins.get(name)!

            if (plugin.dependencies) {
              for (const dep of plugin.dependencies) {
                yield* visit(dep, [...path, name])
              }
            }

            order.push(name)
          }
        })

      for (const name of this.plugins.keys()) {
        yield* visit(name)
      }

      return order
    })
  }
}
```

### Resource Management
```typescript
class PluginServiceLive implements PluginService {
  cleanup() {
    return Effect.gen(function* (_) {
      // Execute cleanup tasks in reverse initialization order
      const tasks = Array.from(this.cleanupTasks.values()).reverse()
      
      yield* Effect.forEach(tasks, (task) => 
        pipe(
          task,
          Effect.catchAll((e) => 
            Effect.logError('Cleanup failed', e)
          )
        )
      )
    })
  }
}
```

### Public API
```typescript
export const createCodex = () => {
  return {
    use: <T extends Plugin[]>(plugins: T) =>
      pipe(
        Effect.serviceWithEffect(PluginService, (service) =>
          Effect.forEach(plugins, (plugin) => 
            service.register(plugin)
          )
        ),
        Effect.provide(PluginServiceLive)
      ),

    init: () =>
      pipe(
        Effect.serviceWithEffect(PluginService, (service) => 
          service.init()
        ),
        Effect.provide(PluginServiceLive)
      ),

    cleanup: () =>
      pipe(
        Effect.serviceWithEffect(PluginService, (service) => 
          service.cleanup()
        ),
        Effect.provide(PluginServiceLive)
      )
  }
}
```

## Testing Strategy

### Mock Service Layer
```typescript
const TestPluginService = Layer.succeed(
  PluginService,
  new (class implements PluginService {
    register = jest.fn()
    init = jest.fn()
    cleanup = jest.fn()
  })()
)
```

### Test Utilities
```typescript
const createTestPlugin = (config: Partial<Plugin>) => ({
  name: 'test',
  version: '1.0.0',
  register: () => Effect.succeed({}),
  ...config,
})

const runWithTestService = <E, A>(
  effect: Effect.Effect<PluginService, E, A>
) => pipe(
  effect,
  Effect.provide(TestPluginService),
  Effect.runPromise
)
```

## Migration Path

### Phase 1: Effect Integration
1. Add Effect.ts dependency
2. Create new Effect-based types
3. Implement core functionality
4. Add tests

### Phase 2: Backwards Compatibility
1. Create compatibility layer
2. Add migration utilities
3. Update documentation
4. Add examples

### Phase 3: Plugin Migration
1. Migrate core plugins
2. Update plugin templates
3. Add migration guide
4. Update tests

## Performance Considerations
1. Lazy plugin initialization
2. Efficient dependency resolution
3. Resource cleanup optimization
4. Error recovery strategies

## Security Considerations
1. Plugin isolation
2. Resource limits
3. Error boundaries
4. Cleanup guarantees