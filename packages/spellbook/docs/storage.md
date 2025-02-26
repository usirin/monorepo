# Storage: Type-Safe State Management for Spellbooks

## Overview

The Storage system provides a type-safe, transport-agnostic way to manage state in Spellbook applications. Following the algebraic definition `Inventory :: Map<Serializable, Serializable>`, it offers a key-value store that works with any serializable data.

```typescript
// Create a storage implementation
const storage = createLocalStorage("my-app");

// Type-safe operations
await storage.set("user", { id: "123", name: "Alice" });
const user = await storage.get<User>("user");
```

When combined with SpellCaster, storage becomes "Inventory" - providing state management alongside spell execution:

```typescript
const caster = createSpellCaster<typeof mySpellbook>({
  transport: createWebSocketTransport(ws),
  storage: createLocalStorage("my-app")
});

// Inventory operations through SpellCaster
await caster.inventory.set("count", 1);
const count = await caster.inventory.get<number>("count");
```

## Core Concepts

### 1. Storage Interface

The Storage interface defines a minimal yet complete key-value store API:

- **Get/Set Operations**: Retrieve and store serializable values
- **Existence Checking**: Test if keys exist
- **Enumeration**: List available keys
- **Deletion**: Remove individual items or clear all
- **Type Safety**: Generics for type-safe retrieval

### 2. Implementation Flexibility

Storage can be implemented for various backends:

- **Memory**: Ephemeral in-memory storage
- **Browser**: LocalStorage, SessionStorage, IndexedDB
- **Cross-Tab**: BroadcastChannel for shared state
- **Remote**: Firebase, Custom backends
- **Node.js**: FileSystem, SQLite, Redis

### 3. Composition Patterns

Storage implementations can be composed for enhanced capabilities:

- **Namespacing**: Isolate data domains
- **Caching**: Layer memory over persistent storage
- **Middleware**: Add logging, validation, encryption
- **Transactions**: Atomic multi-operation sequences
- **Migrations**: Data structure evolution

## API Reference

### Storage Interface

```typescript
interface Storage {
  // Store a value with type safety
  set<T extends Serializable>(key: string, value: T): Promise<void>;
  
  // Retrieve a value with type safety
  get<T extends Serializable>(key: string): Promise<T | null>;
  
  // Check if a key exists
  has(key: string): Promise<boolean>;
  
  // Remove a value
  delete(key: string): Promise<boolean>;
  
  // Clear all values
  clear(): Promise<void>;
  
  // Get all keys
  keys(): Promise<string[]>;
}
```

### Optional Extended Interfaces

For implementations that support additional capabilities:

```typescript
// For storage that supports subscriptions
interface ObservableStorage extends Storage {
  subscribe<T>(key: string, listener: (value: T) => void): () => void;
  onChange<T>(key: string, listener: (value: T) => void): () => void;
}

// For storage that supports transactions
interface TransactionalStorage extends Storage {
  transaction<T>(cb: (storage: Storage) => Promise<T>): Promise<T>;
}

// For storage that supports expiry
interface ExpiringStorage extends Storage {
  setWithExpiry<T>(key: string, value: T, ttlMs: number): Promise<void>;
}

// For storage that supports namespacing
interface NamespacedStorage extends Storage {
  withNamespace(namespace: string): Storage;
}
```

### Creating Storage Implementations

```typescript
// Memory storage
function createMemoryStorage(): Storage;

// LocalStorage
function createLocalStorage(namespace: string): Storage;

// SessionStorage
function createSessionStorage(namespace: string): Storage;

// IndexedDB
function createIndexedDBStorage(dbName: string, storeName?: string): Storage;

// BroadcastChannel for cross-tab storage
function createBroadcastChannelStorage(channelName: string): ObservableStorage;

// Storage composition
function createNamespacedStorage(baseStorage: Storage, namespace: string): Storage;
function createCachedStorage(primaryStorage: Storage, cacheStorage?: Storage): Storage;
```

## Usage Examples

### Basic Storage Operations

```typescript
// Create a storage implementation
const storage = createLocalStorage("my-app");

// Store a value
await storage.set("count", 1);

// Check if a key exists
if (await storage.has("count")) {
  // Retrieve with type safety
  const count = await storage.get<number>("count");
  console.log(count); // 1
}

// Remove a value
await storage.delete("count");

// Clear all values
await storage.clear();

// List all keys
const keys = await storage.keys();
console.log(keys); // []
```

