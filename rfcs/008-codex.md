# RFC 008: Codex Plugin System

## Summary
A plugin system for studio applications inspired by Laravel's Service Providers and Hapi's plugin system.

## Core Concepts

### Plugin Definition
```typescript
interface Plugin {
  name: string
  version: string
  dependencies?: string[]
  
  // Setup phase - register dependencies
  register: (context: StudioContext) => Promise<void> | void
  
  // Runtime phase - use dependencies
  boot?: (context: StudioContext) => Promise<void> | void
}

// Studio context provided to plugins
interface StudioContext {
  // Core systems
  commands: SpellbookAPI    // Command system
  keybindings: RunekeeperAPI // Keyboard system
  widgets: ShrineAPI        // Widget system
  workspace: LodgeAPI       // Workspace system
  
  // Utilities
  logger: Logger
  config: Config
}
```

### Simple Example: Git Plugin
```typescript
const gitPlugin: Plugin = {
  name: 'git',
  version: '1.0.0',
  dependencies: ['workspace', 'terminal'],
  
  // Register phase - setup commands, keybindings, etc
  async register({ commands, keybindings }) {
    // Register git commands
    commands.register({
      git: {
        commit: defineCommand({
          input: z.object({
            message: z.string()
          }),
          handler: async ({ message }) => {
            // Git commit implementation
          }
        })
      }
    })
    
    // Add git keybindings
    keybindings.bind('normal', '<leader>gc', () => {
      commands.execute(['git', 'commit'])
    })
  },
  
  // Boot phase - setup initial state
  async boot({ workspace, terminal }) {
    // Create git workspace layout
    workspace.createLayout('git', {
      root: createStack('horizontal', [
        createWindow('git-status'),
        createWindow('terminal')
      ])
    })
  }
}
```

### Advanced Example: LSP Plugin
```typescript
const lspPlugin: Plugin = {
  name: 'lsp',
  version: '1.0.0',
  dependencies: ['workspace', 'editor'],
  
  async register({ commands, widgets }) {
    // Register LSP commands
    commands.register({
      lsp: {
        format: defineCommand({
          input: z.object({
            path: z.string()
          }),
          handler: async ({ path }) => {
            // Format file
          }
        })
      }
    })
    
    // Register LSP widgets
    widgets.register({
      'lsp-diagnostics': defineWidget({
        // Diagnostics widget implementation
      })
    })
  },
  
  async boot({ workspace, editor }) {
    // Initialize LSP servers
    const tsserver = await initializeServer('typescript')
    
    // Connect to editor
    editor.onDidChangeContent(async (change) => {
      const diagnostics = await tsserver.getDiagnostics(change.path)
      workspace.updateDiagnostics(diagnostics)
    })
  }
}
```

### Using Plugins
```typescript
import { createStudio } from '@umut/codex'

const studio = createStudio()

// Register plugins in order
await studio.use([
  workspacePlugin,
  editorPlugin,
  gitPlugin,
  lspPlugin
])

// Initialize everything
await studio.init()
```

## Key Features

1. **Dependency Management**
   - Clear dependency declaration
   - Automatic ordering
   - Dependency validation

2. **Phased Initialization**
   - Register phase for setup
   - Boot phase for runtime
   - Clear lifecycle

3. **Type Safety**
   - Full TypeScript support
   - Context type inference
   - API validation

4. **Development Experience**
   - Clear plugin API
   - Easy debugging
   - Hot reloading support

## Next Steps
1. Implement core plugin system
2. Add dependency resolution
3. Add lifecycle management
4. Add hot reload support 