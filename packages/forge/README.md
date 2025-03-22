# @usirin/forge

Create type-safe, uniquely identifiable entities for your domain model. It's simple and focused on making entity management in TypeScript a breeze.

## Overview

While developing domain models, you often need entities that are:
1. Always uniquely identifiable
2. Type-safe when referenced
3. Easy to compose
4. Simple to validate

Forge makes this easy with a minimal yet powerful API.

## Installation

```bash
npm install @usirin/forge   # npm
yarn add @usirin/forge      # yarn
pnpm add @usirin/forge      # pnpm
bun add @usirin/forge       # bun
```

## Basic Usage

### Creating Entities with Factory

```typescript
import { factory } from '@usirin/forge'

// Define a post entity
const createPost = factory('post', (title: string, body: string) => ({
  title,
  body
}))

// Create a post - automatically gets unique ID
const post = createPost('Hello World', 'This is my first post')
// Result: { tag: 'post', id: 'post_x7f2k...', title: 'Hello World', body: '...' }

type PostEntity = ReturnType<typeof createPost>
```

### Entity Relationships

```typescript
import { factory, type Ref } from '@usirin/forge'

const createComment = factory('comment', (postID: Ref<PostEntity>, text: string) => ({
  postID,
  text
}))

// Create a comment for a post
const comment = createComment(post.id, 'Great post!')
// Result: { tag: 'comment', id: 'comment_j9k2l...', postID: 'post_x7f2k...', text: '...' }

// Type system ensures you can't use wrong ID types
createComment('wrong_id', 'text') // Type error!
```

## Schema Validation

Forge integrates with [Standard Schema](https://standardschema.dev/) to enable type-safe validation.

### Using struct with Validation Libraries

```typescript
import { struct } from '@usirin/forge'
import { z } from 'zod'
import * as v from 'valibot'

// With Zod
const createUser = struct('user', z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().min(18)
}))

// With Valibot
const createUserV = struct('user', v.object({
  name: v.string(),
  age: v.number()
}))

// Create validated entities
const user1 = createUser({ name: 'John', email: 'john@example.com', age: 25 })
const user2 = createUserV({ name: 'Alice', age: 30 })

// Invalid data will throw validation errors
try {
  createUser({ name: 'Invalid', email: 'not-an-email', age: 15 })
} catch (error) {
  console.error('Validation failed:', error)
}
```

## Advanced Features

### Unique ID Generation & Type Utilities

```typescript
import { id, type Entity, type Ref } from '@usirin/forge'

// Generate a unique ID
const userID = id('user')  // 'user_9wDHM7drQWZE7Jm3RaxV8'

// Define entity types
type UserEntity = Entity<'user'>  // { tag: 'user', id: 'user_...' }
type PostEntity = Entity<'post'>  // { tag: 'post', id: 'post_...' }

// Type-safe function that only accepts references to specific entities
function getUserPosts(userID: Ref<UserEntity>): PostEntity[] {
  // Implementation...
}
```

## Philosophy

Forge doesn't try to solve every use case, but focuses on making entities uniquely identifiable and type-safe to cover most domain modeling needs:

- **Minimal**: Simple API with just a few functions
- **Type-safe**: Full TypeScript support for entity relationships
- **Standards-based**: Uses Standard Schema for validation
- **Interoperable**: Works with various validation libraries
- **Fast**: Efficient ID generation and validation

## License

MIT