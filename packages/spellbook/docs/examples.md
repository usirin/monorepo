# Spellbook Examples

This document provides practical examples to help you get started with Spellbook. Each example demonstrates a different usage pattern or transport mechanism.

## Basic Spellbook

Let's start with a simple spellbook that manages a TODO list:

```typescript
import { z } from "zod";
import { createSpell, createSpellbook } from "@usirin/spellbook";

// Define the Todo type
type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

// In-memory storage for our todos
const todos: Record<string, Todo> = {};

// Create a spell to add a todo
const addTodo = createSpell({
  description: "Add a new todo item",
  parameters: z.object({
    text: z.string().min(1),
  }),
  result: z.object({
    id: z.string(),
    text: z.string(),
    completed: z.boolean(),
  }),
  execute: async ({ text }) => {
    const id = Math.random().toString(36).substring(2, 9);
    const todo: Todo = { id, text, completed: false };
    todos[id] = todo;
    return todo;
  },
});

// Create a spell to toggle todo completion
const toggleTodo = createSpell({
  description: "Toggle the completed status of a todo",
  parameters: z.object({
    id: z.string(),
  }),
  result: z.object({
    id: z.string(),
    text: z.string(),
    completed: z.boolean(),
  }),
  execute: async ({ id }) => {
    if (!todos[id]) {
      throw new Error(`Todo with ID ${id} not found`);
    }
    
    todos[id].completed = !todos[id].completed;
    return todos[id];
  },
});

// Create a spell to list all todos
const listTodos = createSpell({
  description: "List all todos",
  parameters: z.object({}),
  result: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      completed: z.boolean(),
    })
  ),
  execute: async () => {
    return Object.values(todos);
  },
});

// Create a spell to delete a todo
const deleteTodo = createSpell({
  description: "Delete a todo by ID",
  parameters: z.object({
    id: z.string(),
  }),
  result: z.object({
    success: z.boolean(),
  }),
  execute: async ({ id }) => {
    if (!todos[id]) {
      throw new Error(`Todo with ID ${id} not found`);
    }
    
    delete todos[id];
    return { success: true };
  },
});

// Create our todo spellbook
export const todoBook = createSpellbook({
  add: addTodo,
  toggle: toggleTodo,
  list: listTodos,
  delete: deleteTodo,
});

// Export the type for use with SpellCaster
export type TodoAPI = typeof todoBook;
```

## Same-Process Usage

The simplest way to use a spellbook is in the same process:

```typescript
import { execute } from "@usirin/spellbook";
import { todoBook } from "./todoBook";

async function runExample() {
  // Add a new todo
  const todo = await execute(todoBook, "add", { text: "Learn Spellbook" });
  console.log("Added todo:", todo);
  
  // List all todos
  const allTodos = await execute(todoBook, "list", {});
  console.log("All todos:", allTodos);
  
  // Toggle the todo
  const toggled = await execute(todoBook, "toggle", { id: todo.id });
  console.log("Toggled todo:", toggled);
  
  // Delete the todo
  const deleteResult = await execute(todoBook, "delete", { id: todo.id });
  console.log("Delete result:", deleteResult);
}

runExample().catch(console.error);
```

## EventEmitter Transport Example

This example demonstrates using the EventEmitter transport to connect a server and client in the same Node.js process:

