# RFC 006: Shrine Hot Module Replacement

## Summary
A system for hot-reloading widget code while preserving state and connections.

## Implementation

```typescript
// Widget Definition with HMR Support
const CounterWidget = defineWidget({
  id: 'counter',
  // Version helps with migration
  version: '1.0.0',
  initialState: {
    count: 0
  },
  // State migration between versions
  migrate: {
    // Migrate from previous versions
    '0.9.0': (oldState) => ({
      count: oldState.count ?? 0
    })
  },
  // HMR specific hooks
  hmr: {
    // Called before hot update
    beforeUpdate(currentInstance) {
      // Cleanup, save state, etc
      return currentInstance.getState()
    },
    // Called after hot update
    afterUpdate(newInstance, savedState) {
      // Restore state, reconnect ports
      newInstance.setState(savedState)
    }
  }
})

// Registry HMR Support
const registry = createRegistry({
  hmr: {
    // Accept hot updates
    accept: (moduleId) => {
      if (module.hot) {
        module.hot.accept(moduleId, () => {
          registry.hotUpdate(moduleId)
        })
      }
    }
  }
})

// Example: Hot updating a widget
registry.hotUpdate('counter', {
  // Preserve existing connections
  preserveConnections: true,
  // Preserve state
  preserveState: true,
  // Optional state transform
  transformState: (oldState) => ({
    ...oldState,
    newField: 'default'
  })
})
```

## State Preservation

```typescript
// Widget instance management
interface WidgetInstance {
  // Unique instance ID
  id: string
  // Current state
  state: any
  // State history for undo/redo
  history: StateHistory
  // Active connections
  connections: Set<Connection>
  // HMR metadata
  hmr: {
    // Module ID
    moduleId: string
    // Last update timestamp
    lastUpdate: number
    // Previous versions
    versions: string[]
  }
}

// HMR State Management
class HMRStateManager {
  // Keep state history
  private stateHistory: Map<string, any[]> = new Map()
  
  // Save state before update
  saveState(widgetId: string) {
    const instance = this.getInstance(widgetId)
    this.stateHistory.set(widgetId, [
      ...this.stateHistory.get(widgetId) || [],
      instance.state
    ])
  }
  
  // Restore state after update
  restoreState(widgetId: string) {
    const history = this.stateHistory.get(widgetId)
    if (history?.length) {
      return history[history.length - 1]
    }
  }
}
```

## Connection Preservation

```typescript
// Connection tracking
interface Connection {
  source: string
  target: string
  port: string
  // Connection metadata for restoration
  meta: {
    type: 'port' | 'stream'
    transform?: TransformFn
    options?: ConnectionOptions
  }
}

class ConnectionManager {
  private connections = new Map<string, Connection[]>()
  
  // Save connections before update
  saveConnections(widgetId: string) {
    return Array.from(this.getConnections(widgetId))
  }
  
  // Restore connections after update
  restoreConnections(widgetId: string, connections: Connection[]) {
    for (const connection of connections) {
      this.reconnect(connection)
    }
  }
}
```

## Usage Example

```typescript
// Development with HMR
if (import.meta.hot) {
  import.meta.hot.accept('./counter-widget', (newModule) => {
    // Get updated widget definition
    const NewCounterWidget = newModule.default
    
    // Hot update the widget
    registry.hotUpdate('counter', NewCounterWidget, {
      preserveState: true,
      beforeUpdate: (instance) => {
        // Custom cleanup
        instance.cleanup()
      },
      afterUpdate: (instance, oldState) => {
        // Custom state restoration
        instance.hydrate(oldState)
      }
    })
  })
}
```

## Benefits

1. **Development Experience**
   - Instant feedback
   - State preservation
   - Connection preservation
   - No page reloads

2. **Safety**
   - Version tracking
   - State migration
   - Connection validation
   - Cleanup hooks

3. **Debugging**
   - State history
   - Connection tracking
   - Update logging
   - Error recovery 