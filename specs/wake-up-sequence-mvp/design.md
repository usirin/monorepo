# Wake-Up Sequence MVP - Technical Design

## Overview
This document provides the technical design and implementation strategy for the wake-up sequence MVP, derived from [requirements.md](./requirements.md).

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Wake-Up Sequence MVP                     │
├─────────────────────────────────────────────────────────────┤
│  React App Layer                                           │
│  ├── WakeUpSequence (Main Component)                       │
│  ├── InteractionProvider (Context)                         │
│  └── AnalyticsProvider (Tracking)                          │
├─────────────────────────────────────────────────────────────┤
│  Effect Runtime Layer                                      │
│  ├── SequenceManager (State Machine)                       │
│  ├── InteractionService (User Input)                       │
│  ├── AudioService (Sound Management)                       │
│  └── AnalyticsService (Metrics)                            │
├─────────────────────────────────────────────────────────────┤
│  React Three Fiber Layer                                   │
│  ├── SceneManager (3D Environment)                         │
│  ├── CameraController (View Management)                    │
│  ├── LightingSystem (Mood & Atmosphere)                    │
│  └── PostProcessing (Visual Effects)                       │
├─────────────────────────────────────────────────────────────┤
│  Asset Management Layer                                    │
│  ├── ModelLoader (3D Assets)                               │
│  ├── TextureManager (Materials)                            │
│  ├── AudioLoader (Sound Assets)                            │
│  └── PreloadManager (Performance)                          │
└─────────────────────────────────────────────────────────────┘
```

### Core Design Principles
1. **Effect-First Architecture**: All state management and side effects through Effect-TS
2. **Immutable State**: Predictable state transitions using Effect's functional approach
3. **Streaming Assets**: Progressive loading using Effect streams
4. **Error Boundaries**: Graceful degradation with Effect's error handling
5. **Performance Priority**: 60fps maintained through optimized rendering pipeline

## Technical Stack

### Core Dependencies
```json
{
  "dependencies": {
    "react": "catalog:",
    "react-dom": "catalog:",
    "effect": "catalog:",
    "@effect/platform": "catalog:",
    "@react-three/fiber": "catalog:",
    "@react-three/drei": "catalog:", 
    "@react-three/postprocessing": "catalog:",
    "three": "catalog:",
    "tone": "catalog:"
  },
  "devDependencies": {
    "typescript": "catalog:",
    "@rsbuild/core": "catalog:",
    "@rsbuild/plugin-react": "catalog:",
    "@types/react": "catalog:",
    "@types/react-dom": "catalog:",
    "@types/node": "catalog:"
  }
}
```

### Project Structure
```
services/rsbuild-lab/src/
├── components/
│   ├── WakeUpSequence.tsx          # Main sequence component
│   ├── BedroomScene.tsx            # 3D bedroom environment
│   ├── InteractionOverlay.tsx      # UI interaction hints
│   └── LoadingScreen.tsx           # Initial loading state
├── services/
│   ├── SequenceService.ts          # Sequence state management
│   ├── InteractionService.ts       # User interaction handling
│   ├── AudioService.ts             # Audio management
│   ├── AnalyticsService.ts         # Usage tracking
│   └── AssetService.ts             # Asset loading
├── effects/
│   ├── BlurEffect.ts               # Custom blur implementation
│   ├── ClarityTransition.ts        # Blur-to-clarity effect
│   └── LightingEffects.ts          # Dynamic lighting
├── models/
│   ├── SequenceState.ts            # State type definitions
│   ├── InteractionTypes.ts         # Interaction models
│   └── AssetTypes.ts               # Asset definitions
├── assets/
│   ├── models/                     # 3D models (.glb files)
│   ├── textures/                   # Material textures
│   ├── audio/                      # Sound files
│   └── shaders/                    # Custom shaders
└── hooks/
    ├── useSequenceState.ts         # Sequence state hook
    ├── useInteractions.ts          # Interaction handling
    └── useAudio.ts                 # Audio management
