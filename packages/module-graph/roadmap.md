# @umut/module-graph Roadmap

## Overview

TypeScript library for building and analyzing module graphs using Oxc ecosystem.

## Milestones

1. **Setup**
   - [x] Project structure
   - [x] TypeScript config
   - [x] Define ModuleInfo interface
   - [x] Define ModuleGraph interface
   - [x] Install deps (oxc-resolver, oxc-parser)

2. **Core Implementation (TDD Approach)**
   - [ ] Implement ModuleGraph.buildFromEntry
     - [ ] Write failing test
     - [ ] Implement minimal passing code
     - [ ] Refactor and optimize
   - [ ] Implement ModuleGraph.getDependencies
     - [ ] Write failing test
     - [ ] Implement minimal passing code
     - [ ] Refactor and optimize
   - [ ] Implement ModuleGraph.getImporters
     - [ ] Write failing test
     - [ ] Implement minimal passing code
     - [ ] Refactor and optimize
   - [ ] Implement ModuleGraph.getModuleInfo
     - [ ] Write failing test
     - [ ] Implement minimal passing code
     - [ ] Refactor and optimize

3. **Integration and Advanced Features**
   - [ ] Integrate oxc-resolver for module resolution
   - [ ] Implement file reading functionality
   - [ ] Use oxc-parser's moduleLexerSync for import/export extraction
   - [ ] Develop graph building algorithm
   - [ ] Implement circular dependency detection
   - [ ] Add support for dynamic imports

4. **Testing**
   - [ ] Write integration tests with sample project structures
   - [ ] Implement test coverage reporting
   - [ ] Create benchmarks for performance testing

5. **Documentation**
   - [ ] Write JSDoc comments for all public methods and interfaces
   - [ ] Update README with detailed usage examples
   - [ ] Create API documentation

6. **Optimization**
   - [ ] Implement caching mechanism for parsed files
   - [ ] Optimize graph building algorithm

7. **Release Preparation**
   - [ ] Ensure all tests pass and coverage is satisfactory
   - [ ] Perform final documentation review
   - [ ] Prepare npm package configuration
   - [ ] Create a release plan and versioning strategy

## Next Steps

1. Start TDD for ModuleGraph.buildFromEntry
   - In test.ts, create a describe block for ModuleGraph
   - Write a failing test for buildFromEntry method
   - Implement minimal code in index.ts to make the test pass
   - Refactor if necessary

2. Continue with TDD for other ModuleGraph methods
   - Follow the same pattern: write failing test, implement minimal code, refactor
   - Proceed with getDependencies, getImporters, and getModuleInfo in this order

After completing these steps, we'll have a solid foundation with tested core functionality of the ModuleGraph class, ready for further implementation and integration with Oxc tools.
