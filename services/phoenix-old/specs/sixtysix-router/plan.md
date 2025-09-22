# Implementation Plan: sixtysix Router

**Feature**: Effect-TS based frontend router with ManagedRuntime + React integration  
**Status**: Ready for Implementation  
**Target**: Phoenix service prototype  

---

## Overview

Building a production-ready Effect-native router as a proof-of-concept within the Phoenix service. This router will showcase the power of Effect-TS in frontend applications and serve as the foundation for the `sixtysix` npm package.

**Core Innovation**: `Effect<ReactElement, E, R>` route handlers with full Effect ecosystem integration.

---

## Phase 1: Foundation Setup

### 1.1 Dependencies & Package Configuration

**Goal**: Set up Phoenix service with Effect ecosystem dependencies

**Tasks**:
- Remove `react-router` dependencies from Phoenix
- Add Effect ecosystem packages (`effect`, `@effect/platform`, `history`)
- Configure TypeScript for Effect patterns
- Update build configuration for production builds

**Files Modified**:
- `services/phoenix/package.json` - Remove react-router, add Effect deps
- `services/phoenix/tsconfig.json` - Ensure Effect-compatible config

**Acceptance Criteria**:
- ✅ No React Router dependencies remaining
- ✅ All Effect packages installed and working
- ✅ TypeScript compilation succeeds with Effect imports
- ✅ Production build generates clean output

---

## Phase 2: Core Router Implementation

### 2.1 RouterService Implementation

**Goal**: Implement the core RouterService with full Effect integration

**Tasks**:
- Create RouterService as Effect.Service
- Implement route registry with `Ref`
- Add current route state with `SubscriptionRef`
- Implement route matching with path-to-regexp
- Add navigation methods with history integration
- Include built-in observability with `Effect.withSpan`

**Files Created**:
- `services/phoenix/src/router/RouterService.ts` - Core router service
- `services/phoenix/src/router/types.ts` - Type definitions
- `services/phoenix/src/router/matching.ts` - Route matching utilities

**Acceptance Criteria**:
- ✅ RouterService compiles without errors
- ✅ Route registration works dynamically
- ✅ URL matching extracts parameters correctly
- ✅ Navigation updates browser history
- ✅ Current route state is reactive

### 2.2 HistoryService Implementation

**Goal**: Wrap browser history API in Effect service

**Tasks**:
- Create HistoryService as Effect.Service
- Wrap createBrowserHistory from history package
- Implement navigation methods (`push`, `replace`)
- Add history listening capabilities
- Ensure proper resource cleanup

**Files Created**:
- `services/phoenix/src/router/HistoryService.ts` - History wrapper service

**Acceptance Criteria**:
- ✅ History service wraps all needed browser history functions
- ✅ Navigation methods work correctly
- ✅ History listeners can be attached/detached
- ✅ Service integrates cleanly with RouterService

---

## Phase 3: React Integration Layer

### 3.1 Runtime Provider & Hooks

**Goal**: Bridge Effect runtime with React components

**Tasks**:
- Create RuntimeProvider for Effect runtime access
- Implement useRuntime hook for runtime access
- Create useService hook for service dependency injection
- Implement useSubscriptionRef for reactive state consumption
- Add proper TypeScript definitions

**Files Created**:
- `services/phoenix/src/runtime/RuntimeProvider.tsx` - Runtime context
- `services/phoenix/src/runtime/hooks.ts` - React-Effect bridge hooks

**Acceptance Criteria**:
- ✅ RuntimeProvider manages ManagedRuntime lifecycle
- ✅ useRuntime provides type-safe runtime access
- ✅ useService enables dependency injection in React
- ✅ useSubscriptionRef provides reactive state updates

### 3.2 RouterComponent Implementation

**Goal**: Create the main router component that renders matched routes

**Tasks**:
- Implement RouterComponent using RouterService
- Add RouteRenderer for Effect → React element conversion
- Integrate with React Suspense for loading states
- Add ErrorBoundary integration for error handling
- Include initialization and cleanup logic

**Files Created**:
- `services/phoenix/src/router/RouterComponent.tsx` - Main router component
- `services/phoenix/src/router/RouteRenderer.tsx` - Effect-to-React bridge