```

## Effect-TS Integration Strategy

### State Management Pattern
```typescript
// Core sequence state using Effect
export interface SequenceState {
  readonly phase: SequencePhase
  readonly progress: number
  readonly interactions: ReadonlyArray<InteractionEvent>
  readonly audioEnabled: boolean
  readonly performanceMetrics: PerformanceData
}

class SequenceService extends Effect.Service<SequenceService>()("SequenceService", {
  effect: Effect.gen(function* () {
    const state = yield* Ref.make<SequenceState>(initialState)
    
    const updatePhase = (phase: SequencePhase) =>
      Effect.gen(function* () {
        yield* Ref.update(state, s => ({ ...s, phase }))
        yield* AnalyticsService.trackPhaseTransition(phase)
        yield* AudioService.updateAmbientForPhase(phase)
      })
    
    const handleInteraction = (interaction: InteractionEvent) =>
      Effect.gen(function* () {
        const currentState = yield* Ref.get(state)
        const newState = yield* processInteraction(currentState, interaction)
        yield* Ref.set(state, newState)
        yield* AudioService.playInteractionFeedback(interaction.type)
      })
    
    return { state: Ref.get(state), updatePhase, handleInteraction } as const
  })
}) {}
```

### Streaming Asset Loading
```typescript
class AssetLoadingService extends Effect.Service<AssetLoadingService>()("AssetLoadingService", {
  effect: Effect.gen(function* () {
    // Stream-based asset loading for smooth experience
    const loadCriticalAssets = Stream.fromIterable([
      'bedroom-corner.glb',
      'nightstand.glb', 
      'glasses.glb',
      'phone.glb'
    ]).pipe(
      Stream.mapEffect(loadModel),
      Stream.runCollect
    )
    
    const loadAudioAssets = Stream.fromIterable([
      'morning-ambient.wav',
      'interaction-feedback.wav',
      'glasses-pickup.wav'
    ]).pipe(
      Stream.mapEffect(loadAudio),
      Stream.runCollect
    )
    
    // Progressive loading strategy
    const loadSequentially = Effect.gen(function* () {
      // Critical path first
      yield* loadCriticalAssets
      yield* SequenceService.setReady(true)
      
      // Enhancement assets after
      yield* loadAudioAssets
      yield* loadDetailTextures
    })
    
    return { loadSequentially } as const
  })
}) {}
```

### Error Handling Strategy
```typescript
class ErrorBoundaryService extends Effect.Service<ErrorBoundaryService>()("ErrorBoundaryService", {
  effect: Effect.gen(function* () {
    const handleAssetLoadError = (error: AssetError) =>
      Effect.gen(function* () {
        yield* Console.error("Asset loading failed", error)
        yield* AnalyticsService.trackError("asset_load", error)
        
        // Graceful degradation
        match (error.type) {
          case "ModelLoadError":
            return yield* loadFallbackModel(error.asset)
          case "AudioLoadError":
            return yield* disableAudio()
          case "TextureLoadError":
            return yield* loadLowResTexture(error.asset)
        }
      })
    
    const handleInteractionError = (error: InteractionError) =>
      Effect.gen(function* () {
        yield* Console.warn("Interaction error", error)
        yield* SequenceService.retryInteraction(error.interaction)
      })
    
    return { handleAssetLoadError, handleInteractionError } as const
  })
}) {}
```

## 3D Scene Architecture

### Scene Hierarchy
```typescript
// BedroomScene.tsx - Main 3D environment
export const BedroomScene = () => {
  return (
    <Canvas camera={{ position: [0, 1.6, 2], fov: 50 }}>
      {/* Lighting System */}
      <LightingRig />
      
      {/* Environment */}
      <Suspense fallback={<LoadingGeometry />}>
        <BedroomCorner />
        <Nightstand />
        <PersonalItems />
      </Suspense>
      
      {/* Interactive Elements */}
      <InteractiveGlasses />
      <InteractivePhone />
      
      {/* Effects */}
      <EffectComposer>
        <BlurEffect ref={blurRef} />
        <ClarityTransition />
      </EffectComposer>
      
      {/* Camera Control */}
      <CameraController />
    </Canvas>
  )
}
```

### Lighting System Design
```typescript
export const LightingRig = () => {
  const { phase } = useSequenceState()
  
  return (
    <group>
      {/* Primary morning light */}
      <directionalLight
        position={[5, 8, 2]}
        intensity={phase === 'awakening' ? 0.3 : 0.8}
        color={phase === 'awakening' ? '#ffd4a3' : '#fff5e6'}
        castShadow
      />
      
      {/* Ambient room light */}
      <ambientLight 
        intensity={phase === 'awakening' ? 0.1 : 0.4}
        color="#f0f8ff"
      />
      
      {/* Subtle fill light */}
      <pointLight
        position={[-2, 3, 1]}
        intensity={0.2}
        color="#ffe4b5"
      />
    </group>
  )
}
```

### Post-Processing Pipeline
```typescript
export const BlurEffect = forwardRef<BlurEffectRef>((props, ref) => {
  const blurPass = useRef<SelectiveBloomPass>()
  
  useImperativeHandle(ref, () => ({
    transitionToClarity: () => {
      if (blurPass.current) {
        // Smooth transition using Effect streams
        const transition = Stream.range(0, 100).pipe(
          Stream.map(progress => progress / 100),
          Stream.tap(value => 
            Effect.sync(() => {
              blurPass.current.strength = 5 * (1 - value)
            })
          ),
          Stream.schedule(Schedule.spaced("16 millis")), // 60fps
          Stream.runDrain
        )
        
        Effect.runPromise(transition)
      }
    }
  }))
  
  return (
    <selectiveBloom
      ref={blurPass}
      intensity={1}
      luminanceThreshold={0.1}
      radius={5}
      strength={5}
    />
  )
})
```

## Interaction System Design

### Phase-Based Interaction Model
```typescript
export enum SequencePhase {
  LOADING = 'loading',
  AWAKENING = 'awakening',        // 0-20s: Passive blur
  REACHING = 'reaching',          // 20-45s: Mouse-guided reach
  CLARITY = 'clarity',            // 45-70s: Click activation
  AWARENESS = 'awareness'         // 70-90s: Choice awareness
}

