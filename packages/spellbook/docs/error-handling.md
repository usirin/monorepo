# Error Handling in Spellbook

Effective error handling is crucial for building robust applications. This guide explores how Spellbook handles errors across process boundaries and provides best practices for implementing error handling in your Spellbook applications.

## Error Propagation

One of Spellbook's key features is its ability to propagate errors across process boundaries. When a spell throws an error on the server side, Spellbook:

1. Serializes the error (including message, code, and other properties)
2. Transmits it over the transport
3. Reconstructs and rethrows the error on the client side

This means that client code can catch and handle errors as if they had occurred locally, even when the error originated in a remote process.

## Error Structure

Spellbook uses a standard error structure for consistency across environments:

```typescript
interface SpellbookError extends Error {
  message: string;     // Human-readable error message
  code?: string;       // Error code for programmatic handling
  details?: unknown;   // Additional context or data
  cause?: Error;       // The original error that caused this one
}
```

## Validation Errors

Validation errors occur when input parameters or results don't match their respective schemas. Spellbook automatically handles these errors:

```typescript
import { z } from "zod";
import { createSpell } from "@usirin/spellbook";

const transfer = createSpell({
  description: "Transfer money between accounts",
  parameters: z.object({
    fromAccount: z.string(),
    toAccount: z.string(),
    amount: z.number().positive(),  // Must be positive
  }),
  result: z.object({
    success: z.boolean(),
    transactionId: z.string(),
  }),
  execute: async ({ fromAccount, toAccount, amount }) => {
    // Implementation...
    return { success: true, transactionId: "tx_123" };
  },
});
```

When a client tries to cast this spell with an invalid amount:

```typescript
try {
  await client.cast("transfer", {
    fromAccount: "acc_123",
    toAccount: "acc_456",
    amount: -100,  // Negative amount will fail validation
  });
} catch (error) {
  console.error("Validation error:", error.message);
  // Will output something like: "amount must be a positive number"
}
```

## Business Logic Errors

Business logic errors occur during the execution of your spell's business logic. These are errors that represent valid but unsuccessful operations:

```typescript
const withdraw = createSpell({
  description: "Withdraw money from an account",
  parameters: z.object({
    accountId: z.string(),
    amount: z.number().positive(),
  }),
  result: z.object({
    success: z.boolean(),
    newBalance: z.number(),
  }),
  execute: async ({ accountId, amount }) => {
    // Get the account balance
    const account = await getAccount(accountId);
    
    // Check if the account has sufficient funds
    if (account.balance < amount) {
      const error = new Error("Insufficient funds for withdrawal");
      error.code = "INSUFFICIENT_FUNDS";
      error.details = {
        accountId,
        requestedAmount: amount,
        availableBalance: account.balance,
      };
      throw error;
    }
    
    // Process the withdrawal
    const newBalance = await processWithdrawal(accountId, amount);
    return { success: true, newBalance };
  },
});
```

Client code can handle this business logic error specifically:

```typescript
try {
  const result = await client.cast("withdraw", {
    accountId: "acc_123",
    amount: 1000,
  });
  console.log("Withdrawal successful, new balance:", result.newBalance);
} catch (error) {
  if (error.code === "INSUFFICIENT_FUNDS") {
    console.error(
      `Insufficient funds: requested ${error.details.requestedAmount}, ` +
      `but only ${error.details.availableBalance} available`
    );
  } else {
    console.error("Withdrawal failed:", error.message);
  }
}
```

## System Errors

System errors occur due to infrastructure issues like database failures, network problems, or other unexpected situations:

```typescript
const getReport = createSpell({
  description: "Generate a financial report",
  parameters: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  result: z.object({
    reportId: z.string(),
    url: z.string(),
  }),
  execute: async ({ startDate, endDate }) => {
    try {
      // Try to generate the report
      const report = await generateReport(startDate, endDate);
      return { reportId: report.id, url: report.downloadUrl };
    } catch (err) {
      // Wrap the original error with more context
      const wrappedError = new Error(`Report generation failed: ${err.message}`);
      wrappedError.code = "REPORT_GENERATION_FAILED";
      wrappedError.cause = err;  // Preserve the original error
      wrappedError.details = { startDate, endDate };
      throw wrappedError;
    }
  },
});
```

## Standardizing Error Codes

It's a good practice to define standard error codes for your application:

```typescript
// errorCodes.ts
export const ErrorCode = {
  // Validation errors
  INVALID_INPUT: "INVALID_INPUT",
  
  // Authentication/authorization errors
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  
  // Resource errors
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  
  // Business logic errors
  INSUFFICIENT_FUNDS: "INSUFFICIENT_FUNDS",
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
  
  // System errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  
  // Rate limiting
  RATE_LIMITED: "RATE_LIMITED",
};
```

Then use these codes consistently in your spells:

```typescript
import { ErrorCode } from "./errorCodes";

// Inside a spell's execute function
if (!user) {
  const error = new Error(`User with ID ${id} not found`);
  error.code = ErrorCode.NOT_FOUND;
  error.details = { entityType: "User", id };
  throw error;
}
```

## Centralized Error Handling

For client applications, especially those with UIs, consider implementing centralized error handling:

