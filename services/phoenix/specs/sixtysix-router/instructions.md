# sixtysix Router - Initial Requirements

## Feature Overview

Build a prototype of `sixtysix`, an Effect-TS native frontend router that leverages the full Effect signature `Effect<ReactElement, E, R>` with React's `use` hook integration. This router treats routing as Effect computations with explicit error and dependency channels, positioning it as the foundational router for the Effect-TS frontend ecosystem.

## Core Innovation

**Full Effect Signature**: Routes return `Effect<ReactElement, E, R>` where:
- `ReactElement` - The UI to render
- `E` - Typed error channel (AuthError, NotFoundError, NetworkError, etc.)
- `R` - Requirements channel declaring service dependencies

**React Integration**: Leverage React's `use` hook + ManagedRuntime for seamless Effect→Promise→Suspense integration.

## User Stories

### As a developer building Effect-TS applications, I want:

1. **Full Effect Semantics**: Route handlers that return `Effect<ReactElement, E, R>` with typed errors and explicit service dependencies
2. **Compile-time Dependencies**: Routes that declare service requirements in the type system for automatic dependency injection
3. **HttpServer-Like API**: A familiar `Router.empty.pipe(Router.route())` API that mirrors Effect's HttpServer patterns
4. **React-Native Integration**: Routes that work with React's Suspense/ErrorBoundary via the `use` hook - no custom loading/error machinery
5. **Service Orchestration**: Routes that can `yield*` from multiple services with automatic caching, deduplication, and error handling

### As a developer migrating from React Router, I want:

1. **Familiar React Patterns**: Routes that work with standard Suspense/ErrorBoundary instead of custom loading/error components
2. **Progressive Adoption**: Ability to prototype with sixtysix without rewriting my entire application  
3. **Better DX**: Elimination of useEffect/useState boilerplate for data loading in route components

## Real-World Scenarios Addressed

### Service Definitions (Real-World Examples)

```typescript
import { Effect, Data } from "effect"
import { HttpApi } from "@effect/platform"

// Error types
export class UnauthorizedError extends Data.TaggedError("UnauthorizedError")<{
  resource: string
  userId: string
}> {}

export class NotFoundError extends Data.TaggedError("NotFoundError")<{
  resource: string
  id: string
}> {}

export class ValidationError extends Data.TaggedError("ValidationError")<{
  field: string
  message: string
}> {}

// User Service
export class UserService extends Effect.Service<UserService>()("sixtysix/UserService", {
  effect: Effect.gen(function* () {
    const http = yield* HttpApi.client.Client
    
    const getCurrentUser = () =>
      http.get("/api/auth/me").pipe(
        Effect.mapError(() => new UnauthorizedError({ resource: "user", userId: "current" })),
        Effect.cached({ ttl: 300000 }) // 5 minute cache
      )
    
    const getById = (id: string) =>
      http.get(`/api/users/${id}`).pipe(
        Effect.mapError(() => new NotFoundError({ resource: "user", id })),
        Effect.cached({ ttl: 60000 }) // 1 minute cache
      )
    
    return { getCurrentUser, getById } as const
  }),
  dependencies: [HttpApi.client.layer]
}) {}

// Organization Service
export class OrgService extends Effect.Service<OrgService>()("sixtysix/OrgService", {
  effect: Effect.gen(function* () {
    const http = yield* HttpApi.client.Client
    const userService = yield* UserService
    
    const requireMembership = (orgId: string) =>
      Effect.gen(function* () {
        const currentUser = yield* userService.getCurrentUser()
        const membership = yield* http.get(`/api/orgs/${orgId}/members/${currentUser.id}`)
        
        if (!membership.active) {
          return yield* Effect.fail(
            new UnauthorizedError({ resource: "organization", userId: currentUser.id })
          )
        }
        
        return { orgId, role: membership.role, user: currentUser }
      })
    
    const isAdmin = (orgId: string, userId: string) =>
      http.get(`/api/orgs/${orgId}/members/${userId}`).pipe(
        Effect.map(membership => membership.role === "admin"),
        Effect.orElse(() => Effect.succeed(false))
      )
    
    return { requireMembership, isAdmin } as const
  }),
  dependencies: [HttpApi.client.layer, UserService.Default]
}) {}

// Task Service  
export class TaskService extends Effect.Service<TaskService>()("sixtysix/TaskService", {
  effect: Effect.gen(function* () {
    const http = yield* HttpApi.client.Client
    const orgService = yield* OrgService
    
    const get = (taskId: string) =>
      http.get(`/api/tasks/${taskId}`).pipe(
        Effect.mapError(() => new NotFoundError({ resource: "task", id: taskId }))
      )
    
    const requireAccess = (orgId: string, projectId: string, taskId: string) =>
      Effect.gen(function* () {
        const [membership, task] = yield* Effect.all([
          orgService.requireMembership(orgId),
          get(taskId)
        ])
        
        // Check if user has access to this project's tasks
        if (task.projectId !== projectId) {
          return yield* Effect.fail(
            new ValidationError({ field: "projectId", message: "Task does not belong to project" })
          )
        }
        
        return { task, membership }
      })
    
    const create = (projectId: string, data: TaskCreateData) =>
      http.post(`/api/projects/${projectId}/tasks`, { body: data }).pipe(
        Effect.mapError(() => new ValidationError({ field: "task", message: "Failed to create task" }))
      )
    
    return { get, requireAccess, create } as const
  }),
  dependencies: [HttpApi.client.layer, OrgService.Default]
}) {}
```

