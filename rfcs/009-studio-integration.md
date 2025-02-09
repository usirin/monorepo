# RFC 009: Studio Integration

## Summary
This RFC proposes the integration of our core systems (@codex, @spellbook, @runekeeper) into the usir-in studio application, creating a cohesive and extensible development environment.

## Background
We have developed three core systems:
- @codex: A type-safe plugin system
- @spellbook: A command system
- @runekeeper: A keybinding system

Currently, usir-in has a basic widget system and workspace management, but lacks unified command and keyboard control.

## Technical Architecture

### Core Integration

```typescript
import { definePlugin, createCodex } from '@usirin/codex'
import { createSpellbook, defineCommand } from '@usirin/spellbook'
import { createRunekeeper } from '@usirin/runekeeper'
import { z } from 'zod'

// Define plugin context types
declare module '@usirin/codex' {
  interface CodexContext {
    spellbook: ReturnType<typeof createSpellbook>
    runekeeper: ReturnType<typeof createRunekeeper>
    workspace: {
      store: typeof useWorkspaceStore
      commands: typeof workspaceCommands
    }
  }
}

// Core workspace commands
const workspaceCommands = {
  focus: defineCommand({
    description: 'Focus a workspace panel',
    input: z.object({
      path: z.array(z.number())
    }),
    execute: ({path}) => {
      useWorkspaceStore.setState(state => {
        state.workspace.focused = path
      })
    }
  }),
  split: defineCommand({
    description: 'Split current panel',
    input: z.object({
      orientation: z.enum(['horizontal', 'vertical'])
    }),
    execute: ({orientation}) => {
      useWorkspaceStore.setState(state => {
        const {focused} = state.workspace
        state.workspace.layout = split(
          state.workspace.layout,
          focused,
          orientation
        )
      })
    }
  })
}

// Workspace plugin
const workspacePlugin = definePlugin({
  name: 'workspace',
  version: '1.0.0',
  register: () => ({
    store: useWorkspaceStore,
    commands: workspaceCommands
  })
})

// Command system plugin
const spellbookPlugin = definePlugin({
  name: 'spellbook',
  version: '1.0.0',
  dependencies: ['workspace'],
  register: ({workspace}) => {
    const spellbook = createSpellbook()
    
    // Register workspace commands
    Object.entries(workspace.commands).forEach(([name, command]) => {
      spellbook.register(name, command)
    })
    
    return spellbook
  }
})

// Keybinding plugin
const runekeeperPlugin = definePlugin({
  name: 'runekeeper',
  version: '1.0.0',
  dependencies: ['spellbook'],
  register: ({spellbook}) => {
    const runekeeper = createRunekeeper(['normal', 'insert'])
    
    // Default keybindings
    runekeeper.map('normal', '<c-\\>', () => {
      spellbook.execute('workspace.split', { orientation: 'vertical' })
    })
    
    runekeeper.map('normal', '<c-->', () => {
      spellbook.execute('workspace.split', { orientation: 'horizontal' })
    })
    
    return runekeeper
  }
})
```

### Studio Container Updates

```typescript:services/usir-in/studio/container.tsx
import { createCodex } from '@usirin/codex'
import { useEffect } from 'react'

export function StudioContainer() {
  useEffect(() => {
    async function initStudio() {
      const codex = createCodex()
      
      await codex.use([
        workspacePlugin,
        spellbookPlugin,
        runekeeperPlugin
      ])
      
      const studio = await codex.init()
      
      // Initialize keyboard handling
      const handleKeyDown = (e: KeyboardEvent) => {
        studio.runekeeper.handleKeyPress(e.key, 'normal')
      }
      
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
    
    initStudio()
  }, [])
  
  return <Workspace />
}
```

### Command Palette Integration

```typescript:services/usir-in/studio/command-palette.tsx
import { Command } from 'cmdk'
import { useCodex } from './hooks'

export function CommandPalette() {
  const { spellbook } = useCodex()
  
  return (
    <Command>
      <Command.Input placeholder="Type a command..." />
      <Command.List>
        {Object.entries(spellbook.commands).map(([id, command]) => (
          <Command.Item key={id} onSelect={() => spellbook.execute(id)}>
            {command.description}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  )
}
```

## Implementation Strategy

### Phase 1: Core Integration
1. Set up Codex as the central system
2. Migrate existing workspace commands to Spellbook
3. Add basic keybindings with Runekeeper
4. Create studio initialization flow

### Phase 2: User Interface
1. Implement command palette
2. Add keyboard shortcut overlay
3. Create settings UI for keybindings
4. Add command history view

### Phase 3: Plugin System
1. Create widget plugin API
2. Migrate existing widgets to plugin system
3. Add plugin marketplace UI
4. Implement plugin settings management

## Migration Guide

1. Update workspace store:
```typescript
// Before
commands.split.execute({ orientation: 'vertical' })

// After
spellbook.execute('workspace.split', { orientation: 'vertical' })
```

2. Update keyboard shortcuts:
```typescript
// Before
<IconButton onClick={() => commands.split.execute({...})}>

// After
// Define in runekeeper plugin
runekeeper.map('normal', '<c-\\>', () => 
  spellbook.execute('workspace.split', {...})
)
```

## Success Metrics
1. All workspace commands migrated to Spellbook
2. Keyboard shortcuts working for core operations
3. Command palette functional
4. Plugin system able to extend workspace
5. Zero regression in existing functionality

## Security Considerations
1. Plugin sandboxing
2. Command permissions
3. Safe plugin installation
4. Secure plugin marketplace

## Performance Considerations
1. Lazy loading of plugins
2. Command execution performance
3. Keyboard input latency
4. Plugin initialization impact 