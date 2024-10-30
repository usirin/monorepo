# Studio Framework Architecture

## Background
Building studio-like applications (think VS Code or Figma) requires solving similar problems: window management, keyboard shortcuts, widget systems, etc. This framework provides reusable building blocks for these common needs.

## Core Packages

### @umut/spellbook
Everything starts with a command. Commands are the primary way to interact with the system:
```typescript
import { createCommands } from '@umut/spellbook'

const commands = createCommands()

// Register commands
commands.register({
  'workspace.split': {
    execute: (direction: 'horizontal' | 'vertical') => {
      // Update layout
    }
  }
})

// Execute commands
commands.execute('workspace.split', 'vertical')
```

### @umut/runekeeper
Users trigger commands through keyboard shortcuts:
```typescript
import { createRunekeeper } from '@umut/runekeeper'

const keys = createRunekeeper(['normal', 'insert'])

// Map key sequences to commands
keys.map('normal', '<C-w>v', () => {
  commands.execute('workspace.split')
})

// Handle key presses
keys.handleKeyPress('<C-w>', 'normal')
```

### @umut/layout-tree
Commands modify the window layout through this data structure:
```typescript
import { createTree, split, remove } from '@umut/layout-tree'

// Create initial layout
const tree = createTree()

// Split a window
const newTree = split(tree, [0], 'horizontal')

// Remove a window
const updatedTree = remove(tree, [0, 1])
```

### @umut/shrine
Windows contain widgets, which are managed by shrine:
```typescript
import { defineWidget } from '@umut/shrine'

const EditorWidget = defineWidget({
  id: 'editor',
  initialState: {
    content: ''
  },
  ports: {
    input: {
      setContent(state, content: string) {
        state.content = content
      }
    },
    output: {
      onChange: (content: string) => void
    }
  }
})
```

### @umut/lodge
Lodge coordinates everything - layout, focus, widgets:
```typescript
import { createLodge } from '@umut/lodge'

const lodge = createLodge()

// Manage workspaces
lodge.createWorkspace('main')
lodge.focusWindow([0, 1])
lodge.getActiveWorkspace()
```

### @umut/workbench
Finally, workbench renders everything to the screen:
```typescript
import { Workbench, Window } from '@umut/workbench'

function Studio() {
  return (
    <Workbench>
      <CommandPalette />
      <Workspace>
        <Window id="editor" />
      </Workspace>
    </Workbench>
  )
}
```

## Package Dependencies
```
@umut/spellbook   (independent)
@umut/runekeeper  (depends on spellbook)
@umut/layout-tree (independent)
@umut/shrine      (depends on spellbook)
@umut/lodge       (depends on layout-tree, shrine, spellbook)
@umut/workbench   (depends on lodge)
```

## Development
```bash
# Install
pnpm install

# Development
pnpm dev

# Test
pnpm test
```

## Next Steps
1. Implement @umut/spellbook
2. Complete @umut/lodge workspace management
3. Build @umut/workbench components
4. Write documentation