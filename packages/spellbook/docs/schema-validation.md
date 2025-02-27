# Schema Validation

Spellbook uses schema validation to ensure type safety and runtime validation for your APIs. This document explains how schema validation works in Spellbook and the different validation libraries that can be used.

## Why Schema Validation?

Schema validation provides several important benefits:

1. **Type Safety**: TypeScript types are derived from your schemas, ensuring compile-time type checking.
2. **Runtime Validation**: Input and output data are validated at runtime, catching errors that type checking can't.
3. **Self-Documentation**: Schemas document the shape and constraints of your API's data.
4. **Error Messages**: Validation libraries provide helpful error messages when validation fails.

## Validation Libraries

Spellbook is designed to work with any schema validation library that implements the [Standard Schema](https://github.com/standard-schema/standard-schema) specification. While the examples in this documentation often use [Zod](https://github.com/colinhacks/zod), this is simply because it's one of the popular implementations of Standard Schema.

Spellbook fully supports other compliant libraries like:

- [Valibot](https://github.com/fabian-hiller/valibot)
- [Zod](https://github.com/colinhacks/zod)
- Any other library that implements the Standard Schema specification

The choice of validation library is entirely up to you - Spellbook will work with any of them equally well as long as they conform to the Standard Schema specification.

### Using Zod

[Zod](https://github.com/colinhacks/zod) is a popular TypeScript-first schema validation library with a powerful API.

```typescript
import { z } from "zod";
import { createSpell } from "@usirin/spellbook";

const addTodo = createSpell({
  description: "Add a new todo",
  parameters: z.object({
    text: z.string().min(1).max(100),
    completed: z.boolean().default(false),
    priority: z.enum(["low", "medium", "high"]).optional(),
    tags: z.array(z.string()).optional(),
  }),
  result: z.object({
    id: z.string(),
    text: z.string(),
    completed: z.boolean(),
    createdAt: z.string(),
  }),
  execute: async ({ text, completed, priority, tags }) => {
    // Implementation...
    return {
      id: "123",
      text,
      completed,
      createdAt: new Date().toISOString(),
    };
  },
});
```

### Other Validation Libraries

As mentioned earlier, Spellbook works with any validation library that implements the Standard Schema specification. Here's an example using Valibot:

```typescript
import * as v from "valibot";
import { createSpell } from "@usirin/spellbook";

const addTodo = createSpell({
  description: "Add a new todo using Valibot",
  parameters: v.object({
    text: v.string([v.minLength(1), v.maxLength(100)]),
    completed: v.boolean(v.withDefault(false)),
    priority: v.optional(v.union([
      v.literal("low"), 
      v.literal("medium"), 
      v.literal("high")
    ])),
    tags: v.optional(v.array(v.string())),
  }),
  result: v.object({
    id: v.string(),
    text: v.string(),
    completed: v.boolean(),
    createdAt: v.string(),
  }),
  execute: async ({ text, completed, priority, tags }) => {
    // Implementation...
    return {
      id: "123",
      text,
      completed,
      createdAt: new Date().toISOString(),
    };
  },
});
```

To implement the Standard Schema specification, a library needs to provide:

1. A schema definition API
2. A way to parse and validate data against the schema
3. A way to extract TypeScript types from schemas
4. The Standard Schema interface with the `~standard` property

## Validation Flow

Spellbook performs validation at several points:

1. **Parameter Validation**: When a spell is cast, the input parameters are validated against the parameter schema.
2. **Result Validation**: After a spell executes, the result is validated against the result schema.
3. **Transport Serialization**: When data crosses transport boundaries, it's validated after deserialization.

## Error Handling

When validation fails, Spellbook throws an error that includes the validation details:

```typescript
try {
  await execute(myBook, "mySpell", invalidParams);
} catch (error) {
  console.error("Validation error:", error);
  // The error will contain detailed information about what went wrong
}
```

## Advanced Validation Techniques

### Custom Validators

You can define custom validation logic using refinements:

```typescript
const EmailSchema = z.string().refine(
  (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email),
  { message: "Invalid email format" }
);
```

### Nested Objects

Schemas can represent complex nested structures:

```typescript
const UserSchema = z.object({
  profile: z.object({
    name: z.string(),
    address: z.object({
      street: z.string(),
      city: z.string(),
      zip: z.string(),
    }),
  }),
  preferences: z.object({
    theme: z.enum(["light", "dark", "system"]),
    notifications: z.boolean(),
  }),
});
```

### Conditional Validation

You can implement conditional validation using `.refine()`:

```typescript
const PaymentSchema = z.object({
  method: z.enum(["credit_card", "bank_transfer", "paypal"]),
  creditCardNumber: z.string().optional(),
  bankAccount: z.string().optional(),
  paypalEmail: z.string().optional(),
}).refine(
  (data) => {
    if (data.method === "credit_card") return !!data.creditCardNumber;
    if (data.method === "bank_transfer") return !!data.bankAccount;
    if (data.method === "paypal") return !!data.paypalEmail;
    return true;
  },
  {
    message: "Required payment details missing for the selected payment method",
  }
);
```

### Array Validation

You can validate arrays and their items:

```typescript
const TagsSchema = z.array(z.string()).min(1).max(5);

const TodoWithTagsSchema = z.object({
  text: z.string(),
  tags: TagsSchema,
});
```

### Union Types

Schemas can represent union types:

```typescript
const MessageSchema = z.union([
  z.object({ type: z.literal("text"), content: z.string() }),
  z.object({ type: z.literal("image"), url: z.string().url() }),
  z.object({ type: z.literal("file"), url: z.string().url(), name: z.string() }),
]);
```

## Performance Considerations

Schema validation adds some overhead, especially for complex objects. Consider these performance tips:

1. **Keep schemas simple** when possible
2. **Reuse schema definitions** across spells
3. **Configure validation** based on environment (e.g., more strict in development, less in production)

## Example: Comprehensive Validation

This example demonstrates a more comprehensive validation approach using both Zod and Valibot in the same spellbook, showcasing how Spellbook supports multiple Standard Schema implementations:

```typescript
import { z } from "zod";
import * as v from "valibot";
import { createSpell, createSpellbook } from "@usirin/spellbook";

// Define reusable schemas with Zod
const ZodID = z.string().uuid();
const ZodEmail = z.string().email();
const ZodUsername = z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/);
const ZodPassword = z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/);

// Define a user schema with Zod
const ZodUser = z.object({
  id: ZodID,
  email: ZodEmail,
  username: ZodUsername,
  createdAt: z.string().datetime(),
  profile: z.object({
    displayName: z.string().optional(),
    bio: z.string().max(500).optional(),
    avatarUrl: z.string().url().optional(),
  }).optional(),
});

// Define similar schemas with Valibot
const ValibotID = v.string([v.uuid()]);
const ValibotEmail = v.string([v.email()]);
const ValibotUsername = v.string([v.minLength(3), v.maxLength(20), v.pattern(/^[a-zA-Z0-9_]+$/)]);
const ValibotPassword = v.string([v.minLength(8), v.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)]);

// Create a spell to register a user using Zod
const registerUser = createSpell({
  description: "Register a new user",
  parameters: z.object({
    email: ZodEmail,
    username: ZodUsername,
    password: ZodPassword,
  }),
  result: ZodUser,
  execute: async ({ email, username, password }) => {
    // Implementation would handle creating the user in a database
    // For this example, we'll just return a mock user
    
    return {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email,
      username,
      createdAt: new Date().toISOString(),
      profile: {
        displayName: username,
      },
    };
  },
});

// Create a spell to update user using Valibot
const updateUser = createSpell({
  description: "Update an existing user",
  parameters: v.object({
    id: ValibotID,
    profile: v.object({
      displayName: v.optional(v.string()),
      bio: v.optional(v.string([v.maxLength(500)])),
      avatarUrl: v.optional(v.string([v.url()])),
    }),
  }),
  result: ZodUser, // mixing libraries is fine - using Zod result with Valibot parameters
  execute: async ({ id, profile }) => {
    // Implementation would handle updating the user in a database
    // For this example, we'll just return a mock updated user
    
    return {
      id,
      email: "user@example.com",
      username: "username",
      createdAt: new Date().toISOString(),
      profile,
    };
  },
});

const userBook = createSpellbook({
  register: registerUser,
  update: updateUser,
  // Add more user-related spells here
});
```

This example demonstrates how you can use different schema validation libraries in the same project, even within the same spellbook. The choice of which library to use for each spell is entirely up to you.

## Common Validation Patterns

Here are some common validation patterns that you might find useful:

### Required vs Optional Fields

```typescript
z.object({
  // Required field
  name: z.string(),
  
  // Optional field
  description: z.string().optional(),
  
  // Optional field with default value
  status: z.enum(["active", "inactive"]).default("active"),
});
```

### Date Validation

```typescript
// ISO date string validation
const ISODateString = z.string().refine(
  (str) => !isNaN(Date.parse(str)),
  { message: "Invalid ISO date string" }
);

// Date object validation
const DateObject = z.instanceof(Date);

// Future date validation
const FutureDate = z.instanceof(Date).refine(
  (date) => date > new Date(),
  { message: "Date must be in the future" }
);
```

### Numeric Validation

```typescript
// Integer validation
const Integer = z.number().int();

// Positive number validation
const PositiveNumber = z.number().positive();

// Number in range validation
const Score = z.number().min(0).max(100);
```

### String Format Validation

```typescript
// URL validation
const URL = z.string().url();

// Email validation
const Email = z.string().email();

// UUID validation
const UUID = z.string().uuid();

// Custom pattern validation
const PhoneNumber = z.string().regex(/^\+[1-9]\d{1,14}$/);
```

By using these validation techniques, you can create robust and type-safe APIs with clear expectations and constraints.