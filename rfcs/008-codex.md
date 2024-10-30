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

// Each core system is just a plugin
declare module '@umut/codex' {
  interface PluginAPI {
    commands: {
      register: (commands: CommandTree) => void
      execute: (path: string[], args: any) => Promise<void>
    }
  }
}

declare module '@umut/codex' {
  interface PluginAPI {
    keyboard: {
      bind: (mode: string, keys: string, command: () => void) => void
    }
  }
}
```

### Building Studio
```typescript
// Create our studio
const studio = createCodex()

// Core systems as plugins
await studio.use([
  // Framework plugins
  spellbookPlugin,    // Command system
  runekeeperPlugin,   // Keyboard handling
  shrinePlugin,       // Widget system
  lodgePlugin,        // Workspace management
  workbenchPlugin,    // UI components
  
  // Feature plugins
  commandPalettePlugin,
  statusBarPlugin,
  
  // Editor features
  editorPlugin,
  minimapPlugin,
  outlinePlugin,
  
  // Tool features
  terminalPlugin,
  gitPlugin,
  debugPlugin
])

// User plugins
await studio.use([
  myCustomPlugin,
  anotherPlugin
])
```

### Plugin Definition
```typescript
function definePlugin<
  TDeps extends (keyof PluginAPI)[]
>({
  name,
  version,
  dependencies,
  register,
  boot
}: {
  name: string
  version: string
  dependencies: TDeps
  register: (context: Pick<PluginAPI, TDeps[number]>) => Promise<void> | void
  boot?: (context: Pick<PluginAPI, TDeps[number]>) => Promise<void> | void
}) {
  return { name, version, dependencies, register, boot }
}

// Example usage
const gitPlugin = definePlugin({
  name: 'git',
  version: '1.0.0',
  dependencies: ['commands', 'keyboard'],
  
  register(context) {
    context.commands.register({
      git: {
        commit: defineCommand({/*...*/})
      }
    })
  }
})
```

### Using Codex
```typescript
// Create a new codex
const codex = createCodex()

// Register plugins
await codex.use([
  gitPlugin,
  lspPlugin
])

// Initialize everything
await codex.init()

// Create studio with codex
const studio = createStudio({
  codex,
  config: {/*...*/}
})
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

### Building Studio Framework
```typescript
// @umut/spellbook plugin
const spellbookPlugin = definePlugin({
  name: 'spellbook',
  version: '1.0.0',
  
  register(context) {
    // Create command system
    const commands = createCommands()
    
    // Add to context
    context.commands = {
      register: (commandTree) => commands.register(commandTree),
      execute: (path, args) => commands.execute(path, args),
      getAll: () => commands.getAll()
    }
  }
})

// @umut/runekeeper plugin
const runekeeperPlugin = definePlugin({
  name: 'runekeeper',
  version: '1.0.0',
  dependencies: ['commands'],
  
  register(context) {
    // Create keybinding system
    const keys = createRunekeeper(['normal', 'insert'])
    
    // Add to context
    context.keybindings = {
      bind: (mode, keys, command) => keys.bind(mode, keys, command),
      handleKey: (key, mode) => keys.handleKey(key, mode)
    }
  }
})

// @umut/shrine plugin
const shrinePlugin = definePlugin({
  name: 'shrine',
  version: '1.0.0',
  dependencies: ['commands'],
  
  register(context) {
    // Create widget system
    const widgets = createWidgetRegistry()
    
    // Add to context
    context.widgets = {
      register: (widget) => widgets.register(widget),
      get: (id) => widgets.get(id),
      connect: (from, to, ports) => widgets.connect(from, to, ports)
    }
  }
})

// @umut/lodge plugin
const lodgePlugin = definePlugin({
  name: 'lodge',
  version: '1.0.0',
  dependencies: ['widgets', 'commands'],
  
  register(context) {
    // Create workspace management
    const workspace = createLodge()
    
    // Add workspace commands
    context.commands.register({
      workspace: {
        split: defineCommand({/*...*/}),
        focus: defineCommand({/*...*/})
      }
    })
    
    // Add to context
    context.workspace = {
      createWorkspace: (name) => workspace.createWorkspace(name),
      focusWindow: (path) => workspace.focusWindow(path),
      getLayout: () => workspace.getLayout()
    }
  }
})

// Create studio
const codex = createCodex()

// Register framework plugins
await codex.use([
  spellbookPlugin,    // Command system
  runekeeperPlugin,   // Keyboard handling
  shrinePlugin,       // Widget system
  lodgePlugin         // Workspace management
])

// Now we can create studio
const studio = createStudio({
  codex,
  config: {/*...*/}
})