# Widget Communication with Streams

## Summary
A streaming-based communication system for widgets that need real-time data flow.

## How It Works

### Simple Example: Live Counter
Let's start with a basic counter that streams updates to multiple displays:

```typescript
// Counter that streams value changes
const CounterWidget = defineWidget({
  id: 'counter',
  initialState: {
    value: 0
  },
  streams: {
    // Output stream of value changes
    output: {
      value: new WritableStream({
        write(value) {
          // Stream each value change
        }
      })
    }
  }
})

// Display that receives value updates
const DisplayWidget = defineWidget({
  id: 'display',
  initialState: {
    value: null
  },
  streams: {
    // Input stream of values to display
    input: {
      value: new ReadableStream({
        start(controller) {
          // Receive value updates
        }
      })
    }
  }
})

// Connect counter to multiple displays
registry.pipe('counter', ['display1', 'display2'], {
  value: {
    // Optional transform
    through: new TransformStream({
      transform(value, controller) {
        controller.enqueue(`Count: ${value}`)
      }
    })
  }
})
```

### Advanced Example: Code Editor with Real-time Features
A more complex example showing real-time collaboration features:

```typescript
// Code editor with real-time updates
const EditorWidget = defineWidget({
  id: 'editor',
  initialState: {
    content: ''
  },
  streams: {
    output: {
      // Stream of content changes
      changes: new WritableStream({
        write(patch) {
          // Stream each content change
        }
      }),
      // Stream of cursor movements
      cursor: new WritableStream({
        write(position) {
          // Stream cursor position
        }
      })
    },
    input: {
      // Receive remote changes
      remoteChanges: new ReadableStream({
        start(controller) {
          // Handle incoming changes
        }
      })
    }
  }
})

// Collaboration server connection
const CollabWidget = defineWidget({
  id: 'collab',
  streams: {
    input: {
      // Receive local changes
      changes: new ReadableStream({
        start(controller) {
          // Forward to server
        }
      })
    },
    output: {
      // Stream remote changes
      remoteChanges: new WritableStream({
        write(change) {
          // Stream changes from server
        }
      })
    }
  }
})

// Connect editor to collab server
registry.pipe('editor', 'collab', {
  // Local changes go to server
  changes: {
    through: new TransformStream({
      transform(change, controller) {
        // Transform for network protocol
        controller.enqueue(serializeChange(change))
      }
    })
  }
})

registry.pipe('collab', 'editor', {
  // Remote changes come to editor
  remoteChanges: {
    through: new TransformStream({
      transform(change, controller) {
        // Transform from network protocol
        controller.enqueue(deserializeChange(change))
      }
    })
  }
})
```

[Continue with benefits, implementation details, etc...]