**Acceptance Criteria**:
- ✅ RouterComponent renders current route correctly
- ✅ Route changes update UI immediately
- ✅ Loading states handled by Suspense
- ✅ Errors caught by ErrorBoundary
- ✅ Router initializes on mount, cleans up on unmount

---

## Phase 4: Application Runtime & Services

### 4.1 Application Runtime Setup

**Goal**: Create ManagedRuntime with all required services

**Tasks**:
- Define AppRuntime with service layer composition
- Include Effect observability layers (logging, tracing, metrics)
- Add HTTP client layer for API services
- Configure service dependencies correctly
- Ensure proper error handling and resource cleanup

**Files Created**:
- `services/phoenix/src/runtime/AppRuntime.ts` - Application runtime configuration

**Acceptance Criteria**:
- ✅ ManagedRuntime includes all required services
- ✅ Service dependencies resolve correctly
- ✅ Built-in observability is enabled
- ✅ Runtime starts and stops cleanly

### 4.2 Example Services Implementation

**Goal**: Create realistic example services to demonstrate router capabilities

**Tasks**:
- Implement UserService with authentication patterns
- Create OrgService with authorization logic
- Add TaskService with complex service dependencies
- Include proper error types with Data.TaggedError
- Add service-level caching and observability

**Files Created**:
- `services/phoenix/src/services/UserService.ts` - User management
- `services/phoenix/src/services/OrgService.ts` - Organization operations
- `services/phoenix/src/services/TaskService.ts` - Task management
- `services/phoenix/src/services/errors.ts` - Shared error types

**Acceptance Criteria**:
- ✅ Services demonstrate realistic dependency patterns
- ✅ Error handling uses typed errors throughout
- ✅ Service composition works in route handlers
- ✅ Services include proper observability spans

---

## Phase 5: Route Implementation & Testing

### 5.1 Example Routes Implementation

**Goal**: Create comprehensive example routes showcasing router capabilities

**Tasks**:
- Implement homepage route (simple case)
- Create user profile route with parameter extraction
- Add dashboard route with multiple service dependencies
- Include task detail route with complex authorization
- Add 404/error routes for edge cases

**Files Created**:
- `services/phoenix/src/routes/HomeRoute.tsx` - Simple route example
- `services/phoenix/src/routes/UserRoute.tsx` - Parameterized route
- `services/phoenix/src/routes/DashboardRoute.tsx` - Complex service usage
- `services/phoenix/src/routes/TaskRoute.tsx` - Authorization patterns
- `services/phoenix/src/routes/ErrorRoutes.tsx` - Error handling

**Acceptance Criteria**:
- ✅ All routes compile and render correctly
- ✅ Route parameters extracted and typed properly
- ✅ Service dependencies resolved in route handlers
- ✅ Error states handled gracefully
- ✅ Loading states work with Suspense

### 5.2 Route Configuration

**Goal**: Configure router with all example routes

**Tasks**:
- Create router configuration function
- Register all routes with proper paths
- Set up router initialization
- Add route-level code splitting (lazy loading)
- Include route-level observability

**Files Created**:
- `services/phoenix/src/routes/router.ts` - Router configuration
- `services/phoenix/src/routes/lazy.ts` - Lazy loading utilities

**Acceptance Criteria**:
- ✅ Router configuration is clean and maintainable
- ✅ All routes registered with correct paths
- ✅ Lazy loading works for code splitting
- ✅ Router initialization completes successfully

---

## Phase 6: Application Integration

### 6.1 Main Application Update

**Goal**: Replace React Router with sixtysix router in Phoenix frontend

**Tasks**:
- Remove all React Router usage from frontend.tsx
- Integrate RouterComponent with RuntimeProvider
- Set up proper error boundaries and suspense
- Add router configuration and initialization
- Update navigation patterns throughout app

**Files Modified**:
- `services/phoenix/src/frontend.tsx` - Main app entry point
- Remove React Router imports and usage
- Add sixtysix router integration

**Acceptance Criteria**:
- ✅ No React Router code remaining
- ✅ Application starts successfully with new router
- ✅ Navigation works correctly
- ✅ All routes render as expected
- ✅ Error handling works end-to-end

### 6.2 Build & Development Setup

**Goal**: Ensure development and production builds work correctly

**Tasks**:
- Verify production build configuration
- Test development server functionality
- Ensure hot module reloading works
- Check bundle size and optimization
- Validate runtime performance

**Files Modified**:
- Build configuration may need updates for Effect
- Development server configuration