```typescript
// errorHandler.ts
import { ErrorCode } from "./errorCodes";

export function handleSpellbookError(error, context = {}) {
  // Log all errors
  console.error("Spellbook error:", error, context);
  
  // Handle specific error codes
  switch (error.code) {
    case ErrorCode.UNAUTHORIZED:
      // Redirect to login
      redirectToLogin();
      break;
      
    case ErrorCode.NOT_FOUND:
      // Show not found UI
      showNotFoundMessage(error.details.entityType, error.details.id);
      break;
      
    case ErrorCode.INSUFFICIENT_FUNDS:
      // Show specific error message
      showInsufficientFundsMessage(
        error.details.requestedAmount,
        error.details.availableBalance
      );
      break;
      
    case ErrorCode.RATE_LIMITED:
      // Show rate limit message
      showRateLimitMessage(error.details.retryAfter);
      break;
      
    default:
      // Generic error handling
      showErrorMessage(error.message);
  }
  
  // Optionally report to error monitoring service
  reportToErrorMonitoring(error, context);
}
```

Then use it with your spell caster:

```typescript
try {
  const result = await client.cast("someSpell", params);
  // Handle success
} catch (error) {
  handleSpellbookError(error, {
    spellName: "someSpell",
    params,
  });
}
```

## Error Handling with Async/Await

When working with multiple spell casts that depend on each other, use proper error handling with async/await:

```typescript
async function processOrder(orderId) {
  try {
    // Get the order
    const order = await orderClient.cast("getOrder", { orderId });
    
    // Check inventory
    const inventoryCheck = await inventoryClient.cast("checkAvailability", { 
      items: order.items 
    });
    
    if (!inventoryCheck.allAvailable) {
      // Handle unavailable items
      return;
    }
    
    // Process payment
    const payment = await paymentClient.cast("processPayment", {
      orderId,
      amount: order.total,
    });
    
    // Update order status
    await orderClient.cast("updateStatus", {
      orderId,
      status: "PAID",
      paymentId: payment.id,
    });
    
    // Success!
    return { success: true, order, payment };
  } catch (error) {
    // Handle different error cases
    if (error.code === "PAYMENT_FAILED") {
      // Try alternative payment method or notify user
    } else if (error.code === "INVENTORY_CHANGED") {
      // Notify user that inventory changed during checkout
    } else {
      // Generic error handling
      console.error("Order processing failed:", error);
    }
    
    return { success: false, error };
  }
}
```

## Timeouts and Retry Logic

For network transports like WebSockets, consider implementing timeout and retry logic:

```typescript
async function castWithRetry(spellName, params, options = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    timeout = 5000,
  } = options;
  
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Create a promise that rejects after timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Spell cast timed out after ${timeout}ms`));
        }, timeout);
      });
      
      // Race the spell cast against the timeout
      return await Promise.race([
        client.cast(spellName, params),
        timeoutPromise,
      ]);
    } catch (error) {
      lastError = error;
      
      // Don't retry for certain error types
      if (
        error.code === "VALIDATION_ERROR" ||
        error.code === "UNAUTHORIZED" ||
        error.code === "NOT_FOUND"
      ) {
        throw error;
      }
      
      // Last attempt, don't wait
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Optional: exponential backoff
      retryDelay *= 2;
    }
  }
  
  // This should never be reached due to the throw in the loop
  throw lastError;
}

// Usage
try {
  const result = await castWithRetry("importantSpell", params, {
    maxRetries: 5,
    timeout: 10000,
  });
} catch (error) {
  console.error("Failed after multiple attempts:", error);
}
```

## Testing Error Scenarios

When writing tests for your spellbook, make sure to test error scenarios:

```typescript
import { execute } from "@usirin/spellbook";
import { withdrawSpell } from "./account";

describe("Withdraw Spell", () => {
  it("successfully withdraws when funds are available", async () => {
    // Test the success case
  });
  
  it("returns INSUFFICIENT_FUNDS error when balance is too low", async () => {
    try {
      await execute(accountBook, "withdraw", {
        accountId: "acc_low_balance",
        amount: 1000,
      });
      
      // If we get here, the test should fail
      fail("Expected an error but none was thrown");
    } catch (error) {
      expect(error.code).toBe("INSUFFICIENT_FUNDS");
      expect(error.details).toHaveProperty("accountId", "acc_low_balance");
      expect(error.details).toHaveProperty("requestedAmount", 1000);
      expect(error.details).toHaveProperty("availableBalance");
      expect(error.details.availableBalance).toBeLessThan(1000);
    }
  });
  
  it("handles database errors gracefully", async () => {
    // Mock the database to throw an error
    // Test that the error is properly wrapped
  });
});
```

## Conclusion

Effective error handling makes your Spellbook applications more robust and user-friendly. By following these best practices, you can ensure that errors are:

1. **Categorized** - Different types of errors (validation, business logic, system) are treated appropriately
2. **Informative** - Errors contain enough information for debugging and user feedback
3. **Type-safe** - Error codes and structures are consistent and type-checked
4. **Propagated** - Errors cross process boundaries without losing context
5. **Handled** - Client code can catch and respond to different error scenarios

Remember that good error handling is as important as the happy path in your application. Invest time in designing your error handling strategy early in your development process. 