### Complex Authorization (Using Real Services)
```typescript
// Route with multi-level auth requirements using actual services
Router.route("/org/:orgId/projects/:projectId/tasks/:taskId", ({ orgId, projectId, taskId }) =>
  Effect.gen(function*() {
    const taskService = yield* TaskService
    const { task, membership } = yield* taskService.requireAccess(orgId, projectId, taskId)
    return <TaskDetail task={task} userRole={membership.role} />
  })
  // Type: Effect<ReactElement, UnauthorizedError | NotFoundError | ValidationError, TaskService>
)
```

### Dashboard Route (Multi-Service Coordination)
```typescript
// Analytics Service for dashboard
export class AnalyticsService extends Effect.Service<AnalyticsService>()("sixtysix/AnalyticsService", {
  effect: Effect.gen(function* () {
    const http = yield* HttpApi.client.Client
    
    const getOrgStats = (orgId: string) =>
      http.get(`/api/orgs/${orgId}/analytics`).pipe(
        Effect.cached({ ttl: 120000 }) // 2 minute cache for stats
      )
    
    const getRecentActivity = (orgId: string) =>
      http.get(`/api/orgs/${orgId}/activity?limit=10`)
    
    return { getOrgStats, getRecentActivity } as const
  }),
  dependencies: [HttpApi.client.layer]
}) {}

// Dashboard route coordinating multiple services
Router.route("/org/:orgId/dashboard", ({ orgId }) =>
  Effect.gen(function*() {
    const orgService = yield* OrgService
    const analyticsService = yield* AnalyticsService
    
    const [membership, stats, activity] = yield* Effect.all([
      orgService.requireMembership(orgId),
      analyticsService.getOrgStats(orgId),
      analyticsService.getRecentActivity(orgId)
    ])
    
    return <Dashboard 
      org={membership} 
      stats={stats} 
      activity={activity}
    />
  })
  // Type: Effect<ReactElement, UnauthorizedError, OrgService | AnalyticsService>
)
```

### Error Recovery with Typed Errors
```typescript
<ErrorBoundary fallback={({ error, params }) => {
  if (error._tag === "NotFoundError" && error.resource === "task") {
    return <TaskNotFoundPage projectId={params.projectId} suggestAlternatives />
  }
  if (error._tag === "UnauthorizedError") {
    return <LoginPage returnTo={window.location.pathname} />
  }
  if (error._tag === "ValidationError") {
    return <ValidationErrorPage field={error.field} message={error.message} />
  }
  return <GenericErrorPage error={error} />
}}>
  <Router />
</ErrorBoundary>
```

