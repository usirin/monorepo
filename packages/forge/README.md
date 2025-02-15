# @usirin/forge

Create type-safe, uniquely identifiable entities for your domain model. It's simple and focused on making entity management in TypeScript a breeze.

### What?

While developing domain models, you often need entities that are:
1. Always uniquely identifiable
2. Type-safe when referenced
3. Easy to compose
4. Simple to validate

Here is how forge makes this easy:

```typescript
import { factory } from '@usirin/forge'

// Define a post entity
const createPost = factory('post', (title: string, body: string) => ({
  title,
  body
}))

type PostEntity = ReturnType<typeof createPost>

// Create a post - automatically gets unique ID
const post = createPost('Hello World', 'This is my first post')
// Result: {
//   tag: 'post',
//   id: 'post_x7f2k...',
//   title: 'Hello World',
//   body: 'This is my first post'
// }
```

It doesn't try to solve every use case, but since it focuses on making entities uniquely identifiable and type-safe, it should cover most of your domain modeling needs.

### Install

```bash
# npm
npm install @usirin/forge

# pnpm
pnpm add @usirin/forge

# bun
bun add @usirin/forge
```

### Entity Relationships

You can easily model relationships between entities:

```typescript
import { factory, type Ref, type Entity } from '@usirin/forge'

const createComment = factory('comment', (postID: Ref<PostEntity>, text: string) => ({
  postID,
  text
}))

type CommentEntity = ReturnType<typeof createComment>

// Create a comment for a post
const comment = createComment(post.id, 'Great post!')
// Result: {
//   tag: 'comment',
//   id: 'comment_j9k2l...',
//   postID: 'post_x7f2k...',
//   text: 'Great post!'
// }

// Type system ensures you can't use wrong ID types
createComment('wrong_id', 'text') // Type error!
```

### License

MIT