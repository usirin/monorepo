# sixtysix Router - Technical Design

**Derived from**: [requirements.md](./requirements.md)  
**Status**: Phase 3 - Technical Design  
**Target**: Implementation roadmap for Effect-TS native frontend router

## Architecture Overview

sixtysix implements a layered architecture that bridges Effect's functional runtime with React's component system. The design leverages Effect's built-in observability, service composition, and error handling while providing natural React integration patterns.

```
┌─────────────────────────────────────────────────────────────┐
│                    React Component Layer                    │
├─────────────────────────────────────────────────────────────┤
│  Router │ RouteRenderer │ RuntimeProvider │ Navigation Hooks │
├─────────────────────────────────────────────────────────────┤
│                    Effect Integration Layer                  │
├─────────────────────────────────────────────────────────────┤
│     ManagedRuntime      │        React Context Bridge        │
├─────────────────────────────────────────────────────────────┤
│                      Service Layer                          │
├─────────────────────────────────────────────────────────────┤
│ RouterService │ HistoryService │ UserService │ OrgService    │
├─────────────────────────────────────────────────────────────┤
│                    Effect Runtime Core                      │
├─────────────────────────────────────────────────────────────┤
│   Logger.structured │ Tracer.live │ Metric.live │ HttpClient │
└─────────────────────────────────────────────────────────────┘
```

## Core Design Patterns

### Pattern 1: Effect<ReactElement, E, R> as Route Handler

**Problem**: Traditional routers separate route matching from data loading, leading to scattered loading/error logic.

**Solution**: Route handlers return `Effect<ReactElement, E, R>` where the effect embodies both data loading and UI rendering.

```typescript
// Design Pattern: Route as Effect Computation
type RouteHandler<Params> = (params: Params) => Effect<ReactElement, RouteError, Services>

// Implementation Strategy
const createRoute = <P, E, R>(
  pattern: string,
  handler: (params: P) => Effect<ReactElement, E, R>
) => ({
  pattern,
  handler,
  // Type signature captures service dependencies and error types
  dependencies: extractServiceDependencies<R>(),
  errorTypes: extractErrorTypes<E>()
})
```

**Benefits**:
- Compile-time dependency tracking
- Typed error propagation
- Automatic service injection
- Composable with Effect combinators

### Pattern 2: ManagedRuntime as Service Container

**Problem**: Frontend applications need centralized service lifecycle management and dependency injection.

**Solution**: Single ManagedRuntime manages all services with proper initialization order and cleanup.

```typescript
// Design Pattern: Centralized Service Management
const AppRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    // Infrastructure services
    HttpApi.client.layer,
    Effect.Logger.structured,
    Effect.Tracer.live,
    Effect.Metric.live,
    
    // Browser services
    HistoryService.Default,
    
    // Business services (with dependency order)
    UserService.Default,      // No dependencies
    OrgService.Default,       // Depends on UserService
    TaskService.Default,      // Depends on OrgService
    
    // Router service (depends on all above)
    RouterService.Default
  )
)
```

**Benefits**:
- Automatic dependency resolution
- Service lifecycle management
- Layer composition for testing
- Runtime resource cleanup

### Pattern 3: React Context Bridge for Runtime Access

**Problem**: React components need access to Effect runtime without prop drilling.

**Solution**: React Context provides runtime access while maintaining Effect patterns.

```typescript
// Design Pattern: Runtime Context Bridge
const RuntimeContext = createContext<ManagedRuntime<AppServices> | null>(null)

export const RuntimeProvider = ({ runtime, children }) => (
  <RuntimeContext.Provider value={runtime}>
    {children}
  </RuntimeContext.Provider>
)

export const useRuntime = () => {
  const runtime = useContext(RuntimeContext)
  if (!runtime) throw new Error("useRuntime must be used within RuntimeProvider")
  return runtime
}

// Bridge Effect to React Suspense
export const useEffect = <A, E, R>(effect: Effect<A, E, R>): A => {
  const runtime = useRuntime()
  return use(runtime.runPromise(effect))
}
```

**Benefits**:
- Type-safe runtime access
- Automatic error propagation
- Suspense integration
- Testing flexibility

### Pattern 4: Built-in Observability Integration

**Problem**: Custom middleware creates complexity and maintenance overhead.

**Solution**: Leverage Effect's built-in observability for automatic telemetry.