### Complex Data Structures

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  preferences: {
    theme: "light" | "dark";
    notifications: boolean;
  };
}

// Store complex object
await storage.set<User>("currentUser", {
  id: "123",
  name: "Alice",
  email: "alice@example.com",
  preferences: {
    theme: "dark",
    notifications: true
  }
});

// Retrieve with full type safety
const user = await storage.get<User>("currentUser");
if (user) {
  console.log(user.preferences.theme); // "dark"
}
```

### Namespaced Storage

```typescript
// Create base storage
const baseStorage = createLocalStorage("my-app");

// Create namespaced storage instances
const userStorage = createNamespacedStorage(baseStorage, "users");
const settingsStorage = createNamespacedStorage(baseStorage, "settings");

// Each operates in its own namespace
await userStorage.set("currentUser", { id: "123", name: "Alice" });
await settingsStorage.set("theme", "dark");

// Keys don't conflict
const allUserKeys = await userStorage.keys(); // ["currentUser"]
const allSettingsKeys = await settingsStorage.keys(); // ["theme"]

// Base storage sees namespaced keys
const allKeys = await baseStorage.keys(); // ["users:currentUser", "settings:theme"]
```

### Observable Storage with BroadcastChannel

```typescript
// Create storage that works across tabs
const sharedStorage = createBroadcastChannelStorage("app-state");

// Set up listener for changes
const unsubscribe = sharedStorage.onChange<number>("counter", (newValue) => {
  console.log("Counter changed:", newValue);
});

// Update value (triggers listener in all tabs)
await sharedStorage.set("counter", 1);

// Later, clean up subscription
unsubscribe();
```

### Transactional Operations

```typescript
// Storage with transaction support
const storage = createTransactionalStorage(createLocalStorage("my-app"));

// Execute multiple operations atomically
await storage.transaction(async (tx) => {
  const counter = await tx.get<number>("counter") || 0;
  await tx.set("counter", counter + 1);
  await tx.set("lastUpdate", new Date().toISOString());
  await tx.set("history", [
    ...(await tx.get<string[]>("history") || []),
    `Incremented to ${counter + 1}`
  ]);
});
```

### Cached Storage for Performance

```typescript
// Create a storage with in-memory cache
const storage = createCachedStorage(
  createIndexedDBStorage("my-app"), // Slower persistent storage
  createMemoryStorage()             // Fast in-memory cache
);

// First access hits the persistent store
const value = await storage.get("key");

// Subsequent accesses use memory cache
const cachedValue = await storage.get("key"); // Fast!
```

## Integration with SpellCaster

When a Storage implementation is provided to SpellCaster, it becomes available as the `inventory` property:

```typescript
const caster = createSpellCaster<typeof mySpellbook>({
  transport: createWebSocketTransport(ws),
  storage: createLocalStorage("my-app")
});

// All storage operations available through inventory
await caster.inventory.set("count", 1);
const count = await caster.inventory.get<number>("count");
const hasCount = await caster.inventory.has("count");
const allKeys = await caster.inventory.keys();
await caster.inventory.delete("count");
await caster.inventory.clear();
```

### Using Inventory in Spells

Inventory is particularly useful in spell implementations:

```typescript
const counterBook = createSpellbook({
  increment: createSpell({
    description: "Increment a counter",
    parameters: z.object({
      key: z.string(),
      amount: z.number().default(1)
    }),
    execute: async ({ key, amount }, { inventory }) => {
      // Get current value from inventory
      const current = await inventory.get<number>(key) || 0;
      
      // Update value
      const newValue = current + amount;
      await inventory.set(key, newValue);
      
      return newValue;
    }
  }),
  
  getCount: createSpell({
    description: "Get a counter value",
    parameters: z.object({
      key: z.string()
    }),
    execute: async ({ key }, { inventory }) => {
      return await inventory.get<number>(key) || 0;
    }
  })
});
```

### React Hooks for Inventory Values

```typescript
function useInventoryValue<T>(caster: SpellCaster<any>, key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  
  useEffect(() => {
    // Load initial value
    caster.inventory.get<T>(key).then(stored => {
      if (stored !== null) {
        setValue(stored);
      }
    });
    
    // Subscribe to changes if storage supports it
    if ('subscribe' in caster.inventory) {
      return (caster.inventory as ObservableStorage)
        .subscribe<T>(key, newValue => {
          setValue(newValue);
        });
    }
  }, [caster, key]);
  
  // Function to update value
  const updateValue = useCallback(async (newValue: T) => {
    await caster.inventory.set(key, newValue);
    setValue(newValue);
  }, [caster, key]);
  
  return [value, updateValue] as const;
}

