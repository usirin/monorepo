# RFC 003: Shrine Widget Ports

## Summary
A type-safe communication system between widgets using input/output ports.

## Port Types

```typescript
// Basic port definition
interface Ports {
  input: {
    // Input ports are functions that modify widget state
    [key: string]: (state: State, ...args: any[]) => void
  }
  output: {
    // Output ports are event definitions
    [key: string]: (...args: any[]) => void
  }
}

// Example: Code Editor Widget
const EditorWidget = defineWidget({
  id: 'editor',
  initialState: {
    content: '',
    language: 'typescript',
    cursor: { line: 0, column: 0 }
  },
  ports: {
    // Input ports - other widgets can call these
    input: {
      // Set content from external source
      setContent(state, content: string) {
        state.content = content
      },
      // Jump to specific location
      setCursor(state, line: number, column: number) {
        state.cursor = { line, column }
      },
      // Highlight specific range
      highlight(state, range: { start: number, end: number }) {
        state.highlights.push(range)
      }
    },
    // Output ports - this widget emits these events
    output: {
      // Notify when content changes
      onChange: (content: string) => void,
      // Notify when cursor moves
      onCursorMove: (position: { line: number, column: number }) => void,
      // Notify when selection changes
      onSelection: (range: { start: number, end: number }) => void
    }
  }
})

// Example: Preview Widget
const PreviewWidget = defineWidget({
  id: 'preview',
  initialState: {
    content: '',
    scroll: 0
  },
  ports: {
    input: {
      // Update preview content
      updateContent(state, content: string) {
        state.content = content
      },
      // Scroll to position
      scrollTo(state, position: number) {
        state.scroll = position
      }
    },
    output: {
      // Notify when user clicks a position in preview
      onClick: (position: number) => void
    }
  }
})
```

## Connecting Widgets

```typescript
// In your studio setup
const registry = createRegistry()

// Register widgets
registry.register(EditorWidget)
registry.register(PreviewWidget)

// Connect editor to preview
registry.connect('editor', 'preview', {
  // When editor content changes, update preview
  onChange: 'updateContent'
})

// Connect preview to editor
registry.connect('preview', 'editor', {
  // When preview is clicked, move cursor in editor
  onClick: 'setCursor'
})

// Multiple connections
registry.connect('editor', ['preview', 'minimap'], {
  onChange: 'updateContent',
  onCursorMove: 'highlight'
})
```

## Using Ports in Components

```typescript
function EditorComponent() {
  const { state, ports } = useWidget('editor')
  
  return (
    <CodeMirror
      value={state.content}
      onChange={content => {
        // Emit change event through output port
        ports.emit('onChange', content)
      }}
      onCursorActivity={pos => {
        ports.emit('onCursorMove', pos)
      }}
    />
  )
}
```

## Advanced Features

### 1. Port Transformers
```typescript
// Transform data between widgets
registry.connect('editor', 'preview', {
  onChange: {
    to: 'updateContent',
    transform: (markdown: string) => markdownToHtml(markdown)
  }
})
```

### 2. Multiple Sources
```typescript
// Combine multiple outputs into one input
registry.connect(['editor', 'console'], 'output', {
  onChange: 'appendContent'
})
```

### 3. Conditional Connections
```typescript
registry.connect('editor', 'preview', {
  onChange: {
    to: 'updateContent',
    when: (content) => content.length > 0
  }
})
```

### 4. Async Transformers
```typescript
registry.connect('editor', 'preview', {
  onChange: {
    to: 'updateContent',
    async transform(content) {
      const formatted = await prettier.format(content)
      return formatted
    }
  }
})
```

## Benefits

1. **Type Safety**
   - Input/output types are checked at compile time
   - Connection mismatches are caught early

2. **Explicit Contracts**
   - Clear documentation of widget capabilities
   - Self-documenting widget interactions

3. **Decoupling**
   - Widgets don't know about each other
   - Easy to swap implementations

4. **Testability**
   - Easy to mock connections
   - Clear interaction boundaries 