```typescript
import { createEmitterPair } from "@usirin/spellbook/transports/emitter";
import { createServerTransport, createClientTransport } from "@usirin/spellbook/transports/emitter";
import { serve } from "@usirin/spellbook/server";
import { createSpellCaster } from "@usirin/spellbook/caster";
import { todoBook, TodoAPI } from "./todoBook";

async function runExample() {
  // Create a pair of connected emitters
  const [serverEmitter, clientEmitter] = createEmitterPair();
  
  // Create server and client transports
  const serverTransport = createServerTransport(serverEmitter);
  const clientTransport = createClientTransport(clientEmitter);
  
  // Serve the todoBook on the server transport
  serve(todoBook, serverTransport);
  
  // Create a spell caster for the client
  const todos = createSpellCaster<TodoAPI>({
    transport: clientTransport,
  });
  
  try {
    // Add a new todo
    const todo = await todos.cast("add", { text: "Buy groceries" });
    console.log("Added todo:", todo);
    
    // List all todos
    const allTodos = await todos.cast("list", {});
    console.log("All todos:", allTodos);
    
    // Toggle the todo
    const toggled = await todos.cast("toggle", { id: todo.id });
    console.log("Toggled todo:", toggled);
    
    // Attempt to delete a non-existent todo (to demonstrate error handling)
    try {
      await todos.cast("delete", { id: "nonexistent" });
    } catch (error) {
      console.error("Expected error:", error.message);
    }
    
    // Delete the real todo
    const deleteResult = await todos.cast("delete", { id: todo.id });
    console.log("Delete result:", deleteResult);
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

runExample();
```

## WebSocket Transport Example

This example demonstrates using WebSockets to connect a client and server across network boundaries:

```typescript
// server.ts
import { WebSocketServer } from "ws";
import { createServerWebSocketTransport } from "@usirin/spellbook/transports/websocket";
import { serve } from "@usirin/spellbook/server";
import { todoBook } from "./todoBook";

const PORT = 3000;
const wss = new WebSocketServer({ port: PORT });

console.log(`Todo server listening on port ${PORT}`);

wss.on("connection", (ws) => {
  console.log("Client connected");
  
  const transport = createServerWebSocketTransport(ws);
  serve(todoBook, transport);
  
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
```

```typescript
// client.ts
import WebSocket from "ws";
import { createClientWebSocketTransport } from "@usirin/spellbook/transports/websocket";
import { createSpellCaster } from "@usirin/spellbook/caster";
import type { TodoAPI } from "./todoBook";

async function runClient() {
  // Connect to the WebSocket server
  const ws = new WebSocket("ws://localhost:3000");
  
  // Wait for the connection to open
  await new Promise<void>((resolve) => {
    ws.on("open", () => resolve());
  });
  
  console.log("Connected to server");
  
  // Create a transport and spell caster
  const transport = createClientWebSocketTransport(ws);
  const todos = createSpellCaster<TodoAPI>({
    transport,
  });
  
  try {
    // Add a new todo
    const todo = await todos.cast("add", { text: "Learn WebSockets" });
    console.log("Added todo:", todo);
    
    // List all todos
    const allTodos = await todos.cast("list", {});
    console.log("All todos:", allTodos);
    
    // Toggle the todo
    const toggled = await todos.cast("toggle", { id: todo.id });
    console.log("Toggled todo:", toggled);
    
    // Delete the todo
    const deleteResult = await todos.cast("delete", { id: todo.id });
    console.log("Delete result:", deleteResult);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close the connection
    ws.close();
  }
}

runClient();
```

## Browser to Server Example

This example demonstrates connecting a browser client to a Node.js server:

```typescript
// server.ts
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { createServerWebSocketTransport } from "@usirin/spellbook/transports/websocket";
import { serve } from "@usirin/spellbook/server";
import { todoBook } from "./todoBook";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Serve static files
app.use(express.static("public"));

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("Browser client connected");
  
  const transport = createServerWebSocketTransport(ws);
  serve(todoBook, transport);
  
  ws.on("close", () => {
    console.log("Browser client disconnected");
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spellbook Todo Demo</title>
  <script type="module" src="app.js"></script>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    ul { list-style-type: none; padding: 0; }
    li { padding: 10px; margin: 5px 0; background: #f5f5f5; display: flex; align-items: center; }
    li.completed { text-decoration: line-through; color: #888; }
    button { margin-left: 10px; }
    .add-form { display: flex; margin-bottom: 20px; }
    .add-form input { flex-grow: 1; padding: 10px; margin-right: 10px; }
  </style>
</head>
<body>
  <h1>Spellbook Todo Demo</h1>
  
  <form class="add-form">
    <input type="text" id="new-todo" placeholder="What needs to be done?" required>
    <button type="submit">Add</button>
  </form>
  
  <ul id="todo-list"></ul>
  
  <div id="status"></div>
</body>
</html>
```