export interface InteractionState {
  readonly currentPhase: SequencePhase
  readonly phaseStartTime: number
  readonly mousePosition: readonly [number, number]
  readonly glassesReached: boolean
  readonly clarityActivated: boolean
  readonly choicesRevealed: boolean
}
```

### Mouse Interaction Handler
```typescript
class InteractionService extends Effect.Service<InteractionService>()("InteractionService", {
  effect: Effect.gen(function* () {
    const handleMouseMove = (event: MouseEvent) =>
      Effect.gen(function* () {
        const sequenceService = yield* SequenceService
        const state = yield* sequenceService.getState()
        
        match (state.phase) {
          case SequencePhase.REACHING:
            return yield* handleGlassesReach(event)
          case SequencePhase.AWARENESS:
            return yield* handleChoiceHover(event)
          default:
            return Effect.unit
        }
      })
    
    const handleGlassesReach = (event: MouseEvent) =>
      Effect.gen(function* () {
        const glassesPosition = yield* getGlassesScreenPosition()
        const mouseDistance = calculateDistance(event, glassesPosition)
        
        if (mouseDistance < REACH_THRESHOLD) {
          const sequenceService = yield* SequenceService
          yield* sequenceService.setGlassesReached(true)
          const audioService = yield* AudioService
          yield* audioService.playSubtleReachFeedback()
          yield* updateHandPosition(event)
        }
      })
    
    return { handleMouseMove, handleClick: handleGlassesClick } as const
  })
}) {}
```

## Audio System Design

### Contextual Audio Management
```typescript
class AudioService extends Effect.Service<AudioService>()("AudioService", {
  effect: Effect.gen(function* () {
    const audioContext = yield* Effect.sync(() => new AudioContext())
    const masterGain = yield* Effect.sync(() => audioContext.createGain())
    
    const ambientSounds = new Map<SequencePhase, AudioBuffer>()
    
    const updateAmbientForPhase = (phase: SequencePhase) =>
      Effect.gen(function* () {
        const buffer = ambientSounds.get(phase)
        if (buffer) {
          yield* fadeOutCurrent()
          yield* fadeInNew(buffer)
        }
      })
    
    const playInteractionFeedback = (type: InteractionType) =>
      Effect.gen(function* () {
        match (type) {
          case 'glasses_reach':
            return yield* playSubtleReachSound()
          case 'glasses_click':
            return yield* playGlassesActivationSound()
          case 'choice_hover':
            return yield* playChoiceHoverSound()
        }
      })
    
    return { 
      updateAmbientForPhase, 
      playInteractionFeedback,
      setMasterVolume: (volume: number) => 
        Effect.sync(() => { masterGain.gain.value = volume })
    } as const
  })
}) {}
```

## Performance Optimization Strategy

### Rendering Optimization
```typescript
class PerformanceManager extends Effect.Service<PerformanceManager>()("PerformanceManager", {
  effect: Effect.gen(function* () {
    const frameTimeTracker = yield* Ref.make<number[]>([])
    
    const trackFrameTime = (deltaTime: number) =>
      Effect.gen(function* () {
        yield* Ref.update(frameTimeTracker, times => 
          [...times.slice(-59), deltaTime] // Keep last 60 frames
        )
        
        const avgFrameTime = yield* calculateAverageFrameTime()
        if (avgFrameTime > 16.67) { // Below 60fps
          yield* triggerPerformanceDegradation()
        }
      })
    
    const triggerPerformanceDegradation = Effect.gen(function* () {
      // Reduce shadow quality
      yield* SceneService.setShadowMapSize(1024) // from 2048
      
      // Simplify post-processing
      yield* EffectsService.reduceBlurQuality()
      
      // Lower texture resolution
      yield* AssetService.switchToLowResTextures()
    })
    
    return { trackFrameTime } as const
  })
}) {}
```

### Memory Management
```typescript
class MemoryManager extends Effect.Service<MemoryManager>()("MemoryManager", {
  effect: Effect.gen(function* () {
    const disposableResources = yield* Ref.make<Disposable[]>([])
    
    const registerDisposable = (resource: Disposable) =>
      Ref.update(disposableResources, resources => [...resources, resource])
    
    const cleanup = Effect.gen(function* () {
      const resources = yield* Ref.get(disposableResources)
      yield* Effect.all(
        resources.map(resource => 
          Effect.sync(() => resource.dispose())
        )
      )
      yield* Ref.set(disposableResources, [])
    })
    
    return { registerDisposable, cleanup } as const
  })
}) {}
```

## Analytics and Validation

### User Behavior Tracking
```typescript
class AnalyticsService extends Effect.Service<AnalyticsService>()("AnalyticsService", {
  effect: Effect.gen(function* () {
    const sessionData = yield* Ref.make<SessionData>(initialSession)
    
    const trackPhaseTransition = (phase: SequencePhase) =>
      Effect.gen(function* () {
        const timestamp = Date.now()
        yield* Ref.update(sessionData, session => ({
          ...session,
          phaseTransitions: [...session.phaseTransitions, {
            phase,
            timestamp,
            duration: timestamp - session.lastPhaseStart
          }]
        }))
      })
    
    const trackInteraction = (interaction: InteractionEvent) =>
      Effect.gen(function* () {
        yield* Ref.update(sessionData, session => ({
          ...session,
          interactions: [...session.interactions, {
            ...interaction,
            timestamp: Date.now()
          }]
        }))
      })
    
    const getCompletionRate = Effect.gen(function* () {
      const session = yield* Ref.get(sessionData)
      return session.phaseTransitions.length >= 4 // All phases completed
    })
    
    return { trackPhaseTransition, trackInteraction, getCompletionRate } as const
  })
}) {}
```

## Error Handling and Accessibility

### Graceful Degradation
```typescript
class AccessibilityService extends Effect.Service<AccessibilityService>()("AccessibilityService", {
  effect: Effect.gen(function* () {
    const userPreferences = yield* Ref.make<AccessibilityPrefs>(defaultPrefs)
    
    const enableReducedMotion = Effect.gen(function* () {
      yield* Ref.update(userPreferences, prefs => 
        ({ ...prefs, reducedMotion: true })
      )
      yield* SceneService.disableCameraMovement()
      yield* EffectsService.reduceAnimationIntensity()
    })
    
    const enableKeyboardNavigation = Effect.gen(function* () {
      const handleKeyPress = (event: KeyboardEvent) =>
        Effect.gen(function* () {
          match (event.key) {
            case 'Enter':
            case ' ':
              return yield* triggerCurrentInteraction()
            case 'Escape':
              return yield* showSkipOption()
          }
        })
      
      yield* Effect.sync(() => 
        document.addEventListener('keydown', 
          event => Effect.runSync(handleKeyPress(event))
        )
      )
    })
    
    return { enableReducedMotion, enableKeyboardNavigation } as const
  })
}) {}
```

## Deployment and Build Strategy

### Build Configuration
```typescript
// rsbuild.config.ts
export default defineConfig({
  plugins: [pluginReact()],
  output: {
    target: 'web',
    distPath: {
      root: 'dist',
      js: 'js',
      css: 'css',
      assets: 'assets'
    }
  },
  performance: {
    chunkSplit: {
      strategy: 'split-by-experience',
      override: {
        chunks: {
          'wake-up-sequence': {
            test: /wake-up/,
            name: 'wake-up-sequence',
            priority: 10
          }
        }
      }
    }
  },
  dev: {
    hmr: true,
    liveReload: true
  }
})
```

### Asset Pipeline
```typescript
export const AssetPipeline = {
  // 3D model optimization
  models: {
    format: '.glb', // Compressed binary format
    compression: 'draco', // Geometry compression
    maxFileSize: '500KB per model'
  },
  
  // Texture optimization  
  textures: {
    format: 'webp', // Modern format with fallback
    compression: 'high quality',
    maxResolution: '1024x1024'
  },
  
  // Audio optimization
  audio: {
    format: 'webm', // Modern format with fallback
    bitrate: '128kbps',
    compression: 'ogg vorbis fallback'
  }
}
```

## Testing Strategy

### Unit Testing
```typescript
// SequenceService.test.ts
describe('SequenceService', () => {
  it('should transition phases correctly', async () => {
    const program = Effect.gen(function* () {
      const service = yield* SequenceService
      
      yield* service.updatePhase(SequencePhase.REACHING)
      const state = yield* service.getState()
      
      expect(state.phase).toBe(SequencePhase.REACHING)
    })
    
    await Effect.runPromise(program)
  })
})
```

### Integration Testing
```typescript
// Full sequence integration test
describe('Wake-Up Sequence Integration', () => {
  it('should complete full sequence successfully', async () => {
    const program = Effect.gen(function* () {
      // Initialize services
      const sequence = yield* SequenceService
      const interaction = yield* InteractionService
      const analytics = yield* AnalyticsService
      
      // Simulate full user journey
      yield* sequence.start()
      yield* interaction.simulateGlassesReach()
      yield* interaction.simulateGlassesClick()
      yield* sequence.completeSequence()
      
      // Validate completion
      const completionRate = yield* analytics.getCompletionRate()
      expect(completionRate).toBe(true)
    })
    
    await Effect.runPromise(program)
  })
})
```

## Security Considerations

### Data Privacy
- Minimal analytics collection (completion rates, timing data only)
- No personal information storage
- Local storage only for user preferences
- Clear data usage communication

### Asset Security
- All assets served over HTTPS
- No external CDN dependencies for critical path
- Content Security Policy headers
- Asset integrity validation

## Conclusion

This technical design provides a comprehensive foundation for building the wake-up sequence MVP with:

- **Effect-first architecture** for predictable state management
- **Performance-optimized** 3D rendering pipeline  
- **Accessibility-conscious** interaction design
- **Streaming asset loading** for smooth experience
- **Comprehensive error handling** and graceful degradation
- **Analytics integration** for validation and iteration

The design prioritizes emotional impact and authentic representation while maintaining technical excellence and expandability for future episodes.
