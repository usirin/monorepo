# RFC 004: Shrine Stream-Based Ports

## Summary
An enhanced port system using Web Streams API for real-time data flow between widgets.

## Stream-Based Ports

```typescript
const EditorWidget = defineWidget({
  id: 'editor',
  initialState: {
    content: '',
    cursor: { line: 0, column: 0 }
  },
  streams: {
    // Output streams - data flowing out
    output: {
      // Content changes as stream of patches
      content: WritableStream<TextPatch>,
      // Cursor movement as stream
      cursor: WritableStream<CursorPosition>,
      // Selection changes
      selection: WritableStream<SelectionRange>
    },
    // Input streams - data flowing in
    input: {
      // Receive formatting commands
      format: ReadableStream<FormatCommand>,
      // Receive jump commands
      jump: ReadableStream<JumpCommand>
    },
    // Transform streams - modify data as it flows
    transform: {
      // Transform content before output
      content: TransformStream<string, TextPatch>
    }
  }
})

// Preview widget with streaming updates
const PreviewWidget = defineWidget({
  id: 'preview',
  streams: {
    input: {
      // Receive content patches
      content: ReadableStream<TextPatch>,
      // Receive scroll commands
      scroll: ReadableStream<ScrollCommand>
    },
    output: {
      // Emit click positions
      click: WritableStream<PreviewPosition>
    }
  }
})
```

## Stream Connections

```typescript
// Connect widgets using streams
registry.pipe('editor', 'preview', {
  // Pipe editor content to preview
  content: {
    // Optional transform
    through: new TransformStream({
      transform(chunk, controller) {
        const html = markdownToHtml(chunk)
        controller.enqueue(html)
      }
    })
  }
})

// Broadcast channel for multi-widget communication
const contentBroadcast = new BroadcastChannel('content-updates')

registry.broadcast('editor', 'content', contentBroadcast, {
  // Optional encoding/decoding
  encode: JSON.stringify,
  decode: JSON.parse
})

// Multiple consumers
registry.pipe('editor', ['preview', 'minimap', 'outline'], {
  content: {
    // Different transforms for different consumers
    through: (target) => {
      switch(target) {
        case 'preview': return markdownTransform
        case 'minimap': return minimapTransform
        case 'outline': return outlineTransform
      }
    }
  }
})
```

## Stream Processing

```typescript
// In widget components
function EditorComponent() {
  const { streams } = useWidget('editor')
  
  useEffect(() => {
    // Set up content stream
    const writer = streams.output.content.getWriter()
    
    // Handle editor changes
    function handleChange(change: TextPatch) {
      writer.write(change)
    }
    
    return () => writer.close()
  }, [])
  
  // Handle incoming format commands
  useEffect(() => {
    const reader = streams.input.format.getReader()
    
    async function readCommands() {
      while (true) {
        const {done, value} = await reader.read()
        if (done) break
        applyFormatting(value)
      }
    }
    
    readCommands()
    return () => reader.cancel()
  }, [])
}
```

## Advanced Features

### 1. Backpressure Handling
```typescript
registry.pipe('editor', 'preview', {
  content: {
    through: new TransformStream({
      transform(chunk, controller) {
        if (controller.desiredSize! < 0) {
          // Handle backpressure
          controller.terminate()
        }
        controller.enqueue(chunk)
      }
    })
  }
})
```

### 2. Stream Composition
```typescript
// Combine multiple streams
const combinedStream = new TransformStream({
  transform(chunk, controller) {
    const [content, cursor] = chunk
    controller.enqueue({content, cursor})
  }
})

registry.pipe('editor', 'preview', {
  combined: {
    from: ['content', 'cursor'],
    through: combinedStream
  }
})
```

### 3. Broadcast Channels
```typescript
// Create widget groups
const editorGroup = registry.createGroup(['editor', 'preview', 'minimap'])

// Broadcast within group
editorGroup.broadcast('content-updates', {
  from: 'editor',
  stream: 'content'
})
```

## Benefits

1. **Real-time Updates**
   - Efficient streaming of changes
   - Backpressure handling
   - Cancellable operations

2. **Resource Management**
   - Automatic cleanup
   - Memory efficient
   - Flow control

3. **Composability**
   - Stream chaining
   - Transform pipelines
   - Multi-source merging

4. **Performance**
   - Chunk-based processing
   - Native browser APIs
   - Efficient memory usage 