```javascript
// public/app.js
import { createClientWebSocketTransport } from "@usirin/spellbook/transports/websocket";
import { createSpellCaster } from "@usirin/spellbook/caster";

// Connect to the WebSocket server
const ws = new WebSocket(`ws://${window.location.host}`);
let todos;

// Elements
const todoList = document.getElementById("todo-list");
const addForm = document.querySelector(".add-form");
const newTodoInput = document.getElementById("new-todo");
const statusElement = document.getElementById("status");

// Show status
function showStatus(message) {
  statusElement.textContent = message;
}

// Render todos
function renderTodos(todoItems) {
  todoList.innerHTML = "";
  
  todoItems.forEach(todo => {
    const li = document.createElement("li");
    if (todo.completed) li.classList.add("completed");
    
    li.innerHTML = `
      <span>${todo.text}</span>
      <button class="toggle">Toggle</button>
      <button class="delete">Delete</button>
    `;
    
    li.dataset.id = todo.id;
    todoList.appendChild(li);
    
    // Add event listeners
    li.querySelector(".toggle").addEventListener("click", () => toggleTodo(todo.id));
    li.querySelector(".delete").addEventListener("click", () => deleteTodo(todo.id));
  });
}

// Add a new todo
async function addTodo(text) {
  try {
    await todos.cast("add", { text });
    newTodoInput.value = "";
    refreshTodos();
  } catch (error) {
    showStatus(`Error adding todo: ${error.message}`);
  }
}

// Toggle a todo
async function toggleTodo(id) {
  try {
    await todos.cast("toggle", { id });
    refreshTodos();
  } catch (error) {
    showStatus(`Error toggling todo: ${error.message}`);
  }
}

// Delete a todo
async function deleteTodo(id) {
  try {
    await todos.cast("delete", { id });
    refreshTodos();
  } catch (error) {
    showStatus(`Error deleting todo: ${error.message}`);
  }
}

// Refresh the todo list
async function refreshTodos() {
  try {
    const todoItems = await todos.cast("list", {});
    renderTodos(todoItems);
  } catch (error) {
    showStatus(`Error loading todos: ${error.message}`);
  }
}

// Initialize the app when WebSocket connects
ws.onopen = () => {
  showStatus("Connected to server");
  
  // Create a transport and spell caster
  const transport = createClientWebSocketTransport(ws);
  todos = createSpellCaster({
    transport,
  });
  
  // Load initial todos
  refreshTodos();
  
  // Set up form submission
  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (newTodoInput.value.trim()) {
      addTodo(newTodoInput.value);
    }
  });
};

ws.onclose = () => {
  showStatus("Disconnected from server");
};

ws.onerror = () => {
  showStatus("Connection error");
};
```

## Error Handling Example

This example demonstrates comprehensive error handling:

```typescript
import { z } from "zod";
import { createSpell, createSpellbook } from "@usirin/spellbook";
import { createEmitterPair, createServerTransport, createClientTransport } from "@usirin/spellbook/transports/emitter";
import { serve } from "@usirin/spellbook/server";
import { createSpellCaster } from "@usirin/spellbook/caster";

// Create a spell that can throw different types of errors
const riskySpell = createSpell({
  description: "A spell that might throw errors",
  parameters: z.object({
    mode: z.enum(["validation", "business", "unexpected", "success"]),
  }),
  result: z.object({
    status: z.string(),
  }),
  execute: async ({ mode }) => {
    // Simulate different error scenarios
    switch (mode) {
      case "validation":
        // This is just an example, normally Zod would catch this
        throw new Error("VALIDATION_ERROR: Invalid input");
        
      case "business":
        const error = new Error("Item not found");
        // You can attach custom properties to errors
        error.code = "NOT_FOUND";
        error.details = { entityType: "Item" };
        throw error;
        
      case "unexpected":
        // Simulate a server-side crash
        throw new Error("INTERNAL_ERROR: Something went wrong");
        
      case "success":
        return { status: "success" };
        
      default:
        throw new Error("Unknown mode");
    }
  },
});