### Leveraging Effect's Built-in Observability
```typescript
// Use Effect's built-in observability instead of custom middleware
const router = Router.empty.pipe(
  Router.route("/", () => 
    Effect.succeed(<HomePage />).pipe(
      Effect.withSpan("route.home")
    )
  ),
  
  Router.route("/org/:orgId/dashboard", ({ orgId }) =>
    Effect.gen(function*() {
      const orgService = yield* OrgService
      const membership = yield* orgService.requireMembership(orgId)
      return <Dashboard org={membership} />
    }).pipe(
      Effect.withSpan("route.dashboard", { 
        attributes: { orgId, userId: "current" }
      })
    )
  ),
  
  Router.route("/org/:orgId/projects/:projectId/tasks/:taskId", ({ orgId, projectId, taskId }) =>
    Effect.gen(function*() {
      const taskService = yield* TaskService
      const { task, membership } = yield* taskService.requireAccess(orgId, projectId, taskId)
      return <TaskDetail task={task} userRole={membership.role} />
    }).pipe(
      Effect.withSpan("route.task-detail", { 
        attributes: { orgId, projectId, taskId }
      })
    )
  )
)

// Effect runtime automatically provides:
// - Automatic timing and duration tracking
// - Error correlation with traces  
// - Distributed tracing across service calls
// - Metrics collection (request counts, error rates)
// - Structured logging with correlation IDs

// Optional: Route-level metrics using Effect.Metric
const routeCounter = Effect.Metric.counter("route_requests", {
  description: "Total number of route requests"
})

const routeDuration = Effect.Metric.histogram("route_duration_ms", {
  description: "Route execution time in milliseconds" 
})

const dashboardRoute = ({ orgId }: { orgId: string }) =>
  Effect.gen(function*() {
    const orgService = yield* OrgService
    const membership = yield* orgService.requireMembership(orgId)
    
    // Built-in metrics tracking
    yield* Effect.Metric.increment(routeCounter, 1, { route: "dashboard", orgId })
    
    return <Dashboard org={membership} />
  }).pipe(
    Effect.withSpan("route.dashboard", { attributes: { orgId } }),
    Effect.timed, // Automatic duration tracking
    Effect.tap(([duration]) => 
      Effect.Metric.set(routeDuration, duration.millis, { route: "dashboard" })
    ),
    Effect.map(([, result]) => result)
  )
```

### Form Mutations (Simplified)
```typescript
const CreateTaskPage = ({ projectId }: { projectId: string }) => {
  const runtime = useRuntime()
  
  const handleSubmit = (data: TaskCreateData) => {
    const createEffect = Effect.gen(function*() {
      const taskService = yield* TaskService
      const router = yield* RouterService
      
      const task = yield* taskService.create(projectId, data)
      // Analytics happens automatically via router middleware
      yield* router.navigate(`/org/${task.orgId}/projects/${projectId}/tasks/${task.id}`)
    })
    
    runtime.runPromise(createEffect)
  }

  return <TaskForm onSubmit={handleSubmit} />
}
```

## Acceptance Criteria

### Core Router Functionality
- [ ] Route matching supports static paths (`/about`) and parameters (`/users/:id`)
- [ ] Route handlers return `Effect<ReactElement, E, R>` with full type safety
- [ ] Router builder API: `Router.empty.pipe(Router.route(path, handler))`
- [ ] Navigation automatically cancels previous route effects when starting new ones
- [ ] HistoryService wraps browser history package with Effect patterns
- [ ] Built-in observability via `Effect.withSpan()`, `Effect.Metric`, and structured logging
- [ ] Zero-config telemetry and distributed tracing across route boundaries

### ManagedRuntime Integration  
- [ ] ManagedRuntime created once at app startup with all service layers
- [ ] RouterService manages URL state via SubscriptionRef and provides current route effect
- [ ] Routes can `yield*` from any service in the runtime layer
- [ ] Runtime can be swapped for testing (TestRuntime with mock services)

