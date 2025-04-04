# RFC 002: Shrine Widget System

## Core Types

```typescript
/**
 * Represents a widget's state management options.
 * Defines how widget state is handled and persisted.
 *
 * @template TState - The type of the widget's state
 */
interface StateOptions<TState> {
  /** Initial state or state factory */
  initial: TState | (() => TState)

  /** Whether to persist state across sessions */
  persist?: boolean

  /** Optional state migration strategies */
  migrate?: {
    [version: string]: (state: unknown) => TState
  }
}

/**
 * Represents a widget's port configuration.
 * Ports are the communication channels between widgets.
 *
 * @template TInput - Type map for input methods
 * @template TOutput - Type map for output events
 */
interface PortOptions<
  TInput extends Record<string, (...args: any[]) => void>,
  TOutput extends Record<string, (...args: any[]) => void>
> {
  /** Methods that can be called on this widget */
  input?: TInput

  /** Events that this widget can emit */
  output?: TOutput
}

/**
 * Represents a widget's command configuration.
 * Commands are actions that can be triggered on the widget.
 *
 * @template TState - The widget's state type
 */
interface CommandOptions<TState> {
  /** Map of command names to their implementations */
  [key: string]: {
    /** Command description for documentation */
    description?: string

    /** Command implementation with access to widget state */
    execute: (state: TState, ...args: any[]) => void | Promise<void>
  }
}

/**
 * Complete widget definition type.
 * Combines all widget aspects into a single configuration object.
 *
 * @template TState - Widget state type
 * @template TInput - Input port types
 * @template TOutput - Output port types
 */
interface WidgetDefinition<
  TState extends object,
  TInput extends Record<string, (...args: any[]) => void>,
  TOutput extends Record<string, (...args: any[]) => void>
> {
  /** Unique identifier for the widget */
  id: string

  /** Widget state configuration */
  state: StateOptions<TState>

  /** Widget communication ports */
  ports?: PortOptions<TInput, TOutput>

  /** Widget commands */
  commands?: CommandOptions<TState>

  /** Widget lifecycle hooks */
  lifecycle?: {
    /** Called when widget is mounted */
    onMount?: (state: TState) => void | Promise<void>

    /** Called when widget is unmounted */
    onUnmount?: (state: TState) => void | Promise<void>

    /** Called when widget state changes */
    onStateChange?: (state: TState, prev: TState) => void
  }
}

/**
 * Widget instance type.
 * Represents a running instance of a widget.
 *
 * @template TState - Widget state type
 * @template TInput - Input port types
 * @template TOutput - Output port types
 */
interface WidgetInstance<
  TState extends object,
  TInput extends Record<string, (...args: any[]) => void>,
  TOutput extends Record<string, (...args: any[]) => void>
> {
  /** Widget identifier */
  readonly id: string

  /** Current widget state */
  readonly state: TState

  /** Input port methods */
  readonly input: TInput

  /** Output port event emitter */
  readonly output: {
    [K in keyof TOutput]: TOutput[K]
  }

  /** Update widget state */
  setState: (state: Partial<TState> | ((prev: TState) => Partial<TState>)) => void
}
```

## Widget Definition

```typescript
import { defineWidget } from '@usirin/shrine'

// Basic widget
export const CounterWidget = defineWidget({
  id: 'counter',
  // Initial state is type-inferred
  initialState: {
    count: 0
  },
  // Actions are type-safe and have access to state
  actions: {
    increment: (state) => ({ count: state.count + 1 }),
    decrement: (state) => ({ count: state.count - 1 }),
    setValue: (state, value: number) => ({ count: value })
  },
  // Commands are keyboard/command-palette accessible actions
  commands: {
    'counter.increment': (ctx) => ctx.actions.increment(),
    'counter.decrement': (ctx) => ctx.actions.decrement(),
    'counter.reset': (ctx) => ctx.actions.setValue(0)
  }
})

// Widget with external dependencies
export const ChatWidget = defineWidget({
  id: 'chat',
  // Declare external dependencies
  dependencies: {
    ai: OpenAIClient
  },
  initialState: {
    messages: [],
    isLoading: false
  },
  // Actions can be async and use dependencies
  actions: {
    async sendMessage(state, message: string, { ai }) {
      state.isLoading = true
      const response = await ai.send(message)
      state.messages.push(response)
      state.isLoading = false
    }
  }
})

// Widget with communication ports
export const EditorWidget = defineWidget({
  id: 'editor',
  initialState: {
    content: '',
    language: 'typescript'
  },
  // Define input/output ports for widget communication
  ports: {
    // Input ports - other widgets can call these
    input: {
      setContent: (state, content: string) => {
        state.content = content
      },
      setLanguage: (state, lang: string) => {
        state.language = lang
      }
    },
    // Output ports - this widget emits these events
    output: {
      onSave: (content: string) => void,
      onLanguageChange: (language: string) => void
    }
  }
})
```

## Widget Registry

```typescript
import { createRegistry } from '@usirin/shrine'

const registry = createRegistry()

// Register widgets
registry.register(CounterWidget)
registry.register(ChatWidget, {
  // Provide dependencies
  ai: new OpenAIClient()
})

// Get widget instance
const counter = registry.get('counter')
counter.getState() // { count: 0 }
counter.actions.increment()
counter.getState() // { count: 1 }

// Connect widgets
registry.connect('editor', 'preview', {
  onSave: 'updatePreview'
})
```

## React Integration (via @usirin/lodge)

```typescript
import { useWidget } from '@usirin/lodge'

function CounterComponent() {
  const { state, actions } = useWidget('counter')

  return (
    <div>
      Count: {state.count}
      <button onClick={actions.increment}>+</button>
      <button onClick={actions.decrement}>-</button>
    </div>
  )
}
```

## Key Features

1. **Type Safety**
   - Full TypeScript support
   - State types are inferred
   - Action parameters are type-checked
   - Port connections are type-safe

2. **State Management**
   - Immutable updates (using Immer internally)
   - Async action support
   - State persistence options
   - State history/undo support

3. **Widget Communication**
   - Type-safe port system
   - Event-based communication
   - Cross-widget state sync
   - Dependency injection

4. **Hot Module Replacement**
   - State preservation during development
   - Action hot-reloading
   - Component hot-reloading

## Implementation Details

```typescript
type Widget<
  TState,
  TActions,
  TCommands,
  TDeps,
  TInputPorts,
  TOutputPorts
> = {
  id: string
  initialState: TState
  actions: WidgetActions<TState, TActions, TDeps>
  commands?: WidgetCommands<TCommands>
  dependencies?: WidgetDependencies<TDeps>
  ports?: {
    input?: TInputPorts
    output?: TOutputPorts
  }
}

type WidgetInstance<T extends Widget> = {
  getState: () => T['state']
  setState: (state: T['state']) => void
  actions: T['actions']
  ports: {
    emit: <K extends keyof T['ports']['output']>(
      event: K,
      payload: T['ports']['output'][K]
    ) => void
  }
}
