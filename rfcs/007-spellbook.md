# RFC 007: Spellbook Command System

## Summary
A composable command system that serves as the central entry point for studio applications.

## User Journey

Let's build a studio application starting with its command interface:

```typescript
// commands.ts - The entry point of our application
import { z } from 'zod'
import { defineCommand, createCommands } from '@umut/spellbook'

// Workspace management
const workspaceCommands = defineCommand(
  'workspace',
  {
    // Create a new workspace
    create: defineCommand(
      'create',
      z.object({
        name: z.string(),
        template: z.enum(['empty', 'react', 'vue']).default('empty')
      }),
      async ({ name, template }) => {
        // Create workspace logic
      }
    ),
    
    // Split current window
    split: defineCommand(
      'split',
      z.object({
        direction: z.enum(['horizontal', 'vertical'])
      }),
      async ({ direction }) => {
        // Split window logic
      }
    ),
    
    // Focus window in direction
    focus: defineCommand(
      'focus',
      z.object({
        direction: z.enum(['left', 'right', 'up', 'down'])
      }),
      async ({ direction }) => {
        // Focus window logic
      }
    )
  }
)

// File operations
const fileCommands = defineCommand(
  'file',
  {
    open: defineCommand(
      'open',
      z.object({
        path: z.string()
      }),
      async ({ path }) => {
        // Open file logic
      }
    ),
    
    save: defineCommand(
      'save',
      z.object({
        path: z.string().optional()
      }),
      async ({ path }) => {
        // Save file logic
      }
    ),
    
    find: defineCommand(
      'find',
      z.object({
        query: z.string(),
        caseSensitive: z.boolean().default(false)
      }),
      async ({ query, caseSensitive }) => {
        // Find in file logic
      }
    )
  }
)

// Terminal operations
const terminalCommands = defineCommand(
  'terminal',
  {
    create: defineCommand(
      'create',
      z.object({
        cwd: z.string().optional()
      }),
      async ({ cwd }) => {
        // Create terminal logic
      }
    ),
    
    run: defineCommand(
      'run',
      z.object({
        command: z.string(),
        args: z.array(z.string()).default([])
      }),
      async ({ command, args }) => {
        // Run command logic
      }
    )
  }
)

// Create and export our command system
export const commands = createCommands()

// Register all commands
commands.register(workspaceCommands)
commands.register(fileCommands)
commands.register(terminalCommands)
```

Now our application can be controlled through these commands:

```typescript
// Creating a new React project
await commands.execute('workspace.create', {
  name: 'my-app',
  template: 'react'
})

// Split window and open terminal
await commands.execute('workspace.split', {
  direction: 'horizontal'
})
await commands.execute('terminal.create')

// Install dependencies
await commands.execute('terminal.run', {
  command: 'npm',
  args: ['install']
})

// Open and edit file
await commands.execute('file.open', {
  path: 'src/App.tsx'
})
```

### Keyboard Bindings
```typescript
// keybindings.ts
import { createRunekeeper } from '@umut/runekeeper'
import { commands } from './commands'

const keys = createRunekeeper(['normal'])

// Map keys to commands
keys.map('normal', '<C-w>v', () => 
  commands.execute('workspace.split', { direction: 'vertical' })
)

keys.map('normal', '<C-w>s', () => 
  commands.execute('workspace.split', { direction: 'horizontal' })
)

keys.map('normal', '<C-s>', () => 
  commands.execute('file.save')
)
```

### Command Palette UI
```typescript
// command-palette.tsx
import { commands } from './commands'

function CommandPalette() {
  const allCommands = commands.getAll()
  
  return (
    <div>
      {allCommands.map(command => (
        <div key={command.path} onClick={() => {
          // Show argument form and execute command
        }}>
          {command.path}
        </div>
      ))}
    </div>
  )
}
```

## Benefits

1. **Central Control Point**
   - All application actions are commands
   - Clear entry point for features
   - Easy to discover capabilities

2. **Type Safety**
   - Full TypeScript inference
   - Runtime validation via Zod
   - Nested command types

3. **Developer Experience**
   - Commands as API documentation
   - Easy to test
   - Great IDE support

## Next Steps
1. Implement core command definition
2. Add command composition
3. Add type inference
4. Add validation