### React `use` Hook Integration
- [ ] RouteRenderer component uses React's `use` hook to consume route effects
- [ ] Route effects converted to promises via `Effect.runPromise`
- [ ] Standard React Suspense handles loading states automatically
- [ ] Standard React ErrorBoundary handles route failures
- [ ] No custom loading/error machinery needed

### Demo Application
- [ ] Home route with existing APITester functionality (`/`)
- [ ] Organization dashboard route demonstrating multi-service coordination (`/org/:orgId/dashboard`)
- [ ] Task detail route with complex authorization (`/org/:orgId/projects/:projectId/tasks/:taskId`)
- [ ] User profile route showing parameter extraction (`/users/:id`)
- [ ] Error and loading states handled by standard React Suspense/ErrorBoundary
- [ ] Mock services (UserService, OrgService, TaskService, AnalyticsService) returning realistic data
- [ ] Demonstration of service caching, error typing, and dependency injection

## Technical Architecture

### Core Components
```typescript
import { ManagedRuntime, Layer } from "effect"
import { HttpApi } from "@effect/platform"
import { createBrowserHistory, Location, Action } from "history"

// 1. ManagedRuntime with Effect ecosystem integration
const AppRuntime = ManagedRuntime.make(Layer.mergeAll(
  HttpApi.client.layer,       // HTTP client for all services
  UserService.Default,        // User management
  OrgService.Default,         // Organization management  
  TaskService.Default,        // Task operations
  HistoryService.Default,     // Browser history wrapper
  RouterService.Default,      // URL state management
  // Effect's built-in observability layers
  Effect.Logger.structured,   // Structured logging
  Effect.Tracer.live,         // Distributed tracing
  Effect.Metric.live          // Metrics collection
))

// 2. Routes as pure Effect computations with realistic services
const routes = Router.empty.pipe(
  Router.route("/", () => Effect.succeed(<HomePage />)),
  
  Router.route("/org/:orgId/dashboard", ({ orgId }) =>
    Effect.gen(function*() {
      const orgService = yield* OrgService
      const analyticsService = yield* AnalyticsService
      
      const [membership, stats, activity] = yield* Effect.all([
        orgService.requireMembership(orgId),
        analyticsService.getOrgStats(orgId),
        analyticsService.getRecentActivity(orgId)
      ])
      return <Dashboard org={membership} stats={stats} activity={activity} />
    })
  ),
  
  Router.route("/org/:orgId/projects/:projectId/tasks/:taskId", ({ orgId, projectId, taskId }) =>
    Effect.gen(function*() {
      const taskService = yield* TaskService
      const { task, membership } = yield* taskService.requireAccess(orgId, projectId, taskId)
      return <TaskDetail task={task} userRole={membership.role} />
    })
  )
)

// 3. History Service (Effect wrapper around history package)
export class HistoryService extends Effect.Service<HistoryService>()("sixtysix/HistoryService", {
  effect: Effect.gen(function* () {
    const history = createBrowserHistory()
    
    const push = (path: string) =>
      Effect.sync(() => history.push(path))
    
    const replace = (path: string) =>
      Effect.sync(() => history.replace(path))
    
    const listen = (listener: (location: Location, action: Action) => void) =>
      Effect.sync(() => {
        const unlisten = history.listen(listener)
        return unlisten
      })
    
    return { history, push, replace, listen } as const
  })
}) {}

// 4. Router Service using HistoryService
export class RouterService extends Effect.Service<RouterService>()("sixtysix/RouterService", {
  effect: Effect.gen(function* () {
    const historyService = yield* HistoryService
    const currentEffect = yield* SubscriptionRef.make<Effect<ReactElement, any, any> | null>(null)
    
    const navigate = (path: string) =>
      Effect.gen(function* () {
        yield* historyService.push(path)
        const matchedRoute = matchRoutes(routes, path)
        if (matchedRoute) {
          yield* SubscriptionRef.set(currentEffect, matchedRoute.effect)
        }
      }).pipe(
        Effect.withSpan("router.navigate", { attributes: { path } })
      )
    
    return { currentEffect, navigate } as const
  }),
  dependencies: [HistoryService.Default]
}) {}

// 4. React integration via use hook
function RouteRenderer({ effect }: { effect: Effect<ReactElement, any, any> }) {
  const runtime = useRuntime() // From RuntimeProvider context
  const element = use(runtime.runPromise(effect))
  return element
}

// 5. Main Router component
function Router() {
  const router = useService(RouterService)
  const currentEffect = useSubscriptionRef(router.currentEffect)
  
  if (!currentEffect) {
    return <NotFoundPage />
  }
  
  return <RouteRenderer effect={currentEffect} />
}

// 6. Complete App with proper error boundaries
function App() {
  return (
    <RuntimeProvider runtime={AppRuntime}>
      <Suspense fallback={<PageSpinner />}>
        <ErrorBoundary fallback={handleRouteError}>
          <Router />
        </ErrorBoundary>
      </Suspense>
    </RuntimeProvider>
  )
}

// Runtime Provider context
const RuntimeContext = React.createContext<ManagedRuntime.ManagedRuntime<StudioContext, never> | null>(null)

export const RuntimeProvider = ({ runtime, children }: { runtime: typeof AppRuntime, children: React.ReactNode }) => (
  <RuntimeContext.Provider value={runtime}>{children}</RuntimeContext.Provider>
)

export const useRuntime = () => {
  const runtime = useContext(RuntimeContext)
  if (!runtime) throw new Error("useRuntime must be used within RuntimeProvider")
  return runtime
}

// Runtime cleanup on app unmount
useEffect(() => {
  return () => {
    AppRuntime.runFork(AppRuntime.disposeEffect)
  }
}, [])
```