const errorBook = createSpellbook({
  risky: riskySpell,
});

async function errorHandlingExample() {
  // Create a transport pair
  const [serverEmitter, clientEmitter] = createEmitterPair();
  const serverTransport = createServerTransport(serverEmitter);
  const clientTransport = createClientTransport(clientEmitter);
  
  // Serve the spellbook
  serve(errorBook, serverTransport);
  
  // Create a spell caster
  const client = createSpellCaster({
    transport: clientTransport,
  });
  
  // Try different error scenarios
  
  // 1. Success case
  try {
    const result = await client.cast("risky", { mode: "success" });
    console.log("Success result:", result);
  } catch (error) {
    console.error("Unexpected error in success case:", error);
  }
  
  // 2. Validation error
  try {
    await client.cast("risky", { mode: "validation" });
  } catch (error) {
    console.log("Validation error caught:", {
      message: error.message,
      code: error.code,
      details: error.details,
    });
  }
  
  // 3. Business logic error
  try {
    await client.cast("risky", { mode: "business" });
  } catch (error) {
    console.log("Business error caught:", {
      message: error.message,
      code: error.code,
      details: error.details,
    });
    
    // You can check for specific error codes
    if (error.code === "NOT_FOUND") {
      console.log("Handling not found error specifically");
    }
  }
  
  // 4. Unexpected server error
  try {
    await client.cast("risky", { mode: "unexpected" });
  } catch (error) {
    console.log("Server error caught:", {
      message: error.message,
    });
  }
}

errorHandlingExample().catch(console.error);
```

## Advanced Usage: Custom Validation

This example demonstrates using custom validation with Zod:

```typescript
import { z } from "zod";
import { createSpell, createSpellbook } from "@usirin/spellbook";

// Create a custom UUID validation schema
const UUIDSchema = z.string().refine(
  (val) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
  { message: "Invalid UUID format" }
);

// Create a custom Email validation schema
const EmailSchema = z.string().email();

// Create a spell with custom validation
const registerUser = createSpell({
  description: "Register a new user",
  parameters: z.object({
    email: EmailSchema,
    name: z.string().min(2).max(100),
    dateOfBirth: z.string().refine(
      (val) => !isNaN(Date.parse(val)),
      { message: "Invalid date format" }
    ),
    acceptedTerms: z.boolean().refine(val => val === true, {
      message: "You must accept the terms"
    }),
  }),
  result: z.object({
    id: UUIDSchema,
    email: EmailSchema,
    name: z.string(),
  }),
  execute: async ({ email, name, dateOfBirth, acceptedTerms }) => {
    // Implementation would handle creating the user in a database
    console.log(`Creating user with name: ${name}, email: ${email}`);
    
    // Generate a fake UUID for this example
    const id = "550e8400-e29b-41d4-a716-446655440000";
    
    return { id, email, name };
  },
});

const userBook = createSpellbook({
  register: registerUser,
});

// Example usage
import { execute } from "@usirin/spellbook";

async function validationExample() {
  try {
    // This should succeed
    const user = await execute(userBook, "register", {
      email: "user@example.com",
      name: "John Doe",
      dateOfBirth: "1990-01-01",
      acceptedTerms: true,
    });
    console.log("Registered user:", user);
    
    // This should fail validation
    await execute(userBook, "register", {
      email: "invalid-email",
      name: "J", // too short
      dateOfBirth: "not a date",
      acceptedTerms: false,
    });
  } catch (error) {
    console.log("Validation error:", error.message);
  }
}

validationExample();
```

These examples demonstrate the flexibility and power of Spellbook for creating type-safe APIs that work seamlessly across different environments. 