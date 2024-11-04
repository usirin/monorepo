# RFC 010: Studio Package

## Summary
This RFC proposes creating an umbrella package `@umut/studio` that provides a pre-configured Codex instance with core plugins for workspace management, commands, and keybindings.

## Technical Architecture

### Package Structure
```
packages/studio/
├── src/
│   ├── index.ts           # Main exports and studio creation
│   └── plugins/           # Core plugins
│       ├── workspace.ts   # Layout & workspace management
│       ├── commands.ts    # Command system
│       └── keybindings.ts # Keyboard handling
└── package.json
```

### Core API

```typescript:packages/studio/src/index.ts
import { createCodex, type Plugin } from '@umut/codex'
import { type Tree } from '@umut/layout-tree'

/**
 * Configuration options for studio creation
 */
export type StudioOptions = {
  /** Additional plugins beyond the core set */
  plugins?: Plugin[]
  /** Initial workspace layout */
  initialLayout?: Tree
}

/**
 * Creates a pre-configured studio instance
 */
export async function createStudio(options: StudioOptions = {}) {
  const codex = createCodex()

  await codex.use([
    commandsPlugin,
    keybindingsPlugin,
    workspacePlugin,
    ...(options.plugins || [])
  ])

  return codex.init()
}

// Re-export core types and utilities
export type { Tree, Window, Stack } from '@umut/layout-tree'
export { definePlugin } from '@umut/codex'
```

### Core Plugins

```typescript:packages/studio/src/plugins/workspace.ts
import { definePlugin } from '@umut/codex'
import { createTree, split, type StackPath } from '@umut/layout-tree'
import { z } from 'zod'

declare module '@umut/codex' {
  interface CodexContext {
    workspace: {
      /** Current workspace layout */
      layout: Tree
      /** Path to focused panel */
      focused: StackPath
      /** Active panel ID */
      active: string
    }
  }
}

export const workspacePlugin = definePlugin({
  name: 'workspace',
  version: '1.0.0',
  dependencies: ['commands'],
  register: (context) => {
    // Initialize workspace state
    context.workspace = {
      layout: createTree(),
      focused: [],
      active: ''
    }

    // Register workspace commands
    context.commands.register('workspace.split', {
      description: 'Split current panel',
      input: z.object({
        direction: z.enum(['vertical', 'horizontal'])
      }),
      execute: ({direction}) => {
        context.workspace.layout = split(
          context.workspace.layout,
          context.workspace.focused,
          direction
        )
      }
    })
  }
})
```

### Usage Example

```typescript:services/usir-in/src/main.ts
import { createStudio } from '@umut/studio'

async function main() {
  const studio = await createStudio({
    plugins: [myCustomPlugin]
  })

  // Access core functionality through context
  studio.commands.execute('workspace.split', {
    direction: 'vertical'
  })

  // Handle keyboard events
  window.addEventListener('keydown', (e) => {
    studio.keybindings.handleKey(e.key)
  })
}
```

## Implementation Strategy

### Phase 1: Core Integration
1. Create studio package
2. Implement core plugins
3. Add type definitions
4. Create basic examples

### Phase 2: Features
1. Add more workspace commands
2. Implement command palette
3. Add keyboard shortcuts
4. Create panel system

### Phase 3: Extensions
1. Create plugin templates
2. Add extension points
3. Create documentation
4. Add testing utilities

## Benefits
1. Simple, plugin-based architecture
2. Full type safety
3. Easy extensibility
4. Clear separation of concerns
5. Minimal boilerplate

## Migration Guide
1. Install package:
```bash
pnpm add @umut/studio
```

2. Update imports:
```typescript
// Before
import { createCodex } from '@umut/codex'

// After
import { createStudio } from '@umut/studio'
```

3. Update initialization:
```typescript
// Before
const codex = createCodex()
await codex.use([...])

// After
const studio = await createStudio({
  plugins: [...]
})
```