# RFC 001: Studio Framework Architecture

## Summary
A framework for building Vim-inspired studio applications with i3-style window management. The goal is to provide a foundation for building highly customizable, keyboard-driven workspaces.

## Core Packages

### @umut/layout-tree
Pure data structure for tiling window layouts
- Tree-based layout data structure (Stack/Window nodes)
- Basic operations: split, remove, move, swap
- Path-based node addressing
- No UI, pure logic
- No persistence
- No application state

### @umut/runekeeper  
Keyboard and command system
- Vim-style key sequence parsing (`<C-w>v`, etc)
- Modal keyboard handling (normal/insert)
- Timeout-based sequence handling
- Command mapping/execution
- No UI components

### @umut/shrine
Widget system and registry
- Widget registration/discovery
- Widget lifecycle management
- Widget state management
- Widget communication layer
- Hot module replacement support
- No UI components
- Pure TypeScript/JavaScript

### @umut/lodge
Window and workspace management
- React components for window management
- Workspace/tab management UI
- Focus management
- Drag & drop support
- Command palette UI
- Layout persistence
- Integration with shrine for widget rendering

### @umut/ui
Base UI components and theme
- Theme system
- Common components
- Layout primitives
- No business logic

## Example Usage

```typescript
// Widget definition (@umut/shrine)
import { defineWidget } from '@umut/shrine'

export const EditorWidget = defineWidget({
  id: 'editor',
  // Widget-specific state management
  state: {
    content: '',
    language: 'typescript'
  },
  // Widget-specific commands
  commands: {
    'editor.save': (state) => {
      // Save content
    }
  },
  // Optional: Widget communication
  ports: {
    onSave: (content) => void,
    onLanguageChange: (language: string) => void
  }
})

// Widget Registry (@umut/shrine)
import { createRegistry } from '@umut/shrine'

const registry = createRegistry()
registry.register(EditorWidget)
registry.register(PreviewWidget)

// React Component (@umut/lodge)
import { Lodge, useWidget } from '@umut/lodge'

function EditorComponent() {
  const { state, dispatch } = useWidget('editor')
  return <CodeEditor value={state.content} />
}

// Main App
function Studio() {
  return (
    <Lodge registry={registry}>
      <CommandPalette />
      <Workspace>
        <Window id="editor" />
        <Window id="preview" />
      </Workspace>
    </Lodge>
  )
}
```

## Package Dependencies
```
@umut/ui          (independent)
@umut/layout-tree (independent)
@umut/runekeeper  (independent)
@umut/shrine      (independent)
@umut/lodge       (depends on all above)
```

## Next Steps
1. RFC for Widget System (@umut/shrine)
   - Widget definition API
   - State management
   - Communication protocol
   - Hot reload support

2. RFC for Window Management (@umut/lodge)
   - Integration with shrine
   - Window/workspace management
   - Layout persistence

3. RFC for Theme System (@umut/ui)