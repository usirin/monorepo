# Kontrol Framework Architecture

## Background
Building studio-like applications (think VS Code or Figma) requires solving similar problems: window management, keyboard shortcuts, widget systems, etc. Kontrol provides reusable building blocks for these common needs, leveraging Effect.ts for resource management and type safety where it makes sense.

## Core Components

### @kontrol/layout-tree
Pure data structure for window management:
```typescript
import { createTree, split } from '@kontrol/layout-tree'

// Pure functions for layout manipulation
const tree = createTree()
const newTree = split(tree, [0], 'horizontal')
```

### @kontrol/spellbook
Command system with schema validation:
```typescript
import { Schema } from "@effect/schema"

const commands = createSpellbook({
  'workspace.split': defineCommand({
    input: Schema.struct({
      direction: Schema.union(
        Schema.literal("vertical"), 
        Schema.literal("horizontal")
      )
    }),
    execute: ({ direction }) => {/* ... */}
  })
})
```

### @kontrol/runekeeper
Keyboard handling with state machine:
```typescript
const runekeeper = createRunekeeper(['normal', 'insert'])
runekeeper.map('normal', '<C-w>v', () => {/* ... */})
```

### @kontrol/widgets
Widget system designed for AI-first applications, based on vim's buffer/window model:

```typescript
// Core Widget Service - Like vim buffers, but for AI state
class Widget extends Effect.Service<Widget>() {
  static create<TState, TActions>({ id, schema, setup }: {
    id: string,
    // Schema defines widget's state shape
    schema: Schema.Schema<TState>,
    // Setup creates singleton state and actions
    setup: Effect.Effect<TActions>
  }) {
    return class extends Widget {
      static readonly live = Effect.gen(function*(_) {
        // Singleton state for the widget
        const state = yield* Ref.make<TState>()
        
        // Stream for state updates
        const updates = yield* Stream.fromEffect(Ref.get(state))
        
        // Stream for AI events (completions, embeddings etc)
        const events = yield* Stream.async<AIEvent>()
        
        // Actions from setup
        const actions = yield* setup
        
        return {
          // State management
          state,
          updates,
          events,
          actions,
          
          // Metadata
          id,
          schema
        }
      }).pipe(Effect.scoped)
    }
  }
}

// Example: AI Chat Widget
const ChatWidget = Widget.create({
  id: 'chat',
  schema: Schema.struct({
    messages: Schema.array(Schema.struct({
      role: Schema.union(
        Schema.literal("user"),
        Schema.literal("assistant")
      ),
      content: Schema.string,
      // Metadata for AI features
      embedding: Schema.optional(Schema.array(Schema.number)),
      tokens: Schema.optional(Schema.number),
      contextualMemory: Schema.optional(Schema.array(Schema.string))
    })),
    // AI-specific state
    context: Schema.struct({
      relevantDocs: Schema.array(Schema.string),
      codebase: Schema.optional(Schema.string),
      activeFile: Schema.optional(Schema.string)
    }),
    // Stream state
    streaming: Schema.boolean,
    temperature: Schema.number
  }),
  
  setup: Effect.gen(function*(_) {
    const llm = yield* LLMService
    const memory = yield* MemoryService
    const codebase = yield* CodebaseService
    
    return {
      // Basic chat actions
      sendMessage: (content: string) => Effect.gen(function*(_) {
        // Get relevant context
        const context = yield* memory.search(content)
        const codeContext = yield* codebase.findRelevant(content)
        
        // Update state with streaming response
        yield* llm.streamCompletion({
          messages: [...previousMessages, { role: "user", content }],
          context: [...context, ...codeContext]
        })
      }),
      
      // AI-specific actions
      generateEmbeddings: (messageId: string) => 
        Effect.gen(function*(_) {
          const embedding = yield* llm.embed(message.content)
          yield* memory.store(embedding)
        }),
        
      findSimilar: (messageId: string) =>
        Effect.gen(function*(_) {
          const similar = yield* memory.similar(message.embedding)
          return similar
        }),
        
      explainCode: (messageId: string) =>
        Effect.gen(function*(_) {
          const explanation = yield* llm.explain(message.codeContext)
          return explanation
        })
    }
  })
})

// React Window Component (pure rendering)
function ChatWindow({ bufferId }: { bufferId: string }) {
  const chat = useWidget(bufferId)
  
  return (
    <div>
      {chat.messages.map(message => (
        <Message 
          key={message.id}
          content={message.content}
          // AI features available through context menu
          onExplainCode={() => chat.explainCode(message.id)}
          onFindSimilar={() => chat.findSimilar(message.id)}
        />
      ))}
    </div>
  )
}
```

Key Features for AI Applications:

1. **Rich State Model**
   - Support for embeddings and vector storage
   - Streaming state management
   - Context management (docs, code, etc)
   - Memory and retrieval

2. **AI-Specific Actions**
   - Text completion
   - Code explanation
   - Semantic search
   - Context injection
   - Prompt management

3. **Integration Points**
   - LLM services
   - Vector databases
   - Code parsers
   - Knowledge bases
   - Fine-tuning pipelines

## React Integration (@kontrol/widgets/react)
Clean React bindings that hide Effect implementation:
```typescript
// Public React API
export function KontrolProvider({ children }) {
  // Internal Effect runtime setup
  return <>{children}</>
}

export function createWidget<
  TId extends string,
  TProps extends Record<string, unknown>
>(id: TId, config: WidgetConfig<TProps>) {
  return function WidgetComponent(props: TProps) {
    // Internal Effect handling
    return config.component(props)
  }
}

export function useKontrolWidget<T>(id: string) {
  // Internal Effect handling
  return {
    state: /* widget state */,
    api: /* widget methods */
  }
}
```

## Integration (@kontrol/core)
Brings all components together:
```typescript
import { Effect } from "effect"

const program = Effect.gen(function*(_) {
  // Core services
  const layout = yield* LayoutTree
  const commands = yield* Spellbook  
  const keys = yield* Runekeeper
  const widgets = yield* WidgetManager
  
  // Register core commands
  yield* commands.register('split', {
    input: Schema.struct({ direction: Schema.string }),
    execute: ({ direction }) => layout.split(direction)
  })
  
  // Setup keybindings
  yield* keys.map('normal', '<C-w>v', () =>
    commands.execute('split', { direction: 'vertical' })
  )
  
  // Create widgets
  yield* widgets.spawn(EditorWidget)
  
  return {
    layout,
    commands,
    keys,
    widgets
  }
})
```

## Design Principles

1. **Pure Core Components**
   - layout-tree: Pure data structure
   - spellbook: Pure command system
   - runekeeper: Pure state machine
   - widgets: Effect fibers for state (internal)

2. **Effect Integration**
   - Completely internal
   - Hidden from application code
   - Exposed through clean APIs
   - Type-safe boundaries

3. **React Integration**
   - No Effect exposure
   - Simple component API
   - Familiar React patterns
   - Type-safe props and methods

## Development
```bash
pnpm install
pnpm dev
pnpm test
```

## Next Steps
1. Implement core components
2. Build widget fiber system
3. Create React bridge
4. Write documentation