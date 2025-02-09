# RFC 007: Spellbook Command System

## Summary
A type-safe, composable command system that serves as the central entry point for studio applications. This system provides a unified way to define, validate, and execute commands across the application while maintaining full type safety and runtime validation.

## Background and Motivation

### Current State
- Studio applications currently lack a centralized command system
- Command implementations are scattered across different modules
- No standardized way to validate command inputs
- Type safety is inconsistent across command implementations
- Difficult to discover available commands

### Pain Points
- Inconsistent command interfaces
- Runtime errors due to invalid command arguments
- Poor developer experience when implementing new commands
- Difficulty in maintaining command documentation
- No centralized way to track command usage

## Technical Architecture

### Core Components

1. Command Definition
```typescript
import { z } from 'zod'
import { defineCommand, createSpellbook } from '@umut/spellbook'

const createWorkspace = defineCommand({
  description: 'Create a new workspace',
  input: z.object({
    name: z.string(),
    template: z.enum(['empty', 'react', 'vue']).default('empty')
  }),
  execute: async ({ name, template }) => {
    // Implementation
  }
})

const commands = {
  'workspace.create': createWorkspace
}
```

2. Command Registration and Execution
```typescript
const spellbook = createSpellbook(commands)

// Type-safe execution
await spellbook.execute('workspace.create', {
  name: 'my-app',
  template: 'react'
})
```

### Type System

```typescript
type CommandHandler<T extends z.ZodType> = (args: z.infer<T>) => Promise<void> | void

interface Command<TSchema extends z.ZodType> {
  description: string
  input: TSchema
  execute: (args: z.infer<TSchema>) => void
}

// Utility type to infer command input type
type InferCommandInput<T> = T extends Command<infer S> ? z.infer<S> : never
```

### Error Handling
```typescript
try {
  spellbook.execute('workspace.create', {
    name: 123 // Invalid input
  })
} catch (error) {
  // Command will throw errors for:
  // 1. Command not found
  // 2. Invalid arguments (failed schema validation)
}
```

### Command Discovery
```typescript
// Access all registered commands
const allCommands = spellbook.commands

// Get specific command
const createCommand = spellbook.commands['workspace.create']
console.log(createCommand.description) // Access command metadata
```

## Implementation Strategy

### Phase 1: Core Implementation (Completed)
- ✅ Basic command definition with description, input schema, and execute handler
- ✅ Type inference system
- ✅ Command registration
- ✅ Basic validation with Zod

### Phase 2: Developer Experience (In Progress)
- ✅ Type-safe command execution
- 🚧 Better error handling
- 🚧 Command discovery improvements
- 🚧 Command palette UI

### Phase 3: Integration (Planned)
- Command telemetry
- Migration guides
- Integration with existing systems
- Enhanced validation features
- Command middleware support

## Success Metrics
1. 100% type safety for command arguments
2. Zero runtime errors from invalid command arguments
3. Reduced time to implement new commands
4. Improved command discovery
5. Comprehensive error handling

## Current Limitations
1. Flat command structure (no nested namespaces)
2. Basic error handling
3. No middleware support
4. No async validation
5. No command lifecycle hooks