```typescript
// Design Pattern: Zero-Config Observability
const instrumentedRoute = <P, E, R>(
  name: string,
  handler: (params: P) => Effect<ReactElement, E, R>
) => (params: P) =>
  handler(params).pipe(
    Effect.withSpan(name, { 
      attributes: { ...params, route: name }
    }),
    Effect.timed,
    Effect.tap(([duration]) => 
      Effect.Metric.histogram("route_duration_ms").update(duration.millis)
    ),
    Effect.map(([, result]) => result)
  )

// Automatic observability features:
// - Request timing and duration
// - Error tracking and correlation  
// - Distributed tracing across services
// - Metrics collection (counts, rates, percentiles)
// - Structured logging with correlation IDs
```

**Benefits**:
- Zero configuration required
- Industry-standard telemetry
- Automatic error correlation
- Performance monitoring

## Module Architecture

### Core Router Module

**File**: `src/router/Router.ts`

```typescript
// Router data structure - immutable route collection
export interface RouterData<Routes extends Record<string, RouteHandler<any>>> {
  readonly _tag: "RouterData"
  readonly routes: Routes
}

// Route handler type
export type RouteHandler<P> = (params: P) => Effect<ReactElement, any, any>

// Router as an Effect Service
export class RouterService extends Effect.Service<RouterService>()("sixtysix/RouterService", {
  effect: Effect.gen(function* () {
    const historyService = yield* HistoryService
    const currentRoute = yield* SubscriptionRef.make<MatchResult | null>(null)
    
    // Route registry - can be updated dynamically
    const routeRegistry = yield* Ref.make<Record<string, RouteHandler<any>>>({})
    
    const addRoute = <P, E, R>(
      path: string, 
      handler: (params: P) => Effect<ReactElement, E, R>
    ) => 
      Ref.update(routeRegistry, routes => ({ ...routes, [path]: handler }))
    
    const matchRoute = (url: string) =>
      Effect.gen(function* () {
        const routes = yield* Ref.get(routeRegistry)
        
        // Path-to-regexp based matching with parameter extraction
        for (const [pattern, handler] of Object.entries(routes)) {
          const match = matchPath(pattern, url)
          if (match) {
            return {
              handler,
              params: match.params,
              query: new URLSearchParams(new URL(url, window.location.origin).search)
            } as MatchResult
          }
        }
        return null
      })
    
    const navigate = (path: string) =>
      Effect.gen(function* () {
        yield* historyService.push(path)
        const matchResult = yield* matchRoute(path)
        yield* SubscriptionRef.set(currentRoute, matchResult)
      }).pipe(
        Effect.withSpan("router.navigate", { attributes: { path } })
      )
    
    const getCurrentRoute = () => SubscriptionRef.get(currentRoute)
    
    // Initialize current route from URL
    const initialize = Effect.gen(function* () {
      const matchResult = yield* matchRoute(window.location.pathname)
      yield* SubscriptionRef.set(currentRoute, matchResult)
      
      // Listen for browser navigation
      yield* historyService.listen((location) => {
        const updateRoute = Effect.gen(function* () {
          const match = yield* matchRoute(location.pathname)
          yield* SubscriptionRef.set(currentRoute, match)
        })
        // Run the update effect
        yield* updateRoute
      })
    })
    
    return {
      addRoute,
      matchRoute,
      navigate,
      getCurrentRoute,
      currentRoute,
      initialize
    } as const
  }),
  dependencies: [HistoryService.Default]
}) {}

// Route matching result
interface MatchResult<P = any> {
  handler: RouteHandler<P>
  params: P
  query: URLSearchParams
}

// Router configuration using the service
const configureRouter = Effect.gen(function* () {
  const router = yield* RouterService
  
  yield* router.addRoute("/", () => Effect.succeed(<HomePage />))
  yield* router.addRoute("/users/:id", ({ id }) => 
    Effect.gen(function*() {
      const userService = yield* UserService
      const user = yield* userService.getById(id)
      return <UserProfile user={user} />
    })
  )
  
  // Initialize the router
  yield* router.initialize()
  
  return router
})
```

**Design Decisions**:
- **Router as Service**: Router is a proper Effect.Service with dependencies and lifecycle
- **Dependency injection**: Router depends on HistoryService, managed by Effect runtime
- **Reactive state**: Uses SubscriptionRef for current route state
- **Dynamic routes**: Routes can be added/modified at runtime via service methods
- **Integrated navigation**: Navigation logic is part of the router service
- **Testable**: Service can be mocked/swapped in tests via Layer composition
- **Observable**: Built-in tracing and metrics via Effect.withSpan

### Service Layer Design

**File**: `src/services/HistoryService.ts`

