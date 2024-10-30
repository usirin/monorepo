# RFC 008: Codex Plugin System

## Summary
A generic plugin system for building extensible applications using TypeScript's declaration merging for type-safe plugins.

## Core Concepts

### Plugin API Types
```typescript
// Base module declaration
declare module '@umut/codex' {
  interface PluginAPI {}
}

// Spellbook extends API
declare module '@umut/codex' {
  interface PluginAPI {
    spellbook: ReturnType<typeof createSpellbook>
  }
}

// Runekeeper extends API
declare module '@umut/codex' {
  interface PluginAPI {
    runekeeper: ReturnType<typeof createRunekeeper>
  }
}
```

### Core Framework Plugins
```typescript
// @umut/spellbook plugin
const spellbookPlugin = definePlugin({
  name: 'spellbook',
  version: '1.0.0',
  
  register(context) {
    const spellbook = createSpellbook()
    
    context.spellbook = spellbook
  }
})

// @umut/runekeeper plugin
const runekeeperPlugin = definePlugin({
  name: 'runekeeper',
  version: '1.0.0',
  dependencies: ['spellbook'],
  
  register(context) {
    const runekeeper = createRunekeeper(['normal', 'insert'])
    
    context.runekeeper = runekeeper
  }
})

// @umut/shrine plugin
const shrinePlugin = definePlugin({
  name: 'shrine',
  version: '1.0.0',
  dependencies: ['spellbook'],
  
  register(context) {
    const shrine = createShrine()
    
    context.shrine = shrine
  }
})
```

### Using Codex
```typescript
// Create a new codex
const codex = createCodex()

// Register core plugins
await codex.use([
  spellbookPlugin,
  runekeeperPlugin,
  shrinePlugin
])

// Initialize
await codex.init()
```

## Key Features

1. **Type-Safe Dependencies**
   - Dependencies define available APIs
   - TypeScript checks usage
   - No runtime surprises

2. **Extensible Types**
   - Plugins extend PluginAPI
   - Declaration merging
   - No central type definition

3. **Clear Dependencies**
   - Explicit dependency declaration
   - Automatic ordering
   - Dependency validation

## Next Steps
1. Implement core plugin system
2. Add dependency resolution
3. Add lifecycle management
4. Add type inference