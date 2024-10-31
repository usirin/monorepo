# Studio Framework Architecture

## Background
Building studio-like applications (think VS Code or Figma) requires solving similar problems: window management, keyboard shortcuts, widget systems, etc. This framework provides reusable building blocks for these common needs.

## Core Packages

### @umut/codex
Everything starts with plugins. Plugins are how we extend and compose our studio:
```typescript
import { createStudio } from '@umut/codex'

const tokenPlugin = {
  name: 'tokens',
  dependencies: ['workspace'],
  
  // Setup phase
  async register({ commands, keybindings }) {
    commands.register({
      tokens: {
        edit: defineCommand({
          input: z.object({ 
            name: z.string(),
            value: z.string()
          }),
          handler: async ({ name, value }) => {
            // Update design token
          }
        })
      }
    })
  },
  
  // Runtime phase
  async boot({ workspace }) {
    workspace.createLayout('tokens', {
      root: createStack('horizontal', [
        createWindow('token-explorer'),
        createWindow('token-editor')
      ])
    })
  }
}

const studio = createStudio()
await studio.use(tokenPlugin)
```

### @umut/spellbook
Commands are the primary way to interact with the system:
```typescript
const componentCommands = defineCommand('component', {
  create: defineCommand({
    input: z.object({
      name: z.string(),
      type: z.enum(['atom', 'molecule', 'organism'])
    }),
    handler: async ({ name, type }) => {
      // Create new component
    }
  })
})

const commands = createCommands()
commands.register(componentCommands)
```

### @umut/runekeeper
Keyboard input is handled through runekeeper:
```typescript
import { createRunekeeper } from '@umut/runekeeper'

const keys = createRunekeeper(['normal'])

keys.map('normal', '<C-w>v', () => 
  commands.execute(['workspace', 'split'], { direction: 'vertical' })
)
```

### @umut/layout-tree
Pure data structure for window management:
```typescript
import { createTree, split } from '@umut/layout-tree'

const tree = createTree()
const newTree = split(tree, [0], 'horizontal')
```

### @umut/shrine
Widget system with communication:
```typescript
import { defineWidget } from '@umut/shrine'

const EditorWidget = defineWidget({
  id: 'editor',
  initialState: { content: '' },
  ports: {
    input: {
      setContent(state, content) {
        state.content = content
      }
    },
    output: {
      onChange(content) {
        // Called when content changes
      }
    }
  }
})
```

### @umut/lodge
Workspace state management:
```typescript
import { createLodge } from '@umut/lodge'

const lodge = createLodge()
lodge.createWorkspace('main')
lodge.focusWindow([0, 1])
```

### @umut/workbench
React components for the UI:
```typescript
import { Workbench } from '@umut/workbench'

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
@umut/codex      (depends on all)
@umut/spellbook  (independent)
@umut/runekeeper (depends on spellbook)
@umut/layout-tree (independent)
@umut/shrine     (depends on spellbook)
@umut/lodge      (depends on layout-tree, shrine, spellbook)
@umut/workbench  (depends on lodge)
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
1. Complete @umut/codex plugin system
2. Implement @umut/spellbook
3. Build core plugins
4. Write documentation