// In your component
function Counter() {
  const caster = useContext(SpellCasterContext);
  const [count, setCount] = useInventoryValue(caster, "count", 0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

## Implementations

The library provides several built-in storage implementations:

### Memory Storage

In-memory, ephemeral storage that doesn't persist:

```typescript
const memoryStorage = createMemoryStorage();
```

### LocalStorage

Browser's localStorage with automatic serialization:

```typescript
const localStorage = createLocalStorage("app-namespace");
```

### SessionStorage

Browser's sessionStorage (persists for session only):

```typescript
const sessionStorage = createSessionStorage("app-namespace");
```

### IndexedDB Storage

Browser's IndexedDB for larger, structured data:

```typescript
const idbStorage = createIndexedDBStorage("app-database", "app-store");
```

### BroadcastChannel Storage

Shares state across browser tabs with change notifications:

```typescript
const broadcastStorage = createBroadcastChannelStorage("app-state");
```

### Node.js File Storage

For Node.js environments, persists to filesystem:

```typescript
const fileStorage = createFileStorage("./data");
```

## Composition Patterns

Storage implementations can be composed for enhanced capabilities:

### Namespaced Storage

Isolate storage domains:

```typescript
const userStorage = createNamespacedStorage(baseStorage, "users");
const settingsStorage = createNamespacedStorage(baseStorage, "settings");
```

### Cached Storage

Improve performance with in-memory caching:

```typescript
const cachedStorage = createCachedStorage(
  createIndexedDBStorage("app-database"),  // Persistent
  createMemoryStorage()                    // Cache
);
```

### Encrypted Storage

Add encryption for sensitive data:

```typescript
const encryptedStorage = createEncryptedStorage(
  baseStorage,
  encryptionKey
);
```

### Expiring Storage

Add time-to-live for stored values:

```typescript
const expiringStorage = createExpiringStorage(baseStorage);

// Set with 5 minute TTL
await expiringStorage.setWithExpiry("session", sessionData, 5 * 60 * 1000);
```

## Best Practices

### Data Organization

Organize data with clear key structures:

```typescript
// Use prefixes for data types
await storage.set("user:123", userData);
await storage.set("post:456", postData);

// Use namespaces for domains
const userStorage = createNamespacedStorage(storage, "user");
const postStorage = createNamespacedStorage(storage, "post");
```

### Error Handling

Handle storage errors gracefully:

```typescript
try {
  await storage.set("key", value);
} catch (error) {
  if (error instanceof StorageQuotaError) {
    // Handle storage limit exceeded
    console.error("Storage quota exceeded");
  } else if (error instanceof StorageAccessError) {
    // Handle permission issues
    console.error("Cannot access storage");
  } else {
    // Handle other errors
    console.error("Storage error:", error);
  }
}
```

### Migration Strategies

Plan for data evolution:

```typescript
async function migrateStorage(storage) {
  // Check schema version
  const version = await storage.get("schema_version") || 0;
  
  if (version < 1) {
    // Migrate to version 1
    const oldUsers = await storage.get("users") || [];
    for (const user of oldUsers) {
      await storage.set(`user:${user.id}`, user);
    }
    await storage.delete("users");
    await storage.set("schema_version", 1);
  }
  
  if (version < 2) {
    // Migrate to version 2
    // ...
  }
}
```

### Performance Considerations

Optimize for your usage patterns:

```typescript
// Batch operations when possible
await storage.transaction(async (tx) => {
  for (const item of items) {
    await tx.set(`item:${item.id}`, item);
  }
});

// Use appropriate storage type for data size
// - Memory/LocalStorage: Small data (<5MB)
// - IndexedDB: Larger data, structured queries
// - Custom backend: Very large data sets
```

## Conclusion

The Storage system provides a flexible, type-safe way to manage state in Spellbook applications. By separating state management from API behavior, it enables a clean architecture that scales from simple local applications to complex distributed systems. 