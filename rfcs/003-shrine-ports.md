# Widget Communication with Ports

## Summary
A system for widgets to communicate with each other in a type-safe way. Think of ports as plugs and sockets - widgets can have input ports (sockets that accept data) and output ports (plugs that send data).

## How It Works

### Simple Example: Counter with Display
Let's start with a basic counter that updates a display:

```typescript
// A counter that can be incremented/decremented
const CounterWidget = defineWidget({
  id: 'counter',
  initialState: {
    value: 0
  },
  ports: {
    input: {
      // Simple increment/decrement
      increment(state) {
        state.value += 1
      },
      decrement(state) {
        state.value -= 1
      }
    },
    output: {
      // Notify when value changes
      onChange(value) {
        // Will be called after each change
      }
    }
  }
})

// A display that shows a number
const DisplayWidget = defineWidget({
  id: 'display',
  initialState: {
    value: null
  },
  ports: {
    input: {
      // Update display value
      setValue(state, value) {
        state.value = value
      }
    }
  }
})

// Connect counter to display
registry.connect(CounterWidget, DisplayWidget, {
  onChange: 'setValue'
})
```

### Advanced Example: Code Editor Suite
A more complex example showing how multiple specialized widgets work together:

```typescript
// Code editor with syntax highlighting
const EditorWidget = defineWidget({
  id: 'editor',
  initialState: {
    content: '',
    cursor: {line: 0, column: 0},
    selections: []
  },
  ports: {
    input: {
      // Jump to specific location
      setCursor(state, line, column) {
        state.cursor = {line, column}
      },
      // Highlight code range
      addHighlight(state, range) {
        state.selections.push(range)
      },
      // Clear all highlights
      clearHighlights(state) {
        state.selections = []
      }
    },
    output: {
      // Code changed
      onChange(content) {
        // Will be called when code changes
      },
      // Cursor moved
      onCursorMove(position) {
        // Will be called when cursor moves
      }
    }
  }
})

// Problem finder (linter/type checker)
const ProblemFinderWidget = defineWidget({
  id: 'problems',
  initialState: {
    problems: []
  },
  ports: {
    input: {
      // Check code for problems
      check(state, content) {
        state.problems = findProblems(content)
      }
    },
    output: {
      // Problem selected
      onSelect(problem) {
        // Will be called when user clicks a problem
      }
    }
  }
})

// Minimap for code overview
const MinimapWidget = defineWidget({
  id: 'minimap',
  initialState: {
    decorations: []
  },
  ports: {
    input: {
      // Update code overview
      update(state, content) {
        state.decorations = generateMinimap(content)
      },
      // Add problem marker
      addProblem(state, {line, severity}) {
        state.decorations.push({line, type: severity})
      }
    },
    output: {
      // Clicked position in minimap
      onClick(line) {
        // Will be called when user clicks minimap
      }
    }
  }
})

// Connect everything
registry.connect([
  // Editor changes trigger problem finder
  {
    from: EditorWidget,
    to: ProblemFinderWidget,
    connect: {
      onChange: 'check'
    }
  },
  // Problem selection jumps to location
  {
    from: ProblemFinderWidget,
    to: EditorWidget,
    connect: {
      onSelect: 'setCursor'
    }
  },
  // Editor updates minimap
  {
    from: EditorWidget,
    to: MinimapWidget,
    connect: {
      onChange: 'update'
    }
  },
  // Minimap click moves cursor
  {
    from: MinimapWidget,
    to: EditorWidget,
    connect: {
      onClick: 'setCursor'
    }
  }
])
```

## Key Concepts

1. **Input Ports**
   - Functions that modify widget state
   - Called by other widgets
   - Have access to widget state
   - Can validate incoming data

2. **Output Ports**
   - Functions provided by the widget
   - Called when something happens
   - Can be connected to input ports
   - Can transform data before sending

3. **Connections**
   - Link output ports to input ports
   - Can transform data between widgets
   - Type-safe at runtime
   - Easy to debug and monitor

## Benefits

1. **Decoupling**
   - Widgets don't know about each other
   - Easy to swap implementations
   - Clear communication boundaries

2. **Type Safety**
   - Input/output types are checked
   - Runtime validation
   - IDE support

3. **Debugging**
   - Clear data flow
   - Easy to monitor
   - Simple to test