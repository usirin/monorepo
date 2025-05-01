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
- **Context-Aware**: Share context across API operations

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
import { createSpell, createSpellbook } from "@usirin/spellbook";

// 1. Define your Todo schema
const TodoSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1).max(200),
  completed: z.boolean().default(false),
  createdAt: z.string().datetime(),
});

// 2. Define the context shared across all spells
const contextSchema = z.object({
  db: z.any(), // Your database connection
  logger: z.any(), // Logging utilities
});

// 3. Create your spells
const listTodos = createSpell({
  description: "Get all todo items",
  parameters: z.object({}), // No parameters needed to list all
  result: z.object({
    todos: z.array(TodoSchema),
  }),
  context: contextSchema,
  execute: async ({}, { db, logger }) => {
    logger.info(`Listing all todos`);
    // Implementation would query from database
    const todos = [
      { id: "abc-123", text: "Learn Spellbook", completed: true, createdAt: "2023-01-01T12:00:00Z" },
      { id: "def-456", text: "Build TodoMVC API", completed: false, createdAt: "2023-01-02T12:00:00Z" },
    ];

    // Return all todos directly
    return { todos };
  }
});

const createTodo = createSpell({
  description: "Add a new todo item",
  parameters: z.object({
    text: z.string().min(1).max(200),
  }),
  result: TodoSchema,
  context: contextSchema,
  execute: async ({ text }, { db, logger }) => {
    logger.info(`Creating new todo: ${text}`);
    // Implementation would save to database
    return {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    };
  }
});

// Spells for toggleTodo, deleteTodo, clearCompleted removed for brevity

// 4. Create the shared context instance
const context = {
  db: { /* your database connection */ },
  logger: {
    info: (message) => console.log(`[INFO] ${message}`),
    error: (message) => console.error(`[ERROR] ${message}`)
  }
};

// 5. Create your API with context
const todoAPI = createSpellbook({
  listTodos,     // Use camelCase keys
  createTodo,
}, context);

// 6. Export the API type for consumers
export type TodoAPI = typeof todoAPI;

async function todoOperations() {
  // Add a new todo with validation
  const newTodo = await todoAPI.createTodo({ // Use camelCase access
    text: "Build an API with Spellbook",
  });
  
  // TypeScript knows the exact shape of newTodo
  console.log(`Created: ${newTodo.text} (${newTodo.id})`);

  // Get all todos
  const { todos } = await todoAPI.listTodos({}); // Use camelCase access, no filter

  console.log(`Fetched ${todos.length} todos.`);

  // Examples for toggle, delete, validation removed for brevity
}
```

Your API can be used in any JS/TS environment - frontend frameworks like React, Vue or Angular, or backend environments like Node.js, Deno, or Bun.

## Core Concepts

### Spells

A spell is a single API operation with parameters, result schema, context, and implementation:

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
  context: z.object({
    db: z.any(),
    authManager: z.any()
  }),
  execute: async ({ id }, { db, authManager }) => {
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
- **Context**: Shared resources and dependencies required by the spell
- **Execute**: Implementation function that performs the operation

### Context Handling

Spellbook provides a robust system for managing shared context across your API:

```typescript
// Define context schema shared by multiple spells
const apiContext = z.object({
  db: z.any(),
  logger: z.any(),
  config: z.object({
    apiVersion: z.string(),
    maxItems: z.number()
  })
});

// Create spells with the shared context
const listItems = createSpell({
  // ...other properties
  context: apiContext,
  execute: async (params, { db, logger, config }) => {
    logger.info(`Listing items with max: ${config.maxItems}`);
    // Implementation
  }
});

// Create a context instance with actual dependencies
const contextInstance = {
  db: new Database(),
  logger: new Logger(),
  config: {
    apiVersion: "v1",
    maxItems: 100
  }
};

// Create a spellbook with the context
const api = createSpellbook({
  listItems,
  // ...other spells
}, contextInstance);
```

The context is:
- **Type-safe**: TypeScript infers and validates the context structure
- **Automatic**: Provided to each spell without manually passing it
- **Validated**: Context validation happens at runtime
- **Shared**: Reuse the same dependencies across operations

### Spellbooks

A spellbook is a collection of related spells forming a complete API surface with shared context:

```typescript
const userAPI = createSpellbook({
  getUser: getUserSpell,
  createUser: createUserSpell,
  updateUser: updateUserSpell,
  deleteUser: deleteUserSpell,
}, contextInstance);
```

Spellbooks allow you to:

- Group related operations
- Share context across operations
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


This type system enables:
- Complete inference of parameter and result types
- Automatic derivation of context types
- Type-safe API consumption

## License

[MIT](LICENSE)