# sixtysix Router - Technical Requirements

**Derived from**: [instructions.md](./instructions.md)  
**Status**: Phase 2 - Requirements Analysis  
**Target**: Effect-TS developers building complex frontend applications

## Overview

sixtysix is an Effect-TS native frontend router that leverages the full `Effect<ReactElement, E, R>` signature with React's `use` hook integration. This router treats routing as Effect computations with explicit error and dependency channels, integrated with Effect's built-in observability and ecosystem packages.

## Functional Requirements

### FR1: Core Router Functionality

#### FR1.1: Route Definition and Matching
- **Route Builder API**: Support `Router.empty.pipe(Router.route(path, handler))` pattern mirroring HttpServer
- **Path Patterns**: Support static paths (`/about`) and parameterized paths (`/users/:id`, `/org/:orgId/projects/:projectId`)
- **Parameter Extraction**: Extract route parameters and provide them to route handlers as typed objects
- **Route Resolution**: Match incoming URLs to registered routes and execute corresponding effects

#### FR1.2: Effect-Based Route Handlers
- **Full Effect Signature**: Route handlers return `Effect<ReactElement, E, R>` with typed error and dependency channels
- **Service Integration**: Routes can `yield*` from any Effect service in the runtime layer
- **Error Types**: Support typed errors (UnauthorizedError, NotFoundError, ValidationError, etc.)
- **Dependency Declaration**: Route types automatically declare service requirements for compile-time checking

#### FR1.3: Navigation Management
- **Programmatic Navigation**: Provide navigation functions for route changes within effects
- **History Integration**: Wrap browser history package with Effect patterns for functional navigation
- **Cancellation**: Automatically cancel previous route effects when starting new navigation
- **Browser Integration**: Support browser back/forward buttons and URL bar changes

### FR2: React Integration

#### FR2.1: React Hook Integration
- **use Hook Support**: Convert route effects to promises consumable by React's `use` hook
- **Suspense Integration**: Work with React's Suspense component for automatic loading states
- **ErrorBoundary Integration**: Route failures trigger React's ErrorBoundary with typed errors
- **Runtime Access**: Provide `useRuntime()` hook for accessing ManagedRuntime in components

#### FR2.2: Component Patterns
- **RouteRenderer Component**: Component that consumes route effects via `use` hook
- **Router Component**: Main router component that manages current route state
- **RuntimeProvider**: React context provider for ManagedRuntime access
- **Navigation Hooks**: Hooks for programmatic navigation from components

### FR3: Service Architecture

#### FR3.1: Service Definitions
- **UserService**: Authentication and user management with HTTP API integration
- **OrgService**: Organization membership with multi-level authorization logic
- **TaskService**: Complex authorization (org→project→task) with service composition
- **HistoryService**: Browser history wrapper with Effect patterns

#### FR3.2: Service Composition
- **Service Dependencies**: Services can depend on other services via dependencies array
- **Layer Composition**: Automatic layer composition in ManagedRuntime
- **Error Handling**: Typed error propagation through service boundaries
- **Caching**: Service-level caching with TTL and invalidation strategies

### FR4: Observability and Telemetry

#### FR4.1: Built-in Observability
- **Effect Tracing**: Use `Effect.withSpan()` for automatic route tracing with attributes
- **Metrics Collection**: Leverage `Effect.Metric` for counters, histograms, and gauges
- **Structured Logging**: Use Effect's structured logging with correlation IDs
- **Error Tracking**: Automatic error correlation with traces and spans

#### FR4.2: Zero-Config Telemetry
- **Automatic Timing**: Route execution duration tracking without custom code
- **Distributed Tracing**: Trace requests across service boundaries automatically
- **Request Correlation**: Correlate logs, metrics, and traces with request IDs
- **Performance Monitoring**: Built-in monitoring of route performance and errors

## Non-Functional Requirements

### NFR1: Performance

#### NFR1.1: Runtime Performance
- **Effect Overhead**: Minimize abstraction overhead compared to traditional React Router
- **Caching Strategy**: Implement service-level caching with automatic deduplication
- **Bundle Size**: Maintain reasonable bundle size despite additional abstractions
- **Route Resolution**: Fast route matching and parameter extraction

#### NFR1.2: Developer Experience
- **Type Safety**: Full TypeScript integration with compile-time error checking
- **Hot Reloading**: Support development workflow with hot module replacement
- **Error Messages**: Clear, actionable error messages for common mistakes
- **API Consistency**: Consistent patterns across all router APIs

### NFR2: Maintainability

#### NFR2.1: Code Quality
- **Separation of Concerns**: Clear separation between routing, business logic, and presentation
- **Composability**: All components should compose naturally with Effect patterns
- **Testability**: Easy testing with runtime layer swapping and service mocking
- **Documentation**: Comprehensive inline documentation and examples

