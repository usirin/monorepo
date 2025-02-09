# @usirin/forge

A lightweight TypeScript utility for creating and managing typed entities with unique identifiers.

## Features

- Type-safe entity creation
- Unique ID generation with prefixes
- Factory pattern for creating complex entities
- Zero dependencies

## Installation

```bash
npx jsr add @usirin/forge
# or
bunx jsr add @usirin/forge
```

Or with Deno:
```bash
deno add @usirin/forge
```

## Usage

### Basic Entity Creation

```typescript
import { entity, type Entity } from '@usirin/forge';

// Create a basic entity
const user = entity('user');
// Result: { tag: 'user', id: 'user:x7f2k...' }

// Type definition
type UserEntity = Entity<'user'>;
```

### Using the Factory Pattern

```typescript
import { factory } from '@usirin/forge';

// Define a factory for creating users with additional properties
const createUser = factory('user', (name: string, age: number) => ({
  name,
  age
}));

// Create a user
const user = createUser('John', 30);
// Result: {
//   tag: 'user',
//   id: 'user:x7f2k...',
//   name: 'John',
//   age: 30
// }
```

### Working with References

```typescript
import { type Ref } from '@usirin/forge';

type UserEntity = Entity<'user'>;
type UserRef = Ref<UserEntity>; // Type: 'user:string'

// Use refs to store references to entities
const userRef: UserRef = user.id;
```

## API

### `Entity<T>`
Type definition for an entity with a tag and unique ID.

### `Ref<T>`
Type helper for referencing an entity by its ID.

### `id(prefix)`
Generates a unique ID with the given prefix.

### `entity(tag)`
Creates a basic entity with a tag and generated ID.

### `factory(tag, factory)`
Creates a factory function that produces tagged entities with additional properties.

## License

MIT