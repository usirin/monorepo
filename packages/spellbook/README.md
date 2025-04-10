# @usirin/spellbook

Type-safe API surfaces that work across process boundaries.

[![npm version](https://img.shields.io/npm/v/@usirin/spellbook.svg)](https://www.npmjs.com/package/@usirin/spellbook)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Overview

Spellbook lets you create type-safe APIs with full validation and error handling. It provides a consistent way to define your API surface once and use it anywhere.

- **Type-Safe**: End-to-end TypeScript type safety from definition to usage
- **Validated**: Schema validation with any [Standard Schema](https://standardschema.dev/) compatible library
- **Composable**: Build complex APIs from simple, reusable operations
- **Consistent**: Standard patterns for defining and consuming APIs

## Installation

```bash
npm install @usirin/spellbook   # npm
yarn add @usirin/spellbook      # yarn
pnpm add @usirin/spellbook      # pnpm
bun add @usirin/spellbook       # bun
```

## Quick Start: TodoMVC API

Here's how to create a type-safe API for a TodoMVC application:

```typescript
import { z } from "zod";
import { createSpell, createSpellbook, execute } from "@usirin/spellbook";

// 1. Define your Todo schema
const TodoSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1).max(200),
  completed: z.boolean().default(false),
  createdAt: z.string().datetime(),
});

// 2. Create your API
const todoAPI = createSpellbook({
  // Get todos with filtering
  "todo:list": createSpell({
    description: "Get todos with optional filtering",
    parameters: z.object({
      filter: z.enum(["all", "active", "completed"]).default("all"),
    }),
    result: z.object({
      todos: z.array(TodoSchema),
      activeCount: z.number().int(),
      totalCount: z.number().int(),
    }),
    execute: async ({ filter }) => {
      // Implementation would query from database
      const todos = [
        { id: "abc-123", text: "Learn Spellbook", completed: true, createdAt: "2023-01-01T12:00:00Z" },
        { id: "def-456", text: "Build TodoMVC API", completed: false, createdAt: "2023-01-02T12:00:00Z" },
      ];

      const filteredTodos = filter === "all" 
        ? todos 
        : filter === "active" ? todos.filter(t => !t.completed) : todos.filter(t => t.completed);

      return {
        todos: filteredTodos,
        activeCount: todos.filter(t => !t.completed).length,
        totalCount: todos.length,
      };
    }
  }),

  // Add a new todo
  "todo:create": createSpell({
    description: "Add a new todo item",
    parameters: z.object({
      text: z.string().min(1).max(200),
    }),
    result: TodoSchema,
    execute: async ({ text }) => {
      // Implementation would save to database
      return {
        id: crypto.randomUUID(),
        text,
        completed: false,
        createdAt: new Date().toISOString(),
      };
    }
  }),

  // Toggle completion status
  "todo:toggle": createSpell({
    description: "Toggle a todo's completed status",
    parameters: z.object({
      id: z.string().uuid(),
      completed: z.boolean(),
    }),
    result: TodoSchema,
    execute: async ({ id, completed }) => {
      // Implementation would update in database
      return { id, text: "Example Todo", completed, createdAt: "2023-01-01T12:00:00Z" };
    }
  }),

  // Other operations (simplified for brevity)
  "todo:delete": createSpell({
    description: "Delete a todo item",
    parameters: z.object({ id: z.string().uuid() }),
    result: z.object({ success: z.boolean() }),
    execute: async ({ id }) => ({ success: true }),
  }),

  "todo:clearCompleted": createSpell({
    description: "Clear all completed todos",
    parameters: z.object({}),
    result: z.object({ deletedCount: z.number().int() }),
    execute: async () => ({ deletedCount: 2 }),
  }),
});

// 3. Export the API type for consumers
export type TodoAPI = typeof todoAPI;
```

## Using Your API

Spellbook provides a simple execution model with full type safety:

```typescript
import { todoAPI } from "./todo-api";

async function todoOperations() {
  // Add a new todo with validation
  const newTodo = await todoAPI.execute("todo:create", {
    text: "Build an API with Spellbook",
  });
  
  // TypeScript knows the exact shape of newTodo
  console.log(`Created: ${newTodo.text} (${newTodo.id})`);

  // Toggle its completion status
  const updated = await todoAPI.execute("todo:toggle", {
    id: newTodo.id,
    completed: true,
  });
  
  // Get all active todos
  const { todos, activeCount } = await todoAPI.execute("todo:list", {
    filter: "active",
  });
  
  // Validation catches errors automatically during execution
  try {
    await todoAPI.execute("todo:create", {
      text: "", // Invalid: text must not be empty
    });
  } catch (error) {
    console.error("Validation failed:", error);
  }
}
```

Your API can be used in any JS/TS environment - frontend frameworks like React, Vue or Angular, or backend environments like Node.js, Deno, or Bun.

## Core Concepts

### Spells

A spell is a single API operation with parameters, result schema, and implementation:

```typescript
const getUserSpell = createSpell({
  description: "Get user by ID",
  parameters: z.object({
    id: z.string().uuid(),
  }),
  result: z.object({
    id: z.string().uuid(),
    username: z.string(),
    email: z.string().email(),
    profile: z.object({
      fullName: z.string(),
      avatarUrl: z.string().url().optional(),
    }),
  }),
  execute: async ({ id }) => {
    // Implementation would fetch user from database
    return {
      id,
      username: "johndoe",
      email: "john@example.com",
      profile: {
        fullName: "John Doe",
        avatarUrl: "https://example.com/avatar.jpg",
      },
    };
  }
});
```

Key aspects of a spell:

- **Description**: Human-readable description of what the operation does
- **Parameters**: Input schema with validation rules
- **Result**: Output schema defining the expected return type
- **Execute**: Implementation function that performs the operation

### Spellbooks

A spellbook is a collection of related spells forming a complete API surface:

```typescript
const userAPI = createSpellbook({
  "user:get": getUserSpell,
  "user:create": createUserSpell,
  "user:update": updateUserSpell,
  "user:delete": deleteUserSpell,
});
```

Spellbooks allow you to:

- Group related operations
- Export a single API type for consumers
- Provide a unified interface for execution

### Schema Validation

Spellbook leverages [Standard Schema](https://standardschema.dev/) for validation, supporting multiple validation libraries:

```typescript
// With Zod
import { z } from "zod";
const zodSpell = createSpell({
  parameters: z.object({ email: z.string().email() }),
  // ...
});

// With Valibot
import * as v from "valibot";
const valibotSpell = createSpell({
  parameters: v.object({ email: v.string([v.email()]) }),
  // ...
});
```

Benefits of Standard Schema integration:

- Use your preferred validation library
- Full type inference for parameters and results
- Runtime validation for both inputs and outputs, handled automatically within the spell's `execute` method
- Consistent error handling

## Integration with Forge

Spellbook is built on [@usirin/forge](https://github.com/usirin/monorepo/tree/main/packages/forge) for entity creation, providing:

- Unique identifiers for spells and spellbooks
- Type-safe references between entities
- Consistent structure for API components

## Philosophy

Spellbook is designed around these core principles:

- **Define Once, Use Anywhere**: Write your API definition in one place
- **Type Safety First**: End-to-end type safety from definition to usage
- **Schema Validation**: Inputs and outputs are automatically validated within each spell execution for runtime safety
- **Composable APIs**: Build complex operations from simple, reusable pieces

## Documentation

See the [docs directory](./docs) for detailed documentation:
- [Core Concepts](./docs/core-concepts.md)
- [API Reference](./docs/api-reference.md)
- [Schema Validation](./docs/schema-validation.md)

## License

[MIT](LICENSE)