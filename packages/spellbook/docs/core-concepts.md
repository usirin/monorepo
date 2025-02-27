# Core Concepts

This document explains the fundamental concepts that make up the Spellbook architecture.

## Overview

Spellbook is designed to provide a type-safe way to define and use APIs across different process boundaries. The architecture is built around a few key concepts that work together to enable seamless communication while maintaining type safety.

## Spells

A **Spell** is the basic unit of functionality in Spellbook. It represents a single operation with:

- A description of what it does
- A typed schema for its parameters
- A typed schema for its result
- An implementation function (execute) that performs the actual operation

```typescript
import { z } from "zod";
import { createSpell } from "@usirin/spellbook";

const addTodo = createSpell({
  description: "Adds a new todo item",
  parameters: z.object({
    text: z.string(),
    completed: z.boolean().default(false)
  }),
  result: z.object({
    id: z.string(),
    text: z.string(),
    completed: z.boolean()
  }),
  execute: async ({ text, completed }) => {
    // Implementation...
    const id = Math.random().toString(36).substring(2);
    return { id, text, completed };
  }
});
```

Each spell defines a contract with:
- What inputs it accepts
- What outputs it produces
- Validation for both

## Spellbooks

A **Spellbook** is a collection of related spells that form a complete API surface. It groups spells together into a logical unit:

```typescript
import { createSpellbook } from "@usirin/spellbook";

const todoBook = createSpellbook({
  add: addTodo,
  toggle: toggleTodo,
  delete: deleteTodo,
  list: listTodos
});

// The type of the API surface can be exported for clients
export type TodoAPI = typeof todoBook;
```

Spellbooks provide:
- Organization for related functionality
- A complete API surface that can be served as a unit
- Types that can be exported for client use

## Transports

**Transports** are communication channels that connect spellbooks across different process boundaries. They handle the serialization, transmission, and deserialization of requests and responses.

Spellbook's transport system is based on the Web Streams API, providing a uniform interface for different communication methods:

```typescript
interface ServerTransport {
  incoming: ReadableStream<Request>;
  outgoing: WritableStream<Response>;
}

interface ClientTransport {
  incoming: ReadableStream<Response>;
  outgoing: WritableStream<Request>;
}
```

Spellbook includes built-in transports for:
- **EventEmitter**: For in-process or IPC communication
- **WebSocket**: For web and network communication

You can also create custom transports for any communication channel by implementing the transport interface.

## SpellCaster

A **SpellCaster** is a client that invokes spells through a transport. It provides a type-safe interface for calling spells remotely:

```typescript
import { createSpellCaster } from "@usirin/spellbook/caster";
import type { TodoAPI } from "./todoBook";

const todos = createSpellCaster<TodoAPI>({ 
  transport: clientTransport 
});

// Fully type-safe call with autocomplete and type checking
const newTodo = await todos.cast("add", { 
  text: "Buy milk" 
});
// newTodo has the correct type from the spell's result schema
```

The SpellCaster:
- Ensures type safety for parameters and results
- Handles serialization of requests
- Processes responses and errors

## SpellbookServer

A **SpellbookServer** exposes a spellbook for remote invocation through a transport:

```typescript
import { serve, createSpellbookServer } from "@usirin/spellbook/server";
import { todoBook } from "./todoBook";

// Simple version
serve(todoBook, serverTransport);

// Advanced version with more control
const server = createSpellbookServer(todoBook, {
  transport: serverTransport
});

server.start();
// Later...
server.stop();
```

The server:
- Listens for incoming requests
- Validates parameters
- Executes the appropriate spell
- Validates the result
- Returns the response or error

## Request-Response Protocol

Spellbook uses a simple request-response protocol for communication:

**Request** contains:
- The name of the spell to execute
- The parameters for the spell

**Response** contains:
- The original request
- The result of the spell (if successful)
- Error information (if unsuccessful)

## Progressive Enhancement

One of the key benefits of Spellbook is its support for progressive enhancement. You can:

1. Start with direct use of a spellbook in a single process
2. Later switch to using SpellCaster/SpellbookServer with an in-process transport
3. Eventually migrate to a network transport

All without changing your API definition or losing type safety.

## Schema Validation

Spellbook supports multiple schema validation libraries through the Standard Schema interface, including:

- **Zod**: A TypeScript-first schema validation library
- **Valibot**: A lightweight schema validation library

These libraries provide both runtime validation and TypeScript type inference, ensuring both safety and convenience. 