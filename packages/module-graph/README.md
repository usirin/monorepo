# @umut/module-graph

Build and analyze module graphs using the Oxc ecosystem.

## What?

Analyze the dependency structure of your JavaScript/TypeScript project:

```typescript
import { ModuleGraph } from '@umut/module-graph';

const graph = new ModuleGraph();
await graph.buildFromEntry('./src/index.ts');

// Get dependencies of a module
const deps = graph.getDependencies('./src/component.ts');
console.log(deps);
// ['./utils.ts', 'react', ...]

// Find modules importing a specific module
const importers = graph.getImporters('./src/utils.ts');
console.log(importers);
// ['./src/component.ts', './src/app.ts', ...]

// Get detailed info about a module
const info = graph.getModuleInfo('./src/api.ts');
console.log(info);
// { path: './src/api.ts', imports: [...], exports: [...], ... }
```

@umut/module-graph uses oxc-parser and oxc-resolver to build a module graph from your project. Supports CommonJS and ESM.

## API

### ModuleGraph

Main class for building and querying the module graph.

Methods:
- `buildFromEntry(entryFile: string): Promise<void>`
- `getDependencies(modulePath: string): string[]`
- `getImporters(modulePath: string): string[]`
- `getModuleInfo(modulePath: string): ModuleInfo | undefined`

### Types

```typescript
interface ModuleInfo {
  path: string;
  imports: Import[];
  exports: Export[];
  hasModuleSyntax: boolean;
  facade: boolean;
}

type Import = NamedImport | DefaultImport | NamespaceImport;
type Export = NamedExport | DefaultExport | AllExport;

// See source for detailed type definitions
```

## install

```
npm install @umut/module-graph
```

## license

MIT
