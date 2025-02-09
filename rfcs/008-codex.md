# RFC 008: Codex Plugin System

## Summary
A type-safe plugin system for building extensible applications. Plugins can declare dependencies and extend the shared context through TypeScript's declaration merging.

## Core Concepts

### Plugin Definition
```typescript
// Define plugin context
declare module '@usirin/codex' {
  interface CodexContext {
    spellbook: {
      defineCommand: (name: string) => void
      execute: (command: string) => void
    }
  }
}

// Define a plugin
const spellbookPlugin = definePlugin({
  name: 'spellbook',
  version: '1.0.0',
  register: () => ({
    defineCommand: (name) => {},
    execute: (command) => {}
  })
})

// Plugin with dependencies
const runekeeperPlugin = definePlugin({
  name: 'runekeeper',
  version: '1.0.0',
  dependencies: ['spellbook'],
  register: (deps) => ({
    bind: (mode, key) => {
      deps.spellbook.execute('some.command')
    }
  })
})
```

### Plugin Registration
```typescript
const codex = createCodex()

// Register plugins in any order
await codex.use([
  runekeeperPlugin,  // Depends on spellbook
  spellbookPlugin    // Will be initialized first
])

// Initialize plugins in dependency order
const context = await codex.init()
```

## Key Features

1. **Type-Safe Dependencies**
   - Dependencies are checked at compile time
   - Plugin results are properly typed
   - Context is built up through declaration merging

2. **Dependency Resolution**
   - Automatic dependency ordering
   - Circular dependency detection
   - Missing dependency detection

3. **Simple API**
   - Clear plugin contract
   - Async support
   - Easy to extend

## Next Steps
1. Add plugin lifecycle hooks
2. Add plugin versioning
3. Add hot reload support