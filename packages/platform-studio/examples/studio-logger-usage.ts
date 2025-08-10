/**
 * @fileoverview Examples demonstrating StudioLogger that outputs directly to StudioTerminalOutput
 */

import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as SubscriptionRef from "effect/SubscriptionRef"
import { StudioLogger, StudioTerminalOutput } from "../src"

// =============================================================================
// Example 1: Basic Terminal Logging
// =============================================================================

const basicTerminalLoggingExample = Effect.gen(function* () {
  // All of these will appear in the terminal output stream
  yield* StudioLogger.info("Application started", "App")
  yield* StudioLogger.debug("Debug information", "App") 
  yield* StudioLogger.warn("Warning message", "App")
  yield* StudioLogger.error("Error occurred", "App")

  console.log("✅ Logged 4 messages to terminal output")
  return "Basic logging complete"
})

// =============================================================================
// Example 2: Console Replacement - Everything Goes to Terminal
// =============================================================================

const consoleReplacementExample = Effect.gen(function* () {
  // Instead of console.log/error/warn - these go to terminal output
  yield* StudioLogger.consoleLog("This replaces console.log and goes to terminal")
  yield* StudioLogger.consoleError("This replaces console.error and goes to terminal") 
  yield* StudioLogger.consoleWarn("This replaces console.warn and goes to terminal")
  yield* StudioLogger.consoleDebug("This replaces console.debug and goes to terminal")

  console.log("✅ Console replacement logged to terminal output")
  return "Console replacement complete"
})

// =============================================================================
// Example 3: Contextual Logging to Terminal
// =============================================================================

const contextualTerminalLoggingExample = Effect.gen(function* () {
  // Get a contextual logger
  const userServiceLogger = yield* StudioLogger.withContext({ 
    component: "UserService", 
    version: "1.0.0",
    userId: "user_123"
  })

  // All context is included in terminal output
  yield* userServiceLogger.info("User login attempt")
  yield* userServiceLogger.warn("Rate limit approaching")
  yield* userServiceLogger.error("Database connection failed")

  // Regular logging without context
  yield* StudioLogger.info("Global application message")

  console.log("✅ Contextual logging sent to terminal output")
  return "Contextual logging complete"
})

// =============================================================================
// Example 4: Viewing Terminal Output Stream
// =============================================================================

const viewTerminalStreamExample = Effect.gen(function* () {
  // Log some messages first
  yield* StudioLogger.info("Stream message 1")
  yield* StudioLogger.warn("Stream message 2")  
  yield* StudioLogger.error("Stream message 3")

  // Access the terminal output to see our formatted logs
  const terminalOutput = yield* StudioTerminalOutput.StudioTerminalOutput
  const currentOutput = yield* SubscriptionRef.get(terminalOutput)
  
  console.log("📺 Current terminal output:")
  currentOutput.forEach((line, index) => {
    console.log(`   ${index + 1}: ${line}`)
  })
  
  console.log("✅ Terminal stream contains formatted log messages")
  return currentOutput
})

// =============================================================================
// Example 5: Application with All Logging to Terminal
// =============================================================================

const terminalOnlyAppExample = Effect.gen(function* () {
  yield* StudioLogger.info("🚀 Studio application starting...")
  
  // Get contextual logger for the app
  const appLogger = yield* StudioLogger.withContext({ 
    app: "StudioApp", 
    env: "development",
    session: "session_456"
  })

  yield* appLogger.info("Initializing components")
  yield* Effect.sleep("200 millis")
  
  yield* appLogger.debug("Database connection established")
  yield* Effect.sleep("100 millis")
  
  yield* appLogger.info("User interface loaded")
  yield* appLogger.warn("Some non-critical warning")
  
  yield* StudioLogger.info("✅ Application ready!")

  // Show what's in the terminal output
  const terminalOutput = yield* StudioTerminalOutput.StudioTerminalOutput
  const allOutput = yield* SubscriptionRef.get(terminalOutput)
  
  console.log(`\n📺 Terminal now contains ${allOutput.length} log entries:`)
  allOutput.slice(-3).forEach(line => console.log(`   ${line}`))

  return { 
    status: "success", 
    terminalEntries: allOutput.length 
  }
})

// =============================================================================
// Application Layer - StudioLogger + Terminal Output
// =============================================================================

const TerminalLoggingLayer = Layer.mergeAll(
  StudioLogger.layer,                               // Logger service
  StudioTerminalOutput.StudioTerminalOutput.Default  // Terminal output service
)

// =============================================================================
// Running the Examples
// =============================================================================

async function runExamples() {
  console.log("🎯 StudioLogger → Terminal Output Examples\n")

  // Example 1: Basic terminal logging
  console.log("1. Basic Terminal Logging:")
  await Effect.runPromise(Effect.provide(basicTerminalLoggingExample, TerminalLoggingLayer))

  console.log("\n" + "=".repeat(60) + "\n")

  // Example 2: Console replacement
  console.log("2. Console Replacement → Terminal:")
  await Effect.runPromise(Effect.provide(consoleReplacementExample, TerminalLoggingLayer))

  console.log("\n" + "=".repeat(60) + "\n")

  // Example 3: Contextual logging
  console.log("3. Contextual Logging → Terminal:")
  await Effect.runPromise(Effect.provide(contextualTerminalLoggingExample, TerminalLoggingLayer))

  console.log("\n" + "=".repeat(60) + "\n")

  // Example 4: View terminal stream
  console.log("4. Terminal Stream Viewing:")
  await Effect.runPromise(Effect.provide(viewTerminalStreamExample, TerminalLoggingLayer))

  console.log("\n" + "=".repeat(60) + "\n")

  // Example 5: Complete terminal-only app
  console.log("5. Complete Terminal-Only Application:")
  await Effect.runPromise(Effect.provide(terminalOnlyAppExample, TerminalLoggingLayer))
}

// =============================================================================
// Usage Guide
// =============================================================================

/*
## StudioLogger → Terminal Output

This logger sends ALL output to StudioTerminalOutput instead of console.

### Key Features:
- ✅ All logs go to terminal output stream (not console)
- ✅ Formatted with timestamp, level, source, and context
- ✅ Reactive terminal output via SubscriptionRef
- ✅ Console replacement functions
- ✅ Contextual logging support

### Usage:

```typescript
// Basic logging → terminal
yield* StudioLogger.info("Message goes to terminal")

// Console replacement → terminal  
yield* StudioLogger.consoleLog("Replaces console.log → terminal")

// Contextual logging → terminal
const logger = yield* StudioLogger.withContext({ userId: "123" })
yield* logger.info("Context included → terminal")

// View terminal output
const terminal = yield* StudioTerminalOutput.StudioTerminalOutput
const output = yield* SubscriptionRef.get(terminal)
console.log("Terminal contains:", output)
```

### Layer Setup:
```typescript
const AppLayer = Layer.mergeAll(
  StudioLogger.layer,
  StudioTerminalOutput.StudioTerminalOutput.Default
)
```

### Output Format:
```
2024-01-15T10:30:45.123Z INFO    [App] Application started
2024-01-15T10:30:45.124Z WARNING [DB] Connection timeout
2024-01-15T10:30:45.125Z ERROR   [Auth] Login failed {"userId":"123"}
```

All formatted log entries appear in the StudioTerminalOutput stream!
*/

// Run if this file is executed directly
if (import.meta.main) {
  runExamples().catch(console.error)
}

export {
  basicTerminalLoggingExample,
  consoleReplacementExample,
  contextualTerminalLoggingExample,
  viewTerminalStreamExample,
  terminalOnlyAppExample,
  TerminalLoggingLayer
}