## Technical Implementation

### Core Types
```typescript
import { z } from 'zod'

// Command definition with type safety
type CommandDef<TSchema extends z.ZodType> = {
  schema: TSchema
  execute: (args: z.infer<TSchema>) => Promise<void> | void
}

// Recursive command tree type
type CommandTree = {
  [K: string]: CommandDef<z.ZodType> | CommandTree
}

// Helper to extract command paths from a tree
type CommandPaths<T> = T extends CommandDef<any> 
  ? '' 
  : T extends CommandTree
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends CommandDef<any>
          ? K
          : `${K}.${CommandPaths<T[K]>}`
        : never
    }[keyof T]
  : never

// Helper to get args type for a command path
type CommandArgs<
  TCommands extends CommandTree,
  TPath extends string
> = TPath extends keyof TCommands
  ? TCommands[TPath] extends CommandDef<infer TSchema>
    ? z.infer<TSchema>
    : TPath extends `${infer Head}.${infer Rest}`
    ? Head extends keyof TCommands
      ? TCommands[Head] extends CommandTree
        ? CommandArgs<TCommands[Head], Rest>
        : never
      : never
    : never
  : never
```

### Implementation
```typescript
class SpellBook<TCommands extends CommandTree> {
  private commands: TCommands = {} as TCommands

  // Type-safe command registration
  register<TPath extends string>(
    path: TPath,
    def: CommandDef<z.ZodType>
  ): void {
    let current = this.commands
    const parts = path.split('.')
    const last = parts.pop()!
    
    for (const part of parts) {
      current[part] = current[part] || {}
      current = current[part] as CommandTree
    }
    
    current[last] = def
  }

  // Type-safe command execution
  async execute<TPath extends CommandPaths<TCommands>>(
    path: TPath,
    args: CommandArgs<TCommands, TPath>
  ): Promise<void> {
    const command = this.getCommand(path)
    if (!command) {
      throw new Error(`Command not found: ${path}`)
    }

    // Runtime validation
    const validated = command.schema.parse(args)
    
    // Execute command
    await command.execute(validated)
  }

  private getCommand(path: string): CommandDef<z.ZodType> | undefined {
    let current: any = this.commands
    const parts = path.split('.')
    
    for (const part of parts) {
      if (!current[part]) return undefined
      current = current[part]
    }
    
    return current
  }
}

// Helper function with type inference
export function defineCommand<TSchema extends z.ZodType>(
  schema: TSchema,
  execute: (args: z.infer<TSchema>) => Promise<void> | void
): CommandDef<TSchema> {
  return { schema, execute }
}

// Usage example with full type safety
const commands = new SpellBook()

const workspaceCommands = {
  'workspace.split': defineCommand(
    z.object({
      direction: z.enum(['horizontal', 'vertical'])
    }),
    async ({ direction }) => {
      // Implementation
    }
  ),
  'workspace.focus': defineCommand(
    z.object({
      direction: z.enum(['left', 'right', 'up', 'down'])
    }),
    async ({ direction }) => {
      // Implementation
    }
  )
}

// TypeScript will ensure:
// 1. Command paths exist
// 2. Args match schema
// 3. Return types are correct
commands.execute('workspace.split', {
  direction: 'horizontal'
}) // ✅ OK

commands.execute('workspace.split', {
  direction: 'diagonal'
}) // ❌ Type Error

commands.execute('workspace.unknown', {}) // ❌ Type Error
```

### Error Handling
```typescript
// Custom error types
class CommandError extends Error {
  constructor(
    message: string,
    public command: string
  ) {
    super(message)
  }
}

class ValidationError extends CommandError {
  constructor(
    command: string,
    public errors: z.ZodError
  ) {
    super('Invalid command arguments', command)
  }
}

// Error handling in execute
async execute<TPath extends CommandPaths<TCommands>>(
  path: TPath,
  args: CommandArgs<TCommands, TPath>
): Promise<void> {
  const command = this.getCommand(path)
  if (!command) {
    throw new CommandError(`Command not found: ${path}`, path)
  }

  try {
    const validated = command.schema.parse(args)
    await command.execute(validated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(path, error)
    }
    throw error
  }
}
```