#### NFR2.2: Architecture Quality
- **Effect-Native**: Leverage Effect patterns throughout, no imperative workarounds
- **Ecosystem Integration**: Use Effect ecosystem packages instead of custom solutions
- **Progressive Enhancement**: Support gradual adoption without full rewrites
- **Extensibility**: Allow custom extensions while maintaining core simplicity

### NFR3: Compatibility

#### NFR3.1: Technology Requirements
- **React Version**: Require React 18+ for `use` hook support
- **Effect Version**: Require Effect 3.9+ for Effect.Service API with dependencies
- **TypeScript**: Full TypeScript support with strict type checking
- **Build Tools**: Work with modern build tools (Vite, Webpack, etc.)

#### NFR3.2: Browser Support
- **Modern Browsers**: Support all browsers that support ES2020+ features
- **History API**: Depend on browser History API support
- **No Polyfills**: Avoid polyfills for modern browser features
- **Performance**: Maintain good performance across supported browsers

## Technical Constraints

### TC1: Architecture Constraints
- **Prototype Scope**: Build prototype within Phoenix service, no separate package initially
- **Build Process**: Always use production builds (`pnpm build`), no dev server dependency
- **Effect Ecosystem**: Use Effect ecosystem packages exclusively for cross-cutting concerns
- **Single Runtime**: Use one ManagedRuntime per application for service coordination

### TC2: Implementation Constraints
- **Service Pattern**: All services must use `Effect.Service<T>()("identifier", { effect, dependencies })` pattern
- **Error Types**: All errors must extend `Data.TaggedError` for type safety
- **History Package**: Use `history` npm package wrapped with Effect patterns
- **No Custom Middleware**: Use Effect's built-in observability instead of custom middleware

### TC3: Target Market Constraints
- **Effect Developers**: Target developers already familiar with Effect-TS patterns
- **Complex Applications**: Focus on applications with multiple services and complex authorization
- **Type Safety**: Prioritize compile-time safety over runtime flexibility
- **Functional Programming**: Assume functional programming knowledge and preferences

## Dependencies

### D1: Core Dependencies
- **effect**: Core Effect-TS library (3.9+)
- **@effect/platform**: Platform abstractions for HTTP, etc.
- **history**: Browser history management (wrapped with Effect)
- **react**: React library (18+) for `use` hook support
- **react-dom**: React DOM rendering

### D2: Development Dependencies
- **@types/react**: TypeScript definitions for React
- **@types/history**: TypeScript definitions for history package
- **typescript**: TypeScript compiler with strict configuration
- **build tools**: Modern bundler (Vite, Webpack, etc.)

### D3: Optional Dependencies
- **@effect/opentelemetry**: OpenTelemetry integration for production observability
- **testing libraries**: Effect testing utilities and React testing libraries
- **development tools**: Effect language service, debugging tools

## Success Criteria

### SC1: API Clarity
- Effect developers can understand and use the router without extensive documentation
- Route definitions feel natural to developers familiar with HttpServer patterns
- Type errors provide clear guidance on fixing service dependency issues
- Examples demonstrate real-world patterns effectively

### SC2: Code Reduction
- Route components have 50%+ less boilerplate compared to React Router equivalents
- Service composition eliminates manual dependency injection code
- Error handling requires no manual try/catch or error state management
- Loading states are automatic with React Suspense integration

### SC3: Service Integration
- Routes naturally compose with mock services via ManagedRuntime layer swapping
- Complex authorization scenarios work with typed error channels
- Service caching and deduplication work automatically without configuration
- Multi-service coordination in routes is clean and readable

### SC4: Observability
- All async operations have proper error boundaries without manual setup
- Route dependencies and errors are compile-time checked
- Built-in telemetry works without configuration (timing, tracing, metrics)
- Error correlation and distributed tracing work across service boundaries

### SC5: React Integration
- Feels like natural React patterns (Suspense, ErrorBoundary, hooks)
- No custom loading/error machinery needed beyond React standards
- Component testing works with standard React testing tools
- Hot reloading and development workflow feel familiar to React developers

## Acceptance Criteria Summary

All functional requirements (FR1-FR4) must be implemented to basic level for prototype completion. Non-functional requirements (NFR1-NFR3) must be validated through testing and real-world usage scenarios. Technical constraints (TC1-TC3) are mandatory design constraints that cannot be violated. Dependencies (D1-D3) define the exact package requirements and versions. Success criteria (SC1-SC5) define the quality gates for considering the prototype successful.

## Traceability

- **Instructions Reference**: All requirements derived from [instructions.md](./instructions.md) user stories and acceptance criteria
- **Real-World Scenarios**: Complex authorization, dashboard coordination, and form mutations scenarios inform functional requirements
- **Effect Ecosystem**: Technical architecture and built-in observability examples inform technical constraints
- **Target Market**: Effect developer focus and complex application needs inform non-functional requirements
