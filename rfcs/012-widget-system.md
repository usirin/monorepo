# Widget System

## Context
We need a system to extend studio with widgets in a way that follows vim's philosophy of separating control planes (buffers) from viewports (windows). This allows for a clean, composable, and keyboard-driven interface for studio-like applications.

## Decision
Implement a widget system that:
1. Separates widgets (control planes) from windows (viewports)
2. Uses URL-based addressing (widget://name/spell)
3. Leverages layout-tree for vim-like window management
4. Starts with browser-only widgets (e.g., todos) for MVP

### Widget Definition
```typescript
interface Widget {
  name: string
  spells: {
    [key: string]: {
      description: string
      handler: () => React.ReactNode
    }
  }
}
```

### Example Widget
```typescript
const todoWidget = {
  name: "todos",
  spells: {
    list: {
      description: "list todos",
      handler: () => <TodoList />
    },
    create: {
      description: "create todo",
      handler: () => <CreateTodoForm />
    }
  }
}
```

### Window Management
Uses layout-tree for vim-like operations:
- Split windows: - (horizontal), | (vertical)
- Navigate: <C-w>hjkl
- Close: ZZ

### URL Schema
```
widget://[widget-name]/[spell]
Example: widget://todos/list
```

## Implementation

### Phase 1: MVP
1. Widget System Core
   - Widget interface
   - Widget registry
   - Basic state management

2. Window Management
   - Integration with layout-tree
   - URL-based window keys
   - Vim-like operations

3. Todo Widget Example
   - List view
   - Create view
   - Basic state

### Files to Change
1. Widget System Core
   - `packages/widget-system/index.ts` (new)
     - Widget interface
     - Widget registry
     - Basic state management

2. Window Management
   - `services/usir-in/studio/window-manager.tsx` (new)
     - Integration with layout-tree
     - URL-based window keys
     - Vim-like operations

3. Todo Widget Example
   - `services/usir-in/studio/widgets/todo/index.tsx` (new)
     - Todo widget implementation
     - List/Create views
     - Basic state management

4. Studio Integration
   - `services/usir-in/studio/container.tsx` (modify)
     - Integrate window manager
     - Render windows with widgets
     - Handle window operations

5. Command Integration
   - `services/usir-in/spellbook/SpellbookContext.tsx` (modify)
     - Add widget URL commands
     - Handle window operations

### Usage Example
```typescript
// Create studio
const studio = createStudio({
  widgets: [todoWidget]
})

// Use in app
function App() {
  return (
    <Studio>
      {/* Windows render here */}
    </Studio>
  )
}

// User operations
:e widget://todos/list    // Open todo list
-                        // Split horizontal
:e widget://todos/create  // Open create form
```

## Consequences

### Positive
1. Clean separation of concerns
2. Familiar vim-like interface
3. Easy widget development
4. Composable functionality

### Negative
1. Initial setup complexity
2. Learning curve for vim controls
3. State management considerations

## Future Work
1. Widget lifecycle management
2. Rich widget communication
3. Server-integrated widgets
4. State persistence

## Success Metrics
1. Can implement todo widget
2. Vim-like window operations work
3. Widget state persists correctly
4. Smooth user experience 