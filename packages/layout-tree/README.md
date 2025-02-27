# @usirin/layout-tree

Data structure for tiled window layouts.

```bash
pnpm add @usirin/layout-tree
```

## Example

Create a layout like this:

```
*---------*---------*---------*
|         |    B    |         |
|         *---------*         |
|    A    |    C    |    E    |
|         *---------*         |
|         |    D    |         |
*---------*---------*---------*
```

```typescript
import { createTree, createStack, createWindow } from '@usirin/layout-tree'

const tree = createTree(
  createStack('horizontal', [     // children flow left-to-right: A -> (BCD) -> E
    createWindow('A'),
    createStack('vertical', [     // children flow top-to-bottom: B -> C -> D
      createWindow('B'),
      createWindow('C'),
      createWindow('D')
    ]),
    createWindow('E')
  ])
)
```

## Types

### Orientation

```typescript
type Orientation =
  | 'vertical'    // stack children top-to-bottom
  | 'horizontal'  // stack children left-to-right
```

### Direction

```typescript
type Direction =
  | 'up'     // sibling above
  | 'down'   // sibling below
  | 'left'   // sibling to the left
  | 'right'  // sibling to the right
```

### Window

```typescript
interface Window extends Entity<"window"> {
  key: string;
}
```

### Stack

```typescript
interface Stack extends Entity<"stack"> {
  orientation: Orientation;
  children: (Window | Stack)[];
}
```

### Tree

```typescript
interface Tree extends Entity<"tree"> {
  root: Stack;
}
```

## Operations

### Split

Split a window vertically (create new window below) or horizontally (create new window to the right):

```typescript
import { split } from '@usirin/layout-tree'

// vertical split (top-to-bottom)
let newTree = split(tree, [0], 'vertical')

/*
Before:          After:
*---------*     *---------*
|         |     |    A    |
|    A    |     *---------*
|         |     |    B    |
*---------*     *---------*
*/

// horizontal split (left-to-right)
newTree = split(tree, [1], 'horizontal')

/*
Before:          After:
*---------*     *---------*---------*
|    A    |     |         A         |
*---------*     |-------------------|
|    B    |     |    B    |    C    |
*---------*     *---------*---------*
*/
```

### Find

Get a window by path or find siblings in any direction:

```typescript
import { getAt, findSibling } from '@usirin/layout-tree'

// get window at path [0, 1]
const window = getAt(tree.root, [0, 1])

// find siblings
const up = findSibling(tree, [0], 'up')      // sibling above
const right = findSibling(tree, [0], 'right') // sibling to the right
```

### Move & Swap

Move windows around or swap their positions:

```typescript
import { moveBefore, moveAfter, swap } from '@usirin/layout-tree'

// move B before A
let newTree = moveBefore(tree, [1], [0])

/*
Before:          After:
*-----*-----*   *-----*-----*
|  A  |  B  |   |  B  |  A  |
*-----*-----*   *-----*-----*
*/

// swap A and B
newTree = swap(tree, [0], [1])
```

### Remove

Remove a window from the tree:

```typescript
import { remove } from '@usirin/layout-tree'

const newTree = remove(tree, [0, 1])

/*
Before:             After:
*-----*-----*      *---------*
|  A  |  B  |      |    A    |
*-----*-----*      *---------*
*/
```

## Path Navigation

Paths are arrays of indices that describe the location of a window in the tree:

```typescript
// In this layout:
// *---------*---------*
// |    A    |    B    |
// *----*----*---------*
// | C  | D  |    E    |
// *----*----*---------*

[0]     // window A
[1]     // window B
[0, 0]  // window C
[0, 1]  // window D
[1, 0]  // window E
```

## License

MIT