**Acceptance Criteria**:
- ✅ Production builds generate optimized bundles
- ✅ Development server starts and works correctly
- ✅ Hot reloading works with router changes
- ✅ Bundle size is reasonable
- ✅ Runtime performance is acceptable

---

## Phase 7: Documentation & Polish

### 7.1 Code Examples & Documentation

**Goal**: Create clear examples showing router usage patterns

**Tasks**:
- Add inline code comments explaining patterns
- Create README with usage examples
- Document service patterns and best practices
- Include performance considerations
- Add troubleshooting guide

**Files Created**:
- `services/phoenix/src/router/README.md` - Router documentation
- Inline comments throughout codebase

**Acceptance Criteria**:
- ✅ Code is well-documented with clear examples
- ✅ README explains core concepts and usage
- ✅ Service patterns are documented
- ✅ Performance guidelines included

### 7.2 Testing Framework Setup

**Goal**: Establish testing patterns for Effect-based router

**Tasks**:
- Set up testing framework for Effect services
- Create example service tests with Layer swapping
- Add router component tests
- Include integration tests for full routing flow
- Document testing patterns

**Files Created**:
- `services/phoenix/src/router/__tests__/` - Test directory structure
- Example tests for services and components

**Acceptance Criteria**:
- ✅ Testing framework configured for Effect
- ✅ Service tests use proper Layer mocking
- ✅ Component tests work with RuntimeProvider
- ✅ Integration tests cover full routing scenarios

---

## Implementation Timeline

### Sprint 1 (Foundation)
- **Days 1-2**: Dependencies & package setup (Phase 1)
- **Days 3-5**: Core RouterService implementation (Phase 2.1)
- **Day 6**: HistoryService implementation (Phase 2.2)

### Sprint 2 (React Integration)  
- **Days 7-8**: Runtime provider & hooks (Phase 3.1)
- **Days 9-10**: RouterComponent implementation (Phase 3.2)
- **Day 11**: Application runtime setup (Phase 4.1)

### Sprint 3 (Services & Routes)
- **Days 12-13**: Example services (Phase 4.2)
- **Days 14-15**: Route implementation (Phase 5.1)
- **Day 16**: Route configuration (Phase 5.2)

### Sprint 4 (Integration & Polish)
- **Days 17-18**: Application integration (Phase 6.1)
- **Day 19**: Build & development setup (Phase 6.2)
- **Day 20**: Documentation & testing (Phase 7)

**Total Estimated Time**: 4 weeks (20 working days)

---

## Success Metrics

### Technical Metrics
- ✅ Zero React Router dependencies remaining
- ✅ All TypeScript compilation errors resolved
- ✅ Production bundle builds successfully
- ✅ Router handles all navigation scenarios
- ✅ Effect services integrate seamlessly

### Developer Experience Metrics
- ✅ Route definition is intuitive and type-safe
- ✅ Service dependency injection works transparently
- ✅ Error handling is predictable and debuggable
- ✅ Performance is comparable to React Router
- ✅ Development experience is smooth

### Architecture Metrics
- ✅ Router follows Effect ecosystem patterns
- ✅ Service composition is clean and maintainable
- ✅ React integration feels natural
- ✅ Observability provides useful insights
- ✅ Testing is straightforward with Layer swapping

---

## Risk Mitigation

### Technical Risks
- **Effect learning curve**: Mitigated by starting with simple patterns and building complexity gradually
- **React integration complexity**: Addressed through clean abstraction layers and hooks
- **Performance concerns**: Managed through careful Effect usage and production testing
- **Bundle size**: Monitored through build analysis and tree-shaking verification

### Timeline Risks
- **Scope creep**: Controlled by focusing on core functionality first
- **Debugging complexity**: Reduced through comprehensive logging and tracing
- **Integration issues**: Minimized by incremental integration approach

---

## Next Steps

Once this plan is approved:

1. **Start Phase 1** with dependency setup and package configuration
2. **Follow sprint structure** with regular check-ins after each phase
3. **Track progress** against acceptance criteria for each task
4. **Document learnings** throughout implementation for future sixtysix package
5. **Gather feedback** early and often to refine the approach

**Ready to begin implementation!** 🚀

The foundation is solid, the architecture is Effect-native, and the plan is comprehensive. Let's build the future of Effect-TS frontend routing!
