# RFC 010: Studio Package

## Summary
Create `@usirin/studio` as an umbrella package that provides a unified development environment by integrating existing packages (`@umut/runekeeper`, `@umut/layout-tree`) with new core functionality for workspace management, commands, and UI components.

## Background and Motivation

### Current State
- Multiple separate packages (`runekeeper`, `layout-tree`) with overlapping concerns
- Duplicated UI components across services
- Inconsistent keyboard handling between components
- No standardized command system
- Manual integration work required for each new service

### Pain Points
1. Developers must manually wire up keyboard shortcuts
2. Workspace management is reimplemented per service
3. No consistent UI component library
4. Plugin capabilities are limited
5. Command system is ad-hoc

## Technical Architecture

### Core System Design
```mermaid
graph TD
    Studio[Studio Core] --> Workspace[Workspace Manager]
    Studio --> Commands[Command Registry]
    Studio --> Keybindings[Keybinding Manager]
    Studio --> UI[UI Components]
    
    Workspace --> LayoutTree[@usirin/layout-tree]
    Keybindings --> Runekeeper[@usirin/runekeeper]
    
    Commands --> CommandPalette[Command Palette]
    Commands --> Keybindings
    
    UI --> Container[Container]
    UI --> StatusBar[Status Bar]
    UI --> Widget[Widget System]
```

### Package Structure
```
@usirin/studio
├── core/
│   ├── studio.ts         # Main Studio class & initialization
│   ├── types.ts          # Core type definitions
│   └── events.ts         # Event system
├── plugins/
│   ├── workspace/        # Layout & window management
│   │   ├── index.ts
│   │   ├── manager.ts    # Workspace manager implementation
│   │   └── commands.ts   # Workspace-specific commands
│   ├── commands/         # Command system
│   │   ├── index.ts
│   │   ├── registry.ts   # Command registry implementation
│   │   └── palette.ts    # Command palette UI
│   └── keybindings/      # Keyboard handling
│       ├── index.ts
│       ├── manager.ts    # Runekeeper integration
│       └── defaults.ts   # Default keybindings
└── ui/                   # Core UI components
    ├── container.tsx     # Main container component
    ├── statusbar.tsx     # Status bar component
    ├── widget.tsx        # Base widget component
    └── theme.ts         # Theming system
```

### Core APIs

```typescript
interface Studio {
  workspace: WorkspaceManager
  commands: CommandRegistry
  keybindings: RunekeeperManager
  events: EventEmitter
  ui: UIComponents
}

interface WorkspaceManager {
  getCurrentLayout(): Tree
  splitPanel(direction: 'vertical' | 'horizontal'): void
  registerPanel(config: PanelConfig): void
  focusPanel(id: string): void
  // ... other workspace methods
}

interface CommandRegistry {
  register(command: Command): void
  execute(id: string, args?: unknown): Promise<void>
  getAll(): Command[]
  // ... other command methods
}

interface RunekeeperManager {
  bind(sequence: string, command: string): void
  unbind(sequence: string): void
  handleKeyEvent(event: KeyboardEvent): void
  // ... other keybinding methods
}
```

### Plugin System

```typescript
interface StudioPlugin {
  name: string
  version: string
  dependencies?: string[]
  setup: (studio: Studio) => Promise<void> | void
}

interface PluginContext extends Studio {
  // Plugin-specific utilities
  logger: Logger
  storage: Storage
}
```

## Alternatives Considered

### Alternative 1: Enhance Individual Packages
- Pros: Less coordination, smaller scope
- Cons: Continued duplication, no unified API
- Rejected due to maintenance overhead

### Alternative 2: New Framework from Scratch
- Pros: Clean slate, modern architecture
- Cons: Migration cost, lost existing functionality
- Rejected due to timeline constraints

## Implementation Strategy

### Phase 1: Core Integration (Week 1-2)
1. Create Studio class
   - [ ] Basic initialization
   - [ ] Plugin system
   - [ ] Event system
2. Port Workspace Manager
   - [ ] Integrate layout-tree
   - [ ] Add panel management
3. Integrate Runekeeper
   - [ ] Create keybinding manager
   - [ ] Port existing bindings

### Phase 2: Command System (Week 2-3)
1. Command Registry
   - [ ] Command registration
   - [ ] Execution pipeline
   - [ ] Type-safe commands
2. Command Palette
   - [ ] Search interface
   - [ ] Keyboard navigation
   - [ ] Command preview

### Phase 3: UI Components (Week 3-4)
1. Container Component
   - [ ] Layout management
   - [ ] Panel system
2. Widget System
   - [ ] Base widget class
   - [ ] Widget lifecycle
3. Theme Support
   - [ ] Theme provider
   - [ ] Default theme

### Phase 4: Documentation & Testing (Week 4)
1. Documentation
   - [ ] API reference
   - [ ] Plugin guide
   - [ ] Migration guide
2. Testing
   - [ ] Unit tests
   - [ ] Integration tests
   - [ ] Example plugins

## Migration Guide

### Step 1: Install Package
```bash
npm install @usirin/studio
```

### Step 2: Update Code
```typescript
// Before
import { RunekeeperManager } from '@usirin/runekeeper'
import { WorkspaceManager } from './workspace'

// After
import { createStudio } from '@usirin/studio'

const studio = await createStudio({
  plugins: [myPlugin],
  layout: initialLayout,
  keybindings: {
    'ctrl+p': 'workspace.switchPanel',
    'ctrl+k': 'command.palette'
  }
})
```

## Additional Considerations

### Security
- Plugin sandboxing
- Command permissions
- Keyboard event handling

### Performance
- Lazy plugin loading
- Command debouncing
- Layout optimization

### Testing Strategy
1. Unit tests for core functionality
2. Integration tests for plugins
3. Performance benchmarks
4. UI component testing

## Open Questions
1. Plugin versioning strategy?
2. Cross-plugin communication?
3. State persistence?
4. Theme customization API?