# RFC 005: Design System Studio

## Summary
A specialized studio for crafting and maintaining design systems, combining code editor capabilities with visual tools and real-time preview.

## Core Widgets

### 1. Component Editor
```typescript
const ComponentEditorWidget = defineWidget({
  id: 'component-editor',
  initialState: {
    code: '',
    language: 'tsx',
    props: {}
  },
  streams: {
    output: {
      // Stream code changes
      codeChange: WritableStream<CodePatch>,
      // Stream prop changes
      propsChange: WritableStream<PropChange>
    }
  },
  ports: {
    input: {
      // Update from prop inspector
      updateProps: (state, props: Record<string, any>) => {
        state.props = props
      },
      // Update from theme changes
      updateTheme: (state, tokens: ThemeTokens) => {
        // Update theme-related code
      }
    }
  }
})
```

### 2. Props Inspector

```typescript
const PropsInspectorWidget = defineWidget({
  id: 'props-inspector',
  initialState: {
    props: {},
    schema: ComponentSchema
  },
  streams: {
    output: {
      // Stream prop updates
      propUpdate: WritableStream<PropUpdate>
    }
  }
})
```

### 3. Theme Editor
```typescript
const ThemeEditorWidget = defineWidget({
  id: 'theme-editor',
  initialState: {
    tokens: {
      colors: {},
      typography: {},
      spacing: {},
      radii: {}
    }
  },
  streams: {
    output: {
      // Stream token changes
      tokenChange: WritableStream<TokenChange>
    }
  }
})
```

### 4. Component Preview
```typescript
const PreviewWidget = defineWidget({
  id: 'preview',
  initialState: {
    component: null,
    props: {},
    theme: {}
  },
  streams: {
    input: {
      // Receive code updates
      code: ReadableStream<CompiledComponent>,
      // Receive prop updates
      props: ReadableStream<PropUpdate>,
      // Receive theme updates
      theme: ReadableStream<ThemeUpdate>
    }
  }
})
```

### 5. Documentation Editor
```typescript
const DocsEditorWidget = defineWidget({
  id: 'docs',
  initialState: {
    content: '',
    metadata: {}
  },
  ports: {
    input: {
      // Update from component changes
      updateAPI: (state, api: ComponentAPI) => {
        state.metadata.api = api
      }
    }
  }
})
```

## Workspace Layouts

### Component Development Layout
```typescript
const componentLayout = defineLayout({
  root: createStack('horizontal', [
    // Left panel: Code + Props
    createStack('vertical', [
      createWindow('component-editor'),
      createWindow('props-inspector')
    ]),
    // Right panel: Preview + Docs
    createStack('vertical', [
      createWindow('preview'),
      createWindow('docs')
    ])
  ])
})
```

### Theme Development Layout
```typescript
const themeLayout = defineLayout({
  root: createStack('horizontal', [
    createWindow('theme-editor'),
    // Preview panel with component examples
    createStack('vertical', [
      createWindow('button-preview'),
      createWindow('typography-preview'),
      createWindow('color-preview')
    ])
  ])
})
```

## Features

1. **Real-time Preview**
   - Live component compilation
   - Instant prop updates
   - Theme hot-reloading

2. **Design Token Management**
   - Visual token editor
   - Token usage tracking
   - Theme version control

3. **Component Documentation**
   - Auto-generated API docs
   - Usage examples
   - Accessibility guidelines

4. **Code Generation**
   - TypeScript types
   - Prop interfaces
   - Theme type definitions

5. **Export Options**
   - npm package
   - Storybook integration
   - Documentation site

## Integration Examples

```typescript
// Connect component editor to preview
registry.pipe('component-editor', 'preview', {
  codeChange: {
    through: new TransformStream({
      async transform(code, controller) {
        const compiled = await compileComponent(code)
        controller.enqueue(compiled)
      }
    })
  }
})

// Connect theme editor to all previews
registry.broadcast('theme-editor', 'tokenChange', themeChannel)

// Connect props inspector to component editor
registry.connect('props-inspector', 'component-editor', {
  propUpdate: 'updateProps'
})
``` 