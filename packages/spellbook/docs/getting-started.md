# Getting Started with Spellbook

This guide will walk you through the basics of setting up and using Spellbook to create type-safe APIs that work across different environments.

## Installation

Install Spellbook using npm, yarn, or pnpm:

```bash
# Using npm
npm install @usirin/spellbook

# Using yarn
yarn add @usirin/spellbook

# Using pnpm
pnpm add @usirin/spellbook
```

You'll also need a schema validation library. Spellbook works well with [Zod](https://github.com/colinhacks/zod):

```bash
# Using npm
npm install zod

# Using yarn
yarn add zod

# Using pnpm
pnpm add zod
```

## Basic Concepts

Before diving into code, let's understand the core concepts:

- **Spells**: Functions with a description, typed parameters and result schemas, and an implementation.
- **Spellbooks**: Collections of related spells that form a complete API surface.
- **Transports**: Communication channels that connect spellbooks and spell casters.
- **SpellCaster**: A client that invokes spells through a transport.
- **SpellbookServer**: A server that exposes a spellbook for remote invocation.

## Your First Spellbook

Let's create a simple spellbook for a calculator API:

```typescript
// calculator.ts
import { z } from "zod";
import { createSpell, createSpellbook } from "@usirin/spellbook";

// Create a spell to add two numbers
const add = createSpell({
  description: "Add two numbers together",
  parameters: z.object({
    a: z.number(),
    b: z.number(),
  }),
  result: z.object({
    sum: z.number(),
  }),
  execute: async ({ a, b }) => {
    return { sum: a + b };
  },
});

// Create a spell to subtract two numbers
const subtract = createSpell({
  description: "Subtract the second number from the first",
  parameters: z.object({
    a: z.number(),
    b: z.number(),
  }),
  result: z.object({
    difference: z.number(),
  }),
  execute: async ({ a, b }) => {
    return { difference: a - b };
  },
});

// Create a spell to multiply two numbers
const multiply = createSpell({
  description: "Multiply two numbers",
  parameters: z.object({
    a: z.number(),
    b: z.number(),
  }),
  result: z.object({
    product: z.number(),
  }),
  execute: async ({ a, b }) => {
    return { product: a * b };
  },
});

// Create a spell to divide two numbers
const divide = createSpell({
  description: "Divide the first number by the second",
  parameters: z.object({
    a: z.number(),
    b: z.number(),
  }),
  result: z.object({
    quotient: z.number(),
  }),
  execute: async ({ a, b }) => {
    if (b === 0) {
      throw new Error("Division by zero is not allowed");
    }
    return { quotient: a / b };
  },
});

// Create and export the calculator spellbook
export const calculatorBook = createSpellbook({
  add,
  subtract,
  multiply,
  divide,
});

// Export the type for use with SpellCaster
export type CalculatorAPI = typeof calculatorBook;
```

## Using Your Spellbook Directly

The simplest way to use your spellbook is in the same process, with no transport:

```typescript
// direct-usage.ts
import { execute } from "@usirin/spellbook";
import { calculatorBook } from "./calculator";

async function main() {
  // Add two numbers
  const addResult = await execute(calculatorBook, "add", { a: 5, b: 3 });
  console.log(`5 + 3 = ${addResult.sum}`);
  
  // Subtract two numbers
  const subtractResult = await execute(calculatorBook, "subtract", { a: 10, b: 4 });
  console.log(`10 - 4 = ${subtractResult.difference}`);
  
  // Multiply two numbers
  const multiplyResult = await execute(calculatorBook, "multiply", { a: 7, b: 6 });
  console.log(`7 * 6 = ${multiplyResult.product}`);
  
  // Divide two numbers
  const divideResult = await execute(calculatorBook, "divide", { a: 15, b: 3 });
  console.log(`15 / 3 = ${divideResult.quotient}`);
  
  // Handle errors
  try {
    await execute(calculatorBook, "divide", { a: 10, b: 0 });
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

main().catch(console.error);
```

## Using Spellbook Across Process Boundaries

Now let's use the same API across process boundaries using the EventEmitter transport:

```typescript
// server.ts
import { serve } from "@usirin/spellbook/server";
import { createServerTransport } from "@usirin/spellbook/transports/emitter";
import { createEmitterPair } from "@usirin/spellbook/transports/emitter";
import { calculatorBook } from "./calculator";

async function startServer() {
  // Create the emitter pair
  const [serverEmitter, clientEmitter] = createEmitterPair();
  
  // Create a server transport
  const serverTransport = createServerTransport(serverEmitter);
  
  // Serve the calculator book
  console.log("Calculator server started");
  await serve(calculatorBook, serverTransport);
  
  // Return the client emitter for the client to use
  return clientEmitter;
}

// Export the function to start the server
export { startServer };
```

```typescript
// client.ts
import { createClientTransport } from "@usirin/spellbook/transports/emitter";
import { createSpellCaster } from "@usirin/spellbook/caster";
import { startServer } from "./server";
import type { CalculatorAPI } from "./calculator";

async function main() {
  // Start the server and get the client emitter
  const clientEmitter = await startServer();
  
  // Create a client transport
  const clientTransport = createClientTransport(clientEmitter);
  
  // Create a spell caster with the type of our spellbook
  const calculator = createSpellCaster<CalculatorAPI>({
    transport: clientTransport,
  });
  
  // Now we can use our calculator API across process boundaries
  
  // Add two numbers
  const addResult = await calculator.cast("add", { a: 5, b: 3 });
  console.log(`5 + 3 = ${addResult.sum}`);
  
  // Subtract two numbers
  const subtractResult = await calculator.cast("subtract", { a: 10, b: 4 });
  console.log(`10 - 4 = ${subtractResult.difference}`);
  
  // Multiply two numbers
  const multiplyResult = await calculator.cast("multiply", { a: 7, b: 6 });
  console.log(`7 * 6 = ${multiplyResult.product}`);
  
  // Divide two numbers
  const divideResult = await calculator.cast("divide", { a: 15, b: 3 });
  console.log(`15 / 3 = ${divideResult.quotient}`);
  
  // Handle errors
  try {
    await calculator.cast("divide", { a: 10, b: 0 });
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

main().catch(console.error);
```