```typescript
// History service wrapping browser history with Effect patterns
export class HistoryService extends Effect.Service<HistoryService>()("sixtysix/HistoryService", {
  effect: Effect.gen(function* () {
    const history = createBrowserHistory()
    
    // Wrap all history operations as Effects
    const push = (path: string) =>
      Effect.sync(() => history.push(path)).pipe(
        Effect.withSpan("history.push", { attributes: { path } })
      )
    
    const replace = (path: string) =>
      Effect.sync(() => history.replace(path)).pipe(
        Effect.withSpan("history.replace", { attributes: { path } })
      )
    
    const listen = (listener: HistoryListener) =>
      Effect.sync(() => {
        const unlisten = history.listen(listener)
        return () => unlisten()
      })
    
    return { history, push, replace, listen } as const
  })
}) {}

// RouterService is defined above in the Core Router Module section
```

**Design Decisions**:
- Single RouterService handles all routing concerns
- Service composition through dependencies array  
- Built-in observability with Effect.withSpan
- Immutable state management with SubscriptionRef
- Functional wrapping of imperative history API

### React Integration Layer

**File**: `src/components/RouterComponent.tsx`

```typescript
// Main Router component - much simpler now!
export const RouterComponent = () => {
  const routerService = useService(RouterService)
  const currentRoute = useSubscriptionRef(routerService.currentRoute)
  
  // Router service handles all the navigation logic internally
  useEffect(() => {
    // Router initialization is handled by the service itself
    const runtime = useRuntime()
    runtime.runPromise(routerService.initialize())
  }, [])
  
  if (!currentRoute) {
    return <NotFoundPage />
  }
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ErrorBoundary fallback={ErrorPage}>
        <RouteRenderer effect={currentRoute.handler(currentRoute.params)} />
      </ErrorBoundary>
    </Suspense>
  )
}

// RouteRenderer bridges Effect to React Suspense
export const RouteRenderer = ({ effect }: { effect: Effect<ReactElement, any, any> }) => {
  const runtime = useRuntime()
  const element = use(runtime.runPromise(effect))
  return element
}
```

**Design Decisions**:
- Separation of router logic from React rendering
- Standard React patterns (Suspense, ErrorBoundary)
- Effect execution isolated in RouteRenderer
- Browser navigation handled through HistoryService

## Error Handling Design

### Typed Error Propagation

```typescript
// Error type hierarchy for router-specific errors
export class RouteNotFoundError extends Data.TaggedError("RouteNotFoundError")<{
  path: string
}> {}

export class UnauthorizedError extends Data.TaggedError("UnauthorizedError")<{
  resource: string
  userId: string
}> {}

export class ValidationError extends Data.TaggedError("ValidationError")<{
  field: string
  message: string
}> {}

// Error boundary handles typed errors with context
export const ErrorBoundary = ({ fallback, children }) => {
  return (
    <ReactErrorBoundary
      fallback={({ error, params, resetError }) => {
        if (error._tag === "RouteNotFoundError") {
          return <NotFoundPage path={error.path} />
        }
        if (error._tag === "UnauthorizedError") {
          return <LoginPage returnTo={window.location.pathname} />
        }
        if (error._tag === "ValidationError") {
          return <ValidationErrorPage field={error.field} message={error.message} />
        }
        return <GenericErrorPage error={error} onRetry={resetError} />
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}
```

**Design Decisions**:
- Tagged error types for discriminated union handling
- Error boundary provides error context to fallback components
- Automatic error correlation through Effect's tracing
- Recovery actions integrated with error display

## Performance Considerations

### Caching Strategy

```typescript
// Service-level caching with automatic invalidation
export class UserService extends Effect.Service<UserService>()("sixtysix/UserService", {
  effect: Effect.gen(function* () {
    const http = yield* HttpApi.client.Client
    
    const getById = (id: string) =>
      http.get(`/api/users/${id}`).pipe(
        Effect.cached({ ttl: 300000 }), // 5 minute cache
        Effect.withSpan("user.getById", { attributes: { userId: id } })
      )
    
    return { getById } as const
  })
})

// Request deduplication across route boundaries
const getUserEffect = (id: string) =>
  UserService.getById(id).pipe(
    Effect.cached({ 
      ttl: 60000,
      keyBy: (id) => `user:${id}`
    })
  )
```

**Design Decisions**:
- Service-level caching prevents duplicate requests
- TTL-based invalidation with reasonable defaults
- Request deduplication through Effect's caching
- Cache keys derived from request parameters

### Bundle Optimization

```typescript
// Route-level code splitting with dynamic imports
export const createLazyRoute = <P>(
  loader: () => Promise<{ default: (params: P) => Effect<ReactElement, any, any> }>
) => (params: P) =>
  Effect.promise(() => loader()).pipe(
    Effect.map(module => module.default(params)),
    Effect.flatten
  )

// Usage with dynamic imports
const configureRouter = Effect.gen(function* () {
  const router = yield* RouterService
  
  yield* router.addRoute("/", () => Effect.succeed(<HomePage />))
  yield* router.addRoute("/admin", createLazyRoute(() => import("./routes/AdminRoute")))
  yield* router.addRoute("/dashboard", createLazyRoute(() => import("./routes/DashboardRoute")))
  
  yield* router.initialize()
  return router
})
```