### Key Innovations
1. **Effect→Promise→Suspense**: Route effects become promises consumed by React's `use` hook
2. **Typed Error Channels**: Route failures typed and handled by standard ErrorBoundary
3. **Dependency Injection**: Service requirements declared in route types, provided by ManagedRuntime
4. **Built-in Observability**: Leverage Effect's native tracing, metrics, and logging instead of custom middleware
5. **Effect Ecosystem Integration**: Use history package wrapper, HTTP client, and other Effect services
6. **Request Deduplication**: Effect runtime handles caching and deduplication automatically
7. **Zero-Config Telemetry**: Spans, metrics, and logs work out-of-the-box with Effect.withSpan()
8. **Testability**: Swap runtime layers for testing without component changes

## Constraints

- **Scope**: Prototype within Phoenix service, no separate package yet
- **Build Process**: Always use production builds (`pnpm build`), no dev server
- **Dependencies**: Use Effect ecosystem packages (effect, @effect/platform, history), remove React Router
- **Target Market**: Effect-TS developers who understand Effect patterns
- **React Version**: Requires React 18+ for `use` hook support
- **Effect Version**: Use Effect 3.9+ for Effect.Service API with dependencies array
- **Service Pattern**: All services use `Effect.Service<T>()("identifier", { effect, dependencies })` pattern

## Success Metrics

1. **API Clarity**: Effect developers can understand the router without documentation
2. **Code Reduction**: Route components have significantly less boilerplate than React Router equivalents  
3. **Service Composition**: Routes naturally compose with mock services via ManagedRuntime layer swapping
4. **Error Handling**: All async operations have proper error boundaries without manual setup
5. **Type Safety**: Route dependencies and errors are compile-time checked
6. **React Integration**: Feels like natural React patterns (Suspense, ErrorBoundary, hooks)

## Out of Scope (V1)

- Nested routing (focus on flat route structure)
- Route guards/middleware (use service-level authorization)
- Animation/transitions (standard React patterns apply)
- Server-side rendering (client-side prototype first)
- Preloading strategies (Effect caching handles this)
- Route-level code splitting (standard dynamic imports work)
- Complex parameter validation (use Effect schema validation in services)