## Using WebSockets for Network Communication

For communication across network boundaries, you can use the WebSocket transport:

```typescript
// websocket-server.ts
import { WebSocketServer } from "ws";
import { createServerWebSocketTransport } from "@usirin/spellbook/transports/websocket";
import { serve } from "@usirin/spellbook/server";
import { calculatorBook } from "./calculator";

const PORT = 3000;
const wss = new WebSocketServer({ port: PORT });

console.log(`Calculator server listening on port ${PORT}`);

wss.on("connection", (ws) => {
  console.log("Client connected");
  
  const transport = createServerWebSocketTransport(ws);
  serve(calculatorBook, transport);
  
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
```

```typescript
// websocket-client.ts
import WebSocket from "ws";
import { createClientWebSocketTransport } from "@usirin/spellbook/transports/websocket";
import { createSpellCaster } from "@usirin/spellbook/caster";
import type { CalculatorAPI } from "./calculator";

async function main() {
  // Connect to the WebSocket server
  const ws = new WebSocket("ws://localhost:3000");
  
  // Wait for the connection to open
  await new Promise<void>((resolve) => {
    ws.on("open", () => resolve());
  });
  
  console.log("Connected to calculator server");
  
  // Create a transport and spell caster
  const transport = createClientWebSocketTransport(ws);
  const calculator = createSpellCaster<CalculatorAPI>({
    transport,
  });
  
  try {
    // Add two numbers
    const addResult = await calculator.cast("add", { a: 5, b: 3 });
    console.log(`5 + 3 = ${addResult.sum}`);
    
    // Division with error handling
    try {
      await calculator.cast("divide", { a: 10, b: 0 });
    } catch (error) {
      console.error(`Expected error: ${error.message}`);
    }
  } finally {
    // Close the connection
    ws.close();
  }
}

main().catch(console.error);
```

## Advanced Usage: Spellbook Organization

For larger applications, it's a good idea to organize your spellbooks by domain:

```typescript
// users/spells.ts
import { z } from "zod";
import { createSpell, createSpellbook } from "@usirin/spellbook";

export const getUser = createSpell({
  description: "Get a user by ID",
  parameters: z.object({
    id: z.string(),
  }),
  result: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  execute: async ({ id }) => {
    // Implementation...
    return { id, name: "John Doe", email: "john@example.com" };
  },
});

export const createUser = createSpell({
  /* ... */
});

export const updateUser = createSpell({
  /* ... */
});

export const deleteUser = createSpell({
  /* ... */
});

export const userBook = createSpellbook({
  get: getUser,
  create: createUser,
  update: updateUser,
  delete: deleteUser,
});

export type UserAPI = typeof userBook;
```

```typescript
// posts/spells.ts
import { z } from "zod";
import { createSpell, createSpellbook } from "@usirin/spellbook";

export const getPost = createSpell({
  /* ... */
});

export const createPost = createSpell({
  /* ... */
});

export const postBook = createSpellbook({
  get: getPost,
  create: createPost,
});

export type PostAPI = typeof postBook;
```

```typescript
// api.ts
import { createSpellbook } from "@usirin/spellbook";
import { userBook } from "./users/spells";
import { postBook } from "./posts/spells";

// Create a combined API
export const api = createSpellbook({
  users: userBook,
  posts: postBook,
});

export type API = typeof api;
```

## Error Handling Best Practices

When creating spells, it's important to handle errors properly:

```typescript
const getUserData = createSpell({
  description: "Get user data by ID",
  parameters: z.object({
    id: z.string(),
  }),
  result: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  execute: async ({ id }) => {
    try {
      // Try to fetch the user
      const user = await db.users.findById(id);
      
      if (!user) {
        // Use a standard error format
        const error = new Error(`User with ID ${id} not found`);
        error.code = "USER_NOT_FOUND";
        error.details = { userId: id };
        throw error;
      }
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    } catch (err) {
      // Wrap unexpected errors
      if (!err.code) {
        const wrapped = new Error(`Failed to get user: ${err.message}`);
        wrapped.code = "INTERNAL_ERROR";
        wrapped.cause = err;
        throw wrapped;
      }
      
      // Re-throw known errors
      throw err;
    }
  },
});
```

On the client side, you can handle these errors:

```typescript
try {
  const user = await userClient.cast("get", { id: "123" });
  console.log("User:", user);
} catch (error) {
  if (error.code === "USER_NOT_FOUND") {
    console.error("User not found:", error.details.userId);
  } else {
    console.error("Error fetching user:", error.message);
  }
}
```

## Next Steps

Now that you've got the basics down, here are some next steps to explore:

1. [API Reference](./api-reference.md) - Detailed documentation of all Spellbook APIs
2. [Transport Options](./transports.md) - Learn about different transport options
3. [Schema Validation](./schema-validation.md) - Advanced schema validation techniques
4. [Examples](./examples.md) - More complete examples for various use cases
5. [Core Concepts](./core-concepts.md) - Deeper dive into core concepts

By following this guide, you should now have a good understanding of how to create and use Spellbook for your APIs. Happy coding! 