**Design Decisions**:
- Lazy loading through dynamic imports
- Effect-wrapped code splitting for consistency
- Route-level granularity for optimal loading
- Automatic loading states through Suspense

## Testing Strategy

### Service Testing with Layer Composition

```typescript
// Mock services through layer composition
const MockUserService = Layer.succeed(UserService, {
  getById: (id: string) => 
    Effect.succeed({ id, name: `User ${id}`, email: `user${id}@example.com` })
})

const TestRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    MockUserService,
    MockOrgService,
    RouterService.Default,
    HistoryService.Default
  )
)

// Route testing with mock runtime
test("user route loads user data", async () => {
  const userRoute = routes["/users/:id"]
  const result = await TestRuntime.runPromise(
    userRoute({ id: "123" })
  )
  
  expect(result.type).toBe("UserProfile")
  expect(result.props.user.id).toBe("123")
})
```

**Design Decisions**:
- Layer composition enables surgical service mocking
- Test runtime mirrors production runtime structure
- Route effects testable in isolation
- Mock services provide predictable test data

### Component Testing Integration

```typescript
// Testing router components with mock runtime
const renderWithRuntime = (component: ReactElement, runtime = TestRuntime) => {
  return render(
    <RuntimeProvider runtime={runtime}>
      {component}
    </RuntimeProvider>
  )
}

test("RouterComponent renders route components", async () => {
  const { getByText } = renderWithRuntime(
    <RouterComponent router={testRouter} />
  )
  
  await waitFor(() => {
    expect(getByText("User Profile")).toBeInTheDocument()
  })
})
```

**Design Decisions**:
- Test utilities provide runtime setup
- Component testing uses standard React testing patterns
- Async rendering handled through waitFor
- Mock runtime provides predictable behavior

## Implementation Phases

### Phase 1: Core Router Infrastructure
1. **Router builder API** with type-safe route registration
2. **Route matching engine** with parameter extraction
3. **ManagedRuntime setup** with basic service composition
4. **React integration** with RouteRenderer and Router components

### Phase 2: Service Layer
1. **HistoryService** wrapping browser history with Effect patterns
2. **RouterService** managing URL state and navigation
3. **Service composition** with dependency injection
4. **Error handling** with typed error propagation

### Phase 3: Business Services
1. **UserService** with authentication and user management
2. **OrgService** with organization membership logic
3. **TaskService** with complex authorization scenarios
4. **Service integration** across all business logic

### Phase 4: Observability and Polish
1. **Built-in telemetry** with Effect.withSpan integration
2. **Metrics collection** with counters and histograms
3. **Performance optimization** with caching and deduplication
4. **Developer experience** with error messages and debugging

## Risk Mitigation

### Technical Risks

**Risk**: Effect abstraction overhead impacts performance
**Mitigation**: Benchmark against React Router, optimize hot paths, use Effect's performance tools

**Risk**: React ecosystem compatibility issues
**Mitigation**: Test with major React libraries, provide adapter patterns, document limitations

**Risk**: Learning curve for Effect patterns
**Mitigation**: Comprehensive examples, migration guides, progressive enhancement strategy

### Implementation Risks

**Risk**: Complex service dependencies cause circular references
**Mitigation**: Clear dependency order, layer composition validation, dependency graph visualization

**Risk**: Error handling becomes overly complex
**Mitigation**: Start with simple error types, add complexity incrementally, focus on common cases

**Risk**: Testing strategy doesn't scale
**Mitigation**: Establish testing patterns early, automate test runtime setup, document testing approaches

## Success Metrics

### Technical Metrics
- **Bundle Size**: < 50kb additional overhead compared to React Router
- **Performance**: < 10% overhead for route resolution and rendering
- **Type Safety**: 100% TypeScript coverage with strict configuration
- **Test Coverage**: > 90% coverage for core router functionality

### Developer Experience Metrics  
- **API Consistency**: All APIs follow Effect patterns consistently
- **Error Messages**: Clear, actionable error messages for common mistakes
- **Documentation**: Complete examples for all major use cases
- **Migration**: Clear path from React Router with minimal changes

### Functional Metrics
- **Service Integration**: All services compose naturally with router
- **Error Handling**: All error scenarios handled with typed errors
- **Observability**: Built-in telemetry works without configuration
- **React Integration**: Standard React patterns work seamlessly

This design provides a comprehensive technical foundation for implementing sixtysix while maintaining Effect-TS principles and React ecosystem compatibility.
