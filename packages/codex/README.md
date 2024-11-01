# @umut/codex

A type-safe plugin system for building extensible applications.

Imagine you're building a studio application like VS Code or Figma. You need commands and keyboard shortcuts that work together seamlessly. This is where Codex comes in.

## Installation

```bash
# bun
bun add @umut/codex

# npm
npm install @umut/codex

# pnpm
pnpm add @umut/codex

# yarn
yarn add @umut/codex
```

## The Story

Let's build a studio with our core packages:

```typescript
import { definePlugin, createCodex } from '@umut/codex'
import { createSpellbook, defineCommand } from '@umut/spellbook'
import { createRunekeeper } from '@umut/runekeeper'

// First, define what each plugin provides
declare module '@umut/codex' {
  interface CodexContext {
    spellbook: ReturnType<typeof createSpellbook>
    runekeeper: ReturnType<typeof createRunekeeper>
  }
}

// Command system plugin
const spellbookPlugin = definePlugin({
  name: 'spellbook',
  version: '1.0.0',
  register: () => {
    const spellbook = createSpellbook()

    // Register core commands
    spellbook.register({
      workspace: {
        create: defineCommand({
          input: z.object({
            name: z.string(),
            template: z.enum(['empty', 'react', 'vue'])
          }),
          handler: async ({ name, template }) => {
            // Create workspace implementation
          }
        })
      }
    })

    return spellbook
  }
})

// Keyboard system that depends on commands
const runekeeperPlugin = definePlugin({
  name: 'runekeeper',
  version: '1.0.0',
  dependencies: ['spellbook'],
  register: (deps) => {
    const runekeeper = createRunekeeper(['normal', 'insert'])

    // Bind keys to commands
    runekeeper.bind('normal', '<leader>wc', () => {
      deps.spellbook.execute(['workspace', 'create'], {
        name: 'my-project',
        template: 'react'
      })
    })

    return runekeeper
  }
})

// Bring it all together
async function createStudio() {
  const codex = createCodex()

  // Register plugins in any order - Codex handles dependencies
  await codex.use([
    runekeeperPlugin,  // Depends on spellbook
    spellbookPlugin    // No dependencies
  ])

  // Initialize everything
  const studio = await codex.init()

  // Now we can use our studio!
  // Create workspace with keyboard
  // This will trigger: runekeeper -> spellbook
  simulateKeyPress('<leader>wc')
}
```

## Features

- Type-safe plugin dependencies
- Automatic dependency resolution
- Circular dependency detection
- Async support
- TypeScript-first

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build
bun run build
